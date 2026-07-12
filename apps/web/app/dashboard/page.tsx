"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiRequest } from '../../lib/api';
import { useSession } from '../../lib/session';

type Summary = {
  users: number;
  projects: number;
  tasks: number;
};

export default function DashboardPage() {
  const { session } = useSession();
  const [summary, setSummary] = useState<Summary>({ users: 0, projects: 0, tasks: 0 });
  const navigationLinks =
    session?.user.role === 'ADMIN'
      ? [
          { href: '/dashboard/projects', label: 'Projects' },
          { href: '/dashboard/tasks', label: 'Tasks' },
          { href: '/dashboard/users', label: 'Users' }
        ]
      : session?.user.role === 'PROJECT_MANAGER'
        ? [
            { href: '/dashboard/projects', label: 'Projects' },
            { href: '/dashboard/tasks', label: 'Tasks' }
          ]
        : [{ href: '/dashboard/my-tasks', label: 'My Tasks' }];

  useEffect(() => {
    apiRequest<Summary>('/dashboard/summary', {}, session?.token).then(setSummary).catch(() => undefined);
  }, [session?.token]);

  const cards = [
    { label: 'Users', value: summary.users },
    { label: 'Projects', value: summary.projects },
    { label: 'Tasks', value: summary.tasks }
  ];

  return (
    <div className="workspace-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1>System overview</h1>
        </div>
        <div className="quick-links">
          {navigationLinks.map((item) => (
            <Link key={item.href} className="button secondary" href={item.href}>
              {item.label}
            </Link>
          ))}
        </div>
      </header>

      <section className="grid three-up compact">
        {cards.map((card) => (
          <article key={card.label} className="metric-card">
            <span>{card.label}</span>
            <strong>{card.value}</strong>
          </article>
        ))}
      </section>

      <section className="content-panel">
        <h2>What this build covers</h2>
        <div className="feature-list">
          <article>
            <strong>Session flow</strong>
            <p>JWT login, persisted session state, refresh on reload, and sign out.</p>
          </article>
          <article>
            <strong>CRUD screens</strong>
            <p>Management views for users, projects, and tasks backed by the Node API.</p>
          </article>
          <article>
            <strong>Role-aware access</strong>
            <p>Admins can manage everything, project managers can run delivery, and team members can update work.</p>
          </article>
        </div>
      </section>
    </div>
  );
}
