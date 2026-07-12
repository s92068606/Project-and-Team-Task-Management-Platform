"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { useSession } from '../../../lib/session';

export default function LoginPage() {
  const router = useRouter();
  const { login, session, ready } = useSession();
  const [email, setEmail] = useState('admin@cyphlab.test');
  const [password, setPassword] = useState('Password123!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ready && session) {
      router.replace('/dashboard');
    }
  }, [ready, router, session]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Unable to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="shell auth-shell">
      <section className="auth-card login-card">
        <p className="eyebrow">Secure login</p>
        <h1>Sign in to the platform</h1>
        <p>Use the seeded demo account to continue into the management workspace.</p>

        <form className="stack-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" />
          </label>
          <label>
            Password
            <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" />
          </label>
          {error ? <p className="form-error">{error}</p> : null}
          <button className="button primary full" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="demo-block">
          <strong>Demo accounts</strong>
          <span>admin@cyphlab.test</span>
          <span>manager@cyphlab.test</span>
          <span>member@cyphlab.test</span>
        </div>
      </section>
    </main>
  );
}
