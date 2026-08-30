import { NextRequest, NextResponse } from 'next/server';
import { runAITriage } from '@/lib/ai/triage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, domain = 'campus', imageUrl } = body;

    if (!title && !description) {
      return NextResponse.json({ error: 'Title or description required' }, { status: 400 });
    }

    const triageResult = await runAITriage({
      title: title || '',
      description: description || '',
      domain,
      imageUrl
    });

    return NextResponse.json(triageResult);
  } catch (error) {
    console.error('Error in AI triage route:', error);
    return NextResponse.json({ error: 'AI Triage failed' }, { status: 500 });
  }
}
