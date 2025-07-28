import React, { useState, useEffect } from 'react';
import { ProblemAreas, WeeklyProgress, Strengths, AIRecommendations } from '@/components/dashboard';
import { useWeeklyRatings } from '@/hooks/useWeeklyRatings';
import { useGlobalData } from '@/contexts/GlobalDataProvider';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { AIWelcomeWizard } from '@/components/ai/AIWelcomeWizard';
import { EmptyStateView } from '@/components/ui/empty-state-view';
import { adaptWeeklyRatingsToMockData, BASE_METRICS } from '@/utils/dataAdapter';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';

const LifeQualityTracker = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showAIWelcome, setShowAIWelcome] = useState(false);
  
  // Global data management
  const { appState, toggleDemoMode } = useGlobalData();
  
  // Weekly ratings hook
  const { ratings: weeklyRatings } = useWeeklyRatings();
  
  // Check if we should show onboarding or AI welcome
  useEffect(() => {
    const hasShownOnboarding = localStorage.getItem('lqt_onboarding_completed');
    const hasShownWelcome = localStorage.getItem('lqt_ai_welcome_shown');
    const hasApiKey = localStorage.getItem('openai_api_key');
    
    if (!hasShownOnboarding && appState.userState === 'empty') {
      setShowOnboarding(true);
    } else if (!hasShownWelcome && !hasApiKey) {
      setShowAIWelcome(true);
    }
  }, [appState.userState]);

  const handleOnboardingComplete = () => {
    localStorage.setItem('lqt_onboarding_completed', 'true');
    setShowOnboarding(false);
  };

  const handleOnboardingSkip = () => {
    localStorage.setItem('lqt_onboarding_completed', 'true');
    setShowOnboarding(false);
  };

  const handleAIWelcomeComplete = () => {
    localStorage.setItem('lqt_ai_welcome_shown', 'true');
    setShowAIWelcome(false);
  };

  const handleAIWelcomeSkip = () => {
    localStorage.setItem('lqt_ai_welcome_shown', 'true');
    setShowAIWelcome(false);
  };

  // Base metrics
  const baseMetrics = [
    { 
      id: 'peace_of_mind',
      name: 'Спокойствие ума', 
      icon: '🧘', 
      description: 'Внутренняя гармония и стрессоустойчивость',
      category: 'mental',
      isCustom: false
    },
    { 
      id: 'financial_cushion',
      name: 'Финансовая подушка', 
      icon: '💰', 
      description: 'Финансовая стабильность и резервы',
      category: 'finance',
      isCustom: false
    },
    { 
      id: 'income',
      name: 'Доход', 
      icon: '📈', 
      description: 'Уровень и стабильность доходов',
      category: 'finance',
      isCustom: false
    },
    { 
      id: 'wife_communication',
      name: 'Качество общения с женой', 
      icon: '❤️', 
      description: 'Близость и взаимопонимание в отношениях',
      category: 'relationships',
      isCustom: false
    },
    { 
      id: 'family_communication',
      name: 'Качество общения с семьей', 
      icon: '👨‍👩‍👧‍👦', 
      description: 'Семейные связи и поддержка',
      category: 'relationships',
      isCustom: false
    },
    { 
      id: 'physical_health',
      name: 'Физическое здоровье', 
      icon: '💪', 
      description: 'Состояние тела и физическая форма',
      category: 'health',
      isCustom: false
    },
    { 
      id: 'socialization',
      name: 'Социализация', 
      icon: '🤝', 
      description: 'Общение и социальные связи',
      category: 'social',
      isCustom: false
    },
    { 
      id: 'manifestation',
      name: 'Проявленность', 
      icon: '🎯', 
      description: 'Самореализация и достижение целей',
      category: 'personal',
      isCustom: false
    },
    { 
      id: 'travel',
      name: 'Путешествия', 
      icon: '✈️', 
      description: 'Исследование мира и новый опыт',
      category: 'lifestyle',
      isCustom: false
    },
    { 
      id: 'mental_health',
      name: 'Ментальное здоровье', 
      icon: '🧠', 
      description: 'Психическое благополучие',
      category: 'mental',
      isCustom: false
    }
  ];

  // Adapted data from GlobalDataProvider
  const mockData = React.useMemo(() => {
    const data = adaptWeeklyRatingsToMockData(weeklyRatings, appState);
    // Filter out any invalid data entries
    return data.filter(week => {
      if (!week || typeof week !== 'object') return false;
      const hasValidOverall = typeof week.overall === 'number' && !isNaN(week.overall);
      if (!hasValidOverall) {
        console.warn('Filtering out week with invalid overall score:', week);
        return false;
      }
      return true;
    });
  }, [weeklyRatings, appState]);

  if (showOnboarding) {
    return (
      <OnboardingWizard 
        onComplete={handleOnboardingComplete}
        onSkip={handleOnboardingSkip}
      />
    );
  }

  if (showAIWelcome) {
    return (
      <AIWelcomeWizard 
        onComplete={handleAIWelcomeComplete}
        onSkip={handleAIWelcomeSkip}
      />
    );
  }

  // Show empty state if no data
  if (appState.userState === 'empty' || mockData.length === 0) {
    return (
      <div className="p-6">
        <EmptyStateView
          onGetStarted={() => window.location.href = '/ratings'}
          onViewDemo={() => {
            toggleDemoMode();
          }}
        />
      </div>
    );
  }

  const latestWeek = mockData[mockData.length - 1];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Обзор</h1>
        <p className="text-muted-foreground mt-1">
          Главная панель управления вашим качеством жизни
        </p>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ProblemAreas 
          allMetrics={baseMetrics}
          currentWeekData={latestWeek}
          onMetricClick={() => window.location.href = '/analytics'}
        />

        <WeeklyProgress 
          mockData={mockData}
          onViewHistory={() => window.location.href = '/ratings'}
        />

        <Strengths 
          allMetrics={baseMetrics}
          currentWeekData={latestWeek}
          onMetricClick={() => window.location.href = '/analytics'}
        />

        <AIRecommendations 
          allMetrics={baseMetrics}
          currentWeekData={latestWeek}
          onOpenAIChat={() => window.location.href = '/ai-coach'}
        />
      </div>

      {/* Overall Index Chart */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-foreground">Динамика общего индекса</h3>
            <p className="text-sm text-muted-foreground">Отслеживание прогресса по времени</p>
          </div>
        </div>
        
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockData}>
              <defs>
                <linearGradient id="overallGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="week" 
                className="text-muted-foreground text-sm" 
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                domain={[0, 10]} 
                className="text-muted-foreground text-sm"
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
              <Area
                type="monotone"
                dataKey="overall"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#overallGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default LifeQualityTracker;