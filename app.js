const SUPABASE_URL = 'https://lakupnehsetdazezlsrs.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_3ePLMRIKVNms7Qi461FQXw_x2TGc75s';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const authScreen = document.getElementById('auth-screen');
const feedScreen = document.getElementById('feed-screen');
const feedEl = document.getElementById('feed');
const feedEmpty = document.getElementById('feed-empty');
const authMsg = document.getElementById('auth-msg');

let currentUser = null;

function showScreen(loggedIn) {
  authScreen.classList.toggle('hidden', loggedIn);
  feedScreen.classList.toggle('hidden', !loggedIn);
}

async function signIn() {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  authMsg.textContent = '';
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) authMsg.textContent = error.message;
}

async function signUp() {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  authMsg.textContent = '';
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) authMsg.textContent = error.message;
  else authMsg.textContent = 'Check your email to confirm, or just sign in if confirmation is off.';
}

async function logout() {
  await supabase.auth.signOut();
}

async function loadPosts() {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) { console.error(error); return; }
  renderPosts(data || []);
}

function renderPosts(posts) {
  feedEl.innerHTML = '';
  feedEmpty.style.display = posts.length ? 'none' : 'block';
  posts.forEach((p) => {
    const div = document.createElement('div');
    div.className = 'post';
    div.innerHTML = `<div>${escapeHtml(p.content || '')}</div>
      <div class="time">${new Date(p.created_at).toLocaleString()}</div>`;
    feedEl.appendChild(div);
  });
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

async function addPost() {
  const input = document.getElementById('post-input');
  const content = input.value.trim();
  if (!content || !currentUser) return;
  const { error } = await supabase.from('posts').insert({ content, user_id: currentUser.id });
  if (error) alert(error.message);
  else input.value = '';
}

document.getElementById('signin-btn').addEventListener('click', signIn);
document.getElementById('signup-btn').addEventListener('click', signUp);
document.getElementById('logout-btn').addEventListener('click', logout);
document.getElementById('post-btn').addEventListener('click', addPost);

supabase.auth.onAuthStateChange((_event, session) => {
  currentUser = session?.user || null;
  showScreen(!!currentUser);
  if (currentUser) {
    loadPosts();
    supabase.channel('posts-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' },
        (payload) => {
          const p = payload.new;
          const div = document.createElement('div');
          div.className = 'post';
          div.innerHTML = `<div>${escapeHtml(p.content || '')}</div>
            <div class="time">${new Date(p.created_at).toLocaleString()}</div>`;
          feedEl.prepend(div);
          feedEmpty.style.display = 'none';
        })
      .subscribe();
  }
});