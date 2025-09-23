// API Configuration
const isDevelopment = process.env.NODE_ENV === 'development';

// Use environment variable or fallback to localhost
export const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (isDevelopment ? 'http://localhost:5001' : window.location.origin);

export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH_STATUS: `${API_BASE_URL}/api/auth/server-status`,
  AUTH_VERIFY: `${API_BASE_URL}/api/auth/verify`,
  AUTH_LOGIN: `${API_BASE_URL}/api/auth/google`,
  AUTH_LOGOUT: `${API_BASE_URL}/api/auth/logout`,
  
  // Upload endpoints
  UPLOAD_FILE: `${API_BASE_URL}/api/upload/file`,
  
  // Process endpoints
  PROCESS_SHEETS: `${API_BASE_URL}/api/process/sheets`,
  PROCESS_NO_COPY: `${API_BASE_URL}/api/process-no-copy/sheets`,
  
  // Batch endpoints
  BATCH_UPLOAD: `${API_BASE_URL}/api/batch/upload`,
  BATCH_PROCESS: (sessionId: string) => `${API_BASE_URL}/api/batch/process/${sessionId}`,
  BATCH_STATUS: (sessionId: string) => `${API_BASE_URL}/api/batch/status/${sessionId}`,
  BATCH_RESULTS: (sessionId: string) => `${API_BASE_URL}/api/batch/results/${sessionId}`,
  
  // Template endpoints
  TEMPLATE_PROCESS: `${API_BASE_URL}/api/template/process`,
  
  // Read sheets endpoints
  READ_SHEETS: `${API_BASE_URL}/api/sheets/read`,
  
  // Health check
  HEALTH: `${API_BASE_URL}/api/health`,
};

export default {
  API_BASE_URL,
  API_ENDPOINTS
};