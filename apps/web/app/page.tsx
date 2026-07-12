import Link from 'next/link';

const highlights = [
  { label: 'Roles', value: 'Admin, PM, Team Member' },
  { label: 'Security', value: 'JWT + RBAC' },
  { label: 'Stack', value: 'Next.js + Node.js + PostgreSQL' }
];

const cards = [
  {
    title: 'Administrator',
    text: 'Manage users, roles, projects, and access with an admin-first overview.'
  },
  {
    title: 'Project Manager',
    text: 'Create projects, assign team members, and keep delivery moving.'
  },
  {
    title: 'Team Member',
    text: 'Track assigned tasks, update progress, and stay aligned with the team.'
  }
];

export default function HomePage() {
  return (
    <main className="shell">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">CyphLab practical assignment</p>
          <h1>Project and Team Task Management Platform</h1>
          <p className="lede">
            A role-aware work management platform for admins, project managers, and team members.
          </p>
          <div className="actions">
            <Link className="button primary" href="/login">
              Open dashboard
            </Link>
            <a className="button secondary" href="http://localhost:4000/health">
              Check API health
            </a>
          </div>
        </div>
        <aside className="stat-panel">
          {highlights.map((item) => (
            <div key={item.label} className="stat-card">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </aside>
      </section>

      <section className="grid three-up">
        {cards.map((card) => (
          <article key={card.title} className="feature-card">
            <h2>{card.title}</h2>
            <p>{card.text}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
