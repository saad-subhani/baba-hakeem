const categories = [
  { id: 'hair', title: 'Hair Care', accent: '#267644', tint: '#e3f4e6', art: '#a6d879' },
  { id: 'digestive', title: 'Digestion', accent: '#a65d1c', tint: '#fff0d8', art: '#ffc66d' },
  { id: 'joints', title: 'Joint Care', accent: '#5262a3', tint: '#e8eaff', art: '#a9b1f1' },
  { id: 'mens', title: "Men's Care", accent: '#196b78', tint: '#def4f2', art: '#74cfbf' },
  { id: 'wedding', title: 'Wedding Course', accent: '#a64e68', tint: '#ffebef', art: '#f5a8ba' },
];

function CategoryArtwork({ type }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2.2 };
  return <svg viewBox="0 0 120 120" aria-hidden="true" {...common}>
    {type === 'hair' && <><path d="M43 92c-3-15-1-31 2-45 2-9 8-16 15-16s13 7 15 16c3 14 5 30 2 45"/><path d="M49 43c1-11 4-21 11-27m2 27c3-12 9-20 17-24M46 59c-8-8-11-19-9-28m39 31c8-8 12-17 11-27M52 91c3 5 16 5 19 0"/><path d="M54 57c2 2 4 2 6 0m5 0c2 2 4 2 6 0"/></>}
    {type === 'digestive' && <><path d="M58 28v17c0 7-4 11-11 11-9 0-15 7-15 17 0 13 10 22 23 22h13c14 0 23-9 23-22 0-11-7-18-17-18-7 0-10-4-10-11V28"/><path d="M61 48c-2 9-1 15 6 18 7 3 12 1 15 8 3 8-4 16-12 16H54c-7 0-12-5-12-12 0-5 4-9 10-9 10 0 16-7 15-18"/><path d="M57 67c3 4 8 5 13 3"/></>}
    {type === 'joints' && <><path d="M42 28c7 0 13 5 15 12l4 13 13 5c8 3 12 11 9 19-3 7-11 11-19 8l-17-7c-5-2-8-6-10-11l-7-20c-3-9 3-19 12-19Z"/><path d="m54 54 13-4m-20 18 13-5m7-12 4-13c2-7 8-11 15-9 8 2 13 10 11 18l-5 19c-2 7-7 11-14 13"/><circle cx="56" cy="59" r="7" fill="currentColor" opacity=".22"/></>}
    {type === 'mens' && <><circle cx="60" cy="39" r="13"/><path d="M36 94c2-19 9-31 24-31s22 12 24 31M44 74l16 12 16-12M60 86v8"/><path d="m83 27 6-6m-4 14 9-1m-14-8 1-9"/></>}
    {type === 'wedding' && <><path d="M32 64c9-19 20-28 28-28s19 9 28 28c-9 18-20 27-28 27S41 82 32 64Z"/><path d="M45 64h30M60 48v32"/><circle cx="60" cy="64" r="9"/><path d="M30 36c4 2 7 5 9 9m51-9c-4 2-7 5-9 9M29 91c5-1 9-4 12-8m50 8c-5-1-9-4-12-8"/></>}
  </svg>;
}

export default function ProductCategorySection() {
  return <section className="bh-category-section" aria-labelledby="bh-category-title">
    <div className="bh-container">
      <h2 id="bh-category-title" className="bh-category-title">What We Deal In</h2>
      <div className="bh-category-grid">{categories.map((category) => <div className="bh-category-item" key={category.id} style={{ '--category-accent': category.accent, '--category-tint': category.tint, '--category-art': category.art }}>
        <div className="bh-category-art"><span className="bh-category-icon"><CategoryArtwork type={category.id} /></span></div>
        <h3>{category.title}</h3>
      </div>)}</div>
    </div>
  </section>;
}
