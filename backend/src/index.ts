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
import { initializeServiceAccount } from './services/googleService';
import { initializeServiceAccount as initServiceAccount } from './services/googleServiceAccount';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
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

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Initialize Google service on startup
const startServer = async () => {
  try {
    // Try service account first (easier!)
    await initServiceAccount();
    
    // Fall back to OAuth if no service account
    if (!process.env.GOOGLE_REFRESH_TOKEN) {
      console.log('💡 TIP: Using a service account is easier than OAuth!');
      console.log('   1. Create a service account in Google Cloud Console');
      console.log('   2. Download the JSON key as service-account.json');
      console.log('   3. Share your sheets with the service account email');
    } else {
      await initializeServiceAccount();
      console.log('✅ OAuth authentication initialized');
    }
  } catch (error) {
    console.error('Failed to initialize Google service:', error);
  }

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();