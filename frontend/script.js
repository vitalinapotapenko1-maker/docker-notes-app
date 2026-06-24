const API_URL = 'http://localhost:5000';
 
let currentToken = null;
let currentUsername = null;
let currentEditNoteId = null;
let pendingDeleteId = null;
 

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}
 

function showFieldError(fieldId, errorId, message) {
    const input = document.getElementById(fieldId);
    const errorEl = document.getElementById(errorId);
    if (input) {
        input.classList.add('input-error');
        input.classList.remove('input-success');
    }
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.add('visible');
    }
}
 
function showFieldSuccess(fieldId, successId, message) {
    const input = document.getElementById(fieldId);
    const successEl = document.getElementById(successId);
    if (input) {
        input.classList.remove('input-error');
        input.classList.add('input-success');
    }
    if (successEl) {
        successEl.textContent = message;
        successEl.classList.add('visible');
    }
}
 
function clearFieldState(fieldId, errorId, successId) {
    const input = document.getElementById(fieldId);
    const errorEl = document.getElementById(errorId);
    if (input) {
        input.classList.remove('input-error', 'input-success');
    }
    if (errorEl) {
        errorEl.textContent = '';
        errorEl.classList.remove('visible');
    }
    if (successId) {
        const successEl = document.getElementById(successId);
        if (successEl) {
            successEl.textContent = '';
            successEl.classList.remove('visible');
        }
    }
}
 
function clearAllAuthErrors() {
    clearFieldState('username', 'usernameError', 'usernameSuccess');
    clearFieldState('password', 'passwordError');
}
 

function updateUI() {
    const unauthorized = document.getElementById('unauthorized');
    const authorized = document.getElementById('authorized');
    const userNameSpan = document.getElementById('userNameDisplay');
 
    if (currentToken) {
        unauthorized.style.display = 'none';
        authorized.style.display = 'block';
        userNameSpan.innerText = currentUsername;
        loadNotes();
    } else {
        unauthorized.style.display = 'block';
        authorized.style.display = 'none';
        document.getElementById('notes').innerHTML = '';
    }
}
 

function validateRegistration(username, password) {
    let valid = true;
    clearAllAuthErrors();
 
    if (!username) {
        showFieldError('username', 'usernameError', 'Zadajte používateľské meno.');
        valid = false;
    } else if (username.length < 3) {
        showFieldError('username', 'usernameError', 'Meno musí mať minimálne 3 znaky.');
        valid = false;
    }
 
    if (!password) {
        showFieldError('password', 'passwordError', 'Zadajte heslo.');
        valid = false;
    } else if (password.length < 4) {
        showFieldError('password', 'passwordError', 'Heslo musí mať minimálne 4 znaky.');
        valid = false;
    }
 
    return valid;
}
 

async function register() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
 
    if (!validateRegistration(username, password)) return;
 
    const btn = document.getElementById('btnRegister');
    btn.disabled = true;
    btn.textContent = 'Registrujem...';
 
    try {
        const res = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
 
        if (res.ok) {
            clearAllAuthErrors();
            showFieldSuccess('username', 'usernameSuccess', 'Registrácia úspešná! Teraz sa môžete prihlásiť.');
            showToast(`Registrácia pre "${username}" bola úspešná!`, 'success');
            document.getElementById('password').value = '';
        } else if (res.status === 409) {
            showFieldError('username', 'usernameError',
                `Používateľské meno "${username}" je už obsadené. Zvoľte prosím iné meno.`);
        } else {
            showFieldError('username', 'usernameError', data.message || 'Nastala chyba pri registrácii.');
        }
    } catch (error) {
        showToast('Nepodarilo sa pripojiť k serveru. Skontrolujte, či backend beží.', 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Registrovať sa';
    }
}
 

async function login() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
 
    clearAllAuthErrors();
 
    if (!username || !password) {
        if (!username) showFieldError('username', 'usernameError', 'Zadajte používateľské meno.');
        if (!password) showFieldError('password', 'passwordError', 'Zadajte heslo.');
        return;
    }
 
    const btn = document.getElementById('btnLogin');
    btn.disabled = true;
    btn.textContent = 'Prihlasovanie...';
 
    try {
        const res = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
 
        if (res.ok) {
            currentToken = data.token;
            currentUsername = username;
            clearAllAuthErrors();
            document.getElementById('username').value = '';
            document.getElementById('password').value = '';
            showToast(`Vitajte, ${username}!`, 'success');
            updateUI();
        } else {
            showFieldError('username', 'usernameError', 'Nesprávne meno alebo heslo.');
            showFieldError('password', 'passwordError', 'Skontrolujte prihlasovacie údaje a skúste znova.');
        }
    } catch (error) {
        showToast('Nepodarilo sa pripojiť k serveru. Skontrolujte, či backend beží.', 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Prihlásiť sa';
    }
}
 

function logout() {
    currentToken = null;
    currentUsername = null;
    showToast('Boli ste odhlásený.', 'info');
    updateUI();
}
 

async function loadNotes() {
    if (!currentToken) return;
 
    try {
        const res = await fetch(`${API_URL}/notes`, {
            headers: { 'Authorization': `Bearer ${currentToken}` }
        });
 
        if (res.status === 401) {
            showToast('Relácia vypršala. Prihláste sa znova.', 'error');
            logout();
            return;
        }
 
        const notes = await res.json();
        const notesDiv = document.getElementById('notes');
 
        if (notes.length === 0) {
            notesDiv.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📝</div>
                    Zatiaľ nemáte žiadne poznámky.<br>
                    Vytvorte svoju prvú poznámku vyššie.
                </div>`;
            return;
        }
 
        notesDiv.innerHTML = '<div class="notes-grid"></div>';
        const grid = notesDiv.querySelector('.notes-grid');
 
        notes.forEach(note => {
            const card = document.createElement('div');
            card.className = 'note-card';
            card.innerHTML = `
                <div class="note-title">${escapeHtml(note.title)}</div>
                <div class="note-content">${escapeHtml(note.content) || '<em style="color:#aab5c1;">Bez obsahu</em>'}</div>
                <div class="note-actions">
                    <button onclick="openEditModal(${note.id})" class="outline small">Upraviť</button>
                    <button onclick="requestDelete(${note.id})" class="danger small">Vymazať</button>
                </div>
            `;
            grid.appendChild(card);
        });
    } catch (error) {
        showToast('Chyba pri načítaní poznámok.', 'error');
    }
}
 

async function createNote() {
    const titleInput = document.getElementById('noteTitle');
    const contentInput = document.getElementById('noteContent');
    const title = titleInput.value.trim();
    const content = contentInput.value;
 
    clearFieldState('noteTitle', 'noteTitleError');
 
    if (!title) {
        showFieldError('noteTitle', 'noteTitleError', 'Nadpis je povinný.');
        return;
    }
 
    try {
        const res = await fetch(`${API_URL}/notes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            },
            body: JSON.stringify({ title, content })
        });
 
        if (res.ok) {
            titleInput.value = '';
            contentInput.value = '';
            showToast('Poznámka bola vytvorená!', 'success');
            loadNotes();
        } else {
            showToast('Chyba pri vytváraní poznámky.', 'error');
        }
    } catch (error) {
        showToast('Chyba pripojenia k serveru.', 'error');
    }
}

async function openEditModal(noteId) {
    currentEditNoteId = noteId;
 
    try {
        const res = await fetch(`${API_URL}/notes`, {
            headers: { 'Authorization': `Bearer ${currentToken}` }
        });
        const notes = await res.json();
        const note = notes.find(n => n.id === noteId);
 
        if (note) {
            document.getElementById('editNoteTitle').value = note.title;
            document.getElementById('editNoteContent').value = note.content || '';
            clearFieldState('editNoteTitle', 'editNoteTitleError');
            document.getElementById('editModal').style.display = 'flex';
        }
    } catch (error) {
        showToast('Chyba pri načítaní poznámky.', 'error');
    }
}
 
function closeModal() {
    document.getElementById('editModal').style.display = 'none';
    currentEditNoteId = null;
}
 
async function updateNote() {
    const title = document.getElementById('editNoteTitle').value.trim();
    const content = document.getElementById('editNoteContent').value;
 
    clearFieldState('editNoteTitle', 'editNoteTitleError');
 
    if (!title) {
        showFieldError('editNoteTitle', 'editNoteTitleError', 'Nadpis je povinný.');
        return;
    }
 
    try {
        const res = await fetch(`${API_URL}/notes/${currentEditNoteId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            },
            body: JSON.stringify({ title, content })
        });
 
        if (res.ok) {
            showToast('Poznámka bola aktualizovaná!', 'success');
            closeModal();
            loadNotes();
        } else {
            showToast('Chyba pri aktualizácii poznámky.', 'error');
        }
    } catch (error) {
        showToast('Chyba pripojenia k serveru.', 'error');
    }
}
 

function requestDelete(noteId) {
    pendingDeleteId = noteId;
    document.getElementById('confirmOverlay').style.display = 'flex';
}
 
function cancelDelete() {
    pendingDeleteId = null;
    document.getElementById('confirmOverlay').style.display = 'none';
}
 
async function confirmDelete() {
    if (!pendingDeleteId) return;
 
    const id = pendingDeleteId;
    cancelDelete();
 
    try {
        const res = await fetch(`${API_URL}/notes/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${currentToken}` }
        });
 
        if (res.ok) {
            showToast('Poznámka bola vymazaná.', 'success');
            loadNotes();
        } else {
            showToast('Chyba pri vymazávaní poznámky.', 'error');
        }
    } catch (error) {
        showToast('Chyba pripojenia k serveru.', 'error');
    }
}
 

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
 

document.addEventListener('DOMContentLoaded', () => {
    updateUI();
 
    document.getElementById('username').addEventListener('input', () => {
        clearFieldState('username', 'usernameError', 'usernameSuccess');
    });
    document.getElementById('password').addEventListener('input', () => {
        clearFieldState('password', 'passwordError');
    });
 
 
    document.getElementById('password').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') login();
    });
    document.getElementById('username').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') document.getElementById('password').focus();
    });
 
  
    document.getElementById('editModal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('editModal')) closeModal();
    });
    document.getElementById('confirmOverlay').addEventListener('click', (e) => {
        if (e.target === document.getElementById('confirmOverlay')) cancelDelete();
    });
});