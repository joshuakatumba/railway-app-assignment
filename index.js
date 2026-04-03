require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ── Postgres connection ────────────────────────────────────────
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// ── Consolidated Frontend (HTML + CSS + JS) ───────────────────
const HTML_CONTENT = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="Task Manager — a CRUD application deployed on Railway PaaS with PostgreSQL" />
  <title>Task Manager | Railway PaaS Demo</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    :root {
      --bg-primary: #0a0a0f; --bg-secondary: #12121a; --bg-card: rgba(255, 255, 255, 0.04);
      --bg-card-hover: rgba(255, 255, 255, 0.07); --border: rgba(255, 255, 255, 0.08);
      --border-focus: rgba(99, 102, 241, 0.5); --text-primary: #f0f0f5; --text-secondary: #8b8b9e;
      --text-muted: #5a5a6e; --accent: #6366f1; --accent-hover: #818cf8; --accent-glow: rgba(99, 102, 241, 0.25);
      --success: #22c55e; --success-bg: rgba(34, 197, 94, 0.12); --warning: #f59e0b;
      --warning-bg: rgba(245, 158, 11, 0.12); --danger: #ef4444; --danger-bg: rgba(239, 68, 68, 0.12);
      --info: #3b82f6; --info-bg: rgba(59, 130, 246, 0.12); --radius: 12px; --radius-sm: 8px; --transition: 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    body { font-family: 'Inter', sans-serif; background: var(--bg-primary); color: var(--text-primary); min-height: 100vh; line-height: 1.6; -webkit-font-smoothing: antialiased; }
    body::before { content: ''; position: fixed; inset: -50%; width: 200%; height: 200%; background: radial-gradient(ellipse at 20% 50%, rgba(99, 102, 241, 0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(139, 92, 246, 0.06) 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(59, 130, 246, 0.05) 0%, transparent 50%); animation: bgShift 20s ease-in-out infinite alternate; z-index: -1; pointer-events: none; }
    @keyframes bgShift { 0% { transform: translate(0, 0) rotate(0deg); } 100% { transform: translate(-3%, -3%) rotate(3deg); } }
    .container { max-width: 900px; margin: 0 auto; padding: 2rem 1.5rem 4rem; }
    .header { text-align: center; padding: 3rem 0 2.5rem; }
    .header h1 { font-size: 2.5rem; font-weight: 700; letter-spacing: -0.03em; background: linear-gradient(135deg, var(--text-primary) 0%, var(--accent) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: 0.5rem; }
    .header p { color: var(--text-secondary); font-size: 1rem; }
    .badge { display: inline-flex; align-items: center; gap: 0.4rem; margin-top: 1rem; padding: 0.35rem 0.9rem; background: var(--accent-glow); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 999px; font-size: 0.75rem; font-weight: 500; color: var(--accent-hover); }
    .badge .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--success); animation: pulse 2s infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.3); } }
    .card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 1.75rem; margin-bottom: 1.5rem; backdrop-filter: blur(20px); transition: border-color var(--transition), box-shadow var(--transition); }
    .card:hover { border-color: rgba(255, 255, 255, 0.12); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3); }
    .card-title { font-size: 1.1rem; font-weight: 600; margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.5rem; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .form-group { display: flex; flex-direction: column; gap: 0.4rem; }
    .form-group.full { grid-column: 1 / -1; }
    .form-group label { font-size: 0.8rem; font-weight: 500; color: var(--text-secondary); text-transform: uppercase; }
    .form-group input, .form-group textarea, .form-group select { background: var(--bg-secondary); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 0.7rem 0.9rem; color: var(--text-primary); font-family: inherit; font-size: 0.9rem; outline: none; }
    .form-group input:focus, .form-group textarea:focus, .form-group select:focus { border-color: var(--border-focus); box-shadow: 0 0 0 3px var(--accent-glow); }
    .form-actions { display: flex; gap: 0.75rem; margin-top: 0.5rem; }
    .btn { display: inline-flex; align-items: center; justify-content: center; padding: 0.65rem 1.3rem; border-radius: var(--radius-sm); font-family: inherit; font-size: 0.85rem; font-weight: 500; border: none; cursor: pointer; transition: all var(--transition); }
    .btn-primary { background: var(--accent); color: #fff; }
    .btn-primary:hover { background: var(--accent-hover); box-shadow: 0 4px 16px var(--accent-glow); transform: translateY(-1px); }
    .btn-secondary { background: transparent; color: var(--text-secondary); border: 1px solid var(--border); }
    .btn-danger { background: var(--danger-bg); color: var(--danger); border: 1px solid rgba(239, 68, 68, 0.2); }
    .btn-sm { padding: 0.4rem 0.75rem; font-size: 0.78rem; }
    .stats-bar { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
    .stat-item { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 1.1rem; text-align: center; }
    .stat-value { font-size: 1.75rem; font-weight: 700; margin-bottom: 0.15rem; }
    .stat-label { font-size: 0.72rem; font-weight: 500; color: var(--text-secondary); text-transform: uppercase; }
    .stat-total .stat-value { color: var(--info); } .stat-pending .stat-value { color: var(--warning); } .stat-progress .stat-value { color: var(--accent-hover); } .stat-done .stat-value { color: var(--success); }
    .tasks-table { width: 100%; border-collapse: collapse; }
    .tasks-table th { text-align: left; padding: 0.75rem 1rem; font-size: 0.72rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; border-bottom: 1px solid var(--border); }
    .tasks-table td { padding: 0.85rem 1rem; font-size: 0.88rem; border-bottom: 1px solid rgba(255, 255, 255, 0.03); }
    .task-title { font-weight: 500; color: var(--text-primary); }
    .task-desc { color: var(--text-secondary); font-size: 0.8rem; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; }
    .status-badge { padding: 0.25rem 0.7rem; border-radius: 999px; font-size: 0.72rem; font-weight: 600; cursor: pointer; }
    .status-pending { background: var(--warning-bg); color: var(--warning); }
    .status-in-progress { background: var(--info-bg); color: var(--info); }
    .status-completed { background: var(--success-bg); color: var(--success); }
    .action-btns { display: flex; gap: 0.4rem; }
    .toast-container { position: fixed; bottom: 1.5rem; right: 1.5rem; z-index: 1000; display: flex; flex-direction: column; gap: 0.5rem; }
    .toast { padding: 0.75rem 1.25rem; border-radius: var(--radius-sm); font-size: 0.85rem; animation: toastIn 0.3s ease-out; background: var(--bg-secondary); border: 1px solid var(--border); }
    @keyframes toastIn { from { opacity: 0; transform: translateY(1rem); } to { opacity: 1; transform: translateY(0); } }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); display: none; align-items: center; justify-content: center; z-index: 900; }
    .modal-overlay.active { display: flex; }
    .modal { background: var(--bg-secondary); border: 1px solid var(--border); border-radius: var(--radius); padding: 1.75rem; width: 90%; max-width: 500px; }
    @media (max-width: 640px) { .stats-bar { grid-template-columns: repeat(2, 1fr); } .tasks-table th:nth-child(3), .tasks-table td:nth-child(3) { display: none; } }
  </style>
</head>
<body>
  <div class="container">
    <header class="header">
      <h1>Task Manager</h1>
      <p>Single-file Full-stack PaaS Demo</p>
      <div class="badge"><span class="dot"></span> Connected to PostgreSQL</div>
    </header>
    <div class="stats-bar">
      <div class="stat-item stat-total"><div class="stat-value" id="statTotal">0</div><div class="stat-label">Total</div></div>
      <div class="stat-item stat-pending"><div class="stat-value" id="statPending">0</div><div class="stat-label">Pending</div></div>
      <div class="stat-item stat-progress"><div class="stat-value" id="statProgress">0</div><div class="stat-label">In Progress</div></div>
      <div class="stat-item stat-done"><div class="stat-value" id="statDone">0</div><div class="stat-label">Completed</div></div>
    </div>
    <div class="card">
      <div class="card-title">➕ New Task</div>
      <form id="taskForm">
        <div class="form-grid">
          <div class="form-group"><label for="titleInput">Title</label><input type="text" id="titleInput" required /></div>
          <div class="form-group"><label for="statusInput">Status</label><select id="statusInput"><option value="pending">Pending</option><option value="in-progress">In Progress</option><option value="completed">Completed</option></select></div>
          <div class="form-group full"><label for="descInput">Description</label><textarea id="descInput" rows="2"></textarea></div>
        </div>
        <div class="form-actions"><button type="submit" class="btn btn-primary">Create Task</button></div>
      </form>
    </div>
    <div class="card">
      <div class="card-title">📋 Tasks</div>
      <table class="tasks-table"><thead><tr><th>Task</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead><tbody id="taskBody"></tbody></table>
    </div>
  </div>
  <div class="modal-overlay" id="modalOverlay">
    <div class="modal">
      <div class="modal-title">Edit Task</div>
      <form id="editForm">
        <div class="form-grid">
          <div class="form-group full"><label for="editTitle">Title</label><input type="text" id="editTitle" required /></div>
          <div class="form-group full"><label for="editDesc">Description</label><textarea id="editDesc" rows="3"></textarea></div>
          <div class="form-group full"><label for="editStatus">Status</label><select id="editStatus"><option value="pending">Pending</option><option value="in-progress">In Progress</option><option value="completed">Completed</option></select></div>
        </div>
        <div class="form-actions"><button type="submit" class="btn btn-primary">Save</button><button type="button" class="btn btn-secondary" id="cancelEdit">Cancel</button></div>
      </form>
    </div>
  </div>
  <div class="toast-container" id="toastContainer"></div>
  <script>
    let tasks = []; let editingId = null;
    const taskForm = document.getElementById('taskForm'); const taskBody = document.getElementById('taskBody');
    const modalOverlay = document.getElementById('modalOverlay'); const editForm = document.getElementById('editForm');
    document.addEventListener('DOMContentLoaded', fetchTasks);
    taskForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = document.getElementById('titleInput').value; const status = document.getElementById('statusInput').value; const description = document.getElementById('descInput').value;
      await fetch('/api/tasks', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({title, status, description}) });
      taskForm.reset(); fetchTasks();
    });
    editForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await fetch('/api/tasks/' + editingId, { method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({title: document.getElementById('editTitle').value, description: document.getElementById('editDesc').value, status: document.getElementById('editStatus').value}) });
      closeModal(); fetchTasks();
    });
    document.getElementById('cancelEdit').onclick = closeModal;
    async function fetchTasks() {
      const res = await fetch('/api/tasks'); tasks = await res.json();
      document.getElementById('statTotal').textContent = tasks.length;
      document.getElementById('statPending').textContent = tasks.filter(t => t.status === 'pending').length;
      document.getElementById('statProgress').textContent = tasks.filter(t => t.status === 'in-progress').length;
      document.getElementById('statDone').textContent = tasks.filter(t => t.status === 'completed').length;
      taskBody.innerHTML = tasks.map(t => \`<tr><td><div class="task-title">\${t.title}</div><div class="task-desc">\${t.description||''}</div></td><td><span class="status-badge status-\${t.status}" onclick="cycleStatus(\${t.id})">\${t.status}</span></td><td>\${new Date(t.created_at).toLocaleDateString()}</td><td><div class="action-btns"><button class="btn btn-secondary btn-sm" onclick="openEdit(\${t.id})">Edit</button><button class="btn btn-danger btn-sm" onclick="deleteTask(\${t.id})">Delete</button></div></td></tr>\`).join('');
    }
    async function cycleStatus(id) {
      const t = tasks.find(x => x.id === id); const next = {pending:'in-progress', 'in-progress':'completed', completed:'pending'};
      await fetch('/api/tasks/'+id, {method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({status: next[t.status]})}); fetchTasks();
    }
    async function deleteTask(id) { if(confirm('Delete?')) { await fetch('/api/tasks/'+id, {method:'DELETE'}); fetchTasks(); } }
    function openEdit(id) { const t = tasks.find(x => x.id === id); editingId = id; document.getElementById('editTitle').value = t.title; document.getElementById('editDesc').value = t.description||''; document.getElementById('editStatus').value = t.status; modalOverlay.classList.add('active'); }
    function closeModal() { modalOverlay.classList.remove('active'); }
  </script>
</body>
</html>
`;

// ── API Routes ────────────────────────────────────────────────
app.get('/', (req, res) => res.send(HTML_CONTENT));

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'ok', database: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'error', database: 'disconnected', message: err.message });
  }
});

app.get('/api/tasks', async (req, res) => {
  const result = await pool.query('SELECT * FROM tasks ORDER BY created_at DESC');
  res.json(result.rows);
});

app.post('/api/tasks', async (req, res) => {
  const { title, description, status } = req.body;
  const result = await pool.query('INSERT INTO tasks (title, description, status) VALUES ($1, $2, $3) RETURNING *', [title, description || '', status || 'pending']);
  res.status(201).json(result.rows[0]);
});

app.put('/api/tasks/:id', async (req, res) => {
  const { id } = req.params; const { title, description, status } = req.body;
  const result = await pool.query('UPDATE tasks SET title=COALESCE($1,title), description=COALESCE($2,description), status=COALESCE($3,status), updated_at=NOW() WHERE id=$4 RETURNING *', [title, description, status, id]);
  res.json(result.rows[0]);
});

app.delete('/api/tasks/:id', async (req, res) => {
  await pool.query('DELETE FROM tasks WHERE id = $1', [req.params.id]);
  res.json({ message: 'Deleted' });
});

// ── Database Init & Seeding ──────────────────────────────────
async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY, title VARCHAR(255) NOT NULL, description TEXT,
        status VARCHAR(50) DEFAULT 'pending', created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW()
      );`);
    const count = await client.query('SELECT COUNT(*) FROM tasks');
    if (parseInt(count.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO tasks (title, description, status) VALUES
        ('Set up Railway project', 'Link repo for auto-deployments', 'completed'),
        ('Configure environment variables', 'Add DATABASE_URL and NODE_ENV', 'completed'),
        ('Provision PostgreSQL', 'Add the Postgres plugin', 'in-progress'),
        ('Write documentation', 'Complete the final report', 'pending');`);
      console.log('✅ Database seeded with default tasks');
    }
    console.log('✅ Database ready');
  } catch (err) {
    console.error('❌ DB Error:', err.message);
    // On Railway, the DB might take a moment to provision, so we don't want to crash the process
    // but the healthcheck will reflect the status.
  }
  finally { client.release(); }
}

app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  if (process.env.DATABASE_URL) await initDB();
});
