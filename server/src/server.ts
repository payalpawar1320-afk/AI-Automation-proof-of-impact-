import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { connectToDatabase } from './db/mongodb';
import { fetchFromMongoAtlas } from './store';

import issuesRouter from './routes/issues';
import aiRouter from './routes/ai';
import analyticsRouter from './routes/analytics';
import seedRouter from './routes/seed';
import healthRouter from './routes/health';

const app = express();
const PORT = process.env.PORT || 5000;

// Exact allowed CORS origins
const allowedOrigins: string[] = [
  'http://localhost:3000',
  'https://ai-automation-proof-of-impact.vercel.app'
];

if (process.env.FRONTEND_URL) {
  const normalizedFrontendUrl = process.env.FRONTEND_URL.replace(/\/$/, '');
  if (!allowedOrigins.includes(normalizedFrontendUrl)) {
    allowedOrigins.push(normalizedFrontendUrl);
  }
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests or allowed frontend origins
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    console.warn(`[CORS Blocked] Origin not allowed: ${origin}`);
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing with 15mb limit for photo evidence uploads
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Root welcome & status
app.get('/', (req, res) => {
  res.json({
    name: 'Proof of Impact Backend API',
    status: 'online',
    version: '1.0.0',
    endpoints: [
      '/api/health',
      '/api/issues',
      '/api/ai/triage',
      '/api/ai/verify',
      '/api/ai/patterns',
      '/api/ai/query',
      '/api/analytics/departments',
      '/api/seed'
    ],
    timestamp: new Date().toISOString()
  });
});

// Mount modular API routers
app.use('/api/issues', issuesRouter);
app.use('/api/ai', aiRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/seed', seedRouter);
app.use('/api/health', healthRouter);

// Start server
app.listen(PORT, async () => {
  console.log(`====================================================`);
  console.log(`🚀 Proof of Impact API Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔒 Allowed CORS Origins:`, allowedOrigins);
  console.log(`====================================================`);

  // Connect to MongoDB Atlas and prefetch/sync records
  try {
    await connectToDatabase();
    await fetchFromMongoAtlas();
  } catch (err) {
    console.warn('Initial MongoDB Atlas sync warning:', err);
  }
});
