import { Router, Request, Response } from 'express';
import multer from 'multer';
import { BatchProcessor } from '../services/batchProcessor';
import { BatchInputParser } from '../services/batchInputParser';
import { BatchSession, BatchProcessingResult } from '../types/batch.types';

const router = Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'text/csv',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'application/octet-stream'
    ];
    
    if (allowedTypes.includes(file.mimetype) || 
        file.originalname.toLowerCase().endsWith('.csv') ||
        file.originalname.toLowerCase().endsWith('.xlsx') ||
        file.originalname.toLowerCase().endsWith('.xls')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only CSV and Excel files are allowed.'));
    }
  }
});

// Batch processor instance
const batchProcessor = new BatchProcessor();

// Store processing results temporarily (in production, use a database or cache)
const processingResults = new Map<string, BatchProcessingResult>();

/**
 * Upload batch input file (CSV/Excel with Google Sheets URLs and metadata)
 */
router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    // Parse the input file
    const parseResult = await BatchInputParser.parseInputFile(
      req.file.buffer,
      req.file.originalname
    );

    if (!parseResult.success || !parseResult.rows) {
      return res.status(400).json({
        success: false,
        error: parseResult.error || 'Failed to parse input file',
        warnings: parseResult.warnings
      });
    }

    // Create a batch session
    const sessionId = batchProcessor.createSession(parseResult.rows, req.file.originalname);
    const session = batchProcessor.getSessionStatus(sessionId);

    res.json({
      success: true,
      sessionId,
      totalJobs: parseResult.rows.length,
      rows: parseResult.rows.map(row => ({
        rowIndex: row.rowIndex,
        url: row.google_sheets_url,
        metadata: row.metadata
      })),
      warnings: parseResult.warnings,
      session
    });

  } catch (error) {
    console.error('Error uploading batch file:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload batch file'
    });
  }
});

/**
 * Start processing a batch session
 */
router.post('/process/:sessionId', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    // Check if user wants to remove links from output (safe check for req.body)
    const removeLinks = req.query.removeLinks === 'true' || 
                       (req.body && req.body.removeLinks === true);
    
    const session = batchProcessor.getSessionStatus(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    if (session.status === 'processing') {
      return res.status(400).json({
        success: false,
        error: 'Session is already being processed'
      });
    }

    // Start processing asynchronously
    res.json({
      success: true,
      message: 'Batch processing started',
      sessionId,
      totalJobs: session.totalJobs,
      removeLinks // Include the flag in response
    });

    // Process in background with options
    batchProcessor.processBatch(sessionId, { removeLinks })
      .then(result => {
        // Store the result for download
        processingResults.set(sessionId, result);
        console.log(`Batch processing completed for session ${sessionId}`);
      })
      .catch(error => {
        console.error(`Batch processing failed for session ${sessionId}:`, error);
      });

  } catch (error) {
    console.error('Error starting batch processing:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to start batch processing'
    });
  }
});

/**
 * Get batch processing status
 */
router.get('/status/:sessionId', (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    
    const session = batchProcessor.getSessionStatus(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    const result = processingResults.get(sessionId);
    
    res.json({
      success: true,
      session: {
        sessionId: session.sessionId,
        status: session.status,
        totalJobs: session.totalJobs,
        completedJobs: session.completedJobs,
        failedJobs: session.failedJobs,
        startTime: session.startTime,
        endTime: session.endTime,
        percentComplete: session.totalJobs > 0 
          ? Math.floor((session.completedJobs + session.failedJobs) / session.totalJobs * 100)
          : 0
      },
      hasResult: !!result,
      result: result ? {
        totalProcessed: result.totalProcessed,
        successCount: result.successCount,
        failureCount: result.failureCount,
        report: result.report
      } : undefined
    });

  } catch (error) {
    console.error('Error getting batch status:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get batch status'
    });
  }
});

/**
 * Download batch processing results as CSV
 */
router.get('/download/:sessionId', (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    
    const result = processingResults.get(sessionId);
    if (!result || !result.csvBuffer) {
      return res.status(404).json({
        success: false,
        error: 'Processing results not found or not ready'
      });
    }

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `bulk_upload_batch_${timestamp}.csv`;
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(result.csvBuffer);

  } catch (error) {
    console.error('Error downloading batch results:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to download batch results'
    });
  }
});

/**
 * Get batch processing report
 */
router.get('/report/:sessionId', (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    
    const result = processingResults.get(sessionId);
    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Processing results not found'
      });
    }

    res.json({
      success: true,
      report: result.report,
      details: result.results.map(r => ({
        rowIndex: r.rowIndex,
        url: r.google_sheets_url,
        status: r.status,
        error: r.error,
        processingTime: r.processingTime
      }))
    });

  } catch (error) {
    console.error('Error getting batch report:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get batch report'
    });
  }
});

/**
 * Cancel batch processing
 */
router.post('/cancel/:sessionId', (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    
    const session = batchProcessor.getSessionStatus(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    batchProcessor.cancelProcessing();
    
    res.json({
      success: true,
      message: 'Batch processing cancellation requested',
      sessionId
    });

  } catch (error) {
    console.error('Error cancelling batch processing:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to cancel batch processing'
    });
  }
});

/**
 * Download sample batch input template
 * Query parameters: 
 * - format=standard (default) or format=custom
 * - type=csv (default) or type=xlsx
 */
router.get('/template', (req: Request, res: Response) => {
  try {
    const format = req.query.format || 'standard';
    const type = req.query.type || 'csv';
    
    if (format === 'custom') {
      if (type === 'xlsx') {
        // Import CustomColumnMapper for Excel template
        const { CustomColumnMapper } = require('../services/customColumnMapper');
        const template = CustomColumnMapper.generateExcelTemplate();
        const filename = 'batch_input_template_custom.xlsx';
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(template);
      } else {
        const template = BatchInputParser.generateCustomTemplate();
        const filename = 'batch_input_template_custom.csv';
        
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(template);
      }
    } else {
      // Standard format (CSV only for now)
      const template = BatchInputParser.generateSampleTemplate();
      const filename = 'batch_input_template.csv';
      
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(template);
    }

  } catch (error) {
    console.error('Error generating template:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate template'
    });
  }
});

/**
 * Set up WebSocket or SSE for real-time progress updates
 */
batchProcessor.on('progress', (update) => {
  // In a real implementation, you would emit this through WebSocket or SSE
  console.log('Batch progress:', update);
});

batchProcessor.on('complete', (result) => {
  console.log('Batch complete:', result.sessionId);
});

export default router;