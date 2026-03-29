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
import Footer from './components/Footer';
import { healthCheck } from './services/stockApi';

type View = 'landing' | 'analyzer' | 'discovery' | 'history' | 'payments' | 'admin' | 'auth';

export default function App() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [view, setView] = useState<View>('landing');
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [analyzerInput, setAnalyzerInput] = useState('');

  // ── Auth setup ──────────────────────────────────────────────
  useEffect(() => {
    const timeout = setTimeout(() => setIsAuthReady(true), 3000);
    let profileLoaded = false;

    const handleSession = async (session: any) => {
      if (session?.user) {
        const appUser: AppUser = { id: session.user.id, email: session.user.email || '' };
        setUser(appUser);
        if (!profileLoaded) {
          profileLoaded = true;
          await loadProfile(appUser);
        }
        if (view === 'auth' || view === 'landing') setView('analyzer');
      } else {
        setUser(null);
        setUserProfile(null);
        profileLoaded = false;
        if (view !== 'landing') setView('landing');
      }
      setIsAuthReady(true);
    };

    // Use onAuthStateChange as primary — it fires for initial session too
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      await handleSession(session);
    });

    // Fallback: if onAuthStateChange hasn't fired after 2s, check manually
    const fallback = setTimeout(async () => {
      if (!profileLoaded) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) await handleSession(session);
      }
      setIsAuthReady(true);
    }, 2000);

    // Warm up Render backend
    healthCheck();

    return () => {
      clearTimeout(timeout);
      clearTimeout(fallback);
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

  // ── Payment callback handling ──────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('session_id')) {
      // Clear URL params
      window.history.replaceState({}, '', '/');
      // Refresh profile to get new credits
      if (user) {
        setTimeout(() => refreshProfile(), 2000);
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

        {view === 'analyzer' && user && (
          <StockAnalyzer
            key={analyzerInput}
            userProfile={userProfile}
            onCreditsUsed={refreshProfile}
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
      </main>

      <Footer />
    </div>
  );
}
