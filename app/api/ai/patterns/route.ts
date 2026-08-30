import { NextRequest, NextResponse } from 'next/server';
import { detectRecurringPatterns } from '@/lib/ai/patterns';
import { DomainType } from '@/lib/types';

export const dynamic = 'force-dynamic';


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain') as DomainType | null;

    const patterns = await detectRecurringPatterns(domain || undefined);
    return NextResponse.json({ patterns });
  } catch (error) {
    console.error('Error fetching patterns:', error);
    return NextResponse.json({ error: 'Failed to fetch patterns' }, { status: 500 });
  }
}
