import React from 'react';
import { EmptyStateView } from '@/components/ui/empty-state-view';
import { useIntegratedData } from '@/hooks/useIntegratedData';
import ProblemAreas from './ProblemAreas';
import WeeklyProgress from './WeeklyProgress';
import Strengths from './Strengths';
import DynamicsChart from './DynamicsChart';
import TopMetricsGrid from './TopMetricsGrid';
import InsightsOfWeek from './InsightsOfWeek';
import { PersonalRecommendations, PersonalGoals } from '../tracker';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DashboardViewProps {
  allMetrics: Array<{ id: string; name: string; icon: string; description: string; category: string }>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- dynamic week data with metric keys
  weeklyData: any[];
  appState: { userState: string; hasData: boolean; lastDataSync: Date | null };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- insights return dynamic shapes
  generateWeeklyInsights: () => any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- dynamic week data with metric keys
  getFilteredData: (filter: string) => any[];
  timeFilter: string;
  setTimeFilter: (filter: string) => void;
  setCurrentView: (view: string) => void;
  setSelectedMetric: (metric: string | null) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const DashboardView: React.FC<DashboardViewProps> = ({
  allMetrics,
  weeklyData,
  appState,
  generateWeeklyInsights,
  getFilteredData,
  timeFilter,
  setTimeFilter,
  setCurrentView,
  setSelectedMetric,
}) => {
  const { periodLabel } = useIntegratedData();

  // Empty state
  if (appState.userState === 'empty' || weeklyData.length === 0) {
    return (
      <EmptyStateView
        onGetStarted={() => setCurrentView('rate')}
        onViewDemo={() => {}}
      />
    );
  }

  // Derived data
  const latestWeek = weeklyData[weeklyData.length - 1] ?? null;
  const prevWeek = weeklyData.length > 1 ? weeklyData[weeklyData.length - 2] : latestWeek;

  const topMetrics = latestWeek
    ? allMetrics
        .map(metric => ({
          ...metric,
          value:
            typeof latestWeek[metric.name] === 'number' && !isNaN(latestWeek[metric.name])
              ? latestWeek[metric.name]
              : 0,
          change:
            latestWeek && prevWeek
              ? (typeof latestWeek[metric.name] === 'number' && !isNaN(latestWeek[metric.name])
                  ? latestWeek[metric.name]
                  : 0) -
                (typeof prevWeek[metric.name] === 'number' && !isNaN(prevWeek[metric.name])
                  ? prevWeek[metric.name]
                  : 0)
              : 0,
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6)
    : [];

  // Handlers
  const handleMetricClick = (metricId: string) => {
    if (metricId === 'analytics') {
      setCurrentView('analytics');
    } else {
      setSelectedMetric(allMetrics.find(m => m.id === metricId)?.name || null);
      setCurrentView('analytics');
    }
  };

  const handleMetricNameClick = (metricName: string) => {
    setSelectedMetric(metricName);
    setCurrentView('analytics');
  };

  return (
    <div className="space-y-2.5">
      {/* Row 1: 3 summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5">
        <ProblemAreas
          allMetrics={allMetrics}
          currentWeekData={latestWeek}
          onMetricClick={handleMetricClick}
        />
        <WeeklyProgress
          weeklyData={weeklyData}
          onViewHistory={() => setCurrentView('rating')}
        />
        <Strengths
          allMetrics={allMetrics}
          currentWeekData={latestWeek}
          onMetricClick={handleMetricClick}
        />
      </div>

      {/* Row 2: Chart (full width) */}
      <DynamicsChart
        getFilteredData={getFilteredData}
        timeFilter={timeFilter}
        setTimeFilter={setTimeFilter}
      />

      {/* Row 3: Metrics + Insights + Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5">
        <TopMetricsGrid
          topMetrics={topMetrics}
          onMetricClick={handleMetricNameClick}
        />
        <InsightsOfWeek
          insights={generateWeeklyInsights()}
          periodLabel={periodLabel}
          onViewAll={() => setCurrentView('insights')}
        />
        <PersonalGoals
          metrics={allMetrics}
          data={weeklyData}
        />
      </div>

      {/* Row 4: Recommendations (full width) */}
      <PersonalRecommendations
        metrics={allMetrics}
        data={weeklyData}
      />
    </div>
  );
};

export default DashboardView;
