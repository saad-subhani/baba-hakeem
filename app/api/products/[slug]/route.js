import { NextResponse } from 'next/server';
import { runQuery } from '../../../../lib/store';

export const runtime = 'nodejs';

export async function GET(_request, { params }) {
  const slugParam = params?.slug ? String(params.slug) : '';
  if (!slugParam) return NextResponse.json({ error: 'Product slug is required.' }, { status: 400 });

  let { data, error } = await runQuery({
    table: 'products',
    select: '*',
    filters: [{ column: 'slug', value: slugParam }],
    limit: 1
  });

  if (!error && (!data || !data.length)) {
    ({ data, error } = await runQuery({
      table: 'products',
      select: '*',
      filters: [{ column: 'id', value: slugParam }],
      limit: 1
    }));
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data || !data.length) return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
  return NextResponse.json(data[0]);
}
