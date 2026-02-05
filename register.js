function showStatus(text, isError = true) {
  const target = document.getElementById('content');
  target.textContent = text;
  target.style.color = isError ? '#dc2626' : '#15803d';
}

async function createAccount() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  if (!username || !password) {
    showStatus('Please fill in username and password.');
    return;
  }

  if (password.length < 6) {
    showStatus('Password must be at least 6 characters.');
    return;
  }

  try {
    const checkRes = await fetch('http://localhost:3000/check-username', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username })
    });

    const checkPayload = await checkRes.json().catch(() => ({ exists: false }));
    if (checkPayload.exists) {
      showStatus('Username already used. Try another one.');
      return;
    }

    const registerRes = await fetch('http://localhost:3000/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (registerRes.ok) {
      showStatus('Account created. Redirecting to login...', false);
      setTimeout(() => {
        window.location.href = 'loginPage.html';
      }, 900);
      return;
    }

    const payload = await registerRes.json().catch(() => ({}));
    showStatus(payload.message || 'Could not create account.');
  } catch {
    showStatus('Cannot connect to server. Is it running on port 3000?');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('create')?.addEventListener('click', createAccount);
  document.getElementById('login')?.addEventListener('click', () => {
    window.location.href = 'loginPage.html';
  });
});
