let tasks = [];
let currentFilter = 'all';
let editingTaskId = null;

const elements = {
    taskInput: document.getElementById('taskInput'),
    addBtn: document.getElementById('addBtn'),
    tasksList: document.getElementById('tasksList'),
    emptyState: document.getElementById('emptyState'),
    filterBtns: document.querySelectorAll('.filter-btn'),
    totalTasks: document.getElementById('totalTasks'),
    completedTasks: document.getElementById('completedTasks'),
    editModal: document.getElementById('editModal'),
    editTaskInput: document.getElementById('editTaskInput'),
    saveEditBtn: document.getElementById('saveEditBtn'),
    cancelEditBtn: document.getElementById('cancelEditBtn')
};

document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    
    elements.addBtn.addEventListener('click', addTask);
    elements.taskInput.addEventListener('keypress', e => e.key === 'Enter' && addTask());
    
    elements.filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderTasks();
        });
    });
    
    elements.saveEditBtn.addEventListener('click', saveEdit);
    elements.cancelEditBtn.addEventListener('click', closeModal);
    elements.editTaskInput.addEventListener('keypress', e => e.key === 'Enter' && saveEdit());
    elements.editModal.addEventListener('click', e => e.target === elements.editModal && closeModal());
});

async function loadTasks() {
    try {
        const response = await fetch('/api/tasks');
        if (!response.ok) throw new Error('Failed to load tasks');
        tasks = await response.json();
        renderTasks();
        updateStats();
    } catch (error) {
        console.error('Error loading tasks:', error);
    }
}

async function addTask() {
    const taskContent = elements.taskInput.value.trim();
    if (!taskContent) return elements.taskInput.focus();

    try {
        const response = await fetch('/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ task: taskContent })
        });

        if (!response.ok) throw new Error('Failed to add task');

        tasks.unshift(await response.json());
        elements.taskInput.value = '';
        renderTasks();
        updateStats();
        showNotification('Task added', 'success');
    } catch (error) {
        console.error('Error adding task:', error);
        showNotification('Failed to add task', 'error');
    }
}

async function toggleTask(id) {
    try {
        const response = await fetch(`/api/tasks/${id}/toggle`, { method: 'PATCH' });
        if (!response.ok) throw new Error('Failed to toggle task');

        const { completed } = await response.json();
        const task = tasks.find(t => t.id === id);
        if (task) task.completed = completed;
        
        renderTasks();
        updateStats();
    } catch (error) {
        console.error('Error toggling task:', error);
    }
}

function openEditModal(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    editingTaskId = id;
    elements.editTaskInput.value = task.task;
    elements.editModal.classList.add('show');
    elements.editTaskInput.focus();
}

async function saveEdit() {
    const newContent = elements.editTaskInput.value.trim();
    if (!newContent) return elements.editTaskInput.focus();

    try {
        const response = await fetch(`/api/tasks/${editingTaskId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ task: newContent })
        });

        if (!response.ok) throw new Error('Failed to update task');

        const { task: updatedTask } = await response.json();
        const task = tasks.find(t => t.id === editingTaskId);
        if (task) task.task = updatedTask;
        
        closeModal();
        renderTasks();
        showNotification('Task updated', 'success');
    } catch (error) {
        console.error('Error updating task:', error);
        showNotification('Failed to update task', 'error');
    }
}

function closeModal() {
    elements.editModal.classList.remove('show');
    editingTaskId = null;
    elements.editTaskInput.value = '';
}

async function deleteTask(id) {
    if (!confirm('Delete this task?')) return;

    try {
        const response = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete task');

        tasks = tasks.filter(t => t.id !== id);
        renderTasks();
        updateStats();
        showNotification('Task deleted', 'success');
    } catch (error) {
        console.error('Error deleting task:', error);
        showNotification('Failed to delete task', 'error');
    }
}

function renderTasks() {
    const filteredTasks = getFilteredTasks();
    
    if (filteredTasks.length === 0) {
        elements.tasksList.innerHTML = '';
        elements.emptyState.classList.add('show');
        return;
    }

    elements.emptyState.classList.remove('show');
    elements.tasksList.innerHTML = filteredTasks.map(task => `
        <li class="task-item ${task.completed ? 'completed' : ''}">
            <div class="task-checkbox ${task.completed ? 'checked' : ''}" onclick="toggleTask(${task.id})"></div>
            <span class="task-content">${escapeHtml(task.task)}</span>
            <div class="task-actions">
                <button class="task-btn edit-btn" onclick="openEditModal(${task.id})">Edit</button>
                <button class="task-btn delete-btn" onclick="deleteTask(${task.id})">Delete</button>
            </div>
        </li>
    `).join('');
}

function getFilteredTasks() {
    if (currentFilter === 'active') return tasks.filter(t => !t.completed);
    if (currentFilter === 'completed') return tasks.filter(t => t.completed);
    return tasks;
}

function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    elements.totalTasks.textContent = `${total} task${total !== 1 ? 's' : ''}`;
    elements.completedTasks.textContent = `${completed} completed`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showNotification(message, type = 'info') {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.className = 'toast';
    toast.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        background: ${type === 'success' ? '#1a1a1a' : '#c62828'};
        color: white;
        padding: 12px 20px;
        border: 1px solid ${type === 'success' ? '#1a1a1a' : '#c62828'};
        font-size: 0.875rem;
        font-weight: 500;
        z-index: 1000;
        animation: slideIn 0.2s ease;
    `;
    
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.2s ease';
        setTimeout(() => toast.remove(), 200);
    }, 2500);
}

const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);
