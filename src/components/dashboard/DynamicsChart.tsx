import React from 'react';
import {
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from '@/components/ui/safe-recharts';

interface DynamicsChartProps {
  getFilteredData: (filter: string) => any[];
  timeFilter: string;
  setTimeFilter: (filter: string) => void;
}

const periodLabels: Record<string, string> = {
  week: '1Н',
  month: '1М',
  quarter: '3М',
  year: '1Г',
};

const DynamicsChart: React.FC<DynamicsChartProps> = ({
  getFilteredData,
  timeFilter,
  setTimeFilter,
}) => {
  return (
    <div className="bg-card border border-border rounded-[10px] p-3">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-[13px] font-semibold text-foreground">Динамика общего индекса</h3>
          <p className="text-[10px] text-muted-foreground">Отслеживание прогресса по времени</p>
        </div>
        <div className="flex gap-0.5 bg-muted/40 p-0.5 rounded-md">
          {(['week', 'month', 'quarter', 'year'] as const).map(period => (
            <button
              key={period}
              onClick={() => setTimeFilter(period)}
              className={`px-2.5 py-1 rounded text-[10px] font-medium transition-all ${
                timeFilter === period
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {periodLabels[period]}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <RechartsLineChart data={getFilteredData(timeFilter)}>
          <defs>
            <linearGradient id="overallGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="week"
            stroke="hsl(var(--muted-foreground))"
            fontSize={10}
            tickLine={false}
          />
          <YAxis
            domain={[0, 10]}
            stroke="hsl(var(--muted-foreground))"
            fontSize={10}
            tickLine={false}
            width={28}
          />
          <Tooltip
            content={({ active, payload, label }: any) => {
              if (!active || !payload) return null;
              const item = payload.find((p: any) => p.dataKey === 'overall');
              if (!item) return null;
              return (
                <div
                  style={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: 'var(--shadow-lg)',
                    color: 'hsl(var(--card-foreground))',
                    padding: '8px 12px',
                  }}
                >
                  <p style={{ margin: 0, fontSize: 11, color: 'hsl(var(--muted-foreground))' }}>
                    Неделя: {label}
                  </p>
                  <p
                    style={{
                      margin: '4px 0 0',
                      fontSize: 13,
                      fontWeight: 600,
                      color: 'hsl(var(--primary))',
                    }}
                  >
                    Общий индекс:{' '}
                    {typeof item.value === 'number' ? item.value.toFixed(1) : item.value}
                  </p>
                </div>
              );
            }}
          />
          <Line
            type="monotone"
            dataKey="overall"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 3 }}
            activeDot={{ r: 5, fill: 'hsl(var(--primary))' }}
          />
          <Line
            type="linear"
            dataKey="trendLine"
            stroke="hsl(var(--muted-foreground))"
            strokeWidth={1.5}
            strokeDasharray="6 4"
            strokeOpacity={0.35}
            dot={false}
            activeDot={false}
            connectNulls
            name="Тренд"
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DynamicsChart;
