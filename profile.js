const PROFILE_KEY = 'studyPlanner_profile';

function loadProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveProfile(profile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

function paintProfile(profile) {
  if (!profile) return;
  document.getElementById('fullname').value = profile.fullname || '';
  document.getElementById('email').value = profile.email || '';
  document.getElementById('age').value = profile.age || '';
  document.getElementById('work').value = profile.work || '';
  document.getElementById('about').value = profile.about || '';

  const name = (profile.fullname || '').trim();
  document.getElementById('name').textContent = name ? `Hi, ${name}` : 'Profile';
}

function saveMessage() {
  const existing = document.getElementById('savedMessage');
  if (existing) existing.remove();

  const message = document.createElement('div');
  message.id = 'savedMessage';
  message.textContent = 'Saved!';
  document.body.appendChild(message);

  setTimeout(() => message.remove(), 1600);
}

async function logout() {
  try {
    await fetch('http://localhost:3000/logout', {
      method: 'POST',
      credentials: 'include'
    });
  } catch {
    // ignore
  }
  window.location.href = 'loginPage.html';
}

document.addEventListener('DOMContentLoaded', () => {
  const existing = loadProfile();
  paintProfile(existing);

  document.getElementById('saveBtn')?.addEventListener('click', () => {
    const profile = {
      fullname: document.getElementById('fullname').value.trim(),
      email: document.getElementById('email').value.trim(),
      age: document.getElementById('age').value.trim(),
      work: document.getElementById('work').value.trim(),
      about: document.getElementById('about').value.trim()
    };

    saveProfile(profile);
    paintProfile(profile);
    saveMessage();
  });

  document.querySelector('.home-link')?.addEventListener('click', () => {
    window.location.href = 'home.html';
  });

  document.querySelector('.about-link')?.addEventListener('click', () => {
    window.location.href = 'about.html';
  });

  document.getElementById('logout')?.addEventListener('click', logout);
});
