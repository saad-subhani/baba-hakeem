// Exercises category create/rename/delete through the dashboard RPC path.
const base = process.env.BASE || 'http://localhost:3002';
const login = await fetch(base + '/api/local/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ action: 'login', email: 'admin@baba-hakeem.com', password: 'admin123' }) });
const cookie = login.headers.getSetCookie().map(c => c.split(';')[0]).join('; ');
const rpc = async (name, args) => {
  const r = await fetch(base + '/api/local/rpc', { method: 'POST', headers: { 'Content-Type': 'application/json', cookie },
    body: JSON.stringify({ name, args }) });
  return { status: r.status, body: await r.json().catch(() => null) };
};
// create
const created = await rpc('upsert_category', { p_name: 'ZZZ Test Cat' });
console.log('create:', created.status, JSON.stringify(created.body));
const id = created.body?.data?.[0]?.id;
// rename (this path may hit the undefined-bind bug)
if (id) {
  const renamed = await rpc('upsert_category', { p_id: id, p_name: 'ZZZ Test Cat Renamed' });
  console.log('rename:', renamed.status, JSON.stringify(renamed.body));
  const del = await rpc('delete_category', { p_id: id });
  console.log('delete:', del.status, JSON.stringify(del.body));
}
// list as the dashboard does
const q = await fetch(base + '/api/local/query', { method: 'POST', headers: { 'Content-Type': 'application/json', cookie },
  body: JSON.stringify({ table: 'categories', select: 'id,name,slug,created_at', order: { column: 'name', ascending: true } }) });
console.log('list:', q.status, (await q.json()).data?.map(c => c.name).join(' | '));
