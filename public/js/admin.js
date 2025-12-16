// Check if already logged in on load
checkAuth();

async function checkAuth() {
  try {
    const response = await fetch('/api/admin/check-auth');
    const result = await response.json();
    if (result.authenticated) {
      showAdminPanel();
    } else {
      showLoginForm();
    }
  } catch (error) {
    console.error('Auth check error:', error);
    showLoginForm();
  }
}

function showLoginForm() {
  document.getElementById('loginSection').style.display = 'block';
  document.getElementById('adminSection').style.display = 'none';
}

// Login form handler
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const loginMessage = document.getElementById('loginMessage');
  const submitBtn = e.target.querySelector('button[type="submit"]');

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  submitBtn.disabled = true;
  submitBtn.textContent = 'Logging in...';
  loginMessage.textContent = '';
  loginMessage.className = 'form-message';

  try {
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const result = await response.json();

    if (response.ok && result.success) {
      // Session cookie is set automatically by server
      showAdminPanel();
      document.getElementById('loginForm').reset();
    } else {
      loginMessage.textContent = result.message || 'Invalid username or password.';
      loginMessage.className = 'form-message error';
    }
  } catch (error) {
    console.error('Login error:', error);
    loginMessage.textContent = 'Connection error. Please try again.';
    loginMessage.className = 'form-message error';
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Login';
  }
});

// Logout handler
document.getElementById('logoutBtn').addEventListener('click', async () => {
  try {
    await fetch('/api/admin/logout', { method: 'POST' });
    showLoginForm();
  } catch (error) {
    console.error('Logout error:', error);
  }
});

// Show admin panel and load submissions
async function showAdminPanel() {
  document.getElementById('loginSection').style.display = 'none';
  document.getElementById('adminSection').style.display = 'block';
  await loadSubmissions();
}

// Load submissions from server
async function loadSubmissions() {
  const submissionsBody = document.getElementById('submissionsBody');

  try {
    const response = await fetch('/api/admin/submissions'); // Cookie sent automatically

    if (response.status === 401) {
      showLoginForm();
      return;
    }

    const result = await response.json();

    if (result.success && result.data.length > 0) {
      submissionsBody.innerHTML = result.data.map(submission => `
        <tr>
          <td>${formatDateTimeSydneyPlus11(submission.submitted_at)}</td>
          <td>${escapeHtml(submission.full_name)}</td>
          <td>${escapeHtml(submission.phone)}</td>
          <td>${escapeHtml(submission.email || 'N/A')}</td>
          <td>${escapeHtml(submission.message)}</td>
        </tr>
      `).join('');
    } else if (result.success && result.data.length === 0) {
      submissionsBody.innerHTML = '<tr><td colspan="5" class="loading">No submissions yet</td></tr>';
    } else {
      submissionsBody.innerHTML = '<tr><td colspan="5" class="loading">Error loading submissions</td></tr>';
    }
  } catch (error) {
    console.error('Load submissions error:', error);
    submissionsBody.innerHTML = '<tr><td colspan="5" class="loading">Connection error</td></tr>';
  }
}

// Add N hours to a Date (returns a new Date)
function addHours(date, hours) {
  const d = new Date(date);
  d.setTime(d.getTime() + hours * 3_600_000);
  return d;
}

// Format datetime as UTC+11 (Sydney summer)
function formatDateTimeSydneyPlus11(utcIsoString) {
  // Parse the UTC timestamp and add +11 hours
  // Note: Server now stores CURRENT_TIMESTAMP which is usually UTC. 
  const adjusted = addHours(new Date(utcIsoString), 11);
  // Format a readable AU string
  return adjusted.toLocaleString('en-AU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text ?? '';
  return div.innerHTML;
}
