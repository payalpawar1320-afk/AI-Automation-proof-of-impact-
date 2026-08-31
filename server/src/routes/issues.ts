import { Router, Request, Response } from 'express';
import { getDatabase, saveDatabase } from '../store';
import { runAITriage } from '../ai/triage';
import { Issue, DomainType, IssueStatus } from '../types';

const router = Router();

// GET /api/issues
router.get('/', (req: Request, res: Response) => {
  try {
    const domain = req.query.domain as DomainType | undefined;
    const status = req.query.status as string | undefined;
    const category = req.query.category as string | undefined;
    const search = (req.query.search as string | undefined)?.toLowerCase();

    const db = getDatabase();
    let results = db.issues;

    if (domain) {
      results = results.filter(i => i.domain === domain);
    }
    if (status && status !== 'ALL') {
      results = results.filter(i => i.status === status);
    }
    if (category && category !== 'ALL') {
      results = results.filter(i => i.category.toLowerCase().includes(category.toLowerCase()));
    }
    if (search) {
      results = results.filter(i =>
        i.title.toLowerCase().includes(search) ||
        i.description.toLowerCase().includes(search) ||
        i.location.toLowerCase().includes(search) ||
        i.asset.toLowerCase().includes(search) ||
        i.id.toLowerCase().includes(search)
      );
    }

    return res.json({ issues: results, total: results.length });
  } catch (error: any) {
    console.error('Error fetching issues:', error);
    return res.status(500).json({ error: 'Failed to fetch issues' });
  }
});

// POST /api/issues
router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, description, domain = 'campus', beforeImageUrl, beforeNotes, reportedBy = 'Citizen / Reporter' } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    const db = getDatabase();

    // Auto-run AI Triage
    const triage = await runAITriage({ title, description, domain, imageUrl: beforeImageUrl });

    const newId = `${domain.toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date().toISOString();

    const newIssue: Issue = {
      id: newId,
      title,
      description,
      domain,
      category: triage.category,
      department: triage.department,
      priority: triage.priority,
      asset: triage.asset,
      location: triage.location,
      status: 'REPORTED',
      reportedBy,
      createdAt: now,
      updatedAt: now,
      slaHours: triage.priority === 'CRITICAL' ? 12 : (triage.priority === 'HIGH' ? 24 : 48),
      evidence: {
        beforeImageUrl: beforeImageUrl || 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
        beforeNotes: beforeNotes || description
      },
      timeline: [
        {
          id: `t-${Date.now()}-1`,
          stage: 'REPORT',
          title: 'Problem Intake Logged',
          description: `Report filed by ${reportedBy}.`,
          actor: reportedBy,
          timestamp: now
        },
        {
          id: `t-${Date.now()}-2`,
          stage: 'TRIAGE',
          title: `AI Triage: Auto-Categorized (${triage.confidence}% Confidence)`,
          description: `Extracted Category: ${triage.category}, Asset: ${triage.asset}, Priority: ${triage.priority}.`,
          actor: 'ImpactLoop NLP Engine',
          timestamp: new Date(Date.now() + 1000).toISOString()
        },
        {
          id: `t-${Date.now()}-3`,
          stage: 'ROUTING',
          title: `Auto-Routed to ${triage.department}`,
          description: `Dispatched to department queue with ${triage.priority === 'CRITICAL' ? 12 : 24}h SLA target.`,
          actor: 'ImpactLoop Smart Dispatch',
          timestamp: new Date(Date.now() + 2000).toISOString()
        }
      ]
    };

    if (triage.potentialDuplicates && triage.potentialDuplicates.length > 0 && triage.potentialDuplicates[0].similarity > 75) {
      newIssue.duplicateOfId = triage.potentialDuplicates[0].id;
    }

    db.issues.unshift(newIssue);
    saveDatabase(db);

    return res.json({ issue: newIssue, triage });
  } catch (error: any) {
    console.error('Error creating issue:', error);
    return res.status(500).json({ error: 'Failed to create issue' });
  }
});

// GET /api/issues/:id
router.get('/:id', (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const issue = db.issues.find(i => i.id === req.params.id);
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }
    return res.json({ issue });
  } catch (error: any) {
    console.error('Error fetching issue:', error);
    return res.status(500).json({ error: 'Failed to fetch issue' });
  }
});

// PATCH /api/issues/:id
router.patch('/:id', (req: Request, res: Response) => {
  try {
    const body = req.body;
    const db = getDatabase();
    const issueIndex = db.issues.findIndex(i => i.id === req.params.id);

    if (issueIndex === -1) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    const currentIssue = db.issues[issueIndex];
    const now = new Date().toISOString();

    if (body.action === 'CLAIM_RESOLUTION') {
      const { afterImageUrl, afterNotes, claimedBy = 'Technician' } = body;

      currentIssue.status = 'PENDING_VERIFICATION';
      currentIssue.claimedBy = claimedBy;
      currentIssue.updatedAt = now;
      currentIssue.evidence = {
        ...currentIssue.evidence,
        afterImageUrl: afterImageUrl || currentIssue.evidence.afterImageUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
        afterNotes: afterNotes || 'Technician completed repair work.',
        submittedBy: claimedBy,
        submittedAt: now
      };

      currentIssue.timeline.push({
        id: `t-${Date.now()}`,
        stage: 'ACTION_CLAIM',
        title: 'Action Claimed - Awaiting AI Verification',
        description: `Resolution claimed by ${claimedBy}. Proof uploaded and queued for AI Adjudication.`,
        actor: claimedBy,
        timestamp: now
      });
    } else if (body.action === 'UPDATE_STATUS') {
      const newStatus = body.status as IssueStatus;
      currentIssue.status = newStatus;
      currentIssue.updatedAt = now;

      currentIssue.timeline.push({
        id: `t-${Date.now()}`,
        stage: newStatus === 'IN_PROGRESS' ? 'ROUTING' : 'TRIAGE',
        title: `Status Changed to ${newStatus.replace('_', ' ')}`,
        description: body.note || `Status updated manually.`,
        actor: body.actor || 'Operations Supervisor',
        timestamp: now
      });
    }

    db.issues[issueIndex] = currentIssue;
    saveDatabase(db);

    return res.json({ issue: currentIssue });
  } catch (error: any) {
    console.error('Error updating issue:', error);
    return res.status(500).json({ error: 'Failed to update issue' });
  }
});

export default router;
