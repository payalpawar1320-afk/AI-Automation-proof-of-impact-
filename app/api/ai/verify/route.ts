import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, saveDatabase } from '@/lib/store';
import { runAIAdjudication } from '@/lib/ai/verify';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { issueId, beforeNotes, afterNotes, beforeImageUrl, afterImageUrl } = body;

    if (!issueId) {
      return NextResponse.json({ error: 'Issue ID required' }, { status: 400 });
    }

    const db = getDatabase();
    const issueIndex = db.issues.findIndex(i => i.id === issueId);

    if (issueIndex === -1) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }

    const issue = db.issues[issueIndex];
    const now = new Date().toISOString();

    // Run AI Adjudication
    const adjudication = await runAIAdjudication(issue, {
      beforeNotes,
      afterNotes,
      beforeImageUrl,
      afterImageUrl
    });

    issue.adjudication = adjudication;
    issue.updatedAt = now;

    if (adjudication.status === 'VERIFIED_SUCCESSFUL') {
      issue.status = 'VERIFIED_CLOSED';
      issue.verifiedAt = now;
      issue.resolvedAt = issue.resolvedAt || now;

      issue.timeline.push({
        id: `t-${Date.now()}-verify`,
        stage: 'AI_VERIFICATION',
        title: `AI Adjudication APPROVED (${adjudication.confidence}% Confidence)`,
        description: adjudication.summary,
        actor: adjudication.modelUsed,
        timestamp: now,
        metadata: {
          visualScore: adjudication.visualComparisonScore,
          keyFindings: adjudication.keyFindings
        }
      });

      issue.timeline.push({
        id: `t-${Date.now()}-impact`,
        stage: 'IMPACT_LOGGED',
        title: `Impact Score Incremented (+${adjudication.impactScoreDelta} pts)`,
        description: `Verified resolution credited to ${issue.department}. Loop successfully closed.`,
        actor: 'Proof of Impact Ledger',
        timestamp: new Date(Date.now() + 1000).toISOString()
      });
    } else {
      // Verification Failed or Reopened
      issue.status = 'VERIFICATION_FAILED';
      issue.timeline.push({
        id: `t-${Date.now()}-fail`,
        stage: 'AI_VERIFICATION',
        title: `AI Verification REJECTED (${adjudication.confidence}% Confidence)`,
        description: adjudication.summary,
        actor: adjudication.modelUsed,
        timestamp: now,
        metadata: {
          visualScore: adjudication.visualComparisonScore,
          keyFindings: adjudication.keyFindings
        }
      });

      issue.timeline.push({
        id: `t-${Date.now()}-reopen`,
        stage: 'REOPENED',
        title: `Work Order Automatically Reopened & Escalated`,
        description: `Department penalized ${adjudication.impactScoreDelta} pts. Urgent remedy ticket dispatched.`,
        actor: 'ImpactLoop System Policy',
        timestamp: new Date(Date.now() + 1000).toISOString()
      });
    }

    db.issues[issueIndex] = issue;
    saveDatabase(db);

    return NextResponse.json({
      success: true,
      issue,
      adjudication
    });
  } catch (error) {
    console.error('Error in AI verify route:', error);
    return NextResponse.json({ error: 'AI Verification failed' }, { status: 500 });
  }
}
