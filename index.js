require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ── Postgres connection ────────────────────────────────────────
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost')
    ? { rejectUnauthorized: false }
    : false,
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
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

    :root {
      --bg-base: #06060a;
      --bg-surface: #0d0d14;
      --bg-elevated: #13131d;
      --bg-glass: rgba(255, 255, 255, 0.03);
      --bg-glass-hover: rgba(255, 255, 255, 0.06);
      --border-subtle: rgba(255, 255, 255, 0.06);
      --border-default: rgba(255, 255, 255, 0.1);
      --border-accent: rgba(124, 58, 237, 0.4);
      --text-primary: #f5f5f7;
      --text-secondary: #94949f;
      --text-muted: #55555f;
      --accent-violet: #7c3aed;
      --accent-violet-light: #a78bfa;
      --accent-violet-glow: rgba(124, 58, 237, 0.15);
      --accent-violet-soft: rgba(124, 58, 237, 0.08);
      --accent-emerald: #10b981;
      --accent-emerald-soft: rgba(16, 185, 129, 0.12);
      --accent-amber: #f59e0b;
      --accent-amber-soft: rgba(245, 158, 11, 0.12);
      --accent-sky: #0ea5e9;
      --accent-sky-soft: rgba(14, 165, 233, 0.12);
      --accent-rose: #f43f5e;
      --accent-rose-soft: rgba(244, 63, 94, 0.12);
      --radius-lg: 16px;
      --radius-md: 12px;
      --radius-sm: 8px;
      --shadow-glow: 0 0 80px -20px rgba(124, 58, 237, 0.3);
      --transition-fast: 0.15s cubic-bezier(0.4, 0, 0.2, 1);
      --transition-smooth: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: var(--bg-base);
      color: var(--text-primary);
      min-height: 100vh;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      overflow-x: hidden;
    }

    /* ── Ambient background ── */
    .bg-ambient {
      position: fixed;
      inset: 0;
      z-index: -1;
      overflow: hidden;
      pointer-events: none;
    }
    .bg-ambient::before {
      content: '';
      position: absolute;
      width: 600px;
      height: 600px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(124, 58, 237, 0.12) 0%, transparent 70%);
      top: -200px;
      left: -100px;
      animation: floatOrb1 25s ease-in-out infinite;
    }
    .bg-ambient::after {
      content: '';
      position: absolute;
      width: 500px;
      height: 500px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(14, 165, 233, 0.08) 0%, transparent 70%);
      bottom: -150px;
      right: -100px;
      animation: floatOrb2 20s ease-in-out infinite;
    }
    @keyframes floatOrb1 {
      0%, 100% { transform: translate(0, 0); }
      33% { transform: translate(80px, 60px); }
      66% { transform: translate(-40px, 30px); }
    }
    @keyframes floatOrb2 {
      0%, 100% { transform: translate(0, 0); }
      33% { transform: translate(-60px, -40px); }
      66% { transform: translate(30px, -60px); }
    }

    /* ── Grid pattern overlay ── */
    .bg-grid {
      position: fixed;
      inset: 0;
      z-index: -1;
      background-image:
        linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
      background-size: 60px 60px;
      mask-image: radial-gradient(ellipse at 50% 30%, black 20%, transparent 70%);
      -webkit-mask-image: radial-gradient(ellipse at 50% 30%, black 20%, transparent 70%);
    }

    /* ── Layout ── */
    .app-container {
      max-width: 960px;
      margin: 0 auto;
      padding: 2rem 1.5rem 5rem;
    }

    /* ── Header ── */
    .app-header {
      text-align: center;
      padding: 3.5rem 0 3rem;
      position: relative;
    }
    .app-header::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 120px;
      height: 1px;
      background: linear-gradient(90deg, transparent, var(--accent-violet), transparent);
    }
    .logo-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 56px;
      height: 56px;
      border-radius: var(--radius-md);
      background: linear-gradient(135deg, var(--accent-violet) 0%, #a855f7 100%);
      margin-bottom: 1.25rem;
      box-shadow: 0 8px 32px rgba(124, 58, 237, 0.3), inset 0 1px 0 rgba(255,255,255,0.2);
      animation: logoFloat 4s ease-in-out infinite;
    }
    .logo-icon svg { width: 28px; height: 28px; color: white; }
    @keyframes logoFloat {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-4px); }
    }
    .app-title {
      font-size: 2.25rem;
      font-weight: 800;
      letter-spacing: -0.04em;
      line-height: 1.1;
      margin-bottom: 0.6rem;
    }
    .app-title .gradient-text {
      background: linear-gradient(135deg, #f5f5f7 0%, #a78bfa 50%, #0ea5e9 100%);
      background-size: 200% auto;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: shimmer 6s ease infinite;
    }
    @keyframes shimmer {
      0%, 100% { background-position: 0% center; }
      50% { background-position: 200% center; }
    }
    .app-subtitle {
      color: var(--text-secondary);
      font-size: 0.95rem;
      font-weight: 400;
    }
    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 1.25rem;
      padding: 0.4rem 1rem;
      background: var(--accent-violet-soft);
      border: 1px solid rgba(124, 58, 237, 0.2);
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--accent-violet-light);
      letter-spacing: 0.02em;
    }
    .status-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--accent-emerald);
      box-shadow: 0 0 8px rgba(16, 185, 129, 0.6);
      animation: dotPulse 2.5s ease-in-out infinite;
    }
    @keyframes dotPulse {
      0%, 100% { opacity: 1; box-shadow: 0 0 8px rgba(16, 185, 129, 0.6); }
      50% { opacity: 0.6; box-shadow: 0 0 16px rgba(16, 185, 129, 0.4); }
    }

    /* ── Stats Grid ── */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.75rem;
      margin: 2rem 0 1.5rem;
    }
    .stat-card {
      position: relative;
      background: var(--bg-glass);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 1.25rem;
      text-align: center;
      overflow: hidden;
      transition: all var(--transition-smooth);
    }
    .stat-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      border-radius: 2px 2px 0 0;
      opacity: 0;
      transition: opacity var(--transition-smooth);
    }
    .stat-card:hover {
      border-color: var(--border-default);
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.3);
    }
    .stat-card:hover::before { opacity: 1; }
    .stat-card.total::before { background: linear-gradient(90deg, var(--accent-sky), transparent); }
    .stat-card.pending::before { background: linear-gradient(90deg, var(--accent-amber), transparent); }
    .stat-card.progress::before { background: linear-gradient(90deg, var(--accent-violet), transparent); }
    .stat-card.done::before { background: linear-gradient(90deg, var(--accent-emerald), transparent); }
    .stat-number {
      font-size: 2rem;
      font-weight: 800;
      letter-spacing: -0.03em;
      line-height: 1;
      margin-bottom: 0.35rem;
    }
    .stat-card.total .stat-number { color: var(--accent-sky); }
    .stat-card.pending .stat-number { color: var(--accent-amber); }
    .stat-card.progress .stat-number { color: var(--accent-violet-light); }
    .stat-card.done .stat-number { color: var(--accent-emerald); }
    .stat-name {
      font-size: 0.68rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    /* ── Cards ── */
    .panel {
      position: relative;
      background: var(--bg-glass);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      padding: 1.75rem;
      margin-bottom: 1.25rem;
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      transition: all var(--transition-smooth);
    }
    .panel:hover {
      border-color: var(--border-default);
    }
    .panel-header {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      margin-bottom: 1.5rem;
    }
    .panel-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: var(--radius-sm);
      background: var(--accent-violet-soft);
      color: var(--accent-violet-light);
    }
    .panel-icon svg { width: 16px; height: 16px; }
    .panel-title {
      font-size: 0.95rem;
      font-weight: 700;
      letter-spacing: -0.01em;
    }

    /* ── Form ── */
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    .form-field { display: flex; flex-direction: column; gap: 0.5rem; }
    .form-field.span-full { grid-column: 1 / -1; }
    .form-label {
      font-size: 0.72rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
    .form-input,
    .form-textarea,
    .form-select {
      width: 100%;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      padding: 0.75rem 1rem;
      color: var(--text-primary);
      font-family: inherit;
      font-size: 0.88rem;
      outline: none;
      transition: all var(--transition-fast);
    }
    .form-input:hover, .form-textarea:hover, .form-select:hover {
      border-color: var(--border-default);
    }
    .form-input:focus, .form-textarea:focus, .form-select:focus {
      border-color: var(--accent-violet);
      box-shadow: 0 0 0 3px var(--accent-violet-glow), 0 0 20px -5px rgba(124, 58, 237, 0.15);
    }
    .form-input::placeholder, .form-textarea::placeholder {
      color: var(--text-muted);
    }
    .form-select {
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%2394949f' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10l-5 5z'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 0.8rem center;
      padding-right: 2.2rem;
      cursor: pointer;
    }
    .form-select option { background: var(--bg-elevated); color: var(--text-primary); }
    .form-textarea { resize: vertical; min-height: 70px; }
    .form-actions { margin-top: 0.75rem; display: flex; gap: 0.75rem; }

    /* ── Buttons ── */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      padding: 0.7rem 1.4rem;
      border-radius: var(--radius-sm);
      font-family: inherit;
      font-size: 0.82rem;
      font-weight: 600;
      border: none;
      cursor: pointer;
      transition: all var(--transition-fast);
      letter-spacing: 0.01em;
    }
    .btn-accent {
      background: linear-gradient(135deg, var(--accent-violet), #a855f7);
      color: white;
      box-shadow: 0 2px 12px rgba(124, 58, 237, 0.25), inset 0 1px 0 rgba(255,255,255,0.15);
    }
    .btn-accent:hover {
      box-shadow: 0 6px 24px rgba(124, 58, 237, 0.35), inset 0 1px 0 rgba(255,255,255,0.15);
      transform: translateY(-1px);
    }
    .btn-accent:active { transform: translateY(0); }
    .btn-ghost {
      background: transparent;
      color: var(--text-secondary);
      border: 1px solid var(--border-subtle);
    }
    .btn-ghost:hover {
      background: var(--bg-glass-hover);
      border-color: var(--border-default);
      color: var(--text-primary);
    }
    .btn-destructive {
      background: var(--accent-rose-soft);
      color: var(--accent-rose);
      border: 1px solid rgba(244, 63, 94, 0.15);
    }
    .btn-destructive:hover {
      background: rgba(244, 63, 94, 0.18);
      border-color: rgba(244, 63, 94, 0.3);
    }
    .btn-sm { padding: 0.4rem 0.85rem; font-size: 0.75rem; border-radius: 6px; }
    .btn svg { width: 14px; height: 14px; }

    /* ── Table ── */
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th {
      text-align: left;
      padding: 0.75rem 1rem;
      font-size: 0.68rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      border-bottom: 1px solid var(--border-subtle);
    }
    .data-table td {
      padding: 1rem;
      font-size: 0.88rem;
      border-bottom: 1px solid rgba(255,255,255,0.03);
      vertical-align: middle;
    }
    .data-table tbody tr {
      transition: background var(--transition-fast);
    }
    .data-table tbody tr:hover {
      background: var(--bg-glass-hover);
    }
    .data-table tbody tr:last-child td { border-bottom: none; }
    .task-name {
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 0.15rem;
    }
    .task-description {
      color: var(--text-secondary);
      font-size: 0.78rem;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .pill {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.3rem 0.75rem;
      border-radius: 999px;
      font-size: 0.7rem;
      font-weight: 600;
      cursor: pointer;
      transition: all var(--transition-fast);
      text-transform: capitalize;
    }
    .pill::before {
      content: '';
      width: 5px;
      height: 5px;
      border-radius: 50%;
    }
    .pill:hover { transform: scale(1.05); }
    .pill-pending {
      background: var(--accent-amber-soft);
      color: var(--accent-amber);
    }
    .pill-pending::before { background: var(--accent-amber); }
    .pill-in-progress {
      background: var(--accent-sky-soft);
      color: var(--accent-sky);
    }
    .pill-in-progress::before { background: var(--accent-sky); }
    .pill-completed {
      background: var(--accent-emerald-soft);
      color: var(--accent-emerald);
    }
    .pill-completed::before { background: var(--accent-emerald); }
    .action-group { display: flex; gap: 0.35rem; }
    .date-cell {
      color: var(--text-muted);
      font-size: 0.8rem;
      font-variant-numeric: tabular-nums;
    }

    /* ── Empty state ── */
    .empty-state {
      text-align: center;
      padding: 3.5rem 1rem;
    }
    .empty-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: var(--accent-violet-soft);
      margin-bottom: 1rem;
    }
    .empty-icon svg { width: 28px; height: 28px; color: var(--accent-violet-light); opacity: 0.6; }
    .empty-title {
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-secondary);
      margin-bottom: 0.35rem;
    }
    .empty-desc {
      font-size: 0.85rem;
      color: var(--text-muted);
    }

    /* ── Toast ── */
    .toast-area {
      position: fixed;
      bottom: 1.5rem;
      right: 1.5rem;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .toast {
      padding: 0.8rem 1.2rem;
      border-radius: var(--radius-sm);
      font-size: 0.82rem;
      font-weight: 500;
      background: var(--bg-elevated);
      border: 1px solid var(--border-default);
      box-shadow: 0 12px 40px rgba(0,0,0,0.4);
      animation: toastSlide 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes toastSlide {
      from { opacity: 0; transform: translateY(16px) scale(0.96); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    /* ── Modal ── */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.7);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 900;
    }
    .modal-backdrop.open { display: flex; }
    .modal-box {
      background: var(--bg-elevated);
      border: 1px solid var(--border-default);
      border-radius: var(--radius-lg);
      padding: 2rem;
      width: 90%;
      max-width: 480px;
      box-shadow: var(--shadow-glow), 0 24px 48px rgba(0,0,0,0.5);
      animation: modalEntry 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes modalEntry {
      from { opacity: 0; transform: translateY(20px) scale(0.95); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    .modal-title {
      font-size: 1.1rem;
      font-weight: 700;
      margin-bottom: 1.5rem;
    }

    /* ── Footer badge ── */
    .footer-bar {
      text-align: center;
      padding: 2rem 0;
      color: var(--text-muted);
      font-size: 0.75rem;
    }
    .footer-bar a {
      color: var(--accent-violet-light);
      text-decoration: none;
    }
    .footer-bar a:hover { text-decoration: underline; }

    /* ── Responsive ── */
    @media (max-width: 640px) {
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
      .form-grid { grid-template-columns: 1fr; }
      .data-table th:nth-child(3), .data-table td:nth-child(3) { display: none; }
      .app-title { font-size: 1.75rem; }
      .panel { padding: 1.25rem; }
    }

    /* ── Fade-in animation ── */
    .fade-in {
      animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
    }
    .fade-in:nth-child(2) { animation-delay: 0.05s; }
    .fade-in:nth-child(3) { animation-delay: 0.1s; }
    .fade-in:nth-child(4) { animation-delay: 0.15s; }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }
  </style>
</head>
<body>
  <div class="bg-ambient"></div>
  <div class="bg-grid"></div>

  <div class="app-container">
    <header class="app-header fade-in">
      <div class="logo-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
        </svg>
      </div>
      <h1 class="app-title"><span class="gradient-text">Task Manager</span></h1>
      <p class="app-subtitle">Full-stack CRUD app deployed on Railway PaaS</p>
      <div class="status-pill">
        <span class="status-dot"></span>
        PostgreSQL Connected
      </div>
    </header>

    <div class="stats-grid fade-in">
      <div class="stat-card total">
        <div class="stat-number" id="statTotal">0</div>
        <div class="stat-name">Total</div>
      </div>
      <div class="stat-card pending">
        <div class="stat-number" id="statPending">0</div>
        <div class="stat-name">Pending</div>
      </div>
      <div class="stat-card progress">
        <div class="stat-number" id="statProgress">0</div>
        <div class="stat-name">In Progress</div>
      </div>
      <div class="stat-card done">
        <div class="stat-number" id="statDone">0</div>
        <div class="stat-name">Completed</div>
      </div>
    </div>

    <div class="panel fade-in">
      <div class="panel-header">
        <div class="panel-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </div>
        <span class="panel-title">Create New Task</span>
      </div>
      <form id="taskForm">
        <div class="form-grid">
          <div class="form-field">
            <label class="form-label" for="titleInput">Title</label>
            <input class="form-input" type="text" id="titleInput" placeholder="What needs to be done?" required />
          </div>
          <div class="form-field">
            <label class="form-label" for="statusInput">Status</label>
            <select class="form-select" id="statusInput">
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div class="form-field span-full">
            <label class="form-label" for="descInput">Description</label>
            <textarea class="form-textarea" id="descInput" rows="2" placeholder="Add details (optional)"></textarea>
          </div>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-accent">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Create Task
          </button>
        </div>
      </form>
    </div>

    <div class="panel fade-in">
      <div class="panel-header">
        <div class="panel-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
          </svg>
        </div>
        <span class="panel-title">All Tasks</span>
      </div>
      <div id="taskListArea">
        <table class="data-table">
          <thead><tr><th>Task</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead>
          <tbody id="taskBody"></tbody>
        </table>
      </div>
    </div>

    <div class="footer-bar fade-in">
      Deployed on <a href="https://railway.app" target="_blank">Railway</a> &middot; Built with Express &amp; PostgreSQL
    </div>
  </div>

  <div class="modal-backdrop" id="modalOverlay">
    <div class="modal-box">
      <div class="modal-title">Edit Task</div>
      <form id="editForm">
        <div class="form-grid">
          <div class="form-field span-full">
            <label class="form-label" for="editTitle">Title</label>
            <input class="form-input" type="text" id="editTitle" required />
          </div>
          <div class="form-field span-full">
            <label class="form-label" for="editDesc">Description</label>
            <textarea class="form-textarea" id="editDesc" rows="3"></textarea>
          </div>
          <div class="form-field span-full">
            <label class="form-label" for="editStatus">Status</label>
            <select class="form-select" id="editStatus">
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-accent">Save Changes</button>
          <button type="button" class="btn btn-ghost" id="cancelEdit">Cancel</button>
        </div>
      </form>
    </div>
  </div>

  <div class="toast-area" id="toastContainer"></div>

  <script>
    let tasks = [];
    let editingId = null;
    const taskForm = document.getElementById('taskForm');
    const taskBody = document.getElementById('taskBody');
    const taskListArea = document.getElementById('taskListArea');
    const modalOverlay = document.getElementById('modalOverlay');
    const editForm = document.getElementById('editForm');

    document.addEventListener('DOMContentLoaded', fetchTasks);

    taskForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = document.getElementById('titleInput').value;
      const status = document.getElementById('statusInput').value;
      const description = document.getElementById('descInput').value;
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, status, description })
      });
      taskForm.reset();
      fetchTasks();
    });

    editForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await fetch('/api/tasks/' + editingId, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: document.getElementById('editTitle').value,
          description: document.getElementById('editDesc').value,
          status: document.getElementById('editStatus').value
        })
      });
      closeModal();
      fetchTasks();
    });

    document.getElementById('cancelEdit').onclick = closeModal;
    modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });

    async function fetchTasks() {
      const res = await fetch('/api/tasks');
      tasks = await res.json();
      document.getElementById('statTotal').textContent = tasks.length;
      document.getElementById('statPending').textContent = tasks.filter(t => t.status === 'pending').length;
      document.getElementById('statProgress').textContent = tasks.filter(t => t.status === 'in-progress').length;
      document.getElementById('statDone').textContent = tasks.filter(t => t.status === 'completed').length;

      if (tasks.length === 0) {
        taskListArea.innerHTML = '<div class="empty-state"><div class="empty-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/></svg></div><div class="empty-title">No tasks yet</div><div class="empty-desc">Create your first task above to get started</div></div>';
        return;
      }

      taskListArea.innerHTML = '<table class="data-table"><thead><tr><th>Task</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead><tbody id="taskBody"></tbody></table>';
      const tbody = document.getElementById('taskBody');
      tbody.innerHTML = tasks.map(t => {
        const statusLabel = t.status === 'in-progress' ? 'In Progress' : t.status.charAt(0).toUpperCase() + t.status.slice(1);
        return '<tr>' +
          '<td><div class="task-name">' + escapeHtml(t.title) + '</div><div class="task-description">' + escapeHtml(t.description || '') + '</div></td>' +
          '<td><span class="pill pill-' + t.status + '" onclick="cycleStatus(' + t.id + ')">' + statusLabel + '</span></td>' +
          '<td><span class="date-cell">' + new Date(t.created_at).toLocaleDateString() + '</span></td>' +
          '<td><div class="action-group"><button class="btn btn-ghost btn-sm" onclick="openEdit(' + t.id + ')">Edit</button><button class="btn btn-destructive btn-sm" onclick="deleteTask(' + t.id + ')">Delete</button></div></td>' +
          '</tr>';
      }).join('');
    }

    function escapeHtml(str) {
      const div = document.createElement('div');
      div.appendChild(document.createTextNode(str));
      return div.innerHTML;
    }

    async function cycleStatus(id) {
      const t = tasks.find(x => x.id === id);
      const next = { pending: 'in-progress', 'in-progress': 'completed', completed: 'pending' };
      await fetch('/api/tasks/' + id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next[t.status] })
      });
      fetchTasks();
    }

    async function deleteTask(id) {
      if (confirm('Delete this task?')) {
        await fetch('/api/tasks/' + id, { method: 'DELETE' });
        fetchTasks();
      }
    }

    function openEdit(id) {
      const t = tasks.find(x => x.id === id);
      editingId = id;
      document.getElementById('editTitle').value = t.title;
      document.getElementById('editDesc').value = t.description || '';
      document.getElementById('editStatus').value = t.status;
      modalOverlay.classList.add('open');
    }

    function closeModal() {
      modalOverlay.classList.remove('open');
    }
  </script>
</body>
</html>
`;

// ── API Routes ────────────────────────────────────────────────
app.get('/', (req, res) => res.send(HTML_CONTENT));

app.get('/api/health', async (req, res) => {
  try {
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000));
    const query = pool.query('SELECT 1');
    await Promise.race([query, timeout]);
    res.status(200).json({ status: 'ok', database: 'connected' });
  } catch (err) {
    res.status(200).json({ status: 'ok', database: 'disconnected', message: err.message });
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
      console.log('Database seeded with default tasks');
    }
    console.log('Database ready');
  } catch (err) {
    console.error('DB Error:', err.message);
  }
  finally { client.release(); }
}

app.listen(PORT, '0.0.0.0', async () => {
  console.log(`Server listening on http://0.0.0.0:${PORT}`);
  if (process.env.DATABASE_URL) {
    console.log('DATABASE_URL found, initializing database...');
    initDB().catch(err => console.error('Async DB Init Error:', err.message));
  } else {
    console.warn('No DATABASE_URL found in environment.');
  }
});
