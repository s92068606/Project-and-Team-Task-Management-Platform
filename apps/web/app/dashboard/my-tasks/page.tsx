"use client";

import { useEffect, useState } from 'react';
import { apiRequest } from '../../../lib/api';
import { useSession } from '../../../lib/session';

type Task = {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  project: { id: string; name: string };
};

export default function MyTasksPage() {
  const { session } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [statusByTaskId, setStatusByTaskId] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');

  const token = session?.token;

  const loadTasks = async () => {
    if (!token) return;
    const data = await apiRequest<Task[]>('/tasks', {}, token);
    setTasks(data);
    setStatusByTaskId((current) => {
      const next = { ...current };
      for (const task of data) {
        if (!next[task.id]) {
          next[task.id] = task.status;
        }
      }
      return next;
    });
  };

  useEffect(() => {
    loadTasks().catch(() => undefined);
  }, [token]);

  const updateTaskStatus = async (taskId: string) => {
    if (!token) return;
    setMessage('Updating progress...');
    await apiRequest(`/tasks/${taskId}`, { method: 'PATCH', body: JSON.stringify({ status: statusByTaskId[taskId] }) }, token);
    await loadTasks();
    setMessage('Progress updated.');
  };

  return (
    <div className="workspace-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">My Tasks</p>
          <h1>Assigned work</h1>
        </div>
        <span className="status-pill">{tasks.length} records</span>
      </header>

      <section className="content-panel">
        <h2>Task progress</h2>
        <p>Update the status of the tasks assigned to you. Managers and admins use the full task screen.</p>
        {message ? <p className="form-note">{message}</p> : null}
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
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
