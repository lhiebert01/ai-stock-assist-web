export interface StockSnapshot {
  ticker: string;
  name: string;
  what_it_does: string;
  website: string | null;
  exchange: string | null;
  sector: string | null;
  industry: string | null;
  latest_revenue: number | null;
  market_cap: number | null;
  trailing_pe: number | null;
  price: number | null;
  changes: {
    daily_pct: number | null;
    m_window_pct: number | null;
    ytd_pct: number | null;
    y1_pct: number | null;
  };
  panel: {
    open: number | null;
    day_low: number | null;
    day_high: number | null;
    volume: number | null;
    low_52w: number | null;
    high_52w: number | null;
  };
  after_hours: {
    price: number | null;
    change: number | null;
    change_pct: number | null;
  };
  growth: {
    cagr_3yr: number | null;
    cagr_5yr: number | null;
    earnings_growth: number | null;
    revenue_growth: number | null;
    earnings_growth_5yr: number | null;
  };
  analyst: {
    recommendation: string;
    target_price: number | null;
    num_analysts: number | null;
  };
  cash_flow: {
    free_cash_flow: number | null;
    operating_cash_flow: number | null;
    net_income: number | null;
    fcf_yield: number | null;
    p_fcf: number | null;
    ocf_to_ni_ratio: number | null;
  };
  screening_metrics: {
    debt_to_equity: number | null;
    return_on_equity: number | null;
    current_ratio: number | null;
    profit_margin: number | null;
    price_to_book: number | null;
    quick_ratio: number | null;
    dividend_yield: number | null;
    balance_sheet_health: number | null;
  };
  as_of: string;
}

export interface AIRecommendation {
  rating: 'BUY' | 'HOLD' | 'SELL' | 'ERROR';
  text: string;
  has_recommendation: boolean;
}

export interface ChartData {
  dates: string[];
  open: number[];
  high: number[];
  low: number[];
  close: number[];
  volume: number[];
}

export interface DiscoveredStock {
  symbol: string;
  name: string;
  price: number | null;
  change_pct: number | null;
  market_cap: number | null;
  volume: number | null;
}

export interface ComparisonRow {
  ticker: string;
  name: string;
  price: number | null;
  rating: string;
  daily_pct: number | null;
  monthly_pct: number | null;
  ytd_pct: number | null;
  y1_pct: number | null;
  market_cap: number | null;
  pe: number | null;
  fcf_yield: number | null;
  p_fcf: number | null;
  ocf_to_ni: number | null;
  revenue: number | null;
}

export interface FullHistoryEntry {
  id: string;
  tickers: string[];
  methodology: Methodology;
  snapshots: StockSnapshot[];
  recommendation: Record<string, AIRecommendation>;
  comparative_analysis: string | null;
  created_at: string;
}

export type Methodology = 'Growth & Quality' | 'Graham Value Investing';

export type ChartPeriod = '5d' | '1mo' | '3mo' | '6mo' | '1y' | '2y' | '5y' | 'max';

export const CHART_PERIODS: { label: string; value: ChartPeriod }[] = [
  { label: '5D', value: '5d' },
  { label: '1M', value: '1mo' },
  { label: '3M', value: '3mo' },
  { label: '6M', value: '6mo' },
  { label: '1Y', value: '1y' },
  { label: '2Y', value: '2y' },
  { label: '5Y', value: '5y' },
  { label: 'MAX', value: 'max' },
];

export const DISCOVER_CATEGORIES = [
  { id: 'undervalued_large_caps', name: 'Undervalued Large Caps', icon: 'gem' },
  { id: 'growth_technology_stocks', name: 'Tech Growth', icon: 'cpu' },
  { id: 'most_actives', name: 'Most Active', icon: 'activity' },
  { id: 'day_gainers', name: 'Day Gainers', icon: 'trending-up' },
  { id: 'undervalued_growth_stocks', name: 'Value Growth', icon: 'target' },
  { id: 'small_cap_gainers', name: 'Small Cap Gainers', icon: 'zap' },
] as const;
