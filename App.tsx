
import React, { useState, useEffect } from 'react';
import { getMetalMarketData } from './services/geminiService';
import { MetalData, MarketSummary } from './types';
import MetalCard from './components/MetalCard';

const REFRESH_INTERVAL = 600; 

const App: React.FC = () => {
  const [data, setData] = useState<{ hubs: MetalData[]; summary: MarketSummary } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL);

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await getMetalMarketData();
      setData(result);
      setError(null);
      setCountdown(REFRESH_INTERVAL);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Global Hub Sync Error. Market data may be delayed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          fetchData();
          return REFRESH_INTERVAL;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading && !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#020617] text-center">
        <div className="w-16 h-16 border-b-2 border-yellow-500 rounded-full animate-spin mb-6"></div>
        <h2 className="text-sm font-black uppercase tracking-[0.3em] text-slate-400">Synchronizing Global Hubs</h2>
        <div className="flex gap-2 mt-4">
          {['NY', 'SH', 'DXB', 'BOM'].map(h => <span key={h} className="text-[10px] text-slate-600 font-bold">{h}</span>)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200">
      {/* Dynamic FX Ticker */}
      <div className="bg-slate-900/80 border-b border-slate-800 h-10 overflow-hidden flex items-center px-4 gap-8">
        <span className="text-[9px] font-black uppercase text-indigo-400 tracking-widest whitespace-nowrap">FX Hub Index</span>
        <div className="flex items-center gap-6 overflow-x-auto no-scrollbar font-mono text-[10px] font-bold">
          <div className="flex gap-2"><span className="text-slate-500">USD/INR</span> <span className="text-white">₹{data?.summary.fx.usdinr.toFixed(2)}</span></div>
          <div className="flex gap-2"><span className="text-slate-500">USD/CNY</span> <span className="text-white">¥{data?.summary.fx.usdcny.toFixed(2)}</span></div>
          <div className="flex gap-2"><span className="text-slate-500">USD/AED</span> <span className="text-white">د.إ{data?.summary.fx.usdaed.toFixed(2)}</span></div>
          <div className="flex gap-2"><span className="text-slate-500">SYNC IN</span> <span className="text-emerald-400">{formatCountdown(countdown)}</span></div>
        </div>
      </div>

      <nav className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded bg-yellow-500 flex items-center justify-center font-black text-slate-950 text-[10px]">L</div>
          <h1 className="text-sm font-black tracking-[0.2em] uppercase">Lumina <span className="text-slate-500">Global Hubs</span></h1>
        </div>
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">UTC: {new Date().toUTCString().slice(17, 22)}</div>
      </nav>

      <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-12 pb-24">
        {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-[10px] font-bold uppercase tracking-widest">
                {error}
            </div>
        )}

        {/* Hub Sections */}
        {['USA', 'China', 'UAE', 'India'].map(region => (
          <section key={region} className="space-y-6">
            <div className="flex items-center gap-4">
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">{region} Market</h2>
              <div className="h-px bg-slate-800 flex-1"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {data?.hubs.filter(h => h.region === region).map((metal, i) => (
                <MetalCard key={i} data={metal} />
              ))}
            </div>
          </section>
        ))}

        {/* AI Predictions Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-emerald-400">AI Price Forecasting</h2>
            <div className="h-px bg-slate-800 flex-1"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data?.summary.predictions.map((pred, i) => (
              <div key={i} className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-3xl p-6 relative overflow-hidden group">
                <div className={`absolute top-0 right-0 w-32 h-32 blur-[80px] opacity-10 rounded-full ${pred.metal.toLowerCase().includes('gold') ? 'bg-yellow-500' : 'bg-slate-400'}`}></div>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{pred.timeframe} Forecast</span>
                    <h3 className="text-2xl font-black text-white">{pred.metal}</h3>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-bold ${pred.changePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {pred.changePercent >= 0 ? '▲' : '▼'} {Math.abs(pred.changePercent)}%
                    </span>
                    <p className="text-[10px] text-slate-600 font-bold uppercase mt-1">Projected Trend</p>
                  </div>
                </div>

                <div className="flex items-end gap-2 mb-8">
                  <span className="text-3xl font-black text-white">${pred.predictedPrice.toLocaleString()}</span>
                  <span className="text-xs text-slate-500 font-bold pb-1">USD Benchmark</span>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                      <span>Low Confidence: ${pred.lowBound.toLocaleString()}</span>
                      <span>High Confidence: ${pred.highBound.toLocaleString()}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full relative">
                      <div 
                        className="absolute h-full bg-emerald-500/50 rounded-full blur-[2px]"
                        style={{ 
                          left: `${((pred.lowBound - pred.predictedPrice * 0.9) / (pred.predictedPrice * 0.2)) * 100}%`,
                          right: `${100 - ((pred.highBound - pred.predictedPrice * 0.9) / (pred.predictedPrice * 0.2)) * 100}%` 
                        }}
                      ></div>
                      <div 
                        className="absolute h-full bg-emerald-400 rounded-full"
                        style={{ 
                          left: `${((pred.lowBound - pred.predictedPrice * 0.9) / (pred.predictedPrice * 0.2)) * 100}%`,
                          right: `${100 - ((pred.highBound - pred.predictedPrice * 0.9) / (pred.predictedPrice * 0.2)) * 100}%` 
                        }}
                      ></div>
                      <div 
                        className="absolute w-2 h-4 bg-white border-2 border-slate-900 rounded-sm -top-1.5"
                        style={{ left: '50%' }}
                      ></div>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-800/20 p-3 rounded-xl border border-slate-800/50">
                    <span className="text-emerald-400 font-bold">Reasoning:</span> {pred.reasoning}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Global Insight Overlay */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8">
           <div className="lg:col-span-8 bg-indigo-500/5 border border-indigo-500/10 rounded-3xl p-8">
              <div className="flex items-center justify-between mb-6">
                <span className="text-[10px] font-black uppercase text-indigo-400 tracking-[0.4em]">Strategic Analysis</span>
                <span className="text-[10px] font-bold bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full">{data?.summary.sentiment}</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-6 leading-snug">"{data?.summary.headline}"</h3>
              <div className="prose prose-sm prose-invert text-slate-400 leading-relaxed max-w-none">
                {data?.summary.analysis.split('\n\n').map((p, i) => <p key={i} className="mb-4">{p}</p>)}
              </div>
           </div>
           
           <div className="lg:col-span-4 space-y-6">
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6">
                <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-6">Arbitrage Drivers</h4>
                <div className="space-y-4">
                  {data?.summary.drivers.map((d, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5"></div>
                      <p className="text-xs text-slate-300 font-medium leading-relaxed">{d}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="p-6 border border-slate-800 rounded-3xl">
                 <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-4">Grounded Feeds</h4>
                 <div className="space-y-2">
                   {data?.summary.sources.map((s, i) => (
                     <a key={i} href={s.uri} target="_blank" className="block p-2 bg-slate-900/40 rounded text-[10px] text-indigo-400 hover:bg-slate-800 transition-colors truncate">
                       {s.title}
                     </a>
                   ))}
                 </div>
              </div>
           </div>
        </div>
      </main>
    </div>
  );
};

export default App;
