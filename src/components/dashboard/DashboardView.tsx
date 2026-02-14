import React from 'react';
import { EmptyStateView } from '@/components/ui/empty-state-view';
import { useIntegratedData } from '@/hooks/useIntegratedData';
import ProblemAreas from './ProblemAreas';
import WeeklyProgress from './WeeklyProgress';
import Strengths from './Strengths';
import AIRecommendations from './AIRecommendations';
import DynamicsChart from './DynamicsChart';
import CorrelationsSidebar from './CorrelationsSidebar';
import TopMetricsGrid from './TopMetricsGrid';
import InsightsOfWeek from './InsightsOfWeek';
import ActivityCard from './ActivityCard';
import { PersonalRecommendations, PersonalInsights, PersonalGoals } from '../tracker';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DashboardViewProps {
  allMetrics: Array<{ id: string; name: string; icon: string; description: string; category: string }>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- dynamic week data with metric keys
  mockData: any[];
  appState: { userState: string; hasData: boolean; lastDataSync: Date | null };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- insights return dynamic shapes
  generateWeeklyInsights: () => any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- correlation data has dynamic structure
  generateCorrelations: (targetMetric: string) => any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- dynamic week data with metric keys
  getFilteredData: (filter: string) => any[];
  timeFilter: string;
  setTimeFilter: (filter: string) => void;
  setCurrentView: (view: string) => void;
  setSelectedMetric: (metric: string | null) => void;
  currentStreak: number;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const DashboardView: React.FC<DashboardViewProps> = ({
  allMetrics,
  mockData,
  appState,
  generateWeeklyInsights,
  generateCorrelations,
  getFilteredData,
  timeFilter,
  setTimeFilter,
  setCurrentView,
  setSelectedMetric,
  currentStreak,
}) => {
  const { periodLabel } = useIntegratedData();

  // Empty state
  if (appState.userState === 'empty' || mockData.length === 0) {
    return (
      <EmptyStateView
        onGetStarted={() => setCurrentView('rate')}
        onViewDemo={() => {}}
      />
    );
  }

  // Derived data
  const latestWeek = mockData[mockData.length - 1] ?? null;
  const prevWeek = mockData.length > 1 ? mockData[mockData.length - 2] : latestWeek;

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

  // Monthly count — number of weeks with data in last 4 weeks
  const monthlyCount = mockData.slice(-4).filter(w => w && typeof w.overall === 'number' && w.overall > 0).length;

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
      {/* Row 1: 4 summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2.5">
        <ProblemAreas
          allMetrics={allMetrics}
          currentWeekData={latestWeek}
          onMetricClick={handleMetricClick}
        />
        <WeeklyProgress
          mockData={mockData}
          onViewHistory={() => setCurrentView('rating')}
        />
        <Strengths
          allMetrics={allMetrics}
          currentWeekData={latestWeek}
          onMetricClick={handleMetricClick}
        />
        <AIRecommendations
          allMetrics={allMetrics}
          currentWeekData={latestWeek}
          onOpenAIChat={() => setCurrentView('ai')}
        />
      </div>

      {/* Row 2: Chart (2fr) + Correlations (1fr) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5">
        <div className="lg:col-span-2">
          <DynamicsChart
            getFilteredData={getFilteredData}
            timeFilter={timeFilter}
            setTimeFilter={setTimeFilter}
          />
        </div>
        <CorrelationsSidebar
          correlations={generateCorrelations('Общий индекс')}
          allMetrics={allMetrics}
        />
      </div>

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
          data={mockData}
        />
      </div>

      {/* Row 4: AI + Correlations + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5">
        <PersonalRecommendations
          metrics={allMetrics}
          data={mockData}
        />
        <PersonalInsights
          metrics={allMetrics}
          data={mockData}
        />
        <ActivityCard
          monthlyCount={monthlyCount}
          currentStreak={currentStreak}
        />
      </div>
    </div>
  );
};

export default DashboardView;
