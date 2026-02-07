
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { PricePoint } from '../types';

interface PriceChartProps {
  data: PricePoint[];
  color: string;
  title: string;
  isMini?: boolean;
}

const PriceChart: React.FC<PriceChartProps> = ({ data, color, title, isMini = false }) => {
  if (isMini) {
    return (
      <div className="h-full w-full opacity-60 hover:opacity-100 transition-opacity">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <Area type="monotone" dataKey="price" stroke={color} strokeWidth={1} fill={color} fillOpacity={0.05} />
            <XAxis hide dataKey="date" />
            <YAxis hide domain={['auto', 'auto']} />
            <Tooltip 
              contentStyle={{ display: 'none' }}
              labelStyle={{ display: 'none' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/50 h-[350px]">
      <h3 className="text-slate-300 text-lg font-semibold mb-6 flex items-center justify-between">
        {title} 
        <span className="text-xs font-normal text-slate-500 bg-slate-700/50 px-2 py-1 rounded">5D</span>
      </h3>
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`colorPrice-${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="date" 
              stroke="#64748b" 
              fontSize={10} 
              tickFormatter={(str) => {
                const d = new Date(str);
                return d.toLocaleDateString(undefined, { weekday: 'short' });
              }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              stroke="#64748b" 
              fontSize={10} 
              domain={['auto', 'auto']}
              axisLine={false}
              tickLine={false}
              tickFormatter={(val) => val.toLocaleString()}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
              itemStyle={{ color: '#f8fafc' }}
              labelStyle={{ color: '#94a3b8', fontSize: '10px' }}
              formatter={(value: number) => [value.toLocaleString(), 'Price']}
            />
            <Area 
              type="monotone" 
              dataKey="price" 
              stroke={color} 
              strokeWidth={2} 
              fillOpacity={1} 
              fill={`url(#colorPrice-${title})`}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PriceChart;
