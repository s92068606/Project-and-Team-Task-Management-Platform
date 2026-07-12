"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiRequest } from '../../../lib/api';
import { useSession } from '../../../lib/session';

type User = {
  id: string;
  fullName: string;
  email: string;
  role: string;
};

export default function UsersPage() {
  const router = useRouter();
  const { session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [editingId, setEditingId] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('TEAM_MEMBER');
  const [message, setMessage] = useState('');

  const token = session?.token;

  useEffect(() => {
    if (session && session.user.role !== 'ADMIN') {
      router.replace('/dashboard');
    }
  }, [router, session]);

  if (session && session.user.role !== 'ADMIN') {
    return (
      <div className="workspace-stack">
        <section className="content-panel">
          <p className="eyebrow">Access restricted</p>
          <h1>Administrator access only</h1>
          <p>This screen is hidden from project managers and team members.</p>
        </section>
      </div>
    );
  }

  const loadUsers = async () => {
    if (!token) return;
    const data = await apiRequest<User[]>('/users', {}, token);
    setUsers(data);
  };

  useEffect(() => {
    loadUsers().catch(() => undefined);
  }, [token]);

  const resetForm = () => {
    setEditingId('');
    setFullName('');
    setEmail('');
    setPassword('');
    setRole('TEAM_MEMBER');
  };

  const submit = async () => {
    if (!token) return;
    setMessage('Saving user...');
    const payload = { fullName, email, password, role };
    if (editingId) {
      await apiRequest(`/users/${editingId}`, { method: 'PATCH', body: JSON.stringify(payload) }, token);
    } else {
      await apiRequest('/users', { method: 'POST', body: JSON.stringify(payload) }, token);
    }
    await loadUsers();
    resetForm();
    setMessage('User saved.');
  };

  const beginEdit = (user: User) => {
    setEditingId(user.id);
    setFullName(user.fullName);
    setEmail(user.email);
    setPassword('');
    setRole(user.role);
  };

  const remove = async (id: string) => {
    if (!token) return;
    await apiRequest(`/users/${id}`, { method: 'DELETE' }, token);
    await loadUsers();
  };

  return (
    <div className="workspace-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Users</p>
          <h1>User CRUD</h1>
        </div>
        <span className="status-pill">Admin only</span>
      </header>

      <section className="content-panel">
        <h2>{editingId ? 'Edit user' : 'Create user'}</h2>
        <div className="form-grid">
          <label>
            Full name
            <input value={fullName} onChange={(event) => setFullName(event.target.value)} />
          </label>
          <label>
            Email
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" />
          </label>
          <label>
            Password
            <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" />
          </label>
          <label>
            Role
            <select value={role} onChange={(event) => setRole(event.target.value)}>
              <option value="ADMIN">ADMIN</option>
              <option value="PROJECT_MANAGER">PROJECT_MANAGER</option>
              <option value="TEAM_MEMBER">TEAM_MEMBER</option>
            </select>
          </label>
        </div>
        {message ? <p className="form-note">{message}</p> : null}
        <div className="actions">
          <button className="button primary" type="button" onClick={submit}>
            {editingId ? 'Update user' : 'Create user'}
          </button>
          {editingId ? (
            <button className="button secondary" type="button" onClick={resetForm}>
              Cancel
            </button>
          ) : null}
        </div>
      </section>

      <section className="content-panel">
        <h2>Saved users</h2>
        <div className="record-list">
          {users.map((user) => (
            <article key={user.id} className="record-card">
              <div>
                <strong>{user.fullName}</strong>
                <p>{user.email}</p>
                <span>Role: {user.role}</span>
              </div>
              <div className="record-actions">
                <button className="button secondary" type="button" onClick={() => beginEdit(user)}>
                  Edit
                </button>
                <button className="button secondary danger" type="button" onClick={() => remove(user.id)}>
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
