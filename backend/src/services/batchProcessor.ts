import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { 
  BatchSession, 
  BatchJob, 
  BatchJobStatus, 
  BatchProgressUpdate,
  BatchInputRow,
  BatchJobResult,
  BatchProcessingResult,
  BatchProcessingReport
} from '../types/batch.types';
import { PublicSheetsConverter } from './publicSheetsConverter';
import { ExcelTemplateParser } from './excelTemplateParser';
import { FlexibleTemplateParser } from './flexibleTemplateParser';
import { DataTransformer, TransformedERCData } from './dataTransformer';
import { ERCBulkUploadMapper } from './ercBulkUploadMapper';
import { ERCQuarterlyMapper } from './ercQuarterlyMapper';
import { ERCHybridMapper } from './ercHybridMapper';

/**
 * Batch processor service for handling multiple Google Sheets URLs
 * Emits progress events for real-time monitoring
 */
export class BatchProcessor extends EventEmitter {
  private sessions: Map<string, BatchSession> = new Map();
  private currentSession: BatchSession | null = null;
  private isProcessing: boolean = false;
  private shouldCancel: boolean = false;

  constructor() {
    super();
  }

  /**
   * Create a new batch session
   */
  createSession(inputRows: BatchInputRow[], inputFileName?: string): string {
    const sessionId = uuidv4();
    
    const jobs: BatchJob[] = inputRows.map(row => ({
      ...row,
      jobStatus: {
        id: uuidv4(),
        status: 'pending'
      }
    }));

    const session: BatchSession = {
      sessionId,
      createdAt: new Date(),
      totalJobs: jobs.length,
      completedJobs: 0,
      failedJobs: 0,
      status: 'idle',
      jobs,
      inputFileName
    };

    this.sessions.set(sessionId, session);
    this.currentSession = session;
    
    return sessionId;
  }

  /**
   * Start processing a batch session
   */
  async processBatch(sessionId: string, options: { removeLinks?: boolean } = {}): Promise<BatchProcessingResult> {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    if (this.isProcessing) {
      throw new Error('Another batch is already being processed');
    }

    this.isProcessing = true;
    this.shouldCancel = false;
    session.status = 'processing';
    session.startTime = new Date();

    const results: BatchJobResult[] = [];
    const startTime = Date.now();

    try {
      // Process each job sequentially
      for (let i = 0; i < session.jobs.length; i++) {
        if (this.shouldCancel) {
          session.status = 'cancelled';
          break;
        }

        const job = session.jobs[i];
        const jobStartTime = Date.now();
        
        // Emit progress update
        this.emitProgress({
          sessionId,
          currentIndex: i,
          totalJobs: session.totalJobs,
          currentUrl: job.google_sheets_url,
          status: 'processing',
          percentComplete: Math.floor((i / session.totalJobs) * 100),
          message: `Processing sheet ${i + 1} of ${session.totalJobs}`
        });

        // Process the job with options
        const result = await this.processJob(job, options);
        
        // Update job status
        job.jobStatus.status = result.status === 'success' ? 'completed' : 'failed';
        job.jobStatus.error = result.error;
        job.jobStatus.endTime = new Date();
        
        // Update session counters
        if (result.status === 'success') {
          session.completedJobs++;
        } else {
          session.failedJobs++;
        }

        // Add to results
        results.push({
          ...result,
          processingTime: Date.now() - jobStartTime
        });

        // Small delay to prevent overwhelming the API
        if (i < session.jobs.length - 1) {
          await this.delay(500); // 500ms delay between requests
        }
      }

      session.endTime = new Date();
      session.status = this.shouldCancel ? 'cancelled' : 'completed';

      // Generate the combined CSV buffer
      const csvBuffer = await this.generateCombinedCSV(session, results);

      // Create processing report
      const report = this.createReport(session, results);

      const processingResult: BatchProcessingResult = {
        sessionId,
        success: true,
        totalProcessed: results.length,
        successCount: results.filter(r => r.status === 'success').length,
        failureCount: results.filter(r => r.status === 'failed').length,
        results,
        csvBuffer,
        report
      };

      // Emit completion
      this.emit('complete', processingResult);

      return processingResult;

    } catch (error) {
      session.status = 'completed';
      session.endTime = new Date();
      
      throw error;
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process a single job (with or without Google Sheets URL)
   */
  private async processJob(job: BatchJob, options: { removeLinks?: boolean } = {}): Promise<BatchJobResult> {
    try {
      let transformedData: TransformedERCData;
      
      // Check if we have a valid Google Sheets URL
      if (job.google_sheets_url && job.google_sheets_url.trim() !== '') {
        // Process with Google Sheets data
        
        // Step 1: Download Google Sheets as Excel
        const converter = new PublicSheetsConverter();
        let excelBuffer: Buffer;
        
        try {
          excelBuffer = await converter.convertPublicSheetsToExcel(job.google_sheets_url);
        } catch (error) {
          return {
            rowIndex: job.rowIndex,
            google_sheets_url: job.google_sheets_url,
            status: 'failed',
            error: error instanceof Error ? error.message : 'Failed to download Google Sheet'
          };
        }

        // Step 2: Parse Excel template
        let parser: ExcelTemplateParser | FlexibleTemplateParser = new ExcelTemplateParser();
        const loaded = await parser.loadFile(excelBuffer);
        
        if (!loaded) {
          return {
            rowIndex: job.rowIndex,
            google_sheets_url: job.google_sheets_url,
            status: 'failed',
            error: 'Failed to load Excel file'
          };
        }

        // Step 3: Extract data
        let extractionResult = parser.extractData();
        
        // Try flexible parser if standard fails
        if (!extractionResult.success) {
          parser = new FlexibleTemplateParser();
          await parser.loadFile(excelBuffer);
          
          try {
            const flexibleData = (parser as FlexibleTemplateParser).extractFlexibleData();
            extractionResult = {
              success: true,
              data: flexibleData,
              warnings: ['Used flexible parser']
            };
          } catch (flexError) {
            return {
              rowIndex: job.rowIndex,
              google_sheets_url: job.google_sheets_url,
              status: 'failed',
              error: 'Failed to extract data from template'
            };
          }
        }

        if (!extractionResult.success || !extractionResult.data) {
          return {
            rowIndex: job.rowIndex,
            google_sheets_url: job.google_sheets_url,
            status: 'failed',
            error: 'No data extracted from template'
          };
        }

        // Step 4: Transform data
        transformedData = DataTransformer.transform(extractionResult.data);
        
        // Store the extracted data
        job.jobStatus.extractedData = extractionResult.data;
        
      } else {
        // No Google Sheets URL - use metadata only
        // Create an empty TransformedERCData structure
        transformedData = DataTransformer.createEmptyData();
        
        // Mark that this is metadata-only
        transformedData.metadata.missingFields = ['No Google Sheets URL provided - using metadata only'];
      }
      
      // Step 5: Transform to hybrid format (52-field bulk upload + quarterly columns + metadata)
      // Metadata will override/supplement the empty or extracted data
      const hybridData = ERCHybridMapper.transformToHybridFormat(transformedData, job.metadata, options);
      
      // Store the processed data
      job.jobStatus.transformedData = hybridData;

      return {
        rowIndex: job.rowIndex,
        google_sheets_url: job.google_sheets_url,
        status: 'success',
        processedData: hybridData
      };

    } catch (error) {
      return {
        rowIndex: job.rowIndex,
        google_sheets_url: job.google_sheets_url,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Processing failed'
      };
    }
  }


  /**
   * Generate combined CSV with all processed rows
   */
  private async generateCombinedCSV(session: BatchSession, results: BatchJobResult[]): Promise<Buffer> {
    const successfulResults = results.filter(r => r.status === 'success' && r.processedData);
    
    if (successfulResults.length === 0) {
      return Buffer.from('No successful results to export');
    }

    // Get ordered headers using the hybrid mapper
    const headers = ERCHybridMapper.getHeaders(successfulResults[0].processedData!);
    
    // Generate rows by extracting values in the same order as headers
    const dataRows = successfulResults.map(r => 
      headers.map(header => {
        const value = (r.processedData as any)[header];
        if (value === undefined || value === null) return '';
        if (typeof value === 'number') return value.toString();
        return String(value);
      })
    );
    
    // Combine headers and data rows
    const rows = [headers, ...dataRows];
    
    // Convert to CSV
    const csvContent = rows.map(row => 
      row.map((cell: any) => {
        // Escape quotes and wrap in quotes if contains comma, newline, or quote
        const str = String(cell || '');
        if (str.includes(',') || str.includes('\n') || str.includes('"')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      }).join(',')
    ).join('\n');
    
    return Buffer.from(csvContent, 'utf-8');
  }

  /**
   * Create a processing report
   */
  private createReport(session: BatchSession, results: BatchJobResult[]): BatchProcessingReport {
    const duration = session.endTime && session.startTime 
      ? session.endTime.getTime() - session.startTime.getTime()
      : 0;
    
    const successfulRows = results.filter(r => r.status === 'success').length;
    const failedRows = results.filter(r => r.status === 'failed').length;
    
    const errors = results
      .filter(r => r.status === 'failed' && r.error)
      .map(r => ({
        rowIndex: r.rowIndex,
        url: r.google_sheets_url,
        error: r.error!
      }));
    
    const avgProcessingTime = results.length > 0
      ? results.reduce((sum, r) => sum + (r.processingTime || 0), 0) / results.length
      : 0;
    
    return {
      sessionId: session.sessionId,
      startTime: session.startTime!,
      endTime: session.endTime!,
      duration,
      totalRows: session.totalJobs,
      processedRows: results.length,
      successfulRows,
      failedRows,
      successRate: (successfulRows / session.totalJobs) * 100,
      averageProcessingTime: avgProcessingTime,
      errors,
      warnings: []
    };
  }

  /**
   * Emit progress update
   */
  private emitProgress(update: BatchProgressUpdate): void {
    this.emit('progress', update);
  }

  /**
   * Cancel current batch processing
   */
  cancelProcessing(): void {
    this.shouldCancel = true;
  }

  /**
   * Get session status
   */
  getSessionStatus(sessionId: string): BatchSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Helper function to add delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}