// Supabase initialization
const SUPABASE_URL = 'https://yppjeuwcmtanolurkzqw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwcGpldXdjbXRhbm9sdXJrenF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyODk0NDEsImV4cCI6MjA3NTg2NTQ0MX0.XTbri7fcQmkcbMaVJ6lxqOTvy79Sq7o0ShvY-iAKcyU';

const { createClient } = supabase;
const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM elements
const authContainer = document.getElementById('auth-container');
const appContainer = document.getElementById('app-container');
const loginButton = document.getElementById('login-button');
const signupButton = document.getElementById('signup-button');
const logoutButton = document.getElementById('logout-button');
const loginEmailInput = document.getElementById('login-email');
const loginPasswordInput = document.getElementById('login-password');
const signupEmailInput = document.getElementById('signup-email');
const signupPasswordInput = document.getElementById('signup-password');

// Time and Calendar elements
const clockElement = document.getElementById('clock');
const calendarElement = document.getElementById('calendar');

// To-Do List elements
const todoInput = document.getElementById('todo-input');
const addTodoButton = document.getElementById('add-todo-button');
const todoList = document.getElementById('todo-list');

// Memo elements
const memoTextarea = document.getElementById('memo-textarea');
const saveMemoButton = document.getElementById('save-memo-button');

// Account elements
const deleteAccountButton = document.getElementById('delete-account-button');

// Listen for authentication state changes
_supabase.auth.onAuthStateChange((event, session) => {
    if (session) {
        // User is logged in
        authContainer.style.display = 'none';
        appContainer.style.display = 'block';
        fetchTodos();
        fetchMemo();
    } else {
        // User is logged out
        authContainer.style.display = 'block';
        appContainer.style.display = 'none';
        todoList.innerHTML = ''; // Clear todos
        memoTextarea.value = ''; // Clear memo
    }
});

// Update time and date
function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    const dateString = now.toLocaleDateString();
    clockElement.textContent = timeString;
    calendarElement.textContent = dateString;
}
// Update the time every second
setInterval(updateTime, 1000);
// Set initial time and date
updateTime();

// Sign up function
signupButton.addEventListener('click', async () => {
    const email = signupEmailInput.value;
    const password = signupPasswordInput.value;
    const { user, error } = await _supabase.auth.signUp({ email, password });
    if (error) {
        alert(error.message);
    } else {
        alert('Sign up successful! Please check your email for verification.');
    }
});

// Login function
loginButton.addEventListener('click', async () => {
    const email = loginEmailInput.value;
    const password = loginPasswordInput.value;
    const { user, error } = await _supabase.auth.signInWithPassword({ email, password });
    if (error) {
        alert(error.message);
    }
    // The onAuthStateChange listener will handle showing/hiding the containers
});

// Login with Enter key
loginPasswordInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        loginButton.click();
    }
});

// Logout function
logoutButton.addEventListener('click', async () => {
    const { error } = await _supabase.auth.signOut();
    if (error) {
        alert(error.message);
    }
    // The onAuthStateChange listener will handle hiding/showing the containers
});

// Fetch and display todos
const fetchTodos = async () => {
    const { data: todos, error } = await _supabase
        .from('todos')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching todos:', error);
    } else {
        todoList.innerHTML = ''; // Clear the list
        todos.forEach(todo => {
            const li = document.createElement('li');
            li.textContent = todo.task;
            li.dataset.id = todo.id;
            if (todo.is_complete) {
                li.classList.add('completed');
            }

            // Toggle complete status
            li.addEventListener('click', async () => {
                const { error } = await _supabase
                    .from('todos')
                    .update({ is_complete: !todo.is_complete })
                    .eq('id', todo.id);

                if (error) {
                    alert(error.message);
                } else {
                    fetchTodos(); // Refresh the list
                }
            });

            // Delete button
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.addEventListener('click', async (e) => {
                e.stopPropagation(); // Prevent li click event from firing
                const { error } = await _supabase
                    .from('todos')
                    .delete()
                    .eq('id', todo.id);

                if (error) {
                    alert(error.message);
                } else {
                    fetchTodos(); // Refresh the list
                }
            });

            li.appendChild(deleteButton);
            todoList.appendChild(li);
        });
    }
};

// Add a new todo
addTodoButton.addEventListener('click', async () => {
    const task = todoInput.value.trim();
    if (task) {
        const { data: { user } } = await _supabase.auth.getUser();
        const { error } = await _supabase
            .from('todos')
            .insert({ task: task, user_id: user.id });

        if (error) {
            alert(error.message);
        } else {
            todoInput.value = '';
            fetchTodos(); // Refresh the list
        }
    }
});

// Fetch memo
const fetchMemo = async () => {
    const { data: memo, error } = await _supabase
        .from('memos')
        .select('content')
        .single(); // We expect only one memo per user

    if (error && error.code !== 'PGRST116') { // Ignore 'range not satisfiable' error for empty results
        console.error('Error fetching memo:', error);
    } else if (memo) {
        memoTextarea.value = memo.content;
    }
};

// Save memo
saveMemoButton.addEventListener('click', async () => {
    const content = memoTextarea.value.trim();
    const { data: { user } } = await _supabase.auth.getUser();

    const { error } = await _supabase
        .from('memos')
        .upsert({ user_id: user.id, content: content }, { onConflict: 'user_id' });

    if (error) {
        alert(error.message);
    } else {
        alert('Memo saved!');
    }
});

// Delete account
deleteAccountButton.addEventListener('click', async () => {
    if (confirm('Are you sure you want to delete your account? This action is irreversible.')) {
        const { error } = await _supabase.rpc('delete_user_account');

        if (error) {
            alert(error.message);
        } else {
            alert('Account deleted successfully.');
            // The onAuthStateChange listener will handle logout and UI changes
        }
    }
});