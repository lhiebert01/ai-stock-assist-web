import { useEffect, useState } from 'react';
import {
  Shield, Users, DollarSign, BarChart3, Loader2, Search,
  Plus, Minus, Pencil, Trash2, X, UserPlus, Archive,
} from 'lucide-react';
import { supabase } from '../supabase';
import type { UserProfile } from '../types/user';

interface LegacyUser {
  id: string;
  email: string;
  username: string | null;
  analyses_limit: number;
  analyses_total_lifetime: number;
  total_purchases: number;
  total_spent_cents: number;
  created_at: string;
}

interface CreateUserForm {
  email: string;
  password: string;
  username: string;
  credits: number;
  isAdmin: boolean;
}

interface EditUserForm {
  username: string;
  credits_remaining: number;
  is_admin: boolean;
}

const EMPTY_CREATE_FORM: CreateUserForm = {
  email: '',
  password: '',
  username: '',
  credits: 3,
  isAdmin: false,
};

async function getAdminToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

async function adminFetch(method: string, body?: any, query?: string) {
  const token = await getAdminToken();
  if (!token) throw new Error('Not authenticated');

  const url = `/api/admin/users${query ? `?${query}` : ''}`;
  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [legacyUsers, setLegacyUsers] = useState<LegacyUser[]>([]);
  const [legacyNote, setLegacyNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [legacyLoading, setLegacyLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'current' | 'legacy'>('current');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserProfile | null>(null);

  // Forms
  const [createForm, setCreateForm] = useState<CreateUserForm>(EMPTY_CREATE_FORM);
  const [editForm, setEditForm] = useState<EditUserForm>({ username: '', credits_remaining: 0, is_admin: false });

  // Action state
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });
    setUsers(data || []);
    setLoading(false);
  }

  async function loadLegacyUsers() {
    if (legacyUsers.length > 0) return; // already loaded
    setLegacyLoading(true);
    try {
      const data = await adminFetch('GET', undefined, 'action=old-users');
      setLegacyUsers(data.users || []);
      if (data.note) setLegacyNote(data.note);
    } catch (err: any) {
      setLegacyNote(err.message);
    }
    setLegacyLoading(false);
  }

  const adjustCredits = async (userId: string, amount: number) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    const newCredits = Math.max(0, user.credits_remaining + amount);
    await supabase
      .from('user_profiles')
      .update({ credits_remaining: newCredits })
      .eq('id', userId);
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, credits_remaining: newCredits } : u))
    );
  };

  // Create user
  async function handleCreateUser() {
    setActionLoading(true);
    setActionError('');
    try {
      await adminFetch('POST', createForm);
      setShowCreateModal(false);
      setCreateForm(EMPTY_CREATE_FORM);
      await loadUsers();
    } catch (err: any) {
      setActionError(err.message);
    }
    setActionLoading(false);
  }

  // Edit user
  function openEditModal(user: UserProfile) {
    setEditingUser(user);
    setEditForm({
      username: user.username || '',
      credits_remaining: user.credits_remaining,
      is_admin: user.is_admin,
    });
    setActionError('');
  }

  async function handleEditUser() {
    if (!editingUser) return;
    setActionLoading(true);
    setActionError('');
    try {
      await adminFetch('PUT', { userId: editingUser.id, updates: editForm });
      setEditingUser(null);
      await loadUsers();
    } catch (err: any) {
      setActionError(err.message);
    }
    setActionLoading(false);
  }

  // Delete user
  async function handleDeleteUser() {
    if (!deletingUser) return;
    setActionLoading(true);
    setActionError('');
    try {
      await adminFetch('DELETE', { userId: deletingUser.id });
      setDeletingUser(null);
      setUsers((prev) => prev.filter((u) => u.id !== deletingUser.id));
    } catch (err: any) {
      setActionError(err.message);
    }
    setActionLoading(false);
  }

  // Import legacy user → pre-fill create modal
  function handleImportLegacy(lu: LegacyUser) {
    setCreateForm({
      email: lu.email,
      password: '',
      username: lu.username || '',
      credits: lu.analyses_limit || 3,
      isAdmin: false,
    });
    setShowCreateModal(true);
    setActionError('');
  }

  const filtered = users.filter(
    (u) =>
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalRevenue = users.reduce((sum, u) => sum + (u.total_spent_cents || 0), 0) / 100;
  const totalAnalyses = users.reduce((sum, u) => sum + (u.analyses_total_lifetime || 0), 0);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Shield className="w-6 h-6 text-[var(--color-accent)]" />
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Users, label: 'Total Users', value: users.length },
          { icon: DollarSign, label: 'Revenue', value: `$${totalRevenue.toFixed(2)}` },
          { icon: BarChart3, label: 'Total Analyses', value: totalAnalyses },
          { icon: Users, label: 'Paid Users', value: users.filter((u) => u.total_purchases > 0).length },
        ].map((stat) => (
          <div key={stat.label} className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl p-4">
            <stat.icon className="w-4 h-4 text-[var(--color-accent)] mb-2" />
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-xs text-[var(--color-text-muted)]">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => setActiveTab('current')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'current'
              ? 'bg-[var(--color-accent)] text-white'
              : 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
          }`}
        >
          <Users className="w-4 h-4 inline mr-1.5 -mt-0.5" />
          Current Users
        </button>
        <button
          onClick={() => { setActiveTab('legacy'); loadLegacyUsers(); }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'legacy'
              ? 'bg-[var(--color-accent)] text-white'
              : 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
          }`}
        >
          <Archive className="w-4 h-4 inline mr-1.5 -mt-0.5" />
          Legacy Users
        </button>
      </div>

      {/* ========== CURRENT USERS TAB ========== */}
      {activeTab === 'current' && (
        <>
          {/* Search + Create */}
          <div className="flex gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search users..."
                className="w-full pl-10 pr-4 py-3 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30"
              />
            </div>
            <button
              onClick={() => { setCreateForm(EMPTY_CREATE_FORM); setActionError(''); setShowCreateModal(true); }}
              className="flex items-center gap-2 px-4 py-3 bg-[var(--color-accent)] text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Create User</span>
            </button>
          </div>

          {/* User Table */}
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-[var(--color-accent)] mx-auto" />
            </div>
          ) : (
            <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-2xl overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)]">
                    <th className="text-left px-4 py-3 text-xs font-medium text-[var(--color-text-muted)] uppercase">Email</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-[var(--color-text-muted)] uppercase">Credits</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-[var(--color-text-muted)] uppercase">Analyses</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-[var(--color-text-muted)] uppercase hidden sm:table-cell">Purchases</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-[var(--color-text-muted)] uppercase hidden sm:table-cell">Spent</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-[var(--color-text-muted)] uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => (
                    <tr key={u.id} className="border-b border-[var(--color-border)]/50 hover:bg-white/[0.02]">
                      <td className="px-4 py-3">
                        <div className="font-medium truncate max-w-[200px]">{u.email}</div>
                        <div className="text-xs text-[var(--color-text-muted)]">
                          {new Date(u.created_at).toLocaleDateString()}
                          {u.is_admin && <span className="ml-2 text-[var(--color-accent)]">Admin</span>}
                        </div>
                      </td>
                      <td className="text-center px-4 py-3 font-mono font-bold">{u.credits_remaining}</td>
                      <td className="text-center px-4 py-3 text-[var(--color-text-muted)]">{u.analyses_total_lifetime}</td>
                      <td className="text-center px-4 py-3 text-[var(--color-text-muted)] hidden sm:table-cell">{u.total_purchases}</td>
                      <td className="text-center px-4 py-3 text-[var(--color-text-muted)] hidden sm:table-cell">
                        ${((u.total_spent_cents || 0) / 100).toFixed(2)}
                      </td>
                      <td className="text-center px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => adjustCredits(u.id, -1)}
                            className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
                            title="Remove 1 credit"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => adjustCredits(u.id, 5)}
                            className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-emerald-400 transition-colors"
                            title="Add 5 credits"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openEditModal(u)}
                            className="p-1.5 rounded-lg hover:bg-blue-500/10 text-blue-400 transition-colors"
                            title="Edit user"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => { setDeletingUser(u); setActionError(''); }}
                            className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
                            title="Delete user"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ========== LEGACY USERS TAB ========== */}
      {activeTab === 'legacy' && (
        <>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6 text-sm text-amber-200">
            These are users from the old Streamlit app. Click "Import" to create them in the new system.
            Imported users will need to reset their password via Forgot Password.
          </div>

          {legacyLoading ? (
            <div className="text-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-[var(--color-accent)] mx-auto" />
            </div>
          ) : legacyUsers.length === 0 ? (
            <div className="text-center py-12 text-[var(--color-text-muted)]">
              {legacyNote || 'No legacy users found.'}
            </div>
          ) : (
            <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-2xl overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)]">
                    <th className="text-left px-4 py-3 text-xs font-medium text-[var(--color-text-muted)] uppercase">Email</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-[var(--color-text-muted)] uppercase">Username</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-[var(--color-text-muted)] uppercase">Credits</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-[var(--color-text-muted)] uppercase hidden sm:table-cell">Analyses</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-[var(--color-text-muted)] uppercase hidden sm:table-cell">Purchases</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-[var(--color-text-muted)] uppercase hidden sm:table-cell">Spent</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-[var(--color-text-muted)] uppercase hidden sm:table-cell">Joined</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-[var(--color-text-muted)] uppercase">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {legacyUsers.map((lu) => (
                    <tr key={lu.id} className="border-b border-[var(--color-border)]/50 hover:bg-white/[0.02]">
                      <td className="px-4 py-3 font-medium truncate max-w-[200px]">{lu.email}</td>
                      <td className="text-center px-4 py-3 text-[var(--color-text-muted)]">{lu.username || '—'}</td>
                      <td className="text-center px-4 py-3 font-mono font-bold">{lu.analyses_limit}</td>
                      <td className="text-center px-4 py-3 text-[var(--color-text-muted)] hidden sm:table-cell">{lu.analyses_total_lifetime}</td>
                      <td className="text-center px-4 py-3 text-[var(--color-text-muted)] hidden sm:table-cell">{lu.total_purchases}</td>
                      <td className="text-center px-4 py-3 text-[var(--color-text-muted)] hidden sm:table-cell">
                        ${((lu.total_spent_cents || 0) / 100).toFixed(2)}
                      </td>
                      <td className="text-center px-4 py-3 text-[var(--color-text-muted)] hidden sm:table-cell">
                        {new Date(lu.created_at).toLocaleDateString()}
                      </td>
                      <td className="text-center px-4 py-3">
                        <button
                          onClick={() => handleImportLegacy(lu)}
                          className="px-3 py-1.5 bg-[var(--color-accent)]/10 text-[var(--color-accent)] rounded-lg text-xs font-medium hover:bg-[var(--color-accent)]/20 transition-colors"
                        >
                          Import
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ========== CREATE USER MODAL ========== */}
      {showCreateModal && (
        <Modal title="Create User" onClose={() => setShowCreateModal(false)}>
          <div className="space-y-4">
            <Field label="Email" required>
              <input
                type="email"
                value={createForm.email}
                onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))}
                className="modal-input"
                placeholder="user@example.com"
              />
            </Field>
            <Field label="Temporary Password" required>
              <input
                type="text"
                value={createForm.password}
                onChange={(e) => setCreateForm((f) => ({ ...f, password: e.target.value }))}
                className="modal-input"
                placeholder="Min 6 characters"
              />
            </Field>
            <Field label="Username">
              <input
                type="text"
                value={createForm.username}
                onChange={(e) => setCreateForm((f) => ({ ...f, username: e.target.value }))}
                className="modal-input"
                placeholder="Optional"
              />
            </Field>
            <Field label="Credits">
              <input
                type="number"
                value={createForm.credits}
                onChange={(e) => setCreateForm((f) => ({ ...f, credits: parseInt(e.target.value) || 0 }))}
                className="modal-input"
                min={0}
              />
            </Field>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={createForm.isAdmin}
                onChange={(e) => setCreateForm((f) => ({ ...f, isAdmin: e.target.checked }))}
                className="rounded border-[var(--color-border)]"
              />
              <span className="text-sm">Admin privileges</span>
            </label>
            {actionError && <ErrorBanner message={actionError} />}
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowCreateModal(false)} className="modal-btn-secondary flex-1">
                Cancel
              </button>
              <button
                onClick={handleCreateUser}
                disabled={actionLoading || !createForm.email || !createForm.password}
                className="modal-btn-primary flex-1"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Create User'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ========== EDIT USER MODAL ========== */}
      {editingUser && (
        <Modal title={`Edit: ${editingUser.email}`} onClose={() => setEditingUser(null)}>
          <div className="space-y-4">
            <Field label="Username">
              <input
                type="text"
                value={editForm.username}
                onChange={(e) => setEditForm((f) => ({ ...f, username: e.target.value }))}
                className="modal-input"
              />
            </Field>
            <Field label="Credits">
              <input
                type="number"
                value={editForm.credits_remaining}
                onChange={(e) => setEditForm((f) => ({ ...f, credits_remaining: parseInt(e.target.value) || 0 }))}
                className="modal-input"
                min={0}
              />
            </Field>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={editForm.is_admin}
                onChange={(e) => setEditForm((f) => ({ ...f, is_admin: e.target.checked }))}
                className="rounded border-[var(--color-border)]"
              />
              <span className="text-sm">Admin privileges</span>
            </label>
            {actionError && <ErrorBanner message={actionError} />}
            <div className="flex gap-3 pt-2">
              <button onClick={() => setEditingUser(null)} className="modal-btn-secondary flex-1">
                Cancel
              </button>
              <button
                onClick={handleEditUser}
                disabled={actionLoading}
                className="modal-btn-primary flex-1"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Save Changes'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ========== DELETE CONFIRMATION ========== */}
      {deletingUser && (
        <Modal title="Delete User" onClose={() => setDeletingUser(null)}>
          <div className="space-y-4">
            <p className="text-sm text-[var(--color-text-muted)]">
              Are you sure you want to permanently delete{' '}
              <span className="font-medium text-[var(--color-text)]">{deletingUser.email}</span>?
              This removes their auth account and profile. This cannot be undone.
            </p>
            {actionError && <ErrorBanner message={actionError} />}
            <div className="flex gap-3 pt-2">
              <button onClick={() => setDeletingUser(null)} className="modal-btn-secondary flex-1">
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={actionLoading}
                className="flex-1 py-2.5 px-4 rounded-xl text-sm font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Delete User'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Inline styles for modal inputs (avoids global CSS changes) */}
      <style>{`
        .modal-input {
          width: 100%;
          padding: 0.625rem 0.75rem;
          background: var(--color-surface-2);
          border: 1px solid var(--color-border);
          border-radius: 0.75rem;
          font-size: 0.875rem;
          outline: none;
          color: var(--color-text);
        }
        .modal-input:focus {
          box-shadow: 0 0 0 2px rgba(var(--color-accent-rgb, 99,102,241), 0.3);
        }
        .modal-btn-primary {
          padding: 0.625rem 1rem;
          border-radius: 0.75rem;
          font-size: 0.875rem;
          font-weight: 500;
          background: var(--color-accent);
          color: white;
          transition: opacity 0.15s;
        }
        .modal-btn-primary:hover:not(:disabled) { opacity: 0.9; }
        .modal-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
        .modal-btn-secondary {
          padding: 0.625rem 1rem;
          border-radius: 0.75rem;
          font-size: 0.875rem;
          font-weight: 500;
          background: var(--color-surface-2);
          border: 1px solid var(--color-border);
          color: var(--color-text-muted);
          transition: background 0.15s;
        }
        .modal-btn-secondary:hover { background: var(--color-surface); }
      `}</style>
    </div>
  );
}

// ———— Sub-components ————

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <div
        className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl w-full max-w-md p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-sm text-red-400">
      {message}
    </div>
  );
}
