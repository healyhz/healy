const API_URL = window.ENV.API_URL;
const LANDING_URL = window.ENV.LANDING_URL;

async function checkAuth() {
  try {
    const res = await fetch(`${API_URL}/api/auth/get-session`, { credentials: 'include' });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.user ?? null;
  } catch {
    return null;
  }
}

async function logout() {
  await fetch(`${API_URL}/api/auth/sign-out`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: '{}',
  });
  window.location.href = `${LANDING_URL}/login.html`;
}

async function main() {
  const root = document.getElementById('root');
  root.innerHTML = '<p style="padding:2rem;color:#6B7484">Loading…</p>';

  const user = await checkAuth();
  if (!user) {
    window.location.href = `${LANDING_URL}/login.html`;
    return;
  }

  root.innerHTML = `
    <div style="font-family:Arial,sans-serif;padding:2rem;max-width:800px;margin:0 auto">
      <h1 style="color:#183977">Backoffice</h1>
      <p>Logged in as <strong>${user.email}</strong></p>
      <button id="logoutBtn" style="margin-top:1rem;padding:10px 20px;background:#183977;color:#fff;border:none;border-radius:6px;cursor:pointer">
        Logout
      </button>
    </div>
  `;

  document.getElementById('logoutBtn').addEventListener('click', logout);
}

main();
