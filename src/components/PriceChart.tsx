import { useEffect, useRef, useState } from 'react';
import { createChart, ColorType } from 'lightweight-charts';
import { Loader2 } from 'lucide-react';
import { getChartData } from '../services/stockApi';
import type { ChartPeriod } from '../types/stock';
import { CHART_PERIODS } from '../types/stock';

interface PriceChartProps {
  ticker: string;
}

export default function PriceChart({ ticker }: PriceChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null);
  const [period, setPeriod] = useState<ChartPeriod>('1y');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadChart() {
      if (!containerRef.current) return;
      setLoading(true);
      setError(null);

      try {
        const data = await getChartData(ticker, period);
        if (cancelled || !containerRef.current) return;

        // Cleanup previous chart
        if (chartRef.current) {
          chartRef.current.remove();
          chartRef.current = null;
        }

        if (data.dates.length === 0) {
          setError('No chart data available');
          setLoading(false);
          return;
        }

        const chart = createChart(containerRef.current, {
          width: containerRef.current.clientWidth,
          height: 300,
          layout: {
            background: { type: ColorType.Solid, color: 'transparent' },
            textColor: '#94a3b8',
            fontSize: 11,
            fontFamily: 'Inter, sans-serif',
          },
          grid: {
            vertLines: { color: '#1e293b' },
            horzLines: { color: '#1e293b' },
          },
          crosshair: {
            vertLine: { color: '#22d3ee', width: 1, style: 2 },
            horzLine: { color: '#22d3ee', width: 1, style: 2 },
          },
          timeScale: {
            borderColor: '#1e293b',
            timeVisible: period === '5d',
          },
          rightPriceScale: {
            borderColor: '#1e293b',
          },
        });

        const isUp = data.close.length >= 2 && data.close[data.close.length - 1] >= data.close[0];

        const areaSeries = chart.addAreaSeries({
          topColor: isUp ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)',
          bottomColor: isUp ? 'rgba(34, 197, 94, 0.02)' : 'rgba(239, 68, 68, 0.02)',
          lineColor: isUp ? '#22c55e' : '#ef4444',
          lineWidth: 2,
        });

        const chartData = data.dates.map((d, i) => ({
          time: d.split('T')[0] as string,
          value: data.close[i],
        }));

        areaSeries.setData(chartData);
        chart.timeScale().fitContent();
        chartRef.current = chart;

        // Responsive
        const ro = new ResizeObserver(() => {
          if (containerRef.current && chartRef.current) {
            chartRef.current.applyOptions({ width: containerRef.current.clientWidth });
          }
        });
        ro.observe(containerRef.current);

        return () => ro.disconnect();
      } catch (err) {
        if (!cancelled) setError('Failed to load chart');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadChart();
    return () => {
      cancelled = true;
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [ticker, period]);

  return (
    <div className="bg-[var(--color-surface-1)] rounded-xl border border-[var(--color-border)]/50 overflow-hidden">
      {/* Period buttons */}
      <div className="flex items-center gap-1 px-4 pt-3">
        {CHART_PERIODS.map((p) => (
          <button
            key={p.value}
            onClick={() => setPeriod(p.value)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              period === p.value
                ? 'bg-[var(--color-accent)]/15 text-[var(--color-accent)]'
                : 'text-[var(--color-text-muted)] hover:text-white hover:bg-white/5'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Chart container */}
      <div className="relative" style={{ minHeight: 300 }}>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-surface-1)]/80 z-10">
            <Loader2 className="w-6 h-6 animate-spin text-[var(--color-accent)]" />
          </div>
        )}
        {error && !loading && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-[var(--color-text-muted)]">
            {error}
          </div>
        )}
        <div ref={containerRef} />
      </div>
    </div>
  );
}
