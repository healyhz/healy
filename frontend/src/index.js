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

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

const api = {
  list: () => apiFetch('/api/products'),
  create: (data) => apiFetch('/api/products', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiFetch(`/api/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiFetch(`/api/products/${id}`, { method: 'DELETE' }),
};

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function renderTable(products) {
  if (!products.length) return '<p>No products yet.</p>';
  const rows = products.map(p => `
    <tr>
      <td>${escHtml(p.name)}</td>
      <td>${escHtml(p.slug)}</td>
      <td>${p.price}</td>
      <td>${escHtml(p.description)}</td>
      <td>
        <button class="js-edit" data-id="${p.id}">Edit</button>
        <button class="js-delete" data-id="${p.id}">Delete</button>
      </td>
    </tr>
  `).join('');
  return `
    <table border="1" cellpadding="6">
      <thead><tr><th>Name</th><th>Slug</th><th>Price</th><th>Description</th><th>Actions</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function openModal(product = null) {
  const modal = document.getElementById('productModal');
  const form = document.getElementById('productForm');
  document.getElementById('modalTitle').textContent = product ? 'Edit Product' : 'New Product';
  document.getElementById('modalError').textContent = '';
  form.elements.name.value = product?.name ?? '';
  form.elements.slug.value = product?.slug ?? '';
  form.elements.price.value = product?.price ?? '';
  form.elements.description.value = product?.description ?? '';
  form.dataset.editId = product?.id ?? '';
  modal.showModal();
}

async function main() {
  const root = document.getElementById('root');
  root.innerHTML = '<p>Loading…</p>';

  const user = await checkAuth();
  if (!user) {
    window.location.href = `${LANDING_URL}/login.html`;
    return;
  }

  root.innerHTML = `
    <p>Logged in as <strong>${escHtml(user.email)}</strong> <button id="logoutBtn">Logout</button></p>
    ${user.role === 'admin' ? `
      <h2>Products</h2>
      <button id="newProductBtn">New Product</button>
      <div id="productsTable"></div>
      <dialog id="productModal">
        <h3 id="modalTitle"></h3>
        <p id="modalError" style="color:red"></p>
        <form id="productForm" method="dialog">
          <p><label>Name<br><input name="name" required /></label></p>
          <p><label>Slug (auto-generated if blank)<br><input name="slug" /></label></p>
          <p><label>Price<br><input name="price" type="number" min="0" required /></label></p>
          <p><label>Description<br><textarea name="description" required></textarea></label></p>
          <p>
            <button type="button" id="cancelBtn">Cancel</button>
            <button type="submit">Save</button>
          </p>
        </form>
      </dialog>
    ` : `
      <p>Access denied — admin only.</p>
      <button id="claimAdminBtn">Claim Admin</button>
      <p id="claimAdminMsg" style="color:red"></p>
    `}
  `;

  document.getElementById('logoutBtn').addEventListener('click', logout);

  if (user.role !== 'admin') {
    document.getElementById('claimAdminBtn').addEventListener('click', async () => {
      const msgEl = document.getElementById('claimAdminMsg');
      msgEl.style.color = 'red';
      try {
        await apiFetch('/api/claim-admin', { method: 'POST' });
        window.location.reload();
      } catch {
        msgEl.textContent = 'Could not claim admin — an admin may already exist.';
      }
    });
    return;
  }

  const tableDiv = document.getElementById('productsTable');
  const modal = document.getElementById('productModal');
  const form = document.getElementById('productForm');
  let products = [];

  async function refresh() {
    tableDiv.innerHTML = 'Loading…';
    try {
      products = await api.list();
      tableDiv.innerHTML = renderTable(products);
      tableDiv.querySelectorAll('.js-edit').forEach(btn => {
        btn.addEventListener('click', () => {
          const p = products.find(x => x.id === btn.dataset.id);
          if (p) openModal(p);
        });
      });
      tableDiv.querySelectorAll('.js-delete').forEach(btn => {
        btn.addEventListener('click', async () => {
          const p = products.find(x => x.id === btn.dataset.id);
          if (!p || !confirm(`Delete "${p.name}"?`)) return;
          try {
            await api.delete(p.id);
            await refresh();
          } catch {
            alert('Failed to delete product.');
          }
        });
      });
    } catch {
      tableDiv.innerHTML = '<p>Failed to load products.</p>';
    }
  }

  document.getElementById('newProductBtn').addEventListener('click', () => openModal());
  document.getElementById('cancelBtn').addEventListener('click', () => modal.close());

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errEl = document.getElementById('modalError');
    const saveBtn = form.querySelector('[type=submit]');
    errEl.textContent = '';
    saveBtn.disabled = true;

    const editId = form.dataset.editId;
    const data = {
      name: form.elements.name.value.trim(),
      slug: form.elements.slug.value.trim() || undefined,
      price: Number(form.elements.price.value),
      description: form.elements.description.value.trim(),
    };

    try {
      if (editId) {
        await api.update(editId, data);
      } else {
        await api.create(data);
      }
      modal.close();
      await refresh();
    } catch (err) {
      errEl.textContent = err.message || 'Something went wrong.';
    } finally {
      saveBtn.disabled = false;
    }
  });

  await refresh();
}

main();
