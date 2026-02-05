const STORAGE_KEYS = {
  classes: 'studyPlanner_classes',
  activities: 'studyPlanner_activities',
  profile: 'studyPlanner_profile'
};

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function safeText(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function setWelcomeName() {
  const el = document.getElementById('name');
  const profile = loadJSON(STORAGE_KEYS.profile, null);
  if (profile?.fullname?.trim()) {
    el.textContent = `Welcome, ${profile.fullname.trim()}`;
    return;
  }
  el.textContent = 'Welcome';
}

function createClassRow() {
  const wrapper = document.createElement('div');
  wrapper.className = 'input-row';

  const select = document.createElement('select');
  const choices = ['Computer Science', 'Data Analytics', 'Mathematics', 'Engineering', 'Marketing', 'Other'];
  choices.forEach(choice => {
    const option = document.createElement('option');
    option.value = choice;
    option.textContent = choice;
    select.appendChild(option);
  });

  const customInput = document.createElement('input');
  customInput.type = 'text';
  customInput.placeholder = 'Enter course name';
  customInput.className = 'custom-input';
  customInput.style.display = 'none';

  const label = document.createElement('label');
  label.textContent = 'Deadline';
  const deadlineInput = document.createElement('input');
  deadlineInput.type = 'date';
  deadlineInput.className = 'class-deadline';
  label.appendChild(deadlineInput);

  select.addEventListener('change', () => {
    customInput.style.display = select.value === 'Other' ? 'block' : 'none';
  });

  wrapper.append(select, customInput, label);
  return wrapper;
}

function createActivityRow() {
  const wrapper = document.createElement('div');
  wrapper.className = 'input-row';

  const select = document.createElement('select');
  const choices = ['Academic meeting', 'Hiking', 'Sports', 'Shopping', 'Club meeting', 'Other'];
  choices.forEach(choice => {
    const option = document.createElement('option');
    option.value = choice;
    option.textContent = choice;
    select.appendChild(option);
  });

  const customInput = document.createElement('input');
  customInput.type = 'text';
  customInput.placeholder = 'Enter activity name';
  customInput.className = 'custom-input';
  customInput.style.display = 'none';

  const label = document.createElement('label');
  label.textContent = 'Time';
  const timeInput = document.createElement('input');
  timeInput.type = 'time';
  timeInput.className = 'activity-time';
  label.appendChild(timeInput);

  select.addEventListener('change', () => {
    customInput.style.display = select.value === 'Other' ? 'block' : 'none';
  });

  wrapper.append(select, customInput, label);
  return wrapper;
}

function renderClasses() {
  const container = document.getElementById('finalDisplay1');
  const classes = loadJSON(STORAGE_KEYS.classes, []);

  container.innerHTML = '<h3>Upcoming assignments</h3>';

  if (!classes.length) {
    const empty = document.createElement('p');
    empty.className = 'meta';
    empty.textContent = 'No classes saved yet. Add one above.';
    container.appendChild(empty);
    return;
  }

  classes.forEach((item, idx) => {
    const row = document.createElement('div');
    row.className = 'item-row';

    const info = document.createElement('div');
    info.innerHTML = `<strong>${safeText(item.name)}</strong><div class="meta">Deadline: ${safeText(item.deadline)}</div>`;

    const del = document.createElement('button');
    del.className = 'delete-btn';
    del.type = 'button';
    del.textContent = 'Delete';
    del.addEventListener('click', () => {
      const next = classes.filter((_, i) => i !== idx);
      saveJSON(STORAGE_KEYS.classes, next);
      renderClasses();
    });

    row.append(info, del);
    container.appendChild(row);
  });
}

function renderActivities() {
  const container = document.getElementById('finalDisplay2');
  const activities = loadJSON(STORAGE_KEYS.activities, []);

  container.innerHTML = '<h3>Activity list</h3>';

  if (!activities.length) {
    const empty = document.createElement('p');
    empty.className = 'meta';
    empty.textContent = 'No activities saved yet. Add one above.';
    container.appendChild(empty);
    return;
  }

  activities.forEach((item, idx) => {
    const row = document.createElement('div');
    row.className = 'item-row';

    const info = document.createElement('div');
    info.innerHTML = `<strong>${safeText(item.name)}</strong><div class="meta">Time: ${safeText(item.time)}</div>`;

    const del = document.createElement('button');
    del.className = 'delete-btn';
    del.type = 'button';
    del.textContent = 'Delete';
    del.addEventListener('click', () => {
      const next = activities.filter((_, i) => i !== idx);
      saveJSON(STORAGE_KEYS.activities, next);
      renderActivities();
    });

    row.append(info, del);
    container.appendChild(row);
  });
}

function saveClassRows() {
  const rows = [...document.querySelectorAll('#class-content .input-row')];
  const existing = loadJSON(STORAGE_KEYS.classes, []);

  const additions = [];
  rows.forEach(row => {
    const select = row.querySelector('select');
    const custom = row.querySelector('.custom-input');
    const deadline = row.querySelector('.class-deadline')?.value?.trim();
    let name = select?.value || '';

    if (name === 'Other') {
      name = custom?.value?.trim() || '';
    }

    if (!name || !deadline) return;
    additions.push({ name, deadline });
  });

  const merged = [...existing];
  additions.forEach(item => {
    if (!merged.some(c => c.name === item.name && c.deadline === item.deadline)) {
      merged.push(item);
    }
  });

  saveJSON(STORAGE_KEYS.classes, merged);
  document.getElementById('class-content').innerHTML = '';
  renderClasses();
}

function saveActivityRows() {
  const rows = [...document.querySelectorAll('#homework-content .input-row')];
  const existing = loadJSON(STORAGE_KEYS.activities, []);

  const additions = [];
  rows.forEach(row => {
    const select = row.querySelector('select');
    const custom = row.querySelector('.custom-input');
    const time = row.querySelector('.activity-time')?.value?.trim();
    let name = select?.value || '';

    if (name === 'Other') {
      name = custom?.value?.trim() || '';
    }

    if (!name || !time) return;
    additions.push({ name, time });
  });

  const merged = [...existing];
  additions.forEach(item => {
    if (!merged.some(a => a.name === item.name && a.time === item.time)) {
      merged.push(item);
    }
  });

  saveJSON(STORAGE_KEYS.activities, merged);
  document.getElementById('homework-content').innerHTML = '';
  renderActivities();
}

async function logout() {
  try {
    await fetch('http://localhost:3000/logout', {
      method: 'POST',
      credentials: 'include'
    });
  } catch {
    // ignore network failures and continue redirect
  }
  window.location.href = 'loginPage.html';
}

function wireNavigation() {
  document.getElementById('goProfile')?.addEventListener('click', () => {
    window.location.href = 'profile.html';
  });

  document.getElementById('goAbout')?.addEventListener('click', () => {
    window.location.href = 'about.html';
  });

  document.getElementById('goHome')?.addEventListener('click', () => {
    window.location.href = 'home.html';
  });

  document.getElementById('logout')?.addEventListener('click', logout);
}

document.addEventListener('DOMContentLoaded', () => {
  setWelcomeName();
  wireNavigation();

  document.getElementById('addClassBtn')?.addEventListener('click', () => {
    document.getElementById('class-content').appendChild(createClassRow());
  });

  document.getElementById('addActivityBtn')?.addEventListener('click', () => {
    document.getElementById('homework-content').appendChild(createActivityRow());
  });

  document.getElementById('saveBtn1')?.addEventListener('click', saveClassRows);
  document.getElementById('saveBtn2')?.addEventListener('click', saveActivityRows);

  renderClasses();
  renderActivities();
});
