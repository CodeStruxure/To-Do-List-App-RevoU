// js/script.js

// --- DOM elements ---
const taskInput = document.getElementById('taskInput');
const dateInput = document.getElementById('dateInput');
const addBtn = document.getElementById('addBtn');
const filterBtn = document.getElementById('filterBtn');
const filterLabel = document.getElementById('filterLabel');
const deleteAllBtn = document.getElementById('deleteAllBtn');
const errorMsg = document.getElementById('errorMsg');
const todoListEl = document.getElementById('todoList');

// --- state ---
let todos = JSON.parse(localStorage.getItem('todos') || '[]');
// each todo: { id: number, task: string, dueDate: 'YYYY-MM-DD', completed: boolean }
let filterState = 'all'; // 'all' | 'pending' | 'done'

// --- helpers ---
function save() {
  localStorage.setItem('todos', JSON.stringify(todos));
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00'); // ensure local parsing
  if (isNaN(d)) return iso;
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const yy = String(d.getFullYear());
  return `${mm}/${dd}/${yy}`;
}

function escapeHtml(text) {
  return text.replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

function showError(msg) {
  errorMsg.textContent = msg;
  errorMsg.classList.remove('hidden');
  setTimeout(() => errorMsg.classList.add('hidden'), 3000);
}

// --- render ---
function render() {
  const filtered = todos.filter(t => {
    if (filterState === 'all') return true;
    if (filterState === 'pending') return !t.completed;
    return t.completed;
  });

  todoListEl.innerHTML = '';

  if (filtered.length === 0) {
    todoListEl.innerHTML = `<tr><td colspan="4" class="px-4 py-6 text-center text-slate-400">No task found</td></tr>`;
    return;
  }

  filtered.forEach(todo => {
    const tr = document.createElement('tr');
    tr.className = 'border-t border-slate-700';
    tr.innerHTML = `
      <td class="px-4 py-3 break-words">${escapeHtml(todo.task)}</td>
      <td class="px-4 py-3">${formatDate(todo.dueDate)}</td>
      <td class="px-4 py-3"><span class="${todo.completed ? 'text-green-400 font-semibold' : 'text-rose-400 font-semibold'}">${todo.completed ? 'Done' : 'Pending'}</span></td>
      <td class="px-4 py-3">
        <button data-action="toggle" class="mr-2 px-3 py-1 rounded bg-green-600 text-white text-sm">✓</button>
        <button data-action="delete" class="px-3 py-1 rounded bg-red-600 text-white text-sm">X</button>
      </td>
    `;
    // attach listeners (use id to locate real index)
    const toggleBtn = tr.querySelector('[data-action="toggle"]');
    const deleteBtn = tr.querySelector('[data-action="delete"]');

    toggleBtn.addEventListener('click', () => toggleComplete(todo.id));
    deleteBtn.addEventListener('click', () => deleteTask(todo.id));

    todoListEl.appendChild(tr);
  });
}

// --- actions ---
function addTask() {
  const task = taskInput.value.trim();
  const dueDate = dateInput.value;

  if (!task) {
    showError('Task tidak boleh kosong!');
    return;
  }
  if (!dueDate) {
    showError('Pilih due date terlebih dahulu!');
    return;
  }

  const newTodo = {
    id: Date.now(),
    task,
    dueDate,
    completed: false
  };
  todos.push(newTodo);
  save();
  render();

  taskInput.value = '';
  dateInput.value = '';
  taskInput.focus();
}

function toggleComplete(id) {
  const i = todos.findIndex(t => t.id === id);
  if (i === -1) return;
  todos[i].completed = !todos[i].completed;
  save();
  render();
}

function deleteTask(id) {
  todos = todos.filter(t => t.id !== id);
  save();
  render();
}

function deleteAll() {
  if (!todos.length) return;
  if (confirm('Are you sure you want to delete all tasks?')) {
    todos = [];
    save();
    render();
  }
}

// cycle filter: all -> pending -> done -> all
function cycleFilter() {
  if (filterState === 'all') filterState = 'pending';
  else if (filterState === 'pending') filterState = 'done';
  else filterState = 'all';

  filterLabel.textContent = filterState.charAt(0).toUpperCase() + filterState.slice(1);
  render();
}

// --- events ---
addBtn.addEventListener('click', addTask);
deleteAllBtn.addEventListener('click', deleteAll);
filterBtn.addEventListener('click', cycleFilter);

// allow Enter key to add (when focusing task input)
taskInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addTask();
});

// initial render
render();
