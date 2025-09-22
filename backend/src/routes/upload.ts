import { Router } from 'express';
import multer from 'multer';
import xlsx from 'xlsx';
import fs from 'fs/promises';
import path from 'path';

const router = Router();

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error as Error, uploadDir);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.xlsx', '.xls', '.csv'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only XLSX, XLS, and CSV files are allowed.'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

router.post('/file', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const filePath = req.file.path;
    const workbook = xlsx.readFile(filePath);
    const sheetNames = workbook.SheetNames;
    
    let allLinks: string[] = [];

    for (const sheetName of sheetNames) {
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
      
      // Extract Google Sheets URLs from the data
      for (const row of data) {
        for (const cell of row) {
          if (typeof cell === 'string' && isGoogleSheetsUrl(cell)) {
            allLinks.push(cell);
          }
        }
      }
    }

    // Clean up uploaded file
    await fs.unlink(filePath);

    // Remove duplicates
    const uniqueLinks = [...new Set(allLinks)];

    res.json({
      success: true,
      links: uniqueLinks,
      count: uniqueLinks.length
    });
  } catch (error) {
    console.error('Error processing file:', error);
    
    // Clean up file if it exists
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }
    
    res.status(500).json({ error: 'Failed to process file' });
  }
});

function isGoogleSheetsUrl(url: string): boolean {
  const patterns = [
    /^https:\/\/docs\.google\.com\/spreadsheets\/d\/[\w-]+/,
    /^https:\/\/sheets\.google\.com\/[\w-]+/
  ];
  
  return patterns.some(pattern => pattern.test(url));
}

export default router;