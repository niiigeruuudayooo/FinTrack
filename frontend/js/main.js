// ===== Helpers =====
function emailValid(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
function passwordValid(v){ return v.length >= 8 && /\d/.test(v); } // ≥8 chars & a number

const toast = document.getElementById('toast');
function showToast(msg){
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 1800);
}

// ===== Password eye toggle (works on login & signup) =====
document.querySelectorAll('.password-wrap').forEach(wrap => {
  const input = wrap.querySelector('input[type="password"], input[type="text"]');
  const toggle = wrap.querySelector('.pw-toggle');
  if (input && toggle){
    toggle.addEventListener('click', () => {
      const isPw = input.type === 'password';
      input.type = isPw ? 'text' : 'password';
      toggle.textContent = isPw ? '🙈' : '👁';
    });
  }
});

// Helper for JSON POST
async function postJson(url, data) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if(!res.ok) throw new Error(json.message || 'Request failed');
  return json;
}

// ===== Sign Up =====
const signupForm = document.getElementById('signupForm');
if (signupForm){
  const firstEl    = document.getElementById('firstName');
  const lastEl     = document.getElementById('lastName');
  const emailEl    = document.getElementById('email');
  const pwEl       = document.getElementById('password');
  const confirmEl  = document.getElementById('confirm');
  const termsEl    = document.getElementById('terms');
  const submitBtn  = document.getElementById('submitBtn');

  const emailError   = document.getElementById('emailError');
  const pwError      = document.getElementById('passwordError');
  const confirmError = document.getElementById('confirmError');

  function syncButtonState(){
    const ok =
      firstEl.value.trim() &&
      lastEl.value.trim() &&
      emailValid(emailEl.value.trim()) &&
      passwordValid(pwEl.value) &&
      confirmEl.value === pwEl.value &&
      termsEl.checked;
    submitBtn.disabled = !ok;
  }

  [firstEl, lastEl].forEach(el => el.addEventListener('input', syncButtonState));
  emailEl.addEventListener('input', () => {
    emailError.textContent = !emailEl.value ? '' : (emailValid(emailEl.value) ? '' : 'Please enter a valid email.');
    syncButtonState();
  });
  pwEl.addEventListener('input', () => {
    pwError.textContent = !pwEl.value ? '' : (passwordValid(pwEl.value) ? '' : 'Min 8 chars and include a number.');
    if (confirmEl.value && confirmEl.value !== pwEl.value){
      confirmError.textContent = 'Passwords do not match.';
    } else {
      confirmError.textContent = '';
    }
    syncButtonState();
  });
  confirmEl.addEventListener('input', () => {
    confirmError.textContent = !confirmEl.value ? '' : (confirmEl.value === pwEl.value ? '' : 'Passwords do not match.');
    syncButtonState();
  });
  termsEl.addEventListener('change', syncButtonState);

  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await postJson('/api/auth/signup', {
        firstName: firstEl.value.trim(),
        lastName: lastEl.value.trim(),
        email: emailEl.value.trim(),
        password: pwEl.value
      });
      showToast('Account created! Please log in.');
      setTimeout(() => { window.location.href = 'login.html'; }, 1200);
    } catch (err) {
      showToast(err.message);
    }
  });

  syncButtonState();
}

// ===== Login =====
const loginForm = document.getElementById('loginForm');
if (loginForm){
  const userEl = document.getElementById('username');
  const passEl = document.getElementById('password');
  const loginBtn = document.getElementById('loginBtn');

  function syncLogin(){
    loginBtn.disabled = !(userEl.value.trim() && passEl.value);
  }
  [userEl, passEl].forEach(el => el.addEventListener('input', syncLogin));
  syncLogin();

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const data = await postJson('/api/auth/login', {
        email: userEl.value.trim(),
        password: passEl.value
      });
      // Save token (adjust if backend sends JWT token)
      localStorage.setItem('ft_token', data.token);
      showToast('Welcome back!');
      setTimeout(() => { window.location.href = 'dashboard.html'; }, 600);
    } catch(err) {
      showToast(err.message);
    }
  });
}

// ===== Forgot Password =====
const resetForm = document.getElementById('resetForm');
if (resetForm){
  const email = document.getElementById('fpEmail');
  const err = document.getElementById('fpEmailErr');
  const btn = document.getElementById('resetBtn');

  function sync(){
    const ok = emailValid(email.value.trim());
    btn.disabled = !ok;
    err.textContent = ok || !email.value ? '' : 'Please enter a valid email.';
  }
  email.addEventListener('input', sync);
  sync();

  resetForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await postJson('/api/auth/reset-password', { email: email.value.trim() });
      showToast('Reset link sent to your email.');
      setTimeout(() => { window.location.href = 'login.html'; }, 1200);
    } catch(err){
      showToast(err.message);
    }
  });
}

// ===== Find Username =====
const findForm = document.getElementById('findForm');
if (findForm){
  const first = document.getElementById('fnFirst');
  const last = document.getElementById('fnLast');
  const email = document.getElementById('fnEmail');
  const err = document.getElementById('fnEmailErr');
  const btn = document.getElementById('findBtn');

  function sync2(){
    const ok = first.value.trim() && last.value.trim() && emailValid(email.value.trim());
    btn.disabled = !ok;
    err.textContent = emailValid(email.value.trim()) || !email.value ? '' : 'Please enter a valid email.';
  }
  [first, last, email].forEach(el => el.addEventListener('input', sync2));
  sync2();

  findForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await postJson('/api/auth/find-username', {
        firstName: first.value.trim(),
        lastName: last.value.trim(),
        email: email.value.trim()
      });
      showToast('We’ve sent your username to your email.');
      setTimeout(() => { window.location.href = 'login.html'; }, 1200);
    } catch(err){
      showToast(err.message);
    }
  });
}

// ===== Logout =====
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn){
  logoutBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    try {
      // If backend logout API exists, call it here
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch(e) {
      // ignore errors
    }
    localStorage.removeItem('ft_token');
    window.location.href = 'login.html';
  });
}