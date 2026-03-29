import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Gem, Cpu, Activity, TrendingUp, Target, Zap,
  Loader2, Check, BarChart3, AlertCircle,
} from 'lucide-react';
import { discoverStocks } from '../services/stockApi';
import { formatPrice, pctFmt, changeColor, humanMoney } from '../lib/formatters';
import type { DiscoveredStock } from '../types/stock';

const CATEGORIES = [
  { id: 'undervalued_large_caps', name: 'Undervalued Large Caps', icon: Gem, desc: 'Large companies trading below intrinsic value' },
  { id: 'growth_technology_stocks', name: 'Tech Growth', icon: Cpu, desc: 'High-growth technology companies' },
  { id: 'most_actives', name: 'Most Active', icon: Activity, desc: 'Highest trading volume today' },
  { id: 'day_gainers', name: 'Day Gainers', icon: TrendingUp, desc: "Today's biggest price increases" },
  { id: 'undervalued_growth_stocks', name: 'Value Growth', icon: Target, desc: 'Growth at a reasonable price' },
  { id: 'small_cap_gainers', name: 'Small Cap Gainers', icon: Zap, desc: 'Best-performing small caps today' },
];

interface StockDiscoveryProps {
  onAnalyze: (tickers: string) => void;
}

export default function StockDiscovery({ onAnalyze }: StockDiscoveryProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [stocks, setStocks] = useState<DiscoveredStock[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [limitMessage, setLimitMessage] = useState<string | null>(null);

  const handleCategory = async (categoryId: string) => {
    if (activeCategory === categoryId) {
      setActiveCategory(null);
      setStocks([]);
      setSelected(new Set());
      return;
    }

    setActiveCategory(categoryId);
    setSelected(new Set());
    setLoading(true);

    try {
      const result = await discoverStocks(categoryId);
      setStocks(result.stocks);
    } catch {
      setStocks([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (symbol: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(symbol)) {
        next.delete(symbol);
        setLimitMessage(null);
      } else if (next.size < 10) {
        next.add(symbol);
        setLimitMessage(null);
      } else {
        setLimitMessage('Maximum 10 stocks per comparative analysis. Deselect one to add another.');
      }
      return next;
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Stock Discovery</h1>
        <p className="text-[var(--color-text-secondary)] text-sm">
          Browse curated stock categories, then select tickers to analyze
        </p>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => handleCategory(cat.id)}
              className={`flex flex-col items-center gap-2 p-4 sm:p-6 rounded-xl border transition-all ${
                isActive
                  ? 'bg-[var(--color-accent)]/10 border-[var(--color-accent)]/30 text-[var(--color-accent)]'
                  : 'bg-[var(--color-surface-2)] border-[var(--color-border)] hover:border-[var(--color-accent)]/20 text-[var(--color-text-secondary)]'
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-sm font-medium text-center">{cat.name}</span>
              <span className="text-xs text-[var(--color-text-muted)] hidden sm:block">{cat.desc}</span>
            </button>
          );
        })}
      </div>

      {/* Results */}
      <AnimatePresence mode="wait">
        {loading && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--color-accent)] mx-auto mb-3" />
            <p className="text-sm text-[var(--color-text-muted)]">Loading stocks...</p>
          </motion.div>
        )}

        {!loading && stocks.length > 0 && (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Analyze button */}
            {selected.size > 0 && (
              <div className="sticky top-20 z-40 mb-4">
                <div className="bg-[var(--color-surface-1)] border border-[var(--color-accent)]/30 rounded-xl p-3 flex items-center justify-between backdrop-blur-xl">
                  <span className="text-sm text-[var(--color-text-secondary)]">
                    {selected.size} stock{selected.size > 1 ? 's' : ''} selected
                    <span className="text-xs text-[var(--color-text-muted)] ml-1">(10 max)</span>
                  </span>
                  <button
                    onClick={() => onAnalyze(Array.from(selected).join(' '))}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-accent)] text-[var(--color-surface-0)] rounded-lg font-bold hover:brightness-110 transition-all"
                  >
                    <BarChart3 className="w-4 h-4" />
                    Analyze Selected
                  </button>
                </div>
              </div>
            )}

            {/* Limit warning */}
            {limitMessage && (
              <div className="flex items-center gap-2 px-4 py-3 mb-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-400 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {limitMessage}
              </div>
            )}

            {/* Stock List */}
            <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--color-border)]">
                      <th className="w-10 px-4 py-3" />
                      <th className="text-left px-4 py-3 text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Symbol</th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Price</th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Change</th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider hidden sm:table-cell">Volume</th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider hidden sm:table-cell">Mkt Cap</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stocks.map((stock) => (
                      <tr
                        key={stock.symbol}
                        onClick={() => toggleSelect(stock.symbol)}
                        className={`border-b border-[var(--color-border)]/50 cursor-pointer transition-colors ${
                          selected.has(stock.symbol) ? 'bg-[var(--color-accent)]/5' : 'hover:bg-white/[0.02]'
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                            selected.has(stock.symbol)
                              ? 'bg-[var(--color-accent)] border-[var(--color-accent)]'
                              : 'border-[var(--color-border-light)]'
                          }`}>
                            {selected.has(stock.symbol) && <Check className="w-3 h-3 text-[var(--color-surface-0)]" />}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold">{stock.symbol}</div>
                          <div className="text-xs text-[var(--color-text-muted)] truncate max-w-[150px]">{stock.name}</div>
                        </td>
                        <td className="text-right px-4 py-3 font-mono">{formatPrice(stock.price)}</td>
                        <td className={`text-right px-4 py-3 font-mono ${changeColor(stock.change_pct)}`}>
                          {pctFmt(stock.change_pct)}
                        </td>
                        <td className="text-right px-4 py-3 hidden sm:table-cell text-[var(--color-text-muted)]">
                          {stock.volume ? (stock.volume / 1_000_000).toFixed(1) + 'M' : '—'}
                        </td>
                        <td className="text-right px-4 py-3 hidden sm:table-cell text-[var(--color-text-muted)]">
                          {humanMoney(stock.market_cap)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
