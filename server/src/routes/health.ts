import { Router, Request, Response } from 'express';
import { connectToDatabase, IssueModel, RecurringPatternModel } from '../db/mongodb';
import mongoose from 'mongoose';

const router = Router();

// GET /api/health
router.get('/', async (req: Request, res: Response) => {
  try {
    const db = await connectToDatabase();

    if (db && mongoose.connection.readyState === 1) {
      const issueCount = await IssueModel.countDocuments();
      const patternCount = await RecurringPatternModel.countDocuments();

      return res.json({
        status: 'connected',
        provider: 'MongoDB Atlas',
        database: mongoose.connection.name || 'proof_of_impact',
        host: mongoose.connection.host || 'cluster0.1zwuaww.mongodb.net',
        readyState: mongoose.connection.readyState,
        counts: {
          issues: issueCount,
          recurringPatterns: patternCount
        },
        timestamp: new Date().toISOString()
      });
    }

    return res.json({
      status: 'fallback_local',
      provider: 'Local Resilient Store',
      message: 'MongoDB Atlas not currently connected, serving from local store',
      readyState: mongoose.connection.readyState || 0,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
