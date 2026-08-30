import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, saveDatabase } from '@/lib/store';
import { IssueStatus } from '@/lib/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDatabase();
    const issue = db.issues.find(i => i.id === params.id);
    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }
    return NextResponse.json({ issue });
  } catch (error) {
    console.error('Error fetching issue:', error);
    return NextResponse.json({ error: 'Failed to fetch issue' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const db = getDatabase();
    const issueIndex = db.issues.findIndex(i => i.id === params.id);

    if (issueIndex === -1) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }

    const currentIssue = db.issues[issueIndex];
    const now = new Date().toISOString();

    // Handling Resolution Claim
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

    return NextResponse.json({ issue: currentIssue });
  } catch (error) {
    console.error('Error updating issue:', error);
    return NextResponse.json({ error: 'Failed to update issue' }, { status: 500 });
  }
}
