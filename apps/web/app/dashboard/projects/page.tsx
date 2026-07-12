"use client";

import { useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../../../lib/api';
import { useSession } from '../../../lib/session';

type Project = {
  id: string;
  name: string;
  description?: string | null;
  status: string;
  manager: { id: string; fullName: string; email: string };
  members: Array<{ user: { id: string; fullName: string; email: string } }>;
  tasks: Array<{ id: string }>;
};

export default function ProjectsPage() {
  const { session } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingId, setEditingId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [managerId, setManagerId] = useState(session?.user.id ?? '');
  const [message, setMessage] = useState('');

  const token = session?.token;
  const canEdit = session?.user.role === 'ADMIN' || session?.user.role === 'PROJECT_MANAGER';

  const loadProjects = async () => {
    if (!token) return;
    const data = await apiRequest<Project[]>('/projects', {}, token);
    setProjects(data);
  };

  useEffect(() => {
    loadProjects().catch(() => undefined);
  }, [token]);

  useEffect(() => {
    if (!session) {
      return;
    }
    if (session.user.role === 'TEAM_MEMBER') {
      setEditingId('');
    }
  }, [session]);

  const resetForm = () => {
    setEditingId('');
    setName('');
    setDescription('');
    setStatus('ACTIVE');
    setManagerId(session?.user.id ?? '');
  };

  const submit = async () => {
    if (!token) return;
    setMessage('Saving project...');
    const payload = { name, description, status, managerId: managerId || undefined };
    if (editingId) {
      await apiRequest(`/projects/${editingId}`, { method: 'PATCH', body: JSON.stringify(payload) }, token);
    } else {
      await apiRequest('/projects', { method: 'POST', body: JSON.stringify(payload) }, token);
    }
    await loadProjects();
    resetForm();
    setMessage('Project saved.');
  };

  const beginEdit = (project: Project) => {
    setEditingId(project.id);
    setName(project.name);
    setDescription(project.description ?? '');
    setStatus(project.status);
    setManagerId(project.manager.id);
  };

  const remove = async (id: string) => {
    if (!token) return;
    await apiRequest(`/projects/${id}`, { method: 'DELETE' }, token);
    await loadProjects();
  };

  const totalMembers = useMemo(() => projects.reduce((count, project) => count + project.members.length, 0), [projects]);

  return (
    <div className="workspace-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Projects</p>
          <h1>Project CRUD</h1>
        </div>
        <span className="status-pill">{projects.length} records</span>
      </header>

      {canEdit ? (
        <section className="content-panel">
          <h2>{editingId ? 'Edit project' : 'Create project'}</h2>
          <div className="form-grid">
            <label>
              Name
              <input value={name} onChange={(event) => setName(event.target.value)} />
            </label>
            <label>
              Status
              <input value={status} onChange={(event) => setStatus(event.target.value)} />
            </label>
            <label className="span-2">
              Description
              <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={4} />
            </label>
            <label>
              Manager ID
              <input value={managerId} onChange={(event) => setManagerId(event.target.value)} />
            </label>
          </div>
          {message ? <p className="form-note">{message}</p> : null}
          <div className="actions">
            <button className="button primary" type="button" onClick={submit}>
              {editingId ? 'Update project' : 'Create project'}
            </button>
            {editingId ? (
              <button className="button secondary" type="button" onClick={resetForm}>
                Cancel
              </button>
            ) : null}
          </div>
        </section>
      ) : (
        <section className="content-panel">
          <p className="eyebrow">Read only</p>
          <h2>Assigned projects</h2>
          <p>Team members can view their assigned projects here, but cannot create or edit projects.</p>
        </section>
      )}

      <section className="grid two-up compact">
        <article className="metric-card">
          <span>Projects</span>
          <strong>{projects.length}</strong>
        </article>
        <article className="metric-card">
          <span>Members linked</span>
          <strong>{totalMembers}</strong>
        </article>
      </section>

      <section className="content-panel">
        <h2>Saved projects</h2>
        <div className="record-list">
          {projects.map((project) => (
            <article key={project.id} className="record-card">
              <div>
                <strong>{project.name}</strong>
                <p>{project.description ?? 'No description'}</p>
                <span>
                  Manager: {project.manager.fullName} | Members: {project.members.length} | Tasks: {project.tasks.length}
                </span>
              </div>
              {canEdit ? (
                <div className="record-actions">
                  <button className="button secondary" type="button" onClick={() => beginEdit(project)}>
                    Edit
                  </button>
                  <button className="button secondary danger" type="button" onClick={() => remove(project.id)}>
                    Delete
                  </button>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
