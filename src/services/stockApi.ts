import { supabase } from '../supabase';
import type { StockSnapshot, AIRecommendation, ChartData, DiscoveredStock, Methodology } from '../types/stock';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/** Fetch with Render cold-start retry (exponential backoff). */
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 3,
  baseDelay = 1500
): Promise<Response> {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      return response;
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
  throw lastError || new Error('Failed to fetch after retries');
}

async function getAuthHeaders(): Promise<HeadersInit> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const headers = await getAuthHeaders();
  const res = await fetchWithRetry(`${API_URL}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `API error ${res.status}`);
  }
  return res.json();
}

/** Analyze 1-10 tickers. Returns snapshots + any per-ticker errors. */
export async function analyzeStocks(
  tickers: string[],
  methodology: Methodology,
  useMtd = false
): Promise<{ snapshots: StockSnapshot[]; errors: Array<{ ticker: string; error: string }> }> {
  return apiPost('/api/analyze', { tickers, methodology, use_mtd: useMtd });
}

/** Get AI investment recommendation for a single stock. */
export async function getRecommendation(
  snapshot: StockSnapshot,
  methodology: Methodology,
  comparativeContext?: string
): Promise<AIRecommendation> {
  return apiPost('/api/recommendation', {
    snapshot,
    methodology,
    comparative_context: comparativeContext,
  });
}

/** Get AI comparative analysis for multiple stocks. */
export async function getComparativeAnalysis(
  snapshots: StockSnapshot[]
): Promise<{ analysis: string }> {
  return apiPost('/api/comparative', { snapshots });
}

/** Get OHLCV chart data for a ticker. */
export async function getChartData(
  ticker: string,
  period: string
): Promise<ChartData> {
  return apiPost('/api/chart-data', { ticker, period });
}

/** Discover stocks by category (screener). */
export async function discoverStocks(
  category: string
): Promise<{ stocks: DiscoveredStock[] }> {
  return apiPost('/api/discover', { category });
}

/** Export analysis as Word document (returns blob). */
export async function exportWord(
  snapshots: StockSnapshot[],
  windowLabel: string,
  cachedAnalysis?: string
): Promise<Blob> {
  const headers = await getAuthHeaders();
  const res = await fetchWithRetry(`${API_URL}/api/export/word`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      snapshots,
      window_label: windowLabel,
      cached_analysis: cachedAnalysis,
    }),
  });
  if (!res.ok) throw new Error('Export failed');
  return res.blob();
}

/** Health check — useful for warming up Render. */
export async function healthCheck(): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/health`, { signal: AbortSignal.timeout(5000) });
    return res.ok;
  } catch {
    return false;
  }
}
