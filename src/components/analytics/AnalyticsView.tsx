import React, { useMemo } from 'react';
import KPICards from './KPICards';
import CategoriesSection from './CategoriesSection';
import MainChart from './MainChart';
import SparklineCards from './SparklineCards';
import RankingPanel from './RankingPanel';
import TrendsPanel from './TrendsPanel';
import CorrelationsPanel from './CorrelationsPanel';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import type { WeekDataRecord } from '@/utils/dataAdapter';

interface Metric {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: string;
  isCustom: boolean;
}

interface AnalyticsViewProps {
  allMetrics: Metric[];
  weeklyData: WeekDataRecord[];
  timeFilter: string;
  setTimeFilter: (f: string) => void;
  categoryFilter: string;
  setCategoryFilter: (f: string) => void;
  getFilteredData: (filter: string) => WeekDataRecord[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- analytics returns a complex dynamic structure
  getAnalytics: () => any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- correlation data has dynamic metric-based structure
  generateCorrelations: (target: string) => any[];
  setSelectedMetric: (name: string | null) => void;
}

const CATEGORY_MAP: Record<string, { name: string; icon: string }> = {
  mental: { name: 'Ментальное', icon: '🧠' },
  health: { name: 'Здоровье', icon: '💪' },
  relationships: { name: 'Отношения', icon: '❤️' },
  finance: { name: 'Финансы', icon: '💰' },
  social: { name: 'Социальное', icon: '🤝' },
  personal: { name: 'Личное', icon: '🧘' },
  lifestyle: { name: 'Образ жизни', icon: '✈️' },
};

const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  allMetrics,
  weeklyData,
  timeFilter,
  setTimeFilter,
  categoryFilter,
  setCategoryFilter,
  getFilteredData,
  getAnalytics,
  generateCorrelations,
  setSelectedMetric,
}) => {
  const analytics = getAnalytics();
  const { averageByMetric, trendsOverTime, bestWeek } = analytics;
  const filteredData = getFilteredData(timeFilter);

  // ====== KPI data ======
  const currentIndex =
    trendsOverTime.length > 0
      ? trendsOverTime[trendsOverTime.length - 1]?.averageScore || 0
      : 0;
  const bestWeekScore = bestWeek ? bestWeek.overallScore : 0;
  const bestWeekDate = bestWeek
    ? format(bestWeek.startDate, 'dd MMMM', { locale: ru })
    : '';
  const totalMetrics = Object.keys(averageByMetric).length;
  const totalWeeks = trendsOverTime.length;

  // ====== Categories data ======
  const latestWeek = weeklyData.length > 0 ? weeklyData[weeklyData.length - 1] : null;
  const categoriesData = useMemo(() => {
    return Object.entries(CATEGORY_MAP).map(([key, cat]) => {
      const catMetrics = allMetrics.filter(m => m.category === key);
      const avgScore =
        catMetrics.length > 0 && latestWeek
          ? catMetrics.reduce((sum, m) => sum + (latestWeek[m.name] || 0), 0) /
            catMetrics.length
          : 0;
      return {
        key,
        name: cat.name,
        icon: cat.icon,
        score: avgScore,
        count: catMetrics.length,
      };
    });
  }, [allMetrics, latestWeek]);

  // ====== Main chart lines ======
  const chartLines = useMemo(() => {
    const lines: { key: string; label: string; color: string }[] = [
      { key: 'overall', label: 'Общий индекс', color: '#3b82f6' },
    ];
    // Add category-level aggregates
    const colorMap: Record<string, string> = {
      health: '#10b981',
      finance: '#f59e0b',
      mental: '#8b5cf6',
      relationships: '#ef4444',
      social: '#06b6d4',
      personal: '#f97316',
      lifestyle: '#ec4899',
    };
    Object.entries(CATEGORY_MAP).forEach(([key, cat]) => {
      lines.push({
        key: `cat_${key}`,
        label: cat.name,
        color: colorMap[key] || '#6b7280',
      });
    });
    return lines;
  }, []);

  // Enrich filteredData with category averages
  const enrichedData = useMemo(() => {
    return filteredData.map(week => {
      const enriched = { ...week };
      Object.entries(CATEGORY_MAP).forEach(([key]) => {
        const catMetrics = allMetrics.filter(m => m.category === key);
        if (catMetrics.length > 0) {
          const vals = catMetrics
            .map(m => week[m.name])
            .filter(v => typeof v === 'number' && !isNaN(v));
          enriched[`cat_${key}`] =
            vals.length > 0
              ? parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1))
              : 0;
        }
      });
      return enriched;
    });
  }, [filteredData, allMetrics]);

  // ====== Sparkline metrics ======
  const sparklineMetrics = useMemo(() => {
    const filtered =
      categoryFilter === 'all'
        ? allMetrics
        : allMetrics.filter(m => m.category === categoryFilter);

    return filtered.map(m => {
      const values = weeklyData
        .map(week => (week && typeof week[m.name] === 'number' ? week[m.name] : 0))
        .filter(v => !isNaN(v));
      const latest = values.length > 0 ? values[values.length - 1] : 0;
      // Monthly change: compare last value vs ~4 weeks ago
      const monthAgo = values.length >= 4 ? values[values.length - 4] : values[0] || 0;
      const change = latest - monthAgo;
      // Take last 10 data points for sparkline
      const sparkData = values.slice(-10);
      return {
        key: m.name,
        name: m.name,
        icon: m.icon,
        value: latest,
        change,
        data: sparkData.length > 0 ? sparkData : [0],
      };
    });
  }, [allMetrics, weeklyData, categoryFilter]);

  // ====== Ranking metrics ======
  const rankingMetrics = useMemo(() => {
    return allMetrics.map(m => {
      const values = weeklyData
        .map(w => (w && typeof w[m.name] === 'number' ? w[m.name] : 0))
        .filter(v => !isNaN(v));
      const latest = values.length > 0 ? values[values.length - 1] : 0;
      const prev = values.length >= 2 ? values[values.length - 2] : 0;
      return {
        name: m.name,
        icon: m.icon,
        value: latest,
        change: latest - prev,
      };
    });
  }, [allMetrics, weeklyData]);

  // ====== Trends data (4-week longitudinal) ======
  const trendsData = useMemo(() => {
    return allMetrics.map(m => {
      const values = weeklyData
        .map(w => (w && typeof w[m.name] === 'number' ? w[m.name] : 0))
        .filter(v => !isNaN(v) && v > 0);
      const latest = values.length > 0 ? values[values.length - 1] : 0;
      const categoryName = CATEGORY_MAP[m.category]?.name || m.category;

      // 4-week trend: compare current value vs average of 4 weeks ago window
      let change = 0;
      let streak = 0; // consecutive weeks in same direction
      if (values.length >= 2) {
        const lookback = Math.min(4, values.length - 1);
        const pastAvg = values.slice(-lookback - 1, -1).reduce((a, b) => a + b, 0) / lookback;
        change = latest - pastAvg;

        // Count streak of consecutive up/down weeks
        for (let i = values.length - 1; i >= 1; i--) {
          const dir = values[i] - values[i - 1];
          if (change >= 0 && dir > 0) streak++;
          else if (change < 0 && dir < 0) streak++;
          else break;
        }
      }

      return {
        name: m.name,
        icon: m.icon,
        category: categoryName,
        change,
        streak,
        weeksOfData: values.length,
      };
    });
  }, [allMetrics, weeklyData]);

  // ====== Correlations data ======
  const correlationsData = useMemo(() => {
    const raw = generateCorrelations('Общий индекс');
    return raw.map(c => {
      // Parse metric pair "Name1 ↔ Name2"
      const parts = c.metric.split(' ↔ ');
      const m1 = allMetrics.find(m => m.name === parts[0]);
      const m2 = allMetrics.find(m => m.name === parts[1]);
      return {
        metric1: parts[0] || '',
        icon1: m1?.icon || '📊',
        metric2: parts[1] || '',
        icon2: m2?.icon || '📊',
        text: `${parts[0] || ''} ↔ ${parts[1] || ''}`,
        percentage: Math.round(Math.abs(c.correlation) * 100),
      };
    });
  }, [generateCorrelations, allMetrics]);

  // ====== Period buttons ======
  const periods: { id: string; label: string }[] = [
    { id: 'week', label: '1Н' },
    { id: 'month', label: '1М' },
    { id: 'quarter', label: '3М' },
    { id: 'year', label: '1Г' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-[28px] font-bold">Аналитика</h1>
          <p className="text-sm text-muted-foreground">
            Отслеживание прогресса и трендов
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-card border border-border rounded-xl p-1">
            {periods.map(p => (
              <button
                key={p.id}
                onClick={() => setTimeFilter(p.id)}
                className={`px-4 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200 ${
                  timeFilter === p.id
                    ? 'bg-blue-500 text-white'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Row */}
      <KPICards
        currentIndex={currentIndex}
        bestWeekScore={bestWeekScore}
        bestWeekDate={bestWeekDate}
        totalMetrics={totalMetrics}
        totalWeeks={totalWeeks}
      />

      {/* Categories */}
      <CategoriesSection
        categories={categoriesData}
        activeCategory={categoryFilter}
        onCategoryClick={setCategoryFilter}
      />

      {/* Main Chart + Sparklines (single card like prototype) */}
      <div className="bg-card border border-border rounded-2xl p-6 overflow-hidden">
        <MainChart
          data={enrichedData}
          availableLines={chartLines}
          defaultActiveKeys={['overall']}
        />
        <SparklineCards
          metrics={sparklineMetrics}
          onMetricClick={(key) => setSelectedMetric(key)}
        />
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <RankingPanel metrics={rankingMetrics} />
        <TrendsPanel trends={trendsData} />
        <CorrelationsPanel correlations={correlationsData} />
      </div>
    </div>
  );
};

export default AnalyticsView;
