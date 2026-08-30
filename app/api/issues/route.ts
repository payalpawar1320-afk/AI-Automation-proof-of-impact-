import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, saveDatabase } from '@/lib/store';
import { runAITriage } from '@/lib/ai/triage';
import { Issue, DomainType } from '@/lib/types';

export const dynamic = 'force-dynamic';


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain') as DomainType | null;
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const search = searchParams.get('search')?.toLowerCase();

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

    return NextResponse.json({ issues: results, total: results.length });
  } catch (error) {
    console.error('Error fetching issues:', error);
    return NextResponse.json({ error: 'Failed to fetch issues' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, domain = 'campus', beforeImageUrl, beforeNotes, reportedBy = 'Citizen / Reporter' } = body;

    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
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

    // If duplicate detected, link it
    if (triage.potentialDuplicates && triage.potentialDuplicates.length > 0 && triage.potentialDuplicates[0].similarity > 75) {
      newIssue.duplicateOfId = triage.potentialDuplicates[0].id;
    }

    db.issues.unshift(newIssue);
    saveDatabase(db);

    return NextResponse.json({ issue: newIssue, triage });
  } catch (error) {
    console.error('Error creating issue:', error);
    return NextResponse.json({ error: 'Failed to create issue' }, { status: 500 });
  }
}
