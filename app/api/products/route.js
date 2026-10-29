import { NextResponse } from 'next/server';
import { runQuery } from '../../../lib/store';

export const runtime='nodejs';

export async function GET() {
  const { data, error } = await runQuery({
    table: 'products',
    select: '*',
    filters: [{ column: 'status', value: 'Published' }],
    order: { column: 'sort_order', ascending: true }
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data || []);
}
