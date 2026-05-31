const STORAGE_KEYS = {
  accessToken: 'drive.accessToken',
  refreshToken: 'drive.refreshToken',
  user: 'drive.user'
};

function showMessage(kind, text) {
  const error = document.getElementById('auth-error');
  const success = document.getElementById('auth-success');
  error.classList.add('d-none');
  success.classList.add('d-none');
  if (!text) return;
  const target = kind === 'error' ? error : success;
  target.textContent = text;
  target.classList.remove('d-none');
}

function clearMessages() {
  showMessage('success', '');
}

function toggleLoading(button, isLoading) {
  button.disabled = isLoading;
  button.querySelector('.btn-text').classList.toggle('d-none', isLoading);
  button.querySelector('.spinner-border').classList.toggle('d-none', !isLoading);
}

function persistSession(payload) {
  localStorage.setItem(STORAGE_KEYS.accessToken, payload.accessToken || '');
  localStorage.setItem(STORAGE_KEYS.refreshToken, payload.refreshToken || '');
  localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(payload.user || {}));
}

function validatePassword(password) {
  return (
    password.length >= 12 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}

async function submitAuth(path, body, button) {
  toggleLoading(button, true);
  try {
    const response = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const payload = await response.json();
    if (!response.ok || payload.error) {
      throw new Error(payload.error || 'Authentication failed');
    }
    persistSession(payload);
    showMessage('success', 'Authentication successful. Redirecting...');
    setTimeout(() => {
      window.location.href = '/dashboard.html';
    }, 250);
  } catch (error) {
    showMessage('error', error.message || 'Authentication failed');
  } finally {
    toggleLoading(button, false);
  }
}

function switchForm(formName) {
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  document.querySelectorAll('#auth-tabs .nav-link').forEach(tab => {
    tab.classList.toggle('active', tab.getAttribute('data-form') === formName);
  });
  loginForm.classList.toggle('d-none', formName !== 'login');
  signupForm.classList.toggle('d-none', formName !== 'signup');
  clearMessages();
}

document.addEventListener('DOMContentLoaded', () => {
  const accessToken = localStorage.getItem(STORAGE_KEYS.accessToken);
  const refreshToken = localStorage.getItem(STORAGE_KEYS.refreshToken);
  if (accessToken && refreshToken) {
    window.location.href = '/dashboard.html';
    return;
  }
  if (accessToken || refreshToken) {
    localStorage.removeItem(STORAGE_KEYS.accessToken);
    localStorage.removeItem(STORAGE_KEYS.refreshToken);
    localStorage.removeItem(STORAGE_KEYS.user);
  }

  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const loginButton = document.getElementById('login-btn');
  const signupButton = document.getElementById('signup-btn');

  document.querySelectorAll('#auth-tabs .nav-link').forEach(tab => {
    tab.addEventListener('click', () => {
      switchForm(tab.getAttribute('data-form'));
    });
  });

  loginForm.addEventListener('submit', async event => {
    event.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    if (!email || !password) {
      showMessage('error', 'Email and password are required');
      return;
    }
    await submitAuth('/api/auth/login', { email, password }, loginButton);
  });

  signupForm.addEventListener('submit', async event => {
    event.preventDefault();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const role = document.getElementById('signup-role').value;
    if (!email || !password) {
      showMessage('error', 'Email and password are required');
      return;
    }
    if (!validatePassword(password)) {
      showMessage('error', 'Password must be 12+ chars and include uppercase, lowercase, number, and symbol');
      return;
    }
    await submitAuth('/api/auth/signup', { email, password, role }, signupButton);
  });
});
