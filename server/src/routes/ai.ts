import { Router, Request, Response } from 'express';
import { runAITriage } from '../ai/triage';
import { runAIAdjudication } from '../ai/verify';
import { detectRecurringPatterns } from '../ai/patterns';
import { runAIQuery } from '../ai/query';
import { getDatabase, saveDatabase } from '../store';
import { DomainType } from '../types';

const router = Router();

// POST /api/ai/triage
router.post('/triage', async (req: Request, res: Response) => {
  try {
    const { title, description, domain = 'campus', imageUrl } = req.body;

    if (!title && !description) {
      return res.status(400).json({ error: 'Title or description required' });
    }

    const triageResult = await runAITriage({
      title: title || '',
      description: description || '',
      domain,
      imageUrl
    });

    return res.json(triageResult);
  } catch (error: any) {
    console.error('Error in AI triage route:', error);
    return res.status(500).json({ error: 'AI Triage failed' });
  }
});

// POST /api/ai/verify
router.post('/verify', async (req: Request, res: Response) => {
  try {
    const { issueId, beforeNotes, afterNotes, beforeImageUrl, afterImageUrl } = req.body;

    if (!issueId) {
      return res.status(400).json({ error: 'Issue ID required' });
    }

    const db = getDatabase();
    const issueIndex = db.issues.findIndex(i => i.id === issueId);

    if (issueIndex === -1) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    const issue = db.issues[issueIndex];
    const now = new Date().toISOString();

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

    return res.json({
      success: true,
      issue,
      adjudication
    });
  } catch (error: any) {
    console.error('Error in AI verify route:', error);
    return res.status(500).json({ error: 'AI Verification failed' });
  }
});

// GET /api/ai/patterns
router.get('/patterns', async (req: Request, res: Response) => {
  try {
    const domain = req.query.domain as DomainType | undefined;
    const patterns = await detectRecurringPatterns(domain || undefined);
    return res.json({ patterns });
  } catch (error: any) {
    console.error('Error fetching patterns:', error);
    return res.status(500).json({ error: 'Failed to fetch patterns' });
  }
});

// POST /api/ai/query
router.post('/query', async (req: Request, res: Response) => {
  try {
    const { query, domain } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query text is required' });
    }

    const result = await runAIQuery({
      query,
      domain: domain as DomainType | undefined
    });

    return res.json(result);
  } catch (error: any) {
    console.error('Error in AI query route:', error);
    return res.status(500).json({ error: 'Query execution failed' });
  }
});

export default router;
