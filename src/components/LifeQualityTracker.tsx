
import React from 'react';
import { WeeklyProgress } from './dashboard/WeeklyProgress';
import { Strengths } from './dashboard/Strengths';
import { ProblemAreas } from './dashboard/ProblemAreas';
import { AIRecommendations } from './dashboard/AIRecommendations';
import { useGlobalData } from '@/contexts/GlobalDataProvider';
import { EmptyStateView } from './ui/empty-state-view';

export const LifeQualityTracker: React.FC = () => {
  const { appState } = useGlobalData();

  if (appState.userState === 'empty') {
    return <EmptyStateView />;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WeeklyProgress />
        <Strengths />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProblemAreas />
        <AIRecommendations />
      </div>
    </div>
  );
};
