import { NextResponse } from 'next/server';
import { resetDatabase } from '@/lib/store';

export async function POST() {
  try {
    const db = resetDatabase();
    return NextResponse.json({ success: true, message: 'Database reset to default test scenarios', total: db.issues.length });
  } catch (error) {
    console.error('Error resetting database:', error);
    return NextResponse.json({ error: 'Failed to reset database' }, { status: 500 });
  }
}
