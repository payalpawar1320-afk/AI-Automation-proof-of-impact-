import { NextRequest, NextResponse } from 'next/server';
import { calculateDepartmentMetrics } from '@/lib/store';
import { DomainType } from '@/lib/types';

export const dynamic = 'force-dynamic';


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain') as DomainType | null;

    const metrics = calculateDepartmentMetrics(domain || undefined);
    return NextResponse.json({ departments: metrics });
  } catch (error) {
    console.error('Error fetching department analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
