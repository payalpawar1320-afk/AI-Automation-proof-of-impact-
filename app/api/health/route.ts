import { NextResponse } from 'next/server';
import { connectToDatabase, IssueModel, RecurringPatternModel } from '@/lib/db/mongodb';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = await connectToDatabase();
    
    if (db && mongoose.connection.readyState === 1) {
      const issueCount = await IssueModel.countDocuments();
      const patternCount = await RecurringPatternModel.countDocuments();

      return NextResponse.json({
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

    return NextResponse.json({
      status: 'fallback_local',
      provider: 'Local Resilient Store',
      message: 'MongoDB Atlas not currently connected, serving from local store',
      readyState: mongoose.connection.readyState || 0,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
