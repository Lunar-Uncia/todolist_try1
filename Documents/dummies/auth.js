const SUPABASE_URL = 'https://yppjeuwcmtanolurkzqw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwcGpldXdjbXRhbm9sdXJrenF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyODk0NDEsImV4cCI6MjA3NTg2NTQ0MX0.XTbri7fcQmkcbMaVJ6lxqOTvy79Sq7o0ShvY-iAKcyU';

const { createClient } = supabase;
const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM Elements
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const showSignup = document.getElementById('show-signup');
const showLogin = document.getElementById('show-login');
const errorMessage = document.getElementById('error-message');

// --- 페이지 로드 시 세션 확인 ---
document.addEventListener('DOMContentLoaded', async () => {
    const { data: { session } } = await _supabase.auth.getSession();
    if (session) {
        window.location.href = 'app.html';
    }
});

// --- 폼 전환 --- 
showSignup.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.classList.remove('active');
    signupForm.classList.add('active');
    errorMessage.style.display = 'none';
});

showLogin.addEventListener('click', (e) => {
    e.preventDefault();
    signupForm.classList.remove('active');
    loginForm.classList.add('active');
    errorMessage.style.display = 'none';
});

// --- 에러 메시지 표시 ---
function displayError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

// --- 회원가입 ---
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    if (password.length < 6) {
        displayError('비밀번호는 6자 이상이어야 합니다.');
        return;
    }

    const { data, error } = await _supabase.auth.signUp({ email, password });

    if (error) {
        displayError(error.message);
    } else {
        alert('회원가입이 완료되었습니다. 이메일을 확인하여 계정을 활성화해주세요!');
        // 폼 초기화
        signupForm.reset();
        // 로그인 폼으로 전환
        signupForm.classList.remove('active');
        loginForm.classList.add('active');
    }
});

// --- 로그인 ---
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    await handleLogin();
});

// 엔터 키로 로그인
document.getElementById('login-password').addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
        e.preventDefault(); // form의 submit 이벤트를 막기 위해
        await handleLogin();
    }
});

async function handleLogin() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const { data, error } = await _supabase.auth.signInWithPassword({ email, password });

    if (error) {
        displayError('이메일 또는 비밀번호가 올바르지 않습니다.');
    } else {
        window.location.href = 'app.html';
    }
}
