import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './routes/auth';
import uploadRoutes from './routes/upload';
import processRoutes from './routes/process';
import processNoCopyRoutes from './routes/processNoCopy';
import readSheetsRoutes from './routes/readSheets';
import templateProcessorRoutes from './routes/templateProcessor';
import batchProcessorRoutes from './routes/batchProcessor';
import driveRoutes from './routes/drive';
import { initializeServiceAccount } from './services/googleService';
import { initializeServiceAccount as initServiceAccount } from './services/googleServiceAccount';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configure CORS for production
const allowedOrigins = process.env.FRONTEND_URL 
  ? [process.env.FRONTEND_URL]
  : ['http://localhost:3000', 'http://localhost:3001'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else if (process.env.NODE_ENV === 'production') {
      // In production, allow Railway domains
      if (origin.includes('.railway.app') || origin.includes('.up.railway.app')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    } else {
      callback(null, true); // Allow all origins in development
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/process', processRoutes);
app.use('/api/process-no-copy', processNoCopyRoutes);
app.use('/api/sheets', readSheetsRoutes);
app.use('/api/template', templateProcessorRoutes);
app.use('/api/batch', batchProcessorRoutes);
app.use('/api/drive', driveRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Initialize Google service on startup
const startServer = async () => {
  try {
    // Skip service account initialization in production if not available
    if (process.env.NODE_ENV !== 'production') {
      try {
        await initServiceAccount();
      } catch (error) {
        console.log('Service account not found, using OAuth instead');
      }
    }
    
    // Use OAuth if refresh token is available
    if (process.env.GOOGLE_REFRESH_TOKEN) {
      await initializeServiceAccount();
      console.log('✅ OAuth authentication initialized with refresh token');
    } else if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
      console.log('✅ OAuth authentication configured');
      console.log('   Users will authenticate with Google when they sign in');
    } else {
      console.log('⚠️ No authentication configured');
      console.log('   Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in environment variables');
    }
  } catch (error) {
    console.error('Warning: Google service initialization:', error);
    console.log('Continuing with OAuth user authentication...');
  }

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Health check available at: http://localhost:${PORT}/api/health`);
  });
};

startServer();