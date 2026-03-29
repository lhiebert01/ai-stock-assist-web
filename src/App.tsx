import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { supabase } from './supabase';
import type { AppUser, UserProfile } from './types/user';

import Navbar from './components/Navbar';
import MarketingLanding from './components/MarketingLanding';
import Auth from './components/Auth';
import StockAnalyzer from './components/StockAnalyzer';
import StockDiscovery from './components/StockDiscovery';
import AnalysisHistory from './components/AnalysisHistory';
import Payments from './components/Payments';
import AdminDashboard from './components/AdminDashboard';
import LearnPage from './components/LearnPage';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import Footer from './components/Footer';
import { healthCheck } from './services/stockApi';

type View = 'landing' | 'analyzer' | 'discovery' | 'history' | 'payments' | 'admin' | 'auth' | 'learn' | 'privacy' | 'terms';

export default function App() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [view, setView] = useState<View>('landing');
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [analyzerInput, setAnalyzerInput] = useState('');
  const [paymentMessage, setPaymentMessage] = useState<string | null>(null);

  // ── Auth setup ──────────────────────────────────────────────
  useEffect(() => {
    const timeout = setTimeout(() => setIsAuthReady(true), 3000);

    // Don't await profile load inside onAuthStateChange — it causes deadlock
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const appUser: AppUser = { id: session.user.id, email: session.user.email || '' };
        setUser(appUser);
        // Use functional update to read CURRENT view (not stale closure value)
        setView(curr => (curr === 'auth' || curr === 'landing') ? 'analyzer' : curr);
        // Load profile outside the lock — use setTimeout to break out of the callback
        setTimeout(() => loadProfile(appUser), 100);
      } else {
        setUser(null);
        setUserProfile(null);
        // Use functional update to read CURRENT view
        setView(curr => (curr !== 'landing' && curr !== 'privacy' && curr !== 'terms' && curr !== 'learn') ? 'landing' : curr);
      }
      setIsAuthReady(true);
    });

    // Warm up Render backend
    healthCheck();

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  // ── Profile loader ─────────────────────────────────────────
  async function loadProfile(appUser: AppUser) {
    try {
      // Wait for auth token to settle before querying
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('[Profile] Loading profile for:', appUser.id, appUser.email);
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', appUser.id)
        .single();

      console.log('[Profile] Result:', { profile, error });

      if (error && error.code === 'PGRST116') {
        // No profile — create one
        console.log('[Profile] No profile found, creating one...');
        const isAdmin = appUser.email.toLowerCase() === 'lindsay.hiebert@gmail.com';
        const { data: newProfile, error: insertError } = await supabase.from('user_profiles').insert({
          id: appUser.id,
          email: appUser.email,
          username: appUser.email.split('@')[0],
          is_admin: isAdmin,
        }).select().single();
        console.log('[Profile] Insert result:', { newProfile, insertError });
        if (newProfile) setUserProfile(newProfile);
      } else if (error) {
        console.error('[Profile] Unexpected error:', JSON.stringify(error));
      } else if (profile) {
        console.log('[Profile] Loaded successfully:', profile.credits_remaining, 'credits');
        setUserProfile(profile);
      }
    } catch (err) {
      console.error('[Profile] Exception:', err);
    }
  }

  // ── Navigation ─────────────────────────────────────────────
  const navigateTo = (newView: View) => {
    setView(newView);
    window.scrollTo(0, 0);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserProfile(null);
    setView('landing');
  };

  const handleDiscoveryAnalyze = (tickers: string) => {
    setAnalyzerInput(tickers);
    setView('analyzer');
  };

  const refreshProfile = async () => {
    if (user) await loadProfile(user);
  };

  const deductCredits = async (count: number = 1) => {
    try {
      if (!user || !userProfile) {
        console.warn('[Credits] Cannot deduct — missing user or profile', { user: !!user, profile: !!userProfile });
        return;
      }
      const newCredits = Math.max(0, userProfile.credits_remaining - count);
      console.log('[Credits] Deducting:', userProfile.credits_remaining, '→', newCredits, `(${count} stocks) for user`, user.id);
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          credits_remaining: newCredits,
          analyses_total_lifetime: (userProfile.analyses_total_lifetime || 0) + count,
        })
        .eq('id', user.id)
        .select('credits_remaining, analyses_total_lifetime')
        .single();
      if (error) {
        console.error('[Credits] Deduction DB error:', JSON.stringify(error));
      } else if (!data) {
        console.error('[Credits] Deduction returned no data — RLS may be blocking the update');
      } else {
        console.log('[Credits] Deduction confirmed — DB now shows:', data.credits_remaining);
        setUserProfile(prev => prev ? { ...prev, credits_remaining: data.credits_remaining, analyses_total_lifetime: data.analyses_total_lifetime } : null);
      }
    } catch (err) {
      console.error('[Credits] Deduction exception:', err);
    }
  };

  // ── Payment callback handling ──────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('session_id')) {
      // Clear URL params
      window.history.replaceState({}, '', '/');
      setPaymentMessage('Payment successful! Your credits are being added...');
      setView('analyzer');
      // Refresh profile after webhook has time to process
      if (user) {
        setTimeout(() => {
          refreshProfile();
          setPaymentMessage('Credits added! Thank you for your purchase.');
          setTimeout(() => setPaymentMessage(null), 5000);
        }, 3000);
      }
    }
  }, [user]);

  // ── Loading ────────────────────────────────────────────────
  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--color-accent)] mx-auto mb-3" />
          <p className="text-sm text-[var(--color-text-muted)]">Loading...</p>
        </div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        user={user}
        userProfile={userProfile}
        view={view}
        onNavigate={navigateTo}
        onLogout={handleLogout}
      />

      <main className="flex-1">
        {view === 'landing' && (
          <MarketingLanding onGetStarted={() => navigateTo(user ? 'analyzer' : 'auth')} />
        )}

        {view === 'auth' && !user && (
          <Auth
            onAuthSuccess={() => {}}
            onBack={() => navigateTo('landing')}
          />
        )}

        {paymentMessage && (
          <div className="max-w-3xl mx-auto mt-4 px-4">
            <div className="px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm font-medium text-center">
              {paymentMessage}
            </div>
          </div>
        )}

        {view === 'analyzer' && user && (
          <StockAnalyzer
            key={analyzerInput}
            userId={user.id}
            userProfile={userProfile}
            onCreditsUsed={deductCredits}
            onNeedCredits={() => navigateTo('payments')}
          />
        )}

        {view === 'discovery' && user && (
          <StockDiscovery onAnalyze={handleDiscoveryAnalyze} />
        )}

        {view === 'history' && user && (
          <AnalysisHistory user={user} />
        )}

        {view === 'payments' && (
          <Payments
            user={user}
            userProfile={userProfile}
            onAuthRequired={() => navigateTo('auth')}
            onBack={() => navigateTo('analyzer')}
          />
        )}

        {view === 'admin' && user && userProfile?.is_admin && (
          <AdminDashboard />
        )}

        {view === 'learn' && (
          <LearnPage />
        )}

        {view === 'privacy' && (
          <PrivacyPolicy onBack={() => navigateTo('landing')} />
        )}

        {view === 'terms' && (
          <TermsOfService onBack={() => navigateTo('landing')} />
        )}
      </main>

      <Footer onNavigate={navigateTo} />
    </div>
  );
}
