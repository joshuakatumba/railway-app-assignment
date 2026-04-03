require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const path = require('path');

// ── Express setup ──────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── Postgres connection ────────────────────────────────────────
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// ── Auto-create table on startup ───────────────────────────────
async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id          SERIAL PRIMARY KEY,
        title       VARCHAR(255) NOT NULL,
        description TEXT,
        status      VARCHAR(50) DEFAULT 'pending',
        created_at  TIMESTAMP DEFAULT NOW(),
        updated_at  TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅  Database initialized — tasks table ready');
  } catch (err) {
    console.error('❌  Database initialization failed:', err.message);
  } finally {
    client.release();
  }
}

// ── Health check ───────────────────────────────────────────────
app.get('/api/health', async (_req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      status: 'healthy',
      timestamp: result.rows[0].now,
      environment: process.env.NODE_ENV || 'development',
    });
  } catch (err) {
    res.status(500).json({ status: 'unhealthy', error: err.message });
  }
});

// ── READ all tasks ─────────────────────────────────────────────
app.get('/api/tasks', async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tasks ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('GET /api/tasks error:', err.message);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// ── READ single task ───────────────────────────────────────────
app.get('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Task not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('GET /api/tasks/:id error:', err.message);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

// ── CREATE task ────────────────────────────────────────────────
app.post('/api/tasks', async (req, res) => {
  try {
    const { title, description, status } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });
    const result = await pool.query(
      'INSERT INTO tasks (title, description, status) VALUES ($1, $2, $3) RETURNING *',
      [title, description || '', status || 'pending']
    );
    console.log(`📝  Task created: "${title}"`);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('POST /api/tasks error:', err.message);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// ── UPDATE task ────────────────────────────────────────────────
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status } = req.body;
    const result = await pool.query(
      `UPDATE tasks
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           status = COALESCE($3, status),
           updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [title, description, status, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Task not found' });
    console.log(`✏️  Task #${id} updated`);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('PUT /api/tasks/:id error:', err.message);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// ── DELETE task ────────────────────────────────────────────────
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Task not found' });
    console.log(`🗑️  Task #${id} deleted`);
    res.json({ message: 'Task deleted successfully', task: result.rows[0] });
  } catch (err) {
    console.error('DELETE /api/tasks/:id error:', err.message);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// ── Catch-all: serve frontend ──────────────────────────────────
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Start server ───────────────────────────────────────────────
app.listen(PORT, async () => {
  console.log(`🚀  Server running on port ${PORT}`);
  console.log(`📍  Environment: ${process.env.NODE_ENV || 'development'}`);
  if (process.env.DATABASE_URL) {
    await initDB();
  } else {
    console.warn('⚠️   DATABASE_URL not set — running without database');
  }
});
