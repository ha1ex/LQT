import React, { useState } from 'react';
import { useMobile } from '@/hooks/use-mobile';
import {
  LineChart,
  ResponsiveContainer,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from '@/components/ui/safe-recharts';


interface MainChartProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- chart data with dynamic metric keys
  data: any[];
  availableLines: { key: string; label: string; color: string }[];
  defaultActiveKeys?: string[];
}

const MainChart: React.FC<MainChartProps> = ({ data, availableLines, defaultActiveKeys }) => {
  const isMobile = useMobile();
  const [activeKeys, setActiveKeys] = useState<string[]>(
    defaultActiveKeys || (availableLines.length > 0 ? [availableLines[0].key] : [])
  );

  const toggleFilter = (key: string) => {
    setActiveKeys(prev => {
      if (prev.includes(key)) {
        return prev.filter(k => k !== key);
      }
      if (prev.length >= 4) return prev; // max 4 lines
      return [...prev, key];
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h2 className="text-base font-semibold">Динамика показателей</h2>
        <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 sm:flex-wrap">
          {availableLines.map(line => {
            const isActive = activeKeys.includes(line.key);
            return (
              <button
                key={line.key}
                onClick={() => toggleFilter(line.key)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-all duration-200 shrink-0 sm:shrink ${
                  isActive
                    ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                    : 'border-border bg-background text-muted-foreground hover:border-muted-foreground hover:text-foreground'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: line.color }}
                />
                {line.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart */}
      <div className="mb-6">
        <ResponsiveContainer width="100%" height={isMobile ? 200 : 280}>
          <LineChart data={data}>
            <CartesianGrid
              strokeDasharray="none"
              stroke="hsl(var(--border))"
              strokeOpacity={0.3}
            />
            <XAxis
              dataKey="week"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: isMobile ? 9 : 11 }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[0, 10]}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickCount={6}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '10px',
                padding: '12px',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              itemStyle={{ fontSize: 12 }}
            />
            {availableLines
              .filter(l => activeKeys.includes(l.key))
              .map((line, idx) => (
                <Line
                  key={line.key}
                  type="monotone"
                  dataKey={line.key}
                  stroke={line.color}
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{
                    r: 6,
                    fill: line.color,
                    stroke: '#fff',
                    strokeWidth: 2,
                  }}
                  fill={idx === 0 ? `${line.color}14` : 'transparent'}
                  fillOpacity={idx === 0 ? 1 : 0}
                />
              ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MainChart;
