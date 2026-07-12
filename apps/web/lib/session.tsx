"use client";

import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiRequest } from './api';

export type UserSession = {
  token: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    role: string;
  };
};

type SessionContextValue = {
  session: UserSession | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<UserSession>;
  logout: () => void;
  refresh: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);
const storageKey = 'cyphlab-session';

export function SessionProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [session, setSession] = useState<UserSession | null>(null);
  const [ready, setReady] = useState(false);

  const persist = (nextSession: UserSession | null) => {
    setSession(nextSession);
    const storage = typeof globalThis === 'undefined' ? undefined : globalThis.localStorage;
    if (!storage) {
      return;
    }
    if (nextSession) {
      storage.setItem(storageKey, JSON.stringify(nextSession));
    } else {
      storage.removeItem(storageKey);
    }
  };

  const refresh = async () => {
    if (!session?.token) {
      return;
    }
    const user = await apiRequest<UserSession['user']>('/auth/me', {}, session.token);
    persist({ token: session.token, user });
  };

  useEffect(() => {
    const storage = typeof globalThis === 'undefined' ? undefined : globalThis.localStorage;
    if (!storage) {
      setReady(true);
      return;
    }

    const raw = storage.getItem(storageKey);
    if (!raw) {
      setReady(true);
      return;
    }

    const stored = JSON.parse(raw) as UserSession;
    setSession(stored);
    apiRequest<UserSession['user']>('/auth/me', {}, stored.token)
      .then((user) => persist({ token: stored.token, user }))
      .catch(() => persist(null))
      .finally(() => setReady(true));
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({
      session,
      ready,
      login: async (email, password) => {
        const result = await apiRequest<UserSession>('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password })
        });
        persist(result);
        return result;
      },
      logout: () => persist(null),
      refresh
    }),
    [session, ready]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return context;
}
