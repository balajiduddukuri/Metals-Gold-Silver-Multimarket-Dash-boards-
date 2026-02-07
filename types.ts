
export interface PricePoint {
  date: string;
  price: number;
}

export interface MetalMetrics {
  high24h: number;
  low24h: number;
  volatility: 'Low' | 'Medium' | 'High';
}

export interface MetalData extends MetalMetrics {
  symbol: string;
  name: string;
  region: 'USA' | 'China' | 'UAE' | 'India';
  currentPrice: number;
  change24h: number;
  history: PricePoint[];
  currency: string;
  unit: string;
}

export interface MetalPrediction {
  metal: string;
  predictedPrice: number;
  lowBound: number;
  highBound: number;
  changePercent: number;
  timeframe: string;
  reasoning: string;
}

export interface MarketSummary {
  headline: string;
  analysis: string;
  sentiment: 'Strong Bullish' | 'Bullish' | 'Neutral' | 'Bearish' | 'Strong Bearish';
  drivers: string[];
  sources: { title: string; uri: string }[];
  fx: {
    usdinr: number;
    usdcny: number;
    usdaed: number;
  };
  predictions: MetalPrediction[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  isThinking?: boolean;
}
