import { useState, useEffect, useMemo, useCallback } from 'react';
import { BottomNavigation } from '@/components/ui/bottom-navigation';
import { MobileHeader } from '@/components/ui/mobile-header';
import { useMobile } from '@/hooks/use-mobile';
import {
  Home, BarChart3, Target, Search, Settings as SettingsIcon,
  Brain,
  Star, Plus, Calendar,
  Activity,
  Menu,
  Lightbulb,
  Sparkles, ArrowLeft
} from 'lucide-react';
import {
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from '@/components/ui/safe-recharts';

// Новые компоненты для улучшенного UX
import CategoryBadge from './tracker/CategoryBadge';
import WeeklyInsights from './tracker/WeeklyInsights';
import CorrelationAnalysis from './tracker/CorrelationAnalysis';
import { StrategyDashboard, HypothesisWizard, HypothesisDetail } from './strategy';
import { AdaptiveDashboard, AIWelcomeWizard } from './ai';
import { AssessmentSplitView } from './rating';
import { DashboardView as DashboardViewNew } from './dashboard';
import { AnalyticsView as AnalyticsViewNew } from './analytics';
import { Settings } from '@/pages/Settings';
import { useIntegratedData } from '@/hooks/useIntegratedData';
import { useWeeklyRatings } from '@/hooks/useWeeklyRatings';
import { useGlobalData } from '@/contexts/GlobalDataProvider';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { adaptWeeklyRatingsToMockData, filterDataByPeriod } from '@/utils/dataAdapter';





const LifeQualityTracker = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [timeFilter, setTimeFilter] = useState('year');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  const [currentStreak] = useState(5);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [strategyView, setStrategyView] = useState<'dashboard' | 'create' | 'detail'>('dashboard');
  const [selectedHypothesisId, setSelectedHypothesisId] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showAIWelcome, setShowAIWelcome] = useState(false);
  const isMobile = useMobile();
  
  // Global data management with error boundary
  const globalData = useGlobalData();
  const { appState } = globalData || {};
  
  // Integrated dashboard-strategy data
  useIntegratedData();
  
  // Weekly ratings hook
  const {
    ratings: weeklyRatings,
    getAnalytics,
  } = useWeeklyRatings();




  


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
    // After onboarding, go to rating view to help user get started
    setCurrentView('rate');
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
  
  // Базовые метрики — актуальный список по Q1/26 из "Качество жизни.xlsx"
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
      name: 'Качество общения с семьёй',
      icon: '👨‍👩‍👧‍👦',
      description: 'Семейные связи и поддержка',
      category: 'relationships',
      isCustom: false
    },
    {
      id: 'physical_activity',
      name: 'Уровень физической активности',
      icon: '🏃',
      description: 'Регулярность и интенсивность физических нагрузок',
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
    },
    {
      id: 'anxiety_level',
      name: 'Уровень тревожности',
      icon: '😰',
      description: 'Уровень тревоги и беспокойства',
      category: 'mental',
      isCustom: false
    },
    {
      id: 'health_condition',
      name: 'Состояние здоровья',
      icon: '🏥',
      description: 'Общее состояние здоровья и самочувствие',
      category: 'health',
      isCustom: false
    },
    {
      id: 'happiness',
      name: 'Ощущение счастья',
      icon: '😊',
      description: 'Общее ощущение счастья и удовлетворённости',
      category: 'personal',
      isCustom: false
    },
    {
      id: 'self_esteem',
      name: 'Самооценка',
      icon: '💎',
      description: 'Уверенность в себе и самоценность',
      category: 'personal',
      isCustom: false
    }
  ];

  const allMetrics = baseMetrics;

  // Функция для генерации инсайтов на основе реальных данных
  const generateWeeklyInsights = () => {
    const insights: Array<{
      type: 'improvement' | 'decline' | 'recommendation' | 'achievement';
      title: string;
      description: string;
      metric?: string;
      change?: number;
    }> = [];

    if (mockData.length < 2) return insights;

    const latest = mockData[mockData.length - 1];
    const previous = mockData[mockData.length - 2];

    // Find improvements and declines
    allMetrics.forEach(metric => {
      const current = latest?.[metric.name];
      const prev = previous?.[metric.name];
      if (typeof current === 'number' && typeof prev === 'number' && current > 0 && prev > 0) {
        const change = current - prev;
        if (change >= 2) {
          insights.push({
            type: 'improvement',
            title: `${metric.icon} Рост: ${metric.name}`,
            description: `Улучшение с ${prev} до ${current} (+${change}) за неделю`,
            metric: metric.name,
            change
          });
        } else if (change <= -2) {
          insights.push({
            type: 'decline',
            title: `⚠️ Снижение: ${metric.name}`,
            description: `Снижение с ${prev} до ${current} (${change}) за неделю`,
            metric: metric.name,
            change
          });
        }
      }
    });

    // Find low metrics needing attention
    allMetrics.forEach(metric => {
      const current = latest?.[metric.name];
      if (typeof current === 'number' && current > 0 && current <= 4) {
        insights.push({
          type: 'recommendation',
          title: `Обратите внимание на «${metric.name}»`,
          description: `Текущая оценка ${current}/10. Эта область требует внимания`,
          metric: metric.name
        });
      }
    });

    // Find strengths (high metrics maintained)
    const highMetrics = allMetrics.filter(m => {
      const val = latest?.[m.name];
      return typeof val === 'number' && val >= 8;
    });
    if (highMetrics.length >= 3) {
      insights.push({
        type: 'achievement',
        title: '🏆 Отличная неделя!',
        description: `${highMetrics.length} метрик с оценкой 8+ — продолжайте в том же духе`
      });
    }

    // Total weeks tracked
    if (mockData.length >= 10) {
      insights.push({
        type: 'achievement',
        title: '📊 Стабильное отслеживание',
        description: `Вы отслеживаете качество жизни уже ${mockData.length} недель`
      });
    }

    // Sort: improvements first, then declines, then recommendations, then achievements
    const typeOrder = { improvement: 0, decline: 1, recommendation: 2, achievement: 3 };
    insights.sort((a, b) => typeOrder[a.type] - typeOrder[b.type]);

    return insights.slice(0, 5);
  };

  // Функция для расчета корреляции Пирсона с защитой от NaN
  const calculatePearsonCorrelation = (x: number[], y: number[]): number => {
    if (x.length !== y.length || x.length === 0) return 0;
    
    // Фильтруем только валидные числа
    const validPairs = x.map((xi, i) => [xi, y[i]])
      .filter(([xi, yi]) => 
        typeof xi === 'number' && typeof yi === 'number' && 
        !isNaN(xi) && !isNaN(yi) && 
        isFinite(xi) && isFinite(yi)
      );
    
    if (validPairs.length < 2) return 0; // Нужно минимум 2 точки
    
    const validX = validPairs.map(pair => pair[0]);
    const validY = validPairs.map(pair => pair[1]);
    const n = validX.length;
    
    const sumX = validX.reduce((a, b) => a + b, 0);
    const sumY = validY.reduce((a, b) => a + b, 0);
    const sumXY = validX.reduce((total, xi, i) => total + xi * validY[i], 0);
    const sumXX = validX.reduce((total, xi) => total + xi * xi, 0);
    const sumYY = validY.reduce((total, yi) => total + yi * yi, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
    
    // Защита от деления на ноль и NaN
    if (denominator === 0 || !isFinite(denominator)) return 0;
    
    const correlation = numerator / denominator;
    
    // Дополнительная защита от NaN и ограничение диапазона [-1, 1]
    if (isNaN(correlation) || !isFinite(correlation)) return 0;
    return Math.max(-1, Math.min(1, correlation));
  };

  // Линейная регрессия для линии тренда
  const addTrendLine = (data: any[]): any[] => {
    if (data.length < 2) return data;
    const vals = data.map((d, i) => ({ x: i, y: typeof d.overall === 'number' && isFinite(d.overall) ? d.overall : null }));
    const valid = vals.filter(v => v.y !== null) as { x: number; y: number }[];
    if (valid.length < 2) return data.map(d => ({ ...d, trendLine: d.overall ?? 0 }));

    const n = valid.length;
    const sumX = valid.reduce((s, v) => s + v.x, 0);
    const sumY = valid.reduce((s, v) => s + v.y, 0);
    const sumXY = valid.reduce((s, v) => s + v.x * v.y, 0);
    const sumX2 = valid.reduce((s, v) => s + v.x * v.x, 0);
    const denom = n * sumX2 - sumX * sumX;
    if (denom === 0) return data.map(d => ({ ...d, trendLine: sumY / n }));

    const slope = (n * sumXY - sumX * sumY) / denom;
    const intercept = (sumY - slope * sumX) / n;

    return data.map((d, i) => ({
      ...d,
      trendLine: parseFloat((slope * i + intercept).toFixed(2)),
    }));
  };

  // Функция для получения отфильтрованных данных с санитизацией
  const getFilteredData = (filter: string) => {
    const rawData = filterDataByPeriod(mockData, filter);

    // Санитизируем данные для предотвращения NaN
    const sanitizedData = rawData.map(week => {
      if (!week || typeof week !== 'object') return null;

      const sanitizedWeek: Record<string, any> = { ...week };

      // Проверяем и исправляем все числовые значения
      Object.keys(sanitizedWeek).forEach(key => {
        if (key !== 'week' && key !== 'date') {
          const value = sanitizedWeek[key];
          if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
            sanitizedWeek[key] = 0;
          }
        }
      });

      return sanitizedWeek;
    }).filter(week => week !== null);

    // Добавляем линию тренда
    return addTrendLine(sanitizedData);
  };

  // Адаптированные данные из GlobalDataProvider с полной санитизацией
  const mockData = useMemo(() => {
    const adaptedData = adaptWeeklyRatingsToMockData(weeklyRatings, appState);
    
    // Если данных нет, создаем пустую структуру с безопасными значениями
    if (!adaptedData || adaptedData.length === 0) {
      return [];
    }
    
    // Дополнительная санитизация на уровне mockData
    const sanitizedData = adaptedData.map((week, index) => {
      if (!week || typeof week !== 'object') {
        if (import.meta.env.DEV) console.warn(`Invalid week data at index ${index}:`, week);
        return null;
      }
      
      const sanitizedWeek: Record<string, any> = {
        week: week.week || `W${index + 1}`,
        date: week.date || 'Unknown',
        overall: typeof week.overall === 'number' && !isNaN(week.overall) && isFinite(week.overall) ? week.overall : 0
      };
      
      // Санитизируем все остальные числовые поля
      Object.keys(week).forEach(key => {
        if (key !== 'week' && key !== 'date' && key !== 'overall') {
          const value = week[key];
          sanitizedWeek[key] = typeof value === 'number' && !isNaN(value) && isFinite(value) ? value : 0;
        }
      });
      
      return sanitizedWeek;
    }).filter(week => week !== null);
    
    return sanitizedData;
  }, [weeklyRatings, appState]);

  // Мемоизированная функция для генерации корреляций с кэшированием
  const generateCorrelations = useCallback((targetMetric: string) => {
    if (targetMetric === 'Общий индекс') {
      // Для общего индекса показываем корреляции между парами индивидуальных метрик
      const correlations: Array<{metric: string, correlation: number, strength: 'strong' | 'moderate' | 'weak'}> = [];
      
      // Получаем все комбинации пар метрик
      for (let i = 0; i < allMetrics.length; i++) {
        for (let j = i + 1; j < allMetrics.length; j++) {
          const metric1 = allMetrics[i];
          const metric2 = allMetrics[j];
          
          const values1 = mockData
            .map(week => week && week[metric1.name] ? week[metric1.name] : 0)
            .filter(val => typeof val === 'number' && !isNaN(val) && isFinite(val));
          const values2 = mockData
            .map(week => week && week[metric2.name] ? week[metric2.name] : 0)
            .filter(val => typeof val === 'number' && !isNaN(val) && isFinite(val));
          
          // Проверяем наличие достаточного количества данных
          if (values1.length >= 3 && values2.length >= 3 && values1.length === values2.length) {
            const correlation = calculatePearsonCorrelation(values1, values2);
            
            // Добавляем только значимые корреляции (|r| > 0.4) и валидные числа
            if (typeof correlation === 'number' && !isNaN(correlation) && isFinite(correlation) && Math.abs(correlation) > 0.4) {
              correlations.push({
                metric: `${metric1.name} ↔ ${metric2.name}`,
                correlation: parseFloat(correlation.toFixed(2)),
                strength: Math.abs(correlation) > 0.7 ? 'strong' as const : 
                         Math.abs(correlation) > 0.4 ? 'moderate' as const : 'weak' as const
              });
            }
          }
        }
      }
      
      // Сортируем по убыванию абсолютного значения корреляции и берем топ-5
      return correlations
        .sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation))
        .slice(0, 5);
    }
    
    // Для отдельных метрик - исключаем целевую метрику из расчета общего индекса
    const targetValues = mockData
      .map(week => week && week[targetMetric] ? week[targetMetric] : 0)
      .filter(val => typeof val === 'number' && !isNaN(val) && isFinite(val));
      
    const correlations = allMetrics
      .filter(metric => metric.name !== targetMetric)
      .map(metric => {
        const metricValues = mockData
          .map(week => week && week[metric.name] ? week[metric.name] : 0)
          .filter(val => typeof val === 'number' && !isNaN(val) && isFinite(val));
        
        // Проверяем наличие достаточного количества данных
        if (metricValues.length >= 3 && targetValues.length >= 3 && metricValues.length === targetValues.length) {
          const correlation = calculatePearsonCorrelation(targetValues, metricValues);
          
          // Проверяем валидность корреляции
          if (typeof correlation === 'number' && !isNaN(correlation) && isFinite(correlation)) {
            return {
              metric: metric.name,
              correlation: parseFloat(correlation.toFixed(2)),
              strength: Math.abs(correlation) > 0.7 ? 'strong' as const : 
                       Math.abs(correlation) > 0.4 ? 'moderate' as const : 'weak' as const
            };
          }
        }
        
        return null;
      })
      .filter((item): item is { metric: string; correlation: number; strength: 'strong' | 'moderate' | 'weak' } => item !== null && typeof item.correlation === 'number' && !isNaN(item.correlation) && isFinite(item.correlation) && Math.abs(item.correlation) > 0.3) // Фильтруем слабые корреляции и NaN
      .sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation)) // Сортируем по силе
      .slice(0, 5); // Берем топ-5
    
    return correlations;
  }, [allMetrics, mockData]);

  // Функция для получения цвета по значению (только функциональные цвета)
  const getScoreColor = (value: number) => {
    if (value >= 8) return 'text-green-600';
    if (value >= 6) return 'text-yellow-600';
    if (value >= 4) return 'text-muted-foreground';
    return 'text-red-600';
  };


  // Sidebar компонент для веб интерфейса
  const Sidebar = () => {
    const navigationItems = [
      { id: 'dashboard', label: 'Главная', icon: Home },
      { id: 'rate', label: 'Оценка', icon: Calendar },
      { id: 'analytics', label: 'Аналитика', icon: BarChart3 },
      { id: 'strategy', label: 'Стратегия', icon: Lightbulb },
      { id: 'ai', label: 'AI Coach', icon: Brain },
      { id: 'insights', label: 'Инсайты', icon: Activity },
    ];

    const settingsItem = { id: 'settings', label: 'Настройки', icon: SettingsIcon };

    return (
      <div className={`bg-card border-r border-border h-screen sticky top-0 transition-all duration-300 flex flex-col ${
        isSidebarCollapsed ? 'w-16' : 'w-64'
      } ${isMobile ? 'w-full' : ''}`}>
        {/* Логотип и кнопка сворачивания */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            {!isSidebarCollapsed && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary-foreground" />
                </div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Life Quality
                </h1>
              </div>
            )}
            {!isMobile && (
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="w-8 h-8 rounded-lg bg-muted hover:bg-muted/80 transition-colors flex items-center justify-center"
              >
                <Menu className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Основная навигация */}
        <nav className="p-4 space-y-2 flex-1">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setCurrentView(item.id);
                setSelectedMetric(null);
                if (item.id === 'strategy') {
                  setStrategyView('dashboard');
                }
              }}
              className={`w-full flex items-center gap-3 p-3 md:p-3 py-4 md:py-3 rounded-lg transition-all duration-200 ${
                currentView === item.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!isSidebarCollapsed && (
                <span className="font-medium">{item.label}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Статистика */}
        {!isSidebarCollapsed && (
          <div className="p-4 space-y-4">
            {/* Текущий стрик */}
            <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg p-4 border border-primary/10">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Текущий стрик</span>
              </div>
              <div className="text-2xl font-bold text-primary">{currentStreak}</div>
              <div className="text-xs text-muted-foreground">недель подряд</div>
            </div>

            {/* Общий индекс */}
            <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-lg p-4 border border-emerald-200/20">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-700">Общий индекс</span>
              </div>
              <div className="text-2xl font-bold text-emerald-600">
                {mockData[mockData.length - 1]?.overall.toFixed(1) || '0.0'}
              </div>
              <div className="text-xs text-muted-foreground">текущее значение</div>
            </div>
          </div>
        )}

        {/* Настройки в нижнем углу */}
        <div className="p-4 border-t border-border">
          <button
            onClick={() => {
              setCurrentView('settings');
              setSelectedMetric(null);
            }}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
              currentView === 'settings'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <settingsItem.icon className="w-5 h-5 flex-shrink-0" />
            {!isSidebarCollapsed && (
              <span className="font-medium">{settingsItem.label}</span>
            )}
          </button>
        </div>
      </div>
    );
  };

  // Топ бар для веб интерфейса
  const TopBar = () => {
    const latestWeek = mockData.length > 0 ? mockData[mockData.length - 1] : null;
    
    if (isMobile) {
      return (
        <div className="flex flex-col">
          <MobileHeader
            title="Life Quality Tracker"
            onSearch={() => {}}
          >
            <Sidebar />
          </MobileHeader>
          
        </div>
      );
    }
    
    return (
      <div className="bg-card border-b border-border p-4 lg:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Главная</h2>
            <p className="text-muted-foreground">
              {latestWeek ? latestWeek.date : 'Данные отсутствуют'}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Поиск */}
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Поиск метрик..."
                className="pl-10 pr-4 py-2 w-64 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            {/* Кнопка добавления оценки */}
            {appState.hasData && (
              <button
                onClick={() => setCurrentView('rate')}
                className="btn-primary px-4 py-2 rounded-xl font-medium flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Оценить неделю</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // DashboardView moved to ./dashboard/DashboardView.tsx


  // Компонент переключателей периодов
  const TimeFilterButtons = () => (
    <div className="flex gap-3">
      {['week', 'month', 'quarter', 'year'].map(period => (
        <button
          key={period}
          onClick={() => setTimeFilter(period)}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
            timeFilter === period
              ? 'btn-primary'
              : 'btn-modern'
          }`}
        >
          {period === 'week' ? '1Н' : period === 'month' ? '1М' : period === 'quarter' ? '3М' : '1Г'}
        </button>
      ))}
    </div>
  );

  // MetricDetailView для веб интерфейса
  const MetricDetailView = () => {
    const metric = allMetrics.find(m => m.name === selectedMetric);
    if (!metric) return null;

    const metricData = mockData
      .map(week => ({
        ...week,
        value: typeof week[metric.name] === 'number' && !isNaN(week[metric.name]) ? week[metric.name] : 0
      }))
      .filter(week => 
        week && 
        typeof week.value === 'number' && 
        !isNaN(week.value) && 
        isFinite(week.value)
      );

    const latestValue = metricData.length > 0 && typeof metricData[metricData.length - 1].value === 'number' 
      ? metricData[metricData.length - 1].value : 0;
    const prevValue = metricData.length > 1 && typeof metricData[metricData.length - 2].value === 'number' 
      ? metricData[metricData.length - 2].value : 0;
    const change = !isNaN(latestValue) && !isNaN(prevValue) ? latestValue - prevValue : 0;

    return (
      <div className="space-y-6">
        {/* Хлебные крошки */}
        <div className="flex items-center gap-2 text-sm">
          <button
            onClick={() => setSelectedMetric(null)}
            className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Назад
          </button>
          <span className="text-muted-foreground">/</span>
          <span className="font-medium">{metric.name}</span>
        </div>

        {/* Информация о метрике */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="text-3xl">{metric.icon}</div>
              <div>
                <h1 className="text-2xl font-bold">{metric.name}</h1>
                <p className="text-muted-foreground">{metric.description}</p>
                <CategoryBadge category={metric.category} />
              </div>
            </div>
            <div className="text-right">
              <div className={`text-3xl font-bold ${getScoreColor(latestValue)}`}>
                {latestValue.toFixed(1)}
              </div>
              <div className={`text-sm ${change >= 0 ? 'text-success' : 'text-error'}`}>
                {change >= 0 ? '+' : ''}{change.toFixed(1)} за неделю
              </div>
            </div>
          </div>
        </div>

        {/* График метрики */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Динамика за период</h3>
            <TimeFilterButtons />
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <RechartsLineChart data={getFilteredData(timeFilter)}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="week" className="text-muted-foreground" />
              <YAxis domain={[0, 10]} className="text-muted-foreground" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Line
                type="monotone"
                dataKey={metric.name}
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, fill: 'hsl(var(--primary))' }}
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        </div>

        {/* Корреляции */}
        <CorrelationAnalysis 
          data={generateCorrelations(metric.name)}
          targetMetric={metric.name}
        />
      </div>
    );
  };

  // Оптимизированная навигация для мобильных (5 основных разделов)
  const navigationItems = [
    { id: 'dashboard', label: 'Главная', icon: Home },
    { id: 'rate', label: 'Оценка', icon: Sparkles },
    { id: 'strategy', label: 'Стратегия', icon: Lightbulb },
    { id: 'ai', label: 'AI Coach', icon: Brain },
    { id: 'settings', label: 'Настройки', icon: SettingsIcon },
  ];

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

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      {!isMobile && <Sidebar />}
      
      {/* Основной контент */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Топ бар */}
        <TopBar />
        
        {/* Контент */}
        <div className={`flex-1 overflow-auto ${isMobile ? 'pb-24' : ''}`}>
          {currentView === 'dashboard' && (
            <div className="max-w-7xl mx-auto p-3 md:p-4 lg:p-6">
              <DashboardViewNew
                allMetrics={allMetrics}
                mockData={mockData}
                appState={appState}
                generateWeeklyInsights={generateWeeklyInsights}
                generateCorrelations={generateCorrelations}
                getFilteredData={getFilteredData}
                timeFilter={timeFilter}
                setTimeFilter={setTimeFilter}
                setCurrentView={setCurrentView}
                setSelectedMetric={setSelectedMetric}
                currentStreak={currentStreak}
              />
            </div>
          )}
          {currentView === 'analytics' && !selectedMetric && (
            <div className="max-w-7xl mx-auto p-3 md:p-4 lg:p-6">
              <AnalyticsViewNew
                allMetrics={allMetrics}
                mockData={mockData}
                timeFilter={timeFilter}
                setTimeFilter={setTimeFilter}
                categoryFilter={categoryFilter}
                setCategoryFilter={setCategoryFilter}
                getFilteredData={getFilteredData}
                getAnalytics={getAnalytics}
                generateCorrelations={generateCorrelations}
                setSelectedMetric={setSelectedMetric}
              />
            </div>
          )}
          {currentView === 'analytics' && selectedMetric && (
            <div className="max-w-7xl mx-auto p-3 md:p-4 lg:p-6">
              <MetricDetailView />
            </div>
          )}
          {currentView === 'rate' && (
            <div className="max-w-7xl mx-auto p-3 md:p-4 lg:p-6">
              <AssessmentSplitView allMetrics={allMetrics} />
            </div>
          )}
          {currentView === 'insights' && (
            <div className="max-w-7xl mx-auto p-3 md:p-4 lg:p-6">
              <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Инсайты и корреляции</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                <WeeklyInsights insights={generateWeeklyInsights()} />
                <CorrelationAnalysis 
                  data={generateCorrelations('Общий индекс')}
                  targetMetric="Общий индекс"
                />
              </div>
            </div>
          )}
          {currentView === 'strategy' && (
            <div className="max-w-7xl mx-auto p-3 md:p-4 lg:p-6">
              {strategyView === 'dashboard' && (
                <StrategyDashboard
                  onCreateHypothesis={() => setStrategyView('create')}
                  onViewHypothesis={(id) => {
                    setSelectedHypothesisId(id);
                    setStrategyView('detail');
                  }}
                />
              )}
              {strategyView === 'create' && (
                <HypothesisWizard
                  onComplete={() => setStrategyView('dashboard')}
                  onCancel={() => setStrategyView('dashboard')}
                  availableMetrics={allMetrics}
                />
              )}
              {strategyView === 'detail' && selectedHypothesisId && (
                <HypothesisDetail
                  hypothesisId={selectedHypothesisId}
                  onBack={() => setStrategyView('dashboard')}
                />
              )}
            </div>
          )}
          {currentView === 'ai' && (
            <div className="max-w-7xl mx-auto p-3 md:p-4 lg:p-6">
              <AdaptiveDashboard
                weekData={mockData}
                goals={[]}
                hypotheses={[]}
                onInsightAction={(insight) => {
                  if (insight.metricId && insight.type === 'goal_suggestion') {
                    setCurrentView('areas');
                  } else if (insight.type === 'hypothesis_improvement') {
                    setCurrentView('strategy');
                  }
                }}
              />
            </div>
          )}
          {currentView === 'settings' && (
            <div className="max-w-7xl mx-auto p-3 md:p-4 lg:p-6">
              <Settings />
            </div>
          )}
          {selectedMetric && (
            <div className="max-w-7xl mx-auto p-3 md:p-4 lg:p-6">
              <MetricDetailView />
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <BottomNavigation
          items={navigationItems.map(item => ({
            ...item,
            isActive: currentView === item.id,
            onClick: () => {
              setCurrentView(item.id);
              setSelectedMetric(null);
            }
          }))}
        />
      )}
    </div>
  );
};

export default LifeQualityTracker;