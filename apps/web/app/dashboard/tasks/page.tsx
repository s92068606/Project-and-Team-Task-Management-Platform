"use client";

import { useEffect, useState } from 'react';
import { apiRequest } from '../../../lib/api';
import { useSession } from '../../../lib/session';

type Project = { id: string; name: string };
type Task = {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  project: Project;
  assignee?: { id: string; fullName: string; email: string } | null;
};

export default function TasksPage() {
  const { session } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [statusByTaskId, setStatusByTaskId] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('TODO');
  const [priority, setPriority] = useState('MEDIUM');
  const [projectId, setProjectId] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [message, setMessage] = useState('');

  const token = session?.token;
  const canManageTasks = session?.user.role === 'ADMIN' || session?.user.role === 'PROJECT_MANAGER';

  const loadTasks = async () => {
    if (!token) return;
    const [projectData, taskData] = await Promise.all([
      apiRequest<Project[]>('/projects', {}, token),
      apiRequest<Task[]>('/tasks', {}, token)
    ]);
    setProjects(projectData);
    setTasks(taskData);
    setStatusByTaskId((current) => {
      const nextStatus = { ...current };
      for (const task of taskData) {
        if (!nextStatus[task.id]) {
          nextStatus[task.id] = task.status;
        }
      }
      return nextStatus;
    });
    setProjectId((current) => current || projectData[0]?.id || '');
  };

  useEffect(() => {
    loadTasks().catch(() => undefined);
  }, [token]);

  const resetForm = () => {
    setEditingId('');
    setTitle('');
    setDescription('');
    setStatus('TODO');
    setPriority('MEDIUM');
    setProjectId(projects[0]?.id ?? '');
    setAssigneeId('');
  };

  const submit = async () => {
    if (!token) return;
    setMessage('Saving task...');
    const payload = { title, description, status, priority, projectId, assigneeId: assigneeId || null };
    if (editingId) {
      await apiRequest(`/tasks/${editingId}`, { method: 'PATCH', body: JSON.stringify(payload) }, token);
    } else {
      await apiRequest('/tasks', { method: 'POST', body: JSON.stringify(payload) }, token);
    }
    await loadTasks();
    resetForm();
    setMessage('Task saved.');
  };

  const beginEdit = (task: Task) => {
    setEditingId(task.id);
    setTitle(task.title);
    setDescription(task.description ?? '');
    setStatus(task.status);
    setPriority(task.priority);
    setProjectId(task.project.id);
    setAssigneeId(task.assignee?.id ?? '');
  };

  const updateTaskStatus = async (taskId: string) => {
    if (!token) return;
    setMessage('Updating task status...');
    await apiRequest(`/tasks/${taskId}`, { method: 'PATCH', body: JSON.stringify({ status: statusByTaskId[taskId] }) }, token);
    await loadTasks();
    setMessage('Task progress updated.');
  };

  const remove = async (id: string) => {
    if (!token) return;
    await apiRequest(`/tasks/${id}`, { method: 'DELETE' }, token);
    await loadTasks();
  };

  return (
    <div className="workspace-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Tasks</p>
          <h1>Task CRUD</h1>
        </div>
        <span className="status-pill">{tasks.length} records</span>
      </header>

      {canManageTasks ? (
        <section className="content-panel">
          <h2>{editingId ? 'Edit task' : 'Create task'}</h2>
          <div className="form-grid">
            <label>
              Title
              <input value={title} onChange={(event) => setTitle(event.target.value)} />
            </label>
            <label>
              Status
              <input value={status} onChange={(event) => setStatus(event.target.value)} />
            </label>
            <label>
              Priority
              <input value={priority} onChange={(event) => setPriority(event.target.value)} />
            </label>
            <label>
              Project
              <select value={projectId} onChange={(event) => setProjectId(event.target.value)}>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Assignee ID
              <input value={assigneeId} onChange={(event) => setAssigneeId(event.target.value)} />
            </label>
            <label className="span-2">
              Description
              <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={4} />
            </label>
          </div>
          {message ? <p className="form-note">{message}</p> : null}
          <div className="actions">
            <button className="button primary" type="button" onClick={submit}>
              {editingId ? 'Update task' : 'Create task'}
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
          <p className="eyebrow">My tasks</p>
          <h2>Track progress</h2>
          <p>Team members can update the status of their assigned tasks, but cannot create or delete tasks.</p>
        </section>
      )}

      <section className="content-panel">
        <h2>Saved tasks</h2>
        <div className="record-list">
          {tasks.map((task) => (
            <article key={task.id} className="record-card">
              <div>
                <strong>{task.title}</strong>
                <p>{task.description ?? 'No description'}</p>
                <span>
                  Project: {task.project.name} | Priority: {task.priority} | Status: {task.status}
                </span>
              </div>
              {canManageTasks ? (
                <div className="record-actions">
                  <button className="button secondary" type="button" onClick={() => beginEdit(task)}>
                    Edit
                  </button>
                  <button className="button secondary danger" type="button" onClick={() => remove(task.id)}>
                    Delete
                  </button>
                </div>
              ) : (
                <div className="record-actions status-editor">
                  <label>
                    Progress
                    <select value={statusByTaskId[task.id] ?? task.status} onChange={(event) => setStatusByTaskId({ ...statusByTaskId, [task.id]: event.target.value })}>
                      <option value="TODO">TODO</option>
                      <option value="IN_PROGRESS">IN_PROGRESS</option>
                      <option value="BLOCKED">BLOCKED</option>
                      <option value="DONE">DONE</option>
                    </select>
                  </label>
                  <button className="button secondary" type="button" onClick={() => updateTaskStatus(task.id)}>
                    Save progress
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
