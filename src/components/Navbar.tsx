import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  TrendingUp, BarChart3, History, CreditCard, Shield, LogOut,
  Menu, X, Sparkles, ChevronDown,
} from 'lucide-react';
import type { AppUser, UserProfile } from '../types/user';

type View = 'landing' | 'analyzer' | 'discovery' | 'history' | 'payments' | 'admin' | 'auth';

interface NavbarProps {
  user: AppUser | null;
  userProfile: UserProfile | null;
  view: View;
  onNavigate: (view: View) => void;
  onLogout: () => void;
}

export default function Navbar({ user, userProfile, view, onNavigate, onLogout }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const isAdmin = userProfile?.is_admin === true;

  // Get initials from username or email
  const getInitials = () => {
    const name = userProfile?.username || user?.email || '';
    const parts = name.split(/[\s@]+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return (name[0] || '?').toUpperCase();
  };
  const displayName = userProfile?.username || user?.email?.split('@')[0] || '';

  const navItems: { label: string; view: View; icon: React.ReactNode }[] = [
    { label: 'Analyze', view: 'analyzer', icon: <BarChart3 className="w-4 h-4" /> },
    { label: 'Discover', view: 'discovery', icon: <Sparkles className="w-4 h-4" /> },
    { label: 'History', view: 'history', icon: <History className="w-4 h-4" /> },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-[var(--color-surface-1)]/80 backdrop-blur-xl border-b border-[var(--color-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded-lg bg-[var(--color-accent)]/15 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[var(--color-accent)]" />
            </div>
            <span className="text-lg font-bold tracking-tight hidden sm:block">
              AI Stock Assist
            </span>
          </button>

          {/* Desktop Nav */}
          {user && (
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <button
                  key={item.view}
                  onClick={() => onNavigate(item.view)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    view === item.view
                      ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
                      : 'text-[var(--color-text-secondary)] hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {/* Credits badge */}
                <button
                  onClick={() => onNavigate('payments')}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 text-sm font-medium text-[var(--color-accent)] hover:bg-[var(--color-accent)]/15 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {userProfile?.credits_remaining ?? 0} analyses
                </button>

                {/* Buy Credits button */}
                <button
                  onClick={() => onNavigate('payments')}
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/25 text-sm font-bold text-emerald-400 hover:bg-emerald-500/25 transition-all"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  Buy Credits
                </button>

                {/* Profile dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[var(--color-text-secondary)] hover:text-white hover:bg-white/5 transition-all"
                  >
                    <div className="w-7 h-7 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center text-xs font-bold text-[var(--color-accent)]">
                      {getInitials()}
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-[var(--color-text-primary)]">{displayName}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-56 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl shadow-2xl overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-[var(--color-border)]">
                          <p className="text-sm font-bold truncate">{displayName}</p>
                          <p className="text-xs text-[var(--color-text-muted)] truncate">{user.email}</p>
                          <p className="text-xs text-[var(--color-accent)] font-medium mt-1">
                            {userProfile?.credits_remaining ?? 0} analyses remaining
                          </p>
                        </div>
                        <div className="p-1">
                          <button
                            onClick={() => { onNavigate('payments'); setProfileOpen(false); }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[var(--color-text-secondary)] hover:text-white hover:bg-white/5 transition-all"
                          >
                            <CreditCard className="w-4 h-4" />
                            Buy Analyses
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => { onNavigate('admin'); setProfileOpen(false); }}
                              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[var(--color-text-secondary)] hover:text-white hover:bg-white/5 transition-all"
                            >
                              <Shield className="w-4 h-4" />
                              Admin
                            </button>
                          )}
                          <button
                            onClick={() => { onLogout(); setProfileOpen(false); }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-all"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Mobile menu */}
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="md:hidden p-2 text-[var(--color-text-secondary)] hover:text-white"
                >
                  {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('auth')}
                  className="px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-white transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onNavigate('auth')}
                  className="px-4 py-2 bg-[var(--color-accent)] text-[var(--color-surface-0)] text-sm font-bold rounded-lg hover:brightness-110 transition-all"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && user && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-[var(--color-border)] overflow-hidden"
            >
              <div className="py-3 space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item.view}
                    onClick={() => { onNavigate(item.view); setMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      view === item.view
                        ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
                        : 'text-[var(--color-text-secondary)] hover:text-white'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
                <button
                  onClick={() => { onNavigate('payments'); setMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-[var(--color-text-secondary)] hover:text-white"
                >
                  <CreditCard className="w-4 h-4" />
                  Buy Analyses ({userProfile?.credits_remaining ?? 0} left)
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
