import { TrendingUp, Heart, ExternalLink } from 'lucide-react';

type View = 'landing' | 'analyzer' | 'discovery' | 'history' | 'payments' | 'admin' | 'auth' | 'learn' | 'metrics' | 'privacy' | 'terms' | 'reset-password';

interface FooterProps {
  onNavigate: (view: View) => void;
}

const ecosystem = [
  { name: 'AI Stock Assist', url: 'https://aistockassist.com' },
  { name: 'Neo-Aesop', url: 'https://neoaesop.com' },
  { name: 'HeroicVerse', url: 'https://heroicverse.app' },
  { name: 'iAppreciateYou', url: 'https://affirm.neoaesop.com' },
];

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="border-t border-[var(--color-border)] mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        {/* 3-column layout */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 mb-10">
          {/* Product */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-4">Product</h4>
            <ul className="space-y-2.5 text-sm">
              <li><button onClick={() => onNavigate('landing')} className="text-[var(--color-text-secondary)] hover:text-white transition-colors">Home</button></li>
              <li><button onClick={() => onNavigate('analyzer')} className="text-[var(--color-text-secondary)] hover:text-white transition-colors">Analyze Stocks</button></li>
              <li><button onClick={() => onNavigate('discovery')} className="text-[var(--color-text-secondary)] hover:text-white transition-colors">Stock Discovery</button></li>
              <li><button onClick={() => onNavigate('payments')} className="text-[var(--color-text-secondary)] hover:text-white transition-colors">Buy Credits</button></li>
            </ul>
          </div>

          {/* Learn */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-4">Learn</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="https://lindsayhiebert.substack.com" target="_blank" rel="noopener noreferrer" className="text-[var(--color-text-secondary)] hover:text-white transition-colors inline-flex items-center gap-1">
                  Substack Blog <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li><button onClick={() => onNavigate('metrics')} className="text-[var(--color-text-secondary)] hover:text-white transition-colors">Metrics Guide</button></li>
              <li><button onClick={() => onNavigate('learn')} className="text-[var(--color-text-secondary)] hover:text-white transition-colors">Learn to Invest</button></li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-4">Connect</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="https://x.com/aistockassist" target="_blank" rel="noopener noreferrer" className="text-[var(--color-text-secondary)] hover:text-white transition-colors inline-flex items-center gap-1">
                  Twitter / X <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a href="https://www.linkedin.com/in/lindsayhiebert/" target="_blank" rel="noopener noreferrer" className="text-[var(--color-text-secondary)] hover:text-white transition-colors inline-flex items-center gap-1">
                  LinkedIn <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a href="https://www.linkedin.com/in/lindsayhiebert/" target="_blank" rel="noopener noreferrer" className="text-[var(--color-text-secondary)] hover:text-white transition-colors inline-flex items-center gap-1">
                  Contact <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Ecosystem row */}
        <div className="flex items-center justify-center flex-wrap gap-x-6 gap-y-2 pb-8 border-b border-[var(--color-border)]">
          <span className="text-xs text-[var(--color-text-muted)] font-bold uppercase tracking-wider">AI for Good:</span>
          {ecosystem.map((app) => (
            <a
              key={app.name}
              href={app.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors"
            >
              {app.name}
            </a>
          ))}
        </div>

        {/* Legal + branding row */}
        <div className="mt-8 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[var(--color-accent)]" />
            <span className="font-bold text-sm">AI Stock Assist</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-[var(--color-text-muted)]">
            <button onClick={() => onNavigate('privacy')} className="hover:text-white transition-colors">
              Privacy Policy
            </button>
            <span>|</span>
            <button onClick={() => onNavigate('terms')} className="hover:text-white transition-colors">
              Terms of Service
            </button>
          </div>
          <p className="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
            &copy; {new Date().getFullYear()} AI Stock Assist. Built with <Heart className="w-3 h-3 text-red-400" /> by Lindsay Hiebert. All rights reserved.
          </p>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-[var(--color-text-muted)] leading-relaxed max-w-2xl mx-auto">
            AI Stock Assist provides AI-generated analysis for educational purposes only.
            This is not financial advice. Always do your own research before making investment decisions.
            Past performance does not guarantee future results.
          </p>
        </div>
      </div>
    </footer>
  );
}
