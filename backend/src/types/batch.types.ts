// Type definitions for batch processing system

export interface BatchMetadata {
  contact_first_name?: string;
  contact_last_name?: string;
  job_title?: string;
  main_phone?: string;
  email?: string;
  original_preparer?: string;
  notes?: string;
  // Any additional custom fields from the input CSV
  [key: string]: string | undefined;
}

export interface BatchInputRow {
  google_sheets_url: string;
  metadata: BatchMetadata;
  rowIndex: number; // Track original row position
}

export interface BatchJobStatus {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
  extractedData?: any;
  transformedData?: any;
  startTime?: Date;
  endTime?: Date;
}

export interface BatchJob extends BatchInputRow {
  jobStatus: BatchJobStatus;
}

export interface BatchSession {
  sessionId: string;
  createdAt: Date;
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  status: 'idle' | 'processing' | 'completed' | 'cancelled';
  jobs: BatchJob[];
  inputFileName?: string;
  outputFileName?: string;
  startTime?: Date;
  endTime?: Date;
}

export interface BatchProcessingResult {
  sessionId: string;
  success: boolean;
  totalProcessed: number;
  successCount: number;
  failureCount: number;
  results: BatchJobResult[];
  csvBuffer?: Buffer;
  report: BatchProcessingReport;
}

export interface BatchJobResult {
  rowIndex: number;
  google_sheets_url: string;
  status: 'success' | 'failed';
  error?: string;
  processedData?: any; // The 52-field row data
  processingTime?: number; // milliseconds
}

export interface BatchProcessingReport {
  sessionId: string;
  startTime: Date;
  endTime: Date;
  duration: number; // milliseconds
  totalRows: number;
  processedRows: number;
  successfulRows: number;
  failedRows: number;
  successRate: number; // percentage
  averageProcessingTime: number; // milliseconds per row
  errors: Array<{
    rowIndex: number;
    url: string;
    error: string;
  }>;
  warnings: string[];
}

export interface BatchProgressUpdate {
  sessionId: string;
  currentIndex: number;
  totalJobs: number;
  currentUrl: string;
  status: 'processing' | 'completed' | 'failed';
  message?: string;
  percentComplete: number;
}