const r = await fetch('http://localhost:3002' + (process.argv[2] || '/admin/categories'));
const t = await r.text();
const i = t.indexOf('"message"');
console.log(t.slice(i, i + 400));
