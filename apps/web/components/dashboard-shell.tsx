"use client";

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useSession } from '../lib/session';

const navigation = [
  { href: '/dashboard', label: 'Overview', roles: ['ADMIN', 'PROJECT_MANAGER', 'TEAM_MEMBER'] },
  { href: '/dashboard/projects', label: 'Projects', roles: ['ADMIN', 'PROJECT_MANAGER', 'TEAM_MEMBER'] },
  { href: '/dashboard/tasks', label: 'Tasks', roles: ['ADMIN', 'PROJECT_MANAGER'] },
  { href: '/dashboard/my-tasks', label: 'My Tasks', roles: ['TEAM_MEMBER'] },
  { href: '/dashboard/users', label: 'Users', roles: ['ADMIN'] }
];

export function DashboardShell({ children }: Readonly<{ children: ReactNode }>) {
  const { session, ready, logout } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const visibleNavigation = navigation.filter((item) => item.roles.includes(session?.user.role ?? ''));

  useEffect(() => {
    if (ready && !session) {
      router.replace('/login');
    }
  }, [ready, session, router]);

  useEffect(() => {
    if (!ready || !session) {
      return;
    }

    const currentItem = navigation.find((item) => item.href === pathname);
    if (currentItem && !currentItem.roles.includes(session.user.role)) {
      const fallback =
        session.user.role === 'TEAM_MEMBER'
          ? '/dashboard/my-tasks'
          : session.user.role === 'PROJECT_MANAGER'
            ? '/dashboard/tasks'
            : '/dashboard';
      router.replace(fallback);
    }
  }, [pathname, ready, router, session]);

  if (!ready || !session) {
    return (
      <main className="shell auth-shell">
        <section className="auth-card">
          <p className="eyebrow">Loading session</p>
          <h1>Restoring your workspace</h1>
          <p>Please wait while the platform checks your JWT session.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="shell dashboard-grid">
      <aside className="side-panel">
        <div>
          <p className="eyebrow">Signed in as</p>
          <h1>{session.user.fullName}</h1>
          <p>{session.user.email}</p>
          <span className="status-pill">{session.user.role}</span>
        </div>

        <nav className="side-nav">
          {visibleNavigation.map((item) => (
            <Link key={item.href} className={pathname === item.href ? 'side-link active' : 'side-link'} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <button className="button secondary full" type="button" onClick={logout}>
          Sign out
        </button>
      </aside>

      <section className="workspace-panel">{children}</section>
    </main>
  );
}
