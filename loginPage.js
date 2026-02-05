function showMessage(text, isError = true) {
  const node = document.getElementById('message');
  node.textContent = text;
  node.style.color = isError ? '#dc2626' : '#15803d';
}

async function clickLogin() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  if (!username || !password) {
    showMessage('Please enter both username and password.');
    return;
  }

  try {
    const result = await fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password })
    });

    if (result.ok) {
      showMessage('Login successful. Redirecting...', false);
      window.location.href = 'home.html';
      return;
    }

    const payload = await result.json().catch(() => ({}));
    showMessage(payload.message || 'Login failed.');
  } catch (error) {
    showMessage('Cannot connect to server. Is it running on port 3000?');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('login')?.addEventListener('click', clickLogin);

  document.getElementById('googleLogin')?.addEventListener('click', () => {
    window.location.href = 'http://localhost:3000/auth/google';
  });

  document.querySelector('.signup')?.addEventListener('click', () => {
    window.location.href = 'signup.html';
  });

  document.getElementById('password')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') clickLogin();
  });
});
