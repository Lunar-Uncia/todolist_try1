const SUPABASE_URL = 'https://yppjeuwcmtanolurkzqw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwcGpldXdjbXRhbm9sdXJrenF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyODk0NDEsImV4cCI6MjA3NTg2NTQ0MX0.XTbri7fcQmkcbMaVJ6lxqOTvy79Sq7o0ShvY-iAKcyU';

const { createClient } = supabase;
const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM Elements
const userEmailSpan = document.getElementById('user-email');
const logoutButton = document.getElementById('logout-button');
const deleteAccountButton = document.getElementById('delete-account-button');
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoDueDate = document.getElementById('todo-due-date');
const todoList = document.getElementById('todo-list');

// Memo Modal Elements
const memoModal = document.getElementById('memo-modal');
const memoText = document.getElementById('memo-text');
const saveMemoButton = document.getElementById('save-memo-button');
const closeModalButton = document.getElementById('close-modal-button');

let currentUser = null;
let currentTodoIdForMemo = null;

// --- 페이지 로드 및 사용자 확인 ---
document.addEventListener('DOMContentLoaded', async () => {
    const { data: { session }, error } = await _supabase.auth.getSession();

    if (error) {
        alert('세션 정보를 가져오는 중 오류가 발생했습니다: ' + error.message);
        return;
    }

    if (!session) {
        window.location.href = 'index.html';
    } else {
        currentUser = session.user;
        userEmailSpan.textContent = currentUser.email;
        await fetchTodos();
    }
});

// --- 할 일 불러오기 ---
async function fetchTodos() {
    const { data: todos, error } = await _supabase
        .from('todos')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        alert('할 일을 불러오는 중 오류가 발생했습니다: ' + error.message);
    } else {
        todoList.innerHTML = ''; // 목록 초기화
        todos.forEach(renderTodo);
    }
}

// --- 할 일 UI 렌더링 ---
function renderTodo(todo) {
    const li = document.createElement('li');
    li.className = `todo-item ${todo.is_complete ? 'completed' : ''}`;
    li.dataset.id = todo.id;

    const dueDate = todo.due_date ? new Date(todo.due_date).toLocaleString('ko-KR') : '기한 없음';
    const memoContent = todo.memo ? `<div class="task-memo">${todo.memo}</div>` : '';

    li.innerHTML = `
        <input type="checkbox" class="complete-checkbox" ${todo.is_complete ? 'checked' : ''}>
        <div class="task-content">
            <span class="task-text">${todo.task}</span>
            <div class="task-meta">기한: ${dueDate}</div>
            ${memoContent}
        </div>
        <button class="memo-button">📝</button>
        <button class="delete-button">🗑️</button>
    `;

    todoList.appendChild(li);
}

// --- 할 일 추가 ---
todoForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const task = todoInput.value.trim();
    const dueDateValue = todoDueDate.value;

    if (!task) return;

    // user_id는 데이터베이스에서 default 값으로 auth.uid()가 설정되었으므로 여기서 보낼 필요가 없습니다.
    const { data, error } = await _supabase
        .from('todos')
        .insert([{ 
            task: task, 
            due_date: dueDateValue ? dueDateValue : null
        }])
        .select()
        .single();

    if (error) {
        alert('할 일을 추가하는 중 오류가 발생했습니다: ' + error.message);
    } else {
        // 새 할 일을 목록의 가장 위에 추가
        const li = renderTodo(data);
        todoList.prepend(li);
        todoForm.reset();
    }
});

// --- 할 일 이벤트 처리 (완료, 삭제, 메모) ---
todoList.addEventListener('click', async (e) => {
    const target = e.target;
    const todoItem = target.closest('.todo-item');
    if (!todoItem) return;

    const todoId = todoItem.dataset.id;

    // 완료/미완료 처리
    if (target.classList.contains('complete-checkbox')) {
        const isComplete = target.checked;
        const { error } = await _supabase
            .from('todos')
            .update({ is_complete: isComplete })
            .eq('id', todoId);
        
        if (error) {
            alert('상태 업데이트 중 오류가 발생했습니다: ' + error.message);
        } else {
            todoItem.classList.toggle('completed', isComplete);
        }
    }

    // 삭제 처리
    if (target.classList.contains('delete-button')) {
        if (confirm('정말로 이 할 일을 삭제하시겠습니까?')) {
            const { error } = await _supabase
                .from('todos')
                .delete()
                .eq('id', todoId);

            if (error) {
                alert('삭제 중 오류가 발생했습니다: ' + error.message);
            } else {
                todoItem.remove();
            }
        }
    }
    
    // 메모 버튼 클릭
    if (target.classList.contains('memo-button')) {
        openMemoModal(todoId);
    }
});

// --- 메모 모달 열기 ---
async function openMemoModal(todoId) {
    currentTodoIdForMemo = todoId;
    const { data: todo, error } = await _supabase
        .from('todos')
        .select('memo')
        .eq('id', todoId)
        .single();

    if (error) {
        alert('메모를 불러오는 중 오류가 발생했습니다: ' + error.message);
        return;
    }

    memoText.value = todo.memo || '';
    memoModal.classList.add('visible');
}

// --- 메모 저장 ---
saveMemoButton.addEventListener('click', async () => {
    const memoContent = memoText.value.trim();
    const { error } = await _supabase
        .from('todos')
        .update({ memo: memoContent })
        .eq('id', currentTodoIdForMemo);

    if (error) {
        alert('메모 저장 중 오류가 발생했습니다: ' + error.message);
    } else {
        closeMemoModal();
    }
});

// --- 메모 모달 닫기 ---
function closeMemoModal() {
    currentTodoIdForMemo = null;
    memoModal.classList.remove('visible');
}
closeModalButton.addEventListener('click', closeMemoModal);

// --- 로그아웃 ---
logoutButton.addEventListener('click', async () => {
    const { error } = await _supabase.auth.signOut();
    if (error) {
        alert('로그아웃 중 오류가 발생했습니다: ' + error.message);
    } else {
        window.location.href = 'index.html';
    }
});

// --- 회원 탈퇴 ---
deleteAccountButton.addEventListener('click', async () => {
    if (confirm('정말로 회원 탈퇴를 진행하시겠습니까? 모든 데이터가 영구적으로 삭제됩니다.')) {
        const { error } = await _supabase.rpc('delete_user');

        if (error) {
            alert(`오류가 발생하여 탈퇴에 실패했습니다: ${error.message}`);
        } else {
            alert('회원 탈퇴가 완료되었습니다.');
            await _supabase.auth.signOut();
            window.location.href = 'index.html';
        }
    }
});

// 회원 탈퇴를 위한 Supabase DB 함수(RPC) 생성 안내
// Supabase SQL Editor에서 아래 코드를 실행해야 합니다.
/*
CREATE OR REPLACE FUNCTION delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $
BEGIN
  DELETE FROM public.todos WHERE user_id = auth.uid();
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$;
*/