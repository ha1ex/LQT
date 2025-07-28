import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { BottomNavigation } from '@/components/ui/bottom-navigation';
import { MobileHeader } from '@/components/ui/mobile-header';
import { useMobile } from '@/hooks/use-mobile';
import { 
  Home, BarChart3, Target, TrendingUp, Search, Bell, Settings, 
  Heart, Dumbbell, Brain, Users, DollarSign, Briefcase, 
  Star, ChevronRight, Plus, Minus, Calendar, Clock,
  Activity, Zap, Sun, Moon, Coffee, Book, Music, Camera,
  Award, Trophy, Flame, CheckCircle, XCircle, ArrowUp, ArrowDown,
  MoreHorizontal, Filter, RefreshCw, Share2, Download, Menu,
  ChevronLeft, ChevronDown, Eye, Edit, Delete, Lightbulb,
  Calendar as CalendarIcon, Smile, Meh, Frown, Angry, Laugh,
  X, Sparkles, ArrowLeft
} from 'lucide-react';
import { 
  LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, BarChart as RechartsBarChart, 
  Bar, Pie, Cell, Area, AreaChart 
} from 'recharts';

// Новые компоненты для улучшенного UX
import CategoryBadge from './tracker/CategoryBadge';
import StreakSystem from './tracker/StreakSystem';
import QuickEmojiRating from './tracker/QuickEmojiRating';
import Breadcrumbs from './tracker/Breadcrumbs';
import WeeklyInsights from './tracker/WeeklyInsights';
import CorrelationAnalysis from './tracker/CorrelationAnalysis';
import MetricNotes from './tracker/MetricNotes';
import PersonalRecommendations from './tracker/PersonalRecommendations';
import PersonalInsights from './tracker/PersonalInsights';
import PersonalGoals from './tracker/PersonalGoals';
import { StrategyDashboard, HypothesisWizard, HypothesisDetail } from './strategy';
import { AdaptiveDashboard, AIWelcomeWizard } from './ai';
import { WeeklyRatingCalendar, WeekDetailModal, RatingAnalytics } from './rating';
import { ProblemAreas, WeeklyProgress, Strengths, AIRecommendations } from './dashboard';
import { useWeeklyRatings } from '@/hooks/useWeeklyRatings';
import { useGlobalData } from '@/contexts/GlobalDataProvider';
import { DemoModeToggle } from '@/components/ui/demo-mode-toggle';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { EmptyStateView } from '@/components/ui/empty-state-view';
import { adaptWeeklyRatingsToMockData, filterDataByPeriod, BASE_METRICS } from '@/utils/dataAdapter';

const LifeQualityTracker = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [timeFilter, setTimeFilter] = useState('month');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [useQuickRating, setUseQuickRating] = useState(false);
  const [weekRatings, setWeekRatings] = useState({});
  const [metricNotes, setMetricNotes] = useState({});
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [animationDelay, setAnimationDelay] = useState(0);
  const [customMetrics, setCustomMetrics] = useState([]);
  const [isAddingMetric, setIsAddingMetric] = useState(false);
  const [newMetricName, setNewMetricName] = useState('');
  const [newMetricDescription, setNewMetricDescription] = useState('');
  const [currentStreak, setCurrentStreak] = useState(5);
  const [bestStreak, setBestStreak] = useState(12);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [strategyView, setStrategyView] = useState<'dashboard' | 'create' | 'detail'>('dashboard');
  const [selectedHypothesisId, setSelectedHypothesisId] = useState<string | null>(null);
  const [selectedWeekRating, setSelectedWeekRating] = useState(null);
  const [isWeekModalOpen, setIsWeekModalOpen] = useState(false);
  const [ratingTab, setRatingTab] = useState('current');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showAIWelcome, setShowAIWelcome] = useState(false);
  const isMobile = useMobile();
  
  // Global data management
  const { appState, syncStatus, generateDemoData, toggleDemoMode } = useGlobalData();
  
  // Weekly ratings hook
  const {
    ratings: weeklyRatings,
    currentWeek,
    getCurrentWeekRating,
    updateMetricRating,
    getAnalytics,
    goToWeek,
    generateTestData
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
  
  // Базовые метрики с иконками и описаниями
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

  // Объединяем базовые и кастомные метрики
  const allMetrics = [...baseMetrics, ...customMetrics];

  // Функция для генерации инсайтов
  const generateWeeklyInsights = () => {
    return [
      {
        type: 'improvement' as const,
        title: 'Отличный прогресс!',
        description: 'Ваше физическое здоровье улучшилось на 2 балла за неделю',
        metric: 'Физическое здоровье',
        change: 2.0
      },
      {
        type: 'recommendation' as const,
        title: 'Обратите внимание',
        description: 'Финансовая подушка требует больше внимания. Попробуйте составить план накоплений',
        metric: 'Финансовая подушка'
      },
      {
        type: 'achievement' as const,
        title: 'Достижение!',
        description: 'Вы поддерживаете стрик уже 5 недель подряд',
      }
    ];
  };

  // Функция для расчета корреляции Пирсона
  const calculatePearsonCorrelation = (x: number[], y: number[]): number => {
    if (x.length !== y.length || x.length === 0) return 0;
    
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((total, xi, i) => total + xi * y[i], 0);
    const sumXX = x.reduce((total, xi) => total + xi * xi, 0);
    const sumYY = y.reduce((total, yi) => total + yi * yi, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
    
    return denominator === 0 ? 0 : Math.max(-1, Math.min(1, numerator / denominator));
  };

  // Функция для получения отфильтрованных данных
  const getFilteredData = (filter: string) => {
    return filterDataByPeriod(mockData, filter);
  };

  // Функция для динамического расчета общего индекса
  const calculateOverallIndex = (weekData: any, metrics: any[]) => {
    if (!weekData || typeof weekData !== 'object') return 0;
    
    const values = metrics
      .map(metric => weekData[metric.name])
      .filter(value => typeof value === 'number' && value !== null && value !== undefined);
    
    return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
  };

  // Адаптированные данные из GlobalDataProvider
  const mockData = useMemo(() => {
    return adaptWeeklyRatingsToMockData(weeklyRatings, appState);
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
          
          const values1 = mockData.map(week => week && week[metric1.name] ? week[metric1.name] : 0);
          const values2 = mockData.map(week => week && week[metric2.name] ? week[metric2.name] : 0);
          
          // Проверяем наличие достаточного количества данных
          if (values1.length >= 3 && values2.length >= 3) {
            const correlation = calculatePearsonCorrelation(values1, values2);
            
            // Добавляем только значимые корреляции (|r| > 0.4)
            if (Math.abs(correlation) > 0.4) {
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
    const targetValues = mockData.map(week => week && week[targetMetric] ? week[targetMetric] : 0);
    const correlations = allMetrics
      .filter(metric => metric.name !== targetMetric)
      .map(metric => {
        const metricValues = mockData.map(week => week && week[metric.name] ? week[metric.name] : 0);
        
        // Проверяем наличие достаточного количества данных
        if (metricValues.length >= 3 && targetValues.length >= 3) {
          const correlation = calculatePearsonCorrelation(targetValues, metricValues);
          
          return {
            metric: metric.name,
            correlation: parseFloat(correlation.toFixed(2)),
            strength: Math.abs(correlation) > 0.7 ? 'strong' as const : 
                     Math.abs(correlation) > 0.4 ? 'moderate' as const : 'weak' as const
          };
        }
        
        return null;
      })
      .filter(item => item !== null && Math.abs(item.correlation) > 0.3) // Фильтруем слабые корреляции
      .sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation)) // Сортируем по силе
      .slice(0, 5); // Берем топ-5
    
    return correlations;
  }, [allMetrics, mockData]);

  // Функция для получения цвета по значению (только функциональные цвета)
  const getScoreColor = (value) => {
    if (value >= 8) return 'text-green-600';
    if (value >= 6) return 'text-yellow-600';
    if (value >= 4) return 'text-gray-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (value) => {
    if (value >= 8) return 'bg-green-50 border-green-200';
    if (value >= 6) return 'bg-yellow-50 border-yellow-200';
    if (value >= 4) return 'bg-gray-50 border-gray-200';
    return 'bg-red-50 border-red-200';
  };

  // Функции для управления кастомными метриками
  const addCustomMetric = () => {
    if (newMetricName.trim() && newMetricDescription.trim()) {
      const newMetric = {
        id: `custom_${Date.now()}`,
        name: newMetricName.trim(),
        icon: '⭐',
        description: newMetricDescription.trim(),
        category: 'custom',
        isCustom: true
      };
      setCustomMetrics(prev => [...prev, newMetric]);
      setNewMetricName('');
      setNewMetricDescription('');
      setIsAddingMetric(false);
    }
  };

  const removeCustomMetric = (metricId: string) => {
    setCustomMetrics(prev => prev.filter(m => m.id !== metricId));
    // Удаляем оценку если была
    setWeekRatings(prev => {
      const metric = allMetrics.find(m => m.id === metricId);
      if (metric) {
        const newRatings = { ...prev };
        delete newRatings[metric.name];
        return newRatings;
      }
      return prev;
    });
  };

  // Компонент для ввода рейтинга с улучшенным UX и категориями
  const RatingInput = ({ metric, value, onChange, onRemove, delay = 0, isCompleted = false }) => {
    return (
      <div 
        className={`bg-card rounded-xl p-4 shadow-soft border transition-all duration-500 animate-fade-in ${
          isCompleted 
            ? 'border-success/30 bg-success/5 opacity-90' 
            : 'border-border hover:shadow-medium hover:border-primary/30'
        }`}
        style={{ animationDelay: `${delay}ms` }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 flex-1">
            <div className={`text-xl transition-all duration-300 ${isCompleted ? 'grayscale-0' : ''}`}>
              {metric.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className={`font-medium text-sm leading-tight transition-colors ${isCompleted ? 'text-success' : 'text-foreground'}`}>
                  {metric.name}
                </h3>
                {isCompleted && <span className="text-xs bg-success/20 text-success px-1.5 py-0.5 rounded-full">✓</span>}
              </div>
              <div className="flex items-center gap-1 mb-1">
                <CategoryBadge category={metric.category} />
              </div>
              <p className="text-xs text-muted-foreground line-clamp-1">{metric.description}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 ml-2">
            <div className={`text-2xl font-bold ${value ? getScoreColor(value) : 'text-muted-foreground'}`}>
              {value || '—'}
            </div>
            {metric.isCustom && onRemove && (
              <button
                onClick={() => onRemove(metric.id)}
                className="w-6 h-6 rounded-full bg-error/10 text-error hover:bg-error/20 transition-colors flex items-center justify-center"
                title="Удалить критерий"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
        
        {useQuickRating ? (
          <QuickEmojiRating
            value={value}
            onChange={(rating) => onChange(metric.name, rating)}
            disabled={isCompleted && value !== null}
          />
        ) : (
          <div className="grid grid-cols-5 gap-2">
            {[1,2,3,4,5,6,7,8,9,10].map(num => (
              <button
                key={num}
                onClick={() => onChange(metric.name, num)}
                disabled={isCompleted && value !== num}
                className={`rating-button ${
                  value === num ? 'selected' : 'unselected'
                } ${isCompleted && value !== null ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                <span className="relative z-10">{num}</span>
                {value === num && (
                  <div className="absolute inset-0 bg-white/20 rounded-xl animate-pulse" />
                )}
              </button>
            ))}
          </div>
        )}
        
        {value && (
          <MetricNotes
            metricName={metric.name}
            currentNote={metricNotes[metric.name] || ''}
            onSaveNote={(note) => setMetricNotes(prev => ({ ...prev, [metric.name]: note }))}
          />
        )}
      </div>
    );
  };

  // Sidebar компонент для веб интерфейса
  const Sidebar = () => {
    const navigationItems = [
      { id: 'dashboard', label: 'Dashboard', icon: Home },
      { id: 'strategy', label: 'Стратегия', icon: Lightbulb },
      { id: 'ai', label: 'AI Coach', icon: Brain },
      { id: 'analytics', label: 'Аналитика', icon: BarChart3 },
      { id: 'rate', label: 'Оценка', icon: Calendar },
      { id: 'insights', label: 'Инсайты', icon: Activity },
    ];

    return (
      <div className={`bg-card border-r border-border h-screen sticky top-0 transition-all duration-300 ${
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

        {/* Навигация */}
        <nav className="p-4 space-y-2">
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
          <div className="p-4 mt-6 space-y-4">
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
            onSearch={(query) => console.log('Search:', query)}
          >
            <Sidebar />
          </MobileHeader>
          
          {/* Mobile Demo Toggle */}
          <div className="bg-card border-b border-border p-3">
            <DemoModeToggle />
          </div>
        </div>
      );
    }
    
    return (
      <div className="bg-card border-b border-border p-4 lg:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Dashboard</h2>
            <p className="text-muted-foreground">
              {latestWeek ? latestWeek.date : 'Данные отсутствуют'}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Demo Mode Toggle */}
            <DemoModeToggle />
            
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

  // Dashboard для веб интерфейса
  const DashboardView = () => {
    // Показываем пустое состояние если нет данных
    if (appState.userState === 'empty' || mockData.length === 0) {
      return (
        <EmptyStateView
          onGetStarted={() => setCurrentView('rate')}
          onViewDemo={() => {
            toggleDemoMode();
          }}
        />
      );
    }

    const latestWeek = mockData[mockData.length - 1];
    const prevWeek = mockData.length > 1 ? mockData[mockData.length - 2] : latestWeek;
    const weekChange = latestWeek.overall - prevWeek.overall;
    const filteredData = getFilteredData(timeFilter);
    
    const topMetrics = allMetrics
      .map(metric => ({
        ...metric,
        value: latestWeek[metric.name] || 0,
        change: (latestWeek[metric.name] || 0) - (prevWeek[metric.name] || 0)
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    return (
      <div className="p-4 lg:p-6 space-y-6">
        {/* Enhanced Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ProblemAreas 
            allMetrics={allMetrics}
            currentWeekData={latestWeek}
            onMetricClick={(metricId) => {
              if (metricId === 'analytics') {
                setCurrentView('analytics');
              } else {
                setSelectedMetric(allMetrics.find(m => m.id === metricId)?.name || null);
                setCurrentView('analytics');
              }
            }}
          />

          <WeeklyProgress 
            mockData={mockData}
            onViewHistory={() => setCurrentView('rating')}
          />

          <Strengths 
            allMetrics={allMetrics}
            currentWeekData={latestWeek}
            onMetricClick={(metricId) => {
              setSelectedMetric(allMetrics.find(m => m.id === metricId)?.name || null);
              setCurrentView('analytics');
            }}
          />

          <AIRecommendations 
            allMetrics={allMetrics}
            currentWeekData={latestWeek}
            onOpenAIChat={() => setCurrentView('ai')}
          />
        </div>

        {/* Premium Chart Section */}
        <div className="card-premium p-8 animate-fade-in">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Динамика общего индекса</h3>
              <p className="text-sm text-muted-foreground">Отслеживание прогресса по времени</p>
            </div>
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
          </div>
          <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl p-6 shadow-inner">
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={filteredData}>
                <defs>
                  <linearGradient id="overallGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(217 91% 60%)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(217 91% 60%)" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="week" className="text-muted-foreground text-sm" />
                <YAxis domain={[0, 10]} className="text-muted-foreground text-sm" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: 'none',
                    borderRadius: '16px',
                    boxShadow: 'var(--shadow-lg)'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="overall"
                  stroke="hsl(217 91% 60%)"
                  fillOpacity={1}
                  fill="url(#overallGradient)"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Оптимизированная секция дашборда */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Лучшие метрики - расширенный блок */}
          <div className="lg:col-span-2 card-premium p-8 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">Лучшие метрики</h3>
                <p className="text-sm text-muted-foreground">Ваши сильные стороны на этой неделе</p>
              </div>
              <div className="btn-icon bg-primary/10">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topMetrics.map((metric, index) => (
                <div 
                  key={metric.id}
                  className="group flex items-center justify-between p-4 rounded-xl hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent transition-all duration-300 cursor-pointer border border-transparent hover:border-primary/10 animate-fade-in"
                  onClick={() => {
                    setSelectedMetric(metric.name);
                    setCurrentView('analytics');
                  }}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-2xl group-hover:scale-110 transition-transform duration-200">
                      {metric.icon}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground mb-1">{metric.name}</div>
                      <CategoryBadge category={metric.category} />
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-foreground mb-1">
                      {metric.value.toFixed(1)}
                    </div>
                    <div className={`text-sm font-semibold ${metric.change >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {metric.change >= 0 ? '+' : ''}{metric.change.toFixed(1)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Краткие инсайты - компактный блок */}
          <div className="card-premium p-6 animate-slide-up" style={{animationDelay: '0.2s'}}>
            <div className="flex items-center gap-3 mb-4">
              <div className="btn-icon bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
                <Lightbulb className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Инсайты недели</h3>
            </div>
            <div className="space-y-3">
              {generateWeeklyInsights().slice(0, 3).map((insight, index) => (
                <div key={index} className="p-3 bg-gradient-to-r from-slate-50 to-transparent rounded-lg border border-slate-100">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {typeof insight === 'string' ? insight : insight.description || insight.title || ''}
                  </p>
                </div>
              ))}
            </div>
            <button 
              onClick={() => setCurrentView('insights')}
              className="w-full mt-4 btn-modern text-sm"
            >
              Все инсайты →
            </button>
          </div>
        </div>
        
        {/* Персональные блоки */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Персональные рекомендации */}
          <PersonalRecommendations 
            metrics={allMetrics}
            data={mockData}
            className="animate-slide-up"
          />

          {/* Ваши инсайты (корреляции) */}
          <PersonalInsights 
            metrics={allMetrics}
            data={mockData}
            className="animate-slide-up"
          />

          {/* Ваши цели */}
          <PersonalGoals 
            metrics={allMetrics}
            data={mockData}
            className="animate-slide-up"
          />
        </div>
        
      </div>
    );
  };

  // Компактный обзор областей для интеграции в аналитику
  const CompactAreasOverview = () => {
    const categories = {
      mental: { name: 'Ментальное', icon: '🧠', color: 'primary' },
      health: { name: 'Здоровье', icon: '💪', color: 'success' },
      relationships: { name: 'Отношения', icon: '❤️', color: 'warning' },
      finance: { name: 'Финансы', icon: '💰', color: 'secondary' },
      social: { name: 'Социальное', icon: '🤝', color: 'info' },
      personal: { name: 'Личное', icon: '🎯', color: 'accent' },
      lifestyle: { name: 'Образ жизни', icon: '✈️', color: 'muted' }
    };

    const latestWeek = mockData.length > 0 ? mockData[mockData.length - 1] : {};

    return (
      <div className="card-premium p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-foreground mb-2">Области жизни</h3>
            <p className="text-sm text-muted-foreground">Быстрый переход к анализу по категориям</p>
          </div>
          <div className="btn-icon bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
            <Target className="w-5 h-5" />
          </div>
        </div>
        
        {/* Компактная сетка областей */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {Object.entries(categories).map(([key, category]) => {
            const categoryMetrics = allMetrics.filter(m => m.category === key);
            const avgScore = categoryMetrics.length > 0 && latestWeek
              ? categoryMetrics.reduce((sum, m) => sum + (latestWeek[m.name] || 0), 0) / categoryMetrics.length 
              : 0;

            const isActive = categoryFilter === key;

            return (
              <button
                key={key}
                onClick={() => {
                  setCategoryFilter(isActive ? 'all' : key);
                }}
                className={`group flex flex-col items-center p-4 rounded-xl transition-all duration-200 border-2 ${
                  isActive 
                    ? 'bg-primary/10 border-primary/30 shadow-lg scale-105' 
                    : 'bg-card border-border hover:border-primary/20 hover:bg-primary/5'
                }`}
              >
                <div className={`text-2xl mb-2 transition-transform duration-200 ${
                  isActive ? 'scale-110' : 'group-hover:scale-105'
                }`}>
                  {category.icon}
                </div>
                <div className={`text-xl font-bold mb-1 ${getScoreColor(avgScore)} ${
                  isActive ? 'text-primary' : ''
                }`}>
                  {avgScore.toFixed(1)}
                </div>
                <div className="text-xs text-center text-muted-foreground font-medium">
                  {category.name}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {categoryMetrics.length} метрик
                </div>
              </button>
            );
          })}
        </div>
        
        {/* Индикатор активного фильтра */}
        {categoryFilter !== 'all' && (
          <div className="mt-4 flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2">
              <div className="text-sm font-medium text-primary">
                Фильтр: {categories[categoryFilter]?.name}
              </div>
              <Badge variant="secondary" className="text-xs">
                {allMetrics.filter(m => m.category === categoryFilter).length} метрик
              </Badge>
            </div>
            <button
              onClick={() => setCategoryFilter('all')}
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              Сбросить фильтр
            </button>
          </div>
        )}
      </div>
    );
  };

  // Аналитика для веб интерфейса
  const AnalyticsView = () => {
    const filteredData = getFilteredData(timeFilter);
    
    return (
      <div className="p-4 lg:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Аналитика</h2>
          <div className="flex gap-2">
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="week">1 неделя</option>
              <option value="month">1 месяц</option>
              <option value="quarter">3 месяца</option>
              <option value="year">1 год</option>
            </select>
          </div>
        </div>

        {/* Компактный обзор областей */}
        <CompactAreasOverview />

        {/* Детальные графики */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {allMetrics
            .filter(metric => categoryFilter === 'all' || metric.category === categoryFilter)
            .map(metric => (
              <div key={metric.id} className="bg-card rounded-xl p-6 border border-border">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-xl">{metric.icon}</div>
                    <div>
                      <h3 className="font-semibold">{metric.name}</h3>
                      <CategoryBadge category={metric.category} />
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedMetric(metric.name)}
                    className="text-primary hover:text-primary/80 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
                
                <ResponsiveContainer width="100%" height={200}>
                  <RechartsLineChart data={filteredData}>
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
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
                    />
               </RechartsLineChart>
                </ResponsiveContainer>
              </div>
            ))}
        </div>
      </div>
    );
  };

  // RatingView с календарной системой
  const RatingView = () => {
    const currentWeekRating = getCurrentWeekRating();
    
    const handleRatingChange = (metricName, rating) => {
      const metric = allMetrics.find(m => m.name === metricName);
      if (metric) {
        updateMetricRating(currentWeek, metric.id, rating);
      }
    };

    const handleWeekSelect = (rating) => {
      setSelectedWeekRating(rating);
      setIsWeekModalOpen(true);
    };

    const completedMetrics = allMetrics.filter(metric => 
      currentWeekRating?.ratings[metric.id] !== undefined
    );
    const pendingMetrics = allMetrics.filter(metric => 
      currentWeekRating?.ratings[metric.id] === undefined
    );

    return (
      <div className="space-y-6">
        {/* Header with test data button */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Еженедельная оценка</h2>
          <Button onClick={generateTestData} variant="outline" size="sm">
            Тестовые данные (20 недель)
          </Button>
        </div>

        <Tabs value={ratingTab} onValueChange={setRatingTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="current">Текущая неделя</TabsTrigger>
            <TabsTrigger value="calendar">Календарь</TabsTrigger>
            <TabsTrigger value="analytics">Аналитика</TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="space-y-6">
        {/* Прогресс */}
        <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl p-6 border border-primary/10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Прогресс оценки</h3>
              <p className="text-sm text-muted-foreground">
                {completedMetrics.length} из {allMetrics.length} метрик оценено
              </p>
            </div>
            <div className="text-2xl font-bold text-primary">
              {Math.round((completedMetrics.length / allMetrics.length) * 100)}%
            </div>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(completedMetrics.length / allMetrics.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Настройки */}
        <div className="flex items-center justify-between p-4 bg-card rounded-xl border border-border">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="font-medium">Быстрая оценка эмодзи</span>
          </div>
          <button
            onClick={() => setUseQuickRating(!useQuickRating)}
            className={`w-12 h-6 rounded-full transition-colors relative ${
              useQuickRating ? 'bg-primary' : 'bg-muted'
            }`}
          >
            <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
              useQuickRating ? 'translate-x-6' : 'translate-x-0.5'
            }`} />
          </button>
        </div>

        {/* Ожидающие оценки */}
        {pendingMetrics.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <div className="w-2 h-2 bg-warning rounded-full"></div>
              Ожидающие оценки
              <span className="text-sm text-muted-foreground">({pendingMetrics.length})</span>
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {pendingMetrics.map((metric, index) => (
                <RatingInput
                  key={metric.id}
                  metric={metric}
                  value={currentWeekRating?.ratings[metric.id]}
                  onChange={handleRatingChange}
                  onRemove={metric.isCustom ? removeCustomMetric : null}
                  delay={index * 50}
                />
              ))}
            </div>
          </div>
        )}

        {/* Добавление нового критерия */}
        <div className="space-y-4">
          {!isAddingMetric ? (
            <button
              onClick={() => setIsAddingMetric(true)}
              className="w-full border-2 border-dashed border-muted-foreground/30 rounded-xl p-6 text-muted-foreground hover:border-primary/50 hover:text-primary transition-all duration-300 group"
            >
              <div className="flex items-center justify-center gap-2">
                <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Добавить критерий</span>
              </div>
            </button>
          ) : (
            <div className="bg-card rounded-xl p-6 shadow-soft border border-border space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Новый критерий</h3>
                <button
                  onClick={() => {
                    setIsAddingMetric(false);
                    setNewMetricName('');
                    setNewMetricDescription('');
                  }}
                  className="w-8 h-8 rounded-full bg-muted hover:bg-muted/80 transition-colors flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Название критерия"
                  value={newMetricName}
                  onChange={(e) => setNewMetricName(e.target.value)}
                  className="px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                />
                <input
                  type="text"
                  placeholder="Описание критерия"
                  value={newMetricDescription}
                  onChange={(e) => setNewMetricDescription(e.target.value)}
                  className="px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setIsAddingMetric(false);
                    setNewMetricName('');
                    setNewMetricDescription('');
                  }}
                  className="flex-1 px-4 py-3 rounded-xl border border-border text-muted-foreground hover:bg-muted/50 transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={addCustomMetric}
                  disabled={!newMetricName.trim() || !newMetricDescription.trim()}
                  className="flex-1 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Добавить
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Завершенные критерии */}
        {completedMetrics.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              Завершенные
              <span className="text-sm text-muted-foreground">({completedMetrics.length})</span>
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {completedMetrics.map((metric, index) => (
                <RatingInput
                  key={metric.id}
                  metric={metric}
                  value={currentWeekRating?.ratings[metric.id]}
                  onChange={handleRatingChange}
                  onRemove={metric.isCustom ? removeCustomMetric : null}
                  delay={index * 50}
                  isCompleted={true}
                />
              ))}
            </div>
          </div>
        )}
          </TabsContent>

          <TabsContent value="calendar">
            <WeeklyRatingCalendar
              ratings={weeklyRatings}
              selectedDate={currentWeek}
              onDateSelect={goToWeek}
              onWeekSelect={handleWeekSelect}
            />
          </TabsContent>

          <TabsContent value="analytics">
            <RatingAnalytics
              analytics={getAnalytics()}
              allMetrics={allMetrics}
            />
          </TabsContent>
        </Tabs>

        <WeekDetailModal
          isOpen={isWeekModalOpen}
          onClose={() => setIsWeekModalOpen(false)}
          rating={selectedWeekRating}
          onSave={(updatedRating) => {
            // Handle save logic here
            setIsWeekModalOpen(false);
          }}
          allMetrics={allMetrics}
        />
      </div>
    );
  };

  // MetricDetailView для веб интерфейса
  const MetricDetailView = () => {
    const metric = allMetrics.find(m => m.name === selectedMetric);
    if (!metric) return null;

    const metricData = mockData.map(week => ({
      ...week,
      value: week[metric.name] || 0
    }));

    const latestValue = metricData[metricData.length - 1].value;
    const prevValue = metricData[metricData.length - 2].value;
    const change = latestValue - prevValue;

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
          <h3 className="text-lg font-semibold mb-4">Динамика за период</h3>
          <ResponsiveContainer width="100%" height={400}>
            <RechartsLineChart data={metricData}>
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
                dataKey="value"
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

  // Обновленный AreasView для веб интерфейса
  const AreasView = () => {
    const categories = {
      mental: { name: 'Ментальное', icon: '🧠', color: 'primary' },
      health: { name: 'Здоровье', icon: '💪', color: 'success' },
      relationships: { name: 'Отношения', icon: '❤️', color: 'warning' },
      finance: { name: 'Финансы', icon: '💰', color: 'secondary' },
      social: { name: 'Социальное', icon: '🤝', color: 'info' },
      personal: { name: 'Личное', icon: '🎯', color: 'accent' },
      lifestyle: { name: 'Образ жизни', icon: '✈️', color: 'muted' }
    };

    const latestWeek = mockData[mockData.length - 1];

    return (
      <div className="p-4 lg:p-6 space-y-6">
        <h2 className="text-2xl font-bold">Области жизни</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(categories).map(([key, category]) => {
            const categoryMetrics = allMetrics.filter(m => m.category === key);
            const avgScore = categoryMetrics.length > 0 
              ? categoryMetrics.reduce((sum, m) => sum + (latestWeek[m.name] || 0), 0) / categoryMetrics.length 
              : 0;

            return (
              <div 
                key={key}
                className="bg-card rounded-xl p-6 border border-border hover:shadow-md transition-all cursor-pointer"
                onClick={() => {
                  setCategoryFilter(key);
                  setCurrentView('analytics');
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-2xl">{category.icon}</div>
                  <div>
                    <h3 className="font-semibold">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">{categoryMetrics.length} метрик</p>
                  </div>
                </div>
                
                <div className={`text-3xl font-bold mb-2 ${getScoreColor(avgScore)}`}>
                  {avgScore.toFixed(1)}
                </div>
                
                <div className="space-y-2">
                  {categoryMetrics.slice(0, 3).map(metric => (
                    <div key={metric.id} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{metric.name}</span>
                      <span className={`font-medium ${getScoreColor(latestWeek[metric.name] || 0)}`}>
                        {(latestWeek[metric.name] || 0).toFixed(1)}
                      </span>
                    </div>
                  ))}
                  {categoryMetrics.length > 3 && (
                    <div className="text-xs text-muted-foreground text-center pt-2">
                      +{categoryMetrics.length - 3} еще
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Оптимизированная навигация для мобильных (5 основных разделов)
  const navigationItems = [
    { id: 'dashboard', label: 'Обзор', icon: Home },
    { id: 'rate', label: 'Оценка', icon: Sparkles },
    { id: 'analytics', label: 'Аналитика', icon: TrendingUp },
    { id: 'strategy', label: 'Стратегия', icon: Lightbulb },
    { id: 'ai', label: 'AI Coach', icon: Brain },
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
          {currentView === 'dashboard' && <DashboardView />}
          {currentView === 'analytics' && <AnalyticsView />}
          {currentView === 'rate' && (
            <div className="p-3 md:p-4 lg:p-6">
              <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Оценка недели</h2>
              <div className="max-w-4xl">
                <RatingView />
              </div>
            </div>
          )}
          {currentView === 'insights' && (
            <div className="p-3 md:p-4 lg:p-6">
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
            <div className="p-3 md:p-4 lg:p-6">
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
            <div className="p-3 md:p-4 lg:p-6">
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
          {selectedMetric && (
            <div className="p-3 md:p-4 lg:p-6">
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