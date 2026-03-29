import { TrendingUp, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[var(--color-accent)]" />
            <span className="font-bold">AI Stock Assist</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-[var(--color-text-muted)]">
            <a href="https://aistockassist.com" className="hover:text-white transition-colors">Home</a>
            <a href="mailto:lindsay.hiebert@gmail.com" className="hover:text-white transition-colors">Contact</a>
          </div>
          <p className="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
            Built with <Heart className="w-3 h-3 text-red-400" /> by Lindsay Hiebert
          </p>
        </div>
        <div className="mt-8 pt-6 border-t border-[var(--color-border)] text-center">
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
