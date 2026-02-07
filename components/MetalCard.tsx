
import React, { useState } from 'react';
import { MetalData } from '../types';
import PriceChart from './PriceChart';

interface MetalCardProps {
  data: MetalData;
}

const MetalCard: React.FC<MetalCardProps> = ({ data }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isPositive = data.change24h >= 0;
  const isGold = data.name.includes('Gold');
  const gradientClass = isGold ? 'gold-gradient' : 'silver-gradient';
  
  const range = data.high24h - data.low24h;
  const progress = ((data.currentPrice - data.low24h) / (range || 1)) * 100;

  return (
    <div className={`bg-slate-900/40 backdrop-blur-md rounded-2xl p-4 border border-slate-800 hover:border-slate-700 transition-all group relative overflow-hidden flex flex-col ${isExpanded ? 'col-span-full' : ''}`}>
      <div className={`absolute -top-12 -right-12 w-32 h-32 opacity-5 blur-3xl rounded-full ${gradientClass}`}></div>
      
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${
              data.region === 'USA' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
              data.region === 'China' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
              data.region === 'UAE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
              'bg-orange-500/10 text-orange-400 border border-orange-500/20'
            }`}>
              {data.region}
            </span>
            <h3 className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{data.symbol}</h3>
          </div>
          <div className="flex items-baseline gap-0.5">
            <span className="text-[10px] font-bold text-slate-500">{data.currency}</span>
            <span className="text-xl font-black text-white tracking-tight">
              {data.currentPrice.toLocaleString(undefined, { maximumFractionDigits: data.currentPrice > 1000 ? 0 : 2 })}
            </span>
          </div>
          <span className="text-[8px] text-slate-500 font-mono uppercase">PER {data.unit}</span>
        </div>
        
        <div className="flex flex-col items-end">
          <span className={`text-[10px] font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isPositive ? '▲' : '▼'}{Math.abs(data.change24h).toFixed(2)}%
          </span>
          <span className="text-[8px] text-slate-600 font-bold uppercase mt-1">{data.volatility} VOL</span>
        </div>
      </div>

      <div className="h-0.5 w-full bg-slate-800 rounded-full overflow-hidden mt-4">
        <div 
          className={`h-full rounded-full ${gradientClass}`}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>

      <div className="mt-4 flex justify-between items-center">
        <div className="flex gap-2">
            <span className="text-[9px] text-slate-600 font-bold uppercase tracking-tighter">L: {data.currency}{data.low24h.toLocaleString()}</span>
            <span className="text-[9px] text-slate-600 font-bold uppercase tracking-tighter">H: {data.currency}{data.high24h.toLocaleString()}</span>
        </div>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded transition-colors ${isExpanded ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
        >
          {isExpanded ? 'Close Chart' : 'View Detail'}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-6 h-[300px] w-full animate-in fade-in slide-in-from-top-4 duration-500">
           <PriceChart 
            data={data.history} 
            color={isGold ? '#fbbf24' : '#94a3b8'} 
            title={`${data.name} History`} 
           />
        </div>
      )}
    </div>
  );
};

export default MetalCard;
