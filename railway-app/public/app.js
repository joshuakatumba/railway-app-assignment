// ── State ────────────────────────────────────────────────────
let tasks = [];
let editingId = null;

// ── DOM refs ─────────────────────────────────────────────────
const taskForm      = document.getElementById('taskForm');
const titleInput    = document.getElementById('titleInput');
const descInput     = document.getElementById('descInput');
const statusInput   = document.getElementById('statusInput');
const taskBody      = document.getElementById('taskBody');
const totalEl       = document.getElementById('statTotal');
const pendingEl     = document.getElementById('statPending');
const progressEl    = document.getElementById('statProgress');
const doneEl        = document.getElementById('statDone');
const toastContainer = document.getElementById('toastContainer');
const modalOverlay  = document.getElementById('modalOverlay');
const editForm      = document.getElementById('editForm');
const editTitle     = document.getElementById('editTitle');
const editDesc      = document.getElementById('editDesc');
const editStatus    = document.getElementById('editStatus');
const cancelEdit    = document.getElementById('cancelEdit');

// ── Init ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', fetchTasks);
taskForm.addEventListener('submit', handleCreate);
editForm.addEventListener('submit', handleUpdate);
cancelEdit.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});

// ── Fetch all tasks ──────────────────────────────────────────
async function fetchTasks() {
  try {
    const res = await fetch('/api/tasks');
    tasks = await res.json();
    render();
  } catch (err) {
    showToast('Failed to load tasks', 'error');
  }
}

// ── Create task ──────────────────────────────────────────────
async function handleCreate(e) {
  e.preventDefault();
  const title = titleInput.value.trim();
  const description = descInput.value.trim();
  const status = statusInput.value;
  if (!title) return;

  try {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, status }),
    });
    if (!res.ok) throw new Error();
    taskForm.reset();
    showToast('Task created successfully', 'success');
    await fetchTasks();
  } catch {
    showToast('Failed to create task', 'error');
  }
}

// ── Update task ──────────────────────────────────────────────
async function handleUpdate(e) {
  e.preventDefault();
  if (!editingId) return;
  try {
    const res = await fetch(`/api/tasks/${editingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: editTitle.value.trim(),
        description: editDesc.value.trim(),
        status: editStatus.value,
      }),
    });
    if (!res.ok) throw new Error();
    closeModal();
    showToast('Task updated', 'success');
    await fetchTasks();
  } catch {
    showToast('Failed to update task', 'error');
  }
}

// ── Delete task ──────────────────────────────────────────────
async function deleteTask(id) {
  if (!confirm('Delete this task?')) return;
  try {
    const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error();
    showToast('Task deleted', 'success');
    await fetchTasks();
  } catch {
    showToast('Failed to delete task', 'error');
  }
}

// ── Quick status toggle ─────────────────────────────────────
async function cycleStatus(id) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;
  const next = { pending: 'in-progress', 'in-progress': 'completed', completed: 'pending' };
  try {
    await fetch(`/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next[task.status] || 'pending' }),
    });
    await fetchTasks();
  } catch {
    showToast('Failed to update status', 'error');
  }
}

// ── Open edit modal ──────────────────────────────────────────
function openEdit(id) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;
  editingId = id;
  editTitle.value = task.title;
  editDesc.value = task.description || '';
  editStatus.value = task.status;
  modalOverlay.classList.add('active');
}

function closeModal() {
  editingId = null;
  modalOverlay.classList.remove('active');
}

// ── Render ───────────────────────────────────────────────────
function render() {
  // stats
  totalEl.textContent    = tasks.length;
  pendingEl.textContent  = tasks.filter((t) => t.status === 'pending').length;
  progressEl.textContent = tasks.filter((t) => t.status === 'in-progress').length;
  doneEl.textContent     = tasks.filter((t) => t.status === 'completed').length;

  // table
  if (tasks.length === 0) {
    taskBody.innerHTML = `
      <tr>
        <td colspan="5">
          <div class="empty-state">
            <div class="icon">📋</div>
            <p>No tasks yet — create one above!</p>
          </div>
        </td>
      </tr>`;
    return;
  }

  taskBody.innerHTML = tasks.map((t) => `
    <tr>
      <td>
        <div class="task-title">${esc(t.title)}</div>
        ${t.description ? `<div class="task-desc">${esc(t.description)}</div>` : ''}
      </td>
      <td>
        <span class="status-badge status-${t.status}" onclick="cycleStatus(${t.id})" style="cursor:pointer;" title="Click to change status">
          ${t.status}
        </span>
      </td>
      <td style="color:var(--text-secondary);font-size:0.82rem;">
        ${new Date(t.created_at).toLocaleDateString()}
      </td>
      <td>
        <div class="action-btns">
          <button class="btn btn-secondary btn-sm" onclick="openEdit(${t.id})">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="deleteTask(${t.id})">Delete</button>
        </div>
      </td>
    </tr>`).join('');
}

// ── Helpers ──────────────────────────────────────────────────
function esc(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

function showToast(msg, type = 'success') {
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.textContent = msg;
  toastContainer.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}
