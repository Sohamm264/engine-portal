// js/app.js — Navigation, data rendering, UI logic


const API = 'http://localhost:7000/api';

// =====================
// NAVIGATION
// =====================
function goPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const pg = document.getElementById('page-' + name);
  if (pg) pg.classList.add('active');

  document.querySelectorAll('.nav-item').forEach(n => {
    if (n.getAttribute('onclick') && n.getAttribute('onclick').includes("'" + name + "'")) {
      n.classList.add('active');
    }
  });

  // Refresh data for specific pages
  if (name === 'users') loadUsers();
  if (name === 'roles') loadRoles();
  if (name === 'invites') loadInvites();
  if (name === 'activity' || name === 'dashboard') loadActivity();
  if (name === 'permissions') renderPermissions();
}

// =====================
// USERS
// =====================
const avatarColors = ['#2563c7','#059669','#7c3aed','#b45309','#0891b2','#be185d','#15803d'];

function getColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

function getInitials(name) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function roleBadge(role) {
  return `<span class="role-badge role-${role.toLowerCase()}">${capitalize(role)}</span>`;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

async function loadUsers() {
  try {
    const res = await fetch(`${API}/users`);
    const users = await res.json();

    document.getElementById('userCount').textContent = users.length;
    document.getElementById('statUsers').textContent = users.length;

    const active = users.filter(u => u.status === 'active').length;
    document.getElementById('statActive').textContent = active;
    document.getElementById('statUsersSub').textContent = `${active} active`;

    const tbody = document.getElementById('usersTableBody');
    if (!users.length) {
      tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No users yet. Invite someone!</td></tr>';
      return;
    }

    tbody.innerHTML = users.map(u => `
      <tr>
        <td>
          <div class="td-name">
            <div class="mini-avatar" style="background:${getColor(u.name)}">${getInitials(u.name)}</div>
            ${escHtml(u.name)}
          </div>
        </td>
        <td>${roleBadge(u.role)}</td>
        <td>
          <span class="status-dot status-${u.status}"></span>
          ${capitalize(u.status)}
        </td>
        <td>${formatDate(u.created_at)}</td>
        <td>
          <button class="btn btn-danger" onclick="deleteUser(${u.id}, '${escHtml(u.name)}')">
            <i class="ti ti-trash"></i> Remove
          </button>
        </td>
      </tr>
    `).join('');
  } catch (e) {
    document.getElementById('usersTableBody').innerHTML =
      '<tr><td colspan="5" class="empty-state">Backend not running. Start your server first.</td></tr>';
  }
}

async function deleteUser(id, name) {
  if (!confirm(`Remove ${name} from the portal?`)) return;
  await fetch(`${API}/users/${id}`, { method: 'DELETE' });
  logActivity(`User <strong>${name}</strong> was removed`, 'ti-user-x', 'red-soft', 'red');
  loadUsers();
}

// =====================
// ROLES
// =====================
const defaultRoles = [
  { name: 'admin',     users: 1, level: 'Full',    desc: 'Complete portal control' },
  { name: 'developer', users: 0, level: 'High',    desc: 'Code, APIs, deployments' },
  { name: 'editor',    users: 0, level: 'Medium',  desc: 'Content & user data' },
  { name: 'client',    users: 0, level: 'Limited', desc: 'Read-only dashboard access' },
  { name: 'viewer',    users: 0, level: 'Minimal', desc: 'View reports only' },
];

function loadRoles() {
  const tbody = document.getElementById('rolesTableBody');
  tbody.innerHTML = defaultRoles.map(r => `
    <tr>
      <td>${roleBadge(r.name)}</td>
      <td>${r.users}</td>
      <td>${r.level}</td>
      <td>${r.desc}</td>
      <td><button class="btn"><i class="ti ti-edit"></i> Edit</button></td>
    </tr>
  `).join('');
}

// =====================
// PERMISSIONS
// =====================
const resources = [
  'Manage Users', 'Edit Roles', 'View Dashboard',
  'Access APIs', 'Invite Users', 'Export Data', 'View Activity Log'
];
const roles = ['Admin', 'Developer', 'Editor', 'Client', 'Viewer'];

// Default permission matrix [resource][role]
const defaultPerms = {
  'Manage Users':    [true,  false, false, false, false],
  'Edit Roles':      [true,  false, false, false, false],
  'View Dashboard':  [true,  true,  true,  true,  true ],
  'Access APIs':     [true,  true,  false, false, false],
  'Invite Users':    [true,  true,  true,  false, false],
  'Export Data':     [true,  true,  false, false, false],
  'View Activity Log':[true, true,  false, false, false],
};

let permState = JSON.parse(JSON.stringify(defaultPerms));

function renderPermissions() {
  const tbody = document.getElementById('permissionsBody');
  tbody.innerHTML = resources.map(resource => `
    <tr>
      <td style="color:var(--text);font-weight:500">${resource}</td>
      ${roles.map((role, ri) => `
        <td style="text-align:center">
          <input type="checkbox"
            ${permState[resource][ri] ? 'checked' : ''}
            onchange="permState['${resource}'][${ri}] = this.checked"
            style="accent-color:var(--accent);width:15px;height:15px;cursor:pointer"
          />
        </td>
      `).join('')}
    </tr>
  `).join('');
}

function savePermissions() {
  localStorage.setItem('engineportal_perms', JSON.stringify(permState));
  alert('Permissions saved!');
  logActivity('Permissions matrix was updated', 'ti-lock', 'accent-soft', 'accent');
}

// =====================
// INVITES
// =====================
let invites = JSON.parse(localStorage.getItem('engineportal_invites') || '[]');

function loadInvites() {
  document.getElementById('inviteCount').textContent = invites.length;
  document.getElementById('statInvites').textContent = invites.length;

  const tbody = document.getElementById('invitesTableBody');
  if (!invites.length) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No pending invitations.</td></tr>';
    return;
  }

  tbody.innerHTML = invites.map((inv, i) => `
    <tr>
      <td>${escHtml(inv.email)}</td>
      <td>${roleBadge(inv.role)}</td>
      <td>${formatDate(inv.sent)}</td>
      <td><span class="status-dot status-pending"></span>Pending</td>
      <td>
        <button class="btn btn-danger" onclick="cancelInvite(${i})">
          <i class="ti ti-x"></i> Cancel
        </button>
      </td>
    </tr>
  `).join('');
}

function cancelInvite(i) {
  const inv = invites[i];
  invites.splice(i, 1);
  localStorage.setItem('engineportal_invites', JSON.stringify(invites));
  logActivity(`Invite to <strong>${inv.email}</strong> was cancelled`, 'ti-mail-off', 'red-soft', 'red');
  loadInvites();
}

// =====================
// ACTIVITY
// =====================
let activityLog = JSON.parse(localStorage.getItem('engineportal_activity') || '[]');

function logActivity(text, icon, bgClass, colorClass) {
  activityLog.unshift({ text, icon, bgClass, colorClass, time: Date.now() });
  if (activityLog.length > 50) activityLog.pop();
  localStorage.setItem('engineportal_activity', JSON.stringify(activityLog));
}

function loadActivity() {
  const items = activityLog.slice(0, 10);
  const html = items.length
    ? items.map(a => `
        <div class="activity-item">
          <div class="act-icon" style="background:var(--${a.bgClass});color:var(--${a.colorClass})">
            <i class="ti ${a.icon}"></i>
          </div>
          <div class="act-text">${a.text}</div>
          <div class="act-time">${timeAgo(a.time)}</div>
        </div>
      `).join('')
    : '<div class="empty-state">No activity yet.</div>';

  const dash = document.getElementById('dashActivity');
  const full = document.getElementById('fullActivity');
  if (dash) dash.innerHTML = html;
  if (full) full.innerHTML = activityLog.length
    ? activityLog.map(a => `
        <div class="activity-item">
          <div class="act-icon" style="background:var(--${a.bgClass});color:var(--${a.colorClass})">
            <i class="ti ${a.icon}"></i>
          </div>
          <div class="act-text">${a.text}</div>
          <div class="act-time">${timeAgo(a.time)}</div>
        </div>
      `).join('')
    : '<div class="empty-state">No activity yet.</div>';
}

// =====================
// MODALS
// =====================
function openInviteModal() {
  document.getElementById('inviteModal').classList.add('open');
}

function openRoleModal() {
  document.getElementById('roleModal').classList.add('open');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

function sendInvite() {
  const email = document.getElementById('inviteEmail').value.trim();
  const role  = document.getElementById('inviteRole').value;
  if (!email) { alert('Please enter an email address.'); return; }
  if (!email.includes('@')) { alert('Please enter a valid email.'); return; }

  invites.push({ email, role, sent: Date.now() });
  localStorage.setItem('engineportal_invites', JSON.stringify(invites));
  logActivity(`Invite sent to <strong>${email}</strong> as ${capitalize(role)}`, 'ti-mail-forward', 'green-soft', 'green');

  document.getElementById('inviteEmail').value = '';
  closeModal('inviteModal');
  loadInvites();
  alert(`Invite sent to ${email}!`);
}

function createRole() {
  const name = document.getElementById('roleName').value.trim();
  const desc = document.getElementById('roleDesc').value.trim();
  if (!name) { alert('Please enter a role name.'); return; }

  defaultRoles.push({ name: name.toLowerCase(), users: 0, level: 'Custom', desc: desc || 'Custom role' });
  logActivity(`New role <strong>${name}</strong> was created`, 'ti-shield-plus', 'purple-soft', 'purple');

  document.getElementById('roleName').value = '';
  document.getElementById('roleDesc').value = '';
  closeModal('roleModal');
  loadRoles();
}

// =====================
// SETTINGS
// =====================
function saveSettings() {
  const name = document.getElementById('settingsName').value;
  const user = document.getElementById('settingsUser').value;
  localStorage.setItem('engineportal_settings', JSON.stringify({ name, user }));
  if (user) document.getElementById('avatarInitials').textContent = getInitials(user);
  alert('Settings saved!');
}

function loadSettings() {
  const s = JSON.parse(localStorage.getItem('engineportal_settings') || '{}');
  if (s.name) document.getElementById('settingsName').value = s.name;
  if (s.user) {
    document.getElementById('settingsUser').value = s.user;
    document.getElementById('avatarInitials').textContent = getInitials(s.user);
  }
}

// =====================
// HELPERS
// =====================
function formatDate(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
}

function timeAgo(ts) {
  const diff = Date.now() - ts;
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
  if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
  return Math.floor(diff / 86400000) + 'd ago';
}

function escHtml(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// Close modals on overlay click
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) overlay.classList.remove('open');
  });
});

// =====================
// INIT
// =====================
document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  loadUsers();
  loadActivity();
  renderPermissions();
  loadInvites();
});
