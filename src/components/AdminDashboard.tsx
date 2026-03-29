import { useEffect, useState } from 'react';
import { Shield, Users, DollarSign, BarChart3, Loader2, Search, Plus, Minus } from 'lucide-react';
import { supabase } from '../supabase';
import type { UserProfile } from '../types/user';

export default function AdminDashboard() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function loadUsers() {
      const { data } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });
      setUsers(data || []);
      setLoading(false);
    }
    loadUsers();
  }, []);

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

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search users..."
          className="w-full pl-10 pr-4 py-3 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30"
        />
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
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
