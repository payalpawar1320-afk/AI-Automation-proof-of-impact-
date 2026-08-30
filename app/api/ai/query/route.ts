import { NextRequest, NextResponse } from 'next/server';
import { runAIQuery } from '@/lib/ai/query';
import { DomainType } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, domain } = body;

    if (!query) {
      return NextResponse.json({ error: 'Query text is required' }, { status: 400 });
    }

    const result = await runAIQuery({
      query,
      domain: domain as DomainType | undefined
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in AI query route:', error);
    return NextResponse.json({ error: 'Query execution failed' }, { status: 500 });
  }
}
