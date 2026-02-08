import React, { useState } from 'react';
import {
  LineChart,
  ResponsiveContainer,
  Line,
  YAxis,
  CartesianGrid,
  Tooltip,
} from '@/components/ui/safe-recharts';

interface SparklineMetric {
  key: string;
  name: string;
  icon: string;
  value: number;
  change: number;
  data: number[];
}

interface SparklineCardsProps {
  metrics: SparklineMetric[];
  onMetricClick?: (metricKey: string) => void;
}

const getValueColor = (v: number) => {
  if (v >= 7) return 'text-emerald-500';
  if (v >= 4) return 'text-yellow-500';
  return 'text-red-500';
};

const getLineColor = (v: number) => {
  if (v >= 7) return '#10b981';
  if (v >= 4) return '#f59e0b';
  return '#ef4444';
};

const SparklineCards: React.FC<SparklineCardsProps> = ({ metrics, onMetricClick }) => {
  const [activeKey, setActiveKey] = useState<string | null>(
    metrics.length > 0 ? metrics[0].key : null
  );

  const handleClick = (key: string) => {
    setActiveKey(prev => (prev === key ? null : key));
    onMetricClick?.(key);
  };

  if (metrics.length === 0) return null;

  return (
    <div className="border-t border-border pt-6">
      <div className="text-sm font-semibold text-muted-foreground mb-4">
        Детализация по метрикам
      </div>
      <div className="grid grid-cols-1 min-[400px]:grid-cols-2 lg:grid-cols-4 gap-3">
        {metrics.map(m => {
          const isActive = activeKey === m.key;
          const lineColor = getLineColor(m.value);
          const sparkData = m.data.map((val, i) => ({ idx: i, val }));

          return (
            <div
              key={m.key}
              onClick={() => handleClick(m.key)}
              className={`bg-muted/50 border rounded-xl p-4 cursor-pointer transition-all duration-200 min-w-0 overflow-hidden ${
                isActive
                  ? 'border-blue-500 bg-blue-500/[0.08]'
                  : 'border-border hover:border-blue-500 hover:-translate-y-0.5'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-lg shrink-0">{m.icon}</span>
                  <span className="text-[13px] font-medium truncate">{m.name}</span>
                </div>
                <span className={`text-lg font-bold shrink-0 ${getValueColor(m.value)}`}>
                  {m.value.toFixed(1)}
                </span>
              </div>

              {/* Mini chart */}
              <div className="relative">
                <ResponsiveContainer width="100%" height={48}>
                  <LineChart data={sparkData}>
                    <CartesianGrid
                      strokeDasharray="none"
                      stroke="hsl(var(--border))"
                      strokeOpacity={0.2}
                      horizontalPoints={[]}
                      verticalPoints={[]}
                    />
                    <YAxis domain={[0, 10]} hide />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px',
                        padding: '6px',
                        fontSize: '11px',
                      }}
                      labelFormatter={() => ''}
                      formatter={(value: number) => [value.toFixed(1), '']}
                    />
                    <Line
                      type="monotone"
                      dataKey="val"
                      stroke={lineColor}
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 3, fill: lineColor }}
                      fill={`${lineColor}15`}
                      fillOpacity={1}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Change */}
              <div
                className={`text-[11px] mt-2 flex items-center gap-1 ${
                  m.change >= 0 ? 'text-emerald-500' : 'text-red-500'
                }`}
              >
                {m.change >= 0 ? '↑' : '↓'} {m.change >= 0 ? '+' : ''}
                {m.change.toFixed(1)} за месяц
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SparklineCards;
