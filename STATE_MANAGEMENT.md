# Управление состоянием приложения

## Обзор

Система управления состоянием построена на React Context API с использованием кастомных хуков для специфичных доменов данных, обеспечивая централизованное и типизированное управление данными.

## Архитектура состояния

### 1. Глобальный контекст

#### GlobalDataProvider (`src/contexts/GlobalDataProvider.tsx`)
**Назначение**: Центральный провайдер для управления состоянием всего приложения

**Структура состояния**:
```typescript
interface GlobalDataContextType {
  // Состояние приложения
  appState: AppDataState;
  syncStatus: DataSyncStatus;
  
  // Данные
  hypotheses: EnhancedHypothesis[];
  weeklyRatings: WeeklyRatingData;
  subjects: Subject[];
  
  // Методы управления
  toggleDemoMode: () => Promise<void>;
  clearAllData: () => Promise<void>;
  generateDemoData: () => Promise<void>;
  refreshData: () => Promise<void>;
}
```

**Состояние приложения**:
```typescript
interface AppDataState {
  userState: UserState; // 'empty' | 'demo' | 'real_data'
  isDemoMode: boolean;
  hasData: boolean;
  lastDataSync: Date | null;
}
```

**Статус синхронизации**:
```typescript
interface DataSyncStatus {
  isLoading: boolean;
  lastSync: Date | null;
  sections: DataSection;
}

interface DataSection {
  hypotheses: boolean;
  weeklyRatings: boolean;
  subjects: boolean;
  aiInsights: boolean;
  goals: boolean;
}
```

#### Реализация провайдера
```typescript
export const GlobalDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Локальное состояние
  const [appState, setAppState] = useState<AppDataState>({
    userState: 'empty',
    isDemoMode: false,
    hasData: false,
    lastDataSync: null
  });
  
  const [syncStatus, setSyncStatus] = useState<DataSyncStatus>({
    isLoading: false,
    lastSync: null,
    sections: {
      hypotheses: false,
      weeklyRatings: false,
      subjects: false,
      aiInsights: false,
      goals: false
    }
  });
  
  // Подключение к хукам данных
  const { hypotheses, isLoading: hypothesesLoading, refreshData: refreshHypotheses } = useEnhancedHypotheses();
  const { ratings: weeklyRatings, isLoading: ratingsLoading, generateTestData: generateRatingsData } = useWeeklyRatings();
  const { subjects, refreshData: refreshSubjects, generateTestData: generateSubjectsData } = useSubjects();
  
  // Определение состояния пользователя
  const determineUserState = useCallback((): UserState => {
    const hasHypotheses = hypotheses.length > 0;
    const hasRatings = Object.keys(weeklyRatings).length > 0;
    const hasSubjects = subjects.length > 0;
    
    if (appState.isDemoMode) {
      return 'demo';
    }
    
    if (hasHypotheses || hasRatings || hasSubjects) {
      return 'real_data';
    }
    
    return 'empty';
  }, [hypotheses, weeklyRatings, subjects, appState.isDemoMode]);
  
  // Обновление состояния при изменении данных
  useEffect(() => {
    const userState = determineUserState();
    const hasData = userState !== 'empty';
    
    setAppState(prev => ({
      ...prev,
      userState,
      hasData,
      lastDataSync: hasData ? new Date() : null
    }));
    
    setSyncStatus(prev => ({
      ...prev,
      isLoading: hypothesesLoading || ratingsLoading,
      sections: {
        hypotheses: hypotheses.length > 0,
        weeklyRatings: Object.keys(weeklyRatings).length > 0,
        subjects: subjects.length > 0,
        aiInsights: false, // TODO: Интеграция с ИИ
        goals: false // TODO: Интеграция с целями
      }
    }));
  }, [hypotheses, weeklyRatings, subjects, hypothesesLoading, ratingsLoading, determineUserState]);
  
  // Переключение демо-режима
  const toggleDemoMode = async () => {
    const newDemoMode = !appState.isDemoMode;
    
    if (newDemoMode) {
      // Включение демо-режима - генерация данных
      await generateDemoData();
    } else {
      // Выключение демо-режима - очистка демо-данных
      await clearAllData();
    }
    
    setAppState(prev => ({
      ...prev,
      isDemoMode: newDemoMode
    }));
  };
  
  // Очистка всех данных
  const clearAllData = async () => {
    localStorage.removeItem('life-quality-hypotheses');
    localStorage.removeItem('life-quality-subjects');
    localStorage.removeItem('weeklyRatings');
    localStorage.removeItem('aiInsights');
    
    // Обновление данных в хуках
    await Promise.all([
      refreshHypotheses(),
      refreshSubjects()
    ]);
  };
  
  // Генерация демо-данных
  const generateDemoData = async () => {
    await generateSubjectsData();
    await generateRatingsData();
    // generateHypothesesData(); // TODO: Добавить генерацию демо-гипотез
  };
  
  // Обновление данных
  const refreshData = async () => {
    setSyncStatus(prev => ({ ...prev, isLoading: true }));
    
    try {
      await Promise.all([
        refreshHypotheses(),
        refreshSubjects()
      ]);
      
      setSyncStatus(prev => ({
        ...prev,
        lastSync: new Date()
      }));
    } finally {
      setSyncStatus(prev => ({ ...prev, isLoading: false }));
    }
  };
  
  const contextValue: GlobalDataContextType = {
    appState,
    syncStatus,
    hypotheses,
    weeklyRatings,
    subjects,
    toggleDemoMode,
    clearAllData,
    generateDemoData,
    refreshData
  };
  
  return (
    <GlobalDataContext.Provider value={contextValue}>
      {children}
    </GlobalDataContext.Provider>
  );
};
```

### 2. Специализированные хуки состояния

#### useEnhancedHypotheses - управление гипотезами
```typescript
interface HypothesesState {
  hypotheses: EnhancedHypothesis[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

const useEnhancedHypotheses = () => {
  const [state, setState] = useState<HypothesesState>({
    hypotheses: [],
    isLoading: true,
    error: null,
    lastUpdated: null
  });
  
  // Загрузка из localStorage
  useEffect(() => {
    loadFromStorage();
  }, []);
  
  const loadFromStorage = () => {
    try {
      const stored = localStorage.getItem('life-quality-hypotheses');
      if (stored) {
        const data = JSON.parse(stored);
        const hypotheses = data.map((h: any) => ({
          ...h,
          createdAt: new Date(h.createdAt),
          updatedAt: new Date(h.updatedAt),
          experimentStartDate: new Date(h.experimentStartDate),
          weeklyProgress: h.weeklyProgress.map((w: any) => ({
            ...w,
            startDate: new Date(w.startDate),
            endDate: new Date(w.endDate),
            lastModified: w.lastModified ? new Date(w.lastModified) : undefined
          })),
          journal: h.journal.map((j: any) => ({
            ...j,
            date: new Date(j.date)
          }))
        }));
        
        setState(prev => ({
          ...prev,
          hypotheses,
          lastUpdated: new Date(),
          isLoading: false
        }));
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Error loading hypotheses:', error);
      setState(prev => ({
        ...prev,
        error: 'Ошибка загрузки гипотез',
        isLoading: false
      }));
    }
  };
  
  const saveToStorage = (hypotheses: EnhancedHypothesis[]) => {
    try {
      localStorage.setItem('life-quality-hypotheses', JSON.stringify(hypotheses));
      setState(prev => ({ ...prev, lastUpdated: new Date(), error: null }));
    } catch (error) {
      console.error('Error saving hypotheses:', error);
      setState(prev => ({ ...prev, error: 'Ошибка сохранения' }));
    }
  };
  
  // Остальные методы...
  
  return {
    ...state,
    createHypothesis,
    updateHypothesis,
    deleteHypothesis,
    updateWeeklyRating,
    addJournalEntry,
    refreshData: loadFromStorage
  };
};
```

#### useWeeklyRatings - управление рейтингами
```typescript
interface WeeklyRatingsState {
  ratings: WeeklyRatingData;
  currentWeek: Date;
  isLoading: boolean;
  error: string | null;
}

const useWeeklyRatings = () => {
  const [state, setState] = useState<WeeklyRatingsState>({
    ratings: {},
    currentWeek: new Date(),
    isLoading: true,
    error: null
  });
  
  // Персистентность в localStorage
  useEffect(() => {
    loadRatingsFromStorage();
  }, []);
  
  const loadRatingsFromStorage = () => {
    try {
      const stored = localStorage.getItem('weeklyRatings');
      if (stored) {
        const parsed = JSON.parse(stored);
        const ratings: WeeklyRatingData = {};
        
        // Парсинг дат из строк
        Object.entries(parsed).forEach(([key, value]: [string, any]) => {
          ratings[key] = {
            ...value,
            startDate: new Date(value.startDate),
            endDate: new Date(value.endDate),
            createdAt: new Date(value.createdAt),
            updatedAt: new Date(value.updatedAt)
          };
        });
        
        setState(prev => ({ ...prev, ratings, isLoading: false }));
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Error loading ratings:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Ошибка загрузки рейтингов',
        isLoading: false 
      }));
    }
  };
  
  const saveToStorage = (newRatings: WeeklyRatingData) => {
    try {
      // Сериализация дат в строки для JSON
      const serializable = Object.entries(newRatings).reduce((acc, [key, rating]) => {
        acc[key] = {
          ...rating,
          startDate: rating.startDate.toISOString(),
          endDate: rating.endDate.toISOString(),
          createdAt: rating.createdAt.toISOString(),
          updatedAt: rating.updatedAt.toISOString()
        };
        return acc;
      }, {} as any);
      
      localStorage.setItem('weeklyRatings', JSON.stringify(serializable));
      setState(prev => ({ ...prev, ratings: newRatings, error: null }));
    } catch (error) {
      console.error('Error saving ratings:', error);
      setState(prev => ({ ...prev, error: 'Ошибка сохранения' }));
    }
  };
  
  // Остальные методы...
  
  return {
    ...state,
    updateWeekRating,
    updateMetricRating,
    getCurrentWeekRating,
    getAnalytics,
    goToNextWeek,
    goToPreviousWeek,
    goToCurrentWeek,
    goToWeek,
    generateTestData
  };
};
```

### 3. Локальное состояние компонентов

#### Состояние формы создания гипотезы
```typescript
interface HypothesisFormState {
  currentStep: number;
  formData: HypothesisFormData;
  validation: ValidationErrors;
  isSubmitting: boolean;
}

const useHypothesisForm = () => {
  const [state, setState] = useState<HypothesisFormState>({
    currentStep: 0,
    formData: createEmptyFormData(),
    validation: {},
    isSubmitting: false
  });
  
  const updateFormData = (field: keyof HypothesisFormData, value: any) => {
    setState(prev => ({
      ...prev,
      formData: { ...prev.formData, [field]: value },
      validation: { ...prev.validation, [field]: undefined } // Очистка ошибки
    }));
  };
  
  const validateStep = (step: number): boolean => {
    const errors = validateHypothesisStep(state.formData, step);
    setState(prev => ({ ...prev, validation: errors }));
    return Object.keys(errors).length === 0;
  };
  
  const nextStep = () => {
    if (validateStep(state.currentStep)) {
      setState(prev => ({ ...prev, currentStep: prev.currentStep + 1 }));
      return true;
    }
    return false;
  };
  
  const prevStep = () => {
    setState(prev => ({ 
      ...prev, 
      currentStep: Math.max(0, prev.currentStep - 1) 
    }));
  };
  
  return {
    ...state,
    updateFormData,
    validateStep,
    nextStep,
    prevStep,
    resetForm: () => setState({
      currentStep: 0,
      formData: createEmptyFormData(),
      validation: {},
      isSubmitting: false
    })
  };
};
```

#### Состояние UI компонентов
```typescript
// Состояние модального окна
const useModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<any>(null);
  
  const open = (modalData?: any) => {
    setData(modalData);
    setIsOpen(true);
  };
  
  const close = () => {
    setIsOpen(false);
    setData(null);
  };
  
  return { isOpen, data, open, close };
};

// Состояние фильтров
const useFilters = <T>() => {
  const [filters, setFilters] = useState<T>({} as T);
  
  const updateFilter = (key: keyof T, value: T[keyof T]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  
  const clearFilters = () => {
    setFilters({} as T);
  };
  
  const resetFilter = (key: keyof T) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  };
  
  return { filters, updateFilter, clearFilters, resetFilter };
};
```

## Паттерны управления состоянием

### 1. Reducer паттерн для сложного состояния
```typescript
interface AppState {
  user: UserState;
  ui: UIState;
  data: DataState;
}

type AppAction = 
  | { type: 'SET_USER_STATE'; payload: UserState }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'UPDATE_DATA'; payload: Partial<DataState> };

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_USER_STATE':
      return { ...state, user: action.payload };
      
    case 'SET_LOADING':
      return { 
        ...state, 
        ui: { ...state.ui, isLoading: action.payload } 
      };
      
    case 'SET_ERROR':
      return { 
        ...state, 
        ui: { ...state.ui, error: action.payload } 
      };
      
    case 'UPDATE_DATA':
      return { 
        ...state, 
        data: { ...state.data, ...action.payload } 
      };
      
    default:
      return state;
  }
};

const useAppReducer = () => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  const actions = {
    setUserState: (userState: UserState) => 
      dispatch({ type: 'SET_USER_STATE', payload: userState }),
    setLoading: (isLoading: boolean) => 
      dispatch({ type: 'SET_LOADING', payload: isLoading }),
    setError: (error: string | null) => 
      dispatch({ type: 'SET_ERROR', payload: error }),
    updateData: (data: Partial<DataState>) => 
      dispatch({ type: 'UPDATE_DATA', payload: data })
  };
  
  return { state, actions };
};
```

### 2. Составные хуки
```typescript
const useAppData = () => {
  const { hypotheses, createHypothesis } = useEnhancedHypotheses();
  const { ratings, updateWeekRating } = useWeeklyRatings();
  const { subjects } = useSubjects();
  const { insights, generateInsights } = useAIInsights();
  
  // Объединенная статистика
  const statistics = useMemo(() => ({
    totalHypotheses: hypotheses.length,
    activeHypotheses: hypotheses.filter(h => h.status === 'active').length,
    averageProgress: hypotheses.reduce((sum, h) => sum + h.progress, 0) / hypotheses.length || 0,
    totalRatings: Object.keys(ratings).length,
    totalSubjects: subjects.length,
    criticalInsights: insights.filter(i => i.importance === 'critical').length
  }), [hypotheses, ratings, subjects, insights]);
  
  // Объединенные действия
  const createHypothesisWithAnalysis = async (data: HypothesisFormData) => {
    const hypothesis = await createHypothesis(data);
    await generateInsights(); // Автоматическая генерация инсайтов
    return hypothesis;
  };
  
  return {
    // Данные
    hypotheses,
    ratings,
    subjects,
    insights,
    statistics,
    
    // Действия
    createHypothesisWithAnalysis,
    updateWeekRating,
    generateInsights
  };
};
```

### 3. Middleware паттерн
```typescript
interface StateMiddleware<T> {
  before?: (action: string, payload: any, state: T) => void;
  after?: (action: string, payload: any, oldState: T, newState: T) => void;
}

const createStateManager = <T>(
  initialState: T,
  middleware: StateMiddleware<T>[] = []
) => {
  const [state, setState] = useState<T>(initialState);
  
  const updateState = (action: string, updater: (prev: T) => T) => {
    setState(prevState => {
      // Before middleware
      middleware.forEach(m => m.before?.(action, updater, prevState));
      
      const newState = updater(prevState);
      
      // After middleware
      middleware.forEach(m => m.after?.(action, updater, prevState, newState));
      
      return newState;
    });
  };
  
  return { state, updateState };
};

// Логирование изменений состояния
const loggingMiddleware: StateMiddleware<any> = {
  before: (action, payload, state) => {
    console.log(`[${action}] Before:`, state);
  },
  after: (action, payload, oldState, newState) => {
    console.log(`[${action}] After:`, newState);
  }
};

// Сохранение в localStorage
const persistenceMiddleware: StateMiddleware<any> = {
  after: (action, payload, oldState, newState) => {
    if (action.includes('PERSIST')) {
      localStorage.setItem('appState', JSON.stringify(newState));
    }
  }
};
```

## Синхронизация данных

### 1. Стратегии синхронизации
```typescript
interface SyncStrategy {
  name: string;
  interval?: number;
  trigger?: 'manual' | 'auto' | 'onchange';
  validator?: (data: any) => boolean;
}

const useSyncManager = () => {
  const [syncStatus, setSyncStatus] = useState<{
    isActive: boolean;
    lastSync: Date | null;
    conflicts: any[];
  }>({
    isActive: false,
    lastSync: null,
    conflicts: []
  });
  
  const strategies: Record<string, SyncStrategy> = {
    localStorage: {
      name: 'LocalStorage',
      trigger: 'onchange',
      validator: (data) => typeof data === 'object'
    },
    cloud: {
      name: 'Cloud Sync',
      interval: 30000, // 30 секунд
      trigger: 'auto',
      validator: (data) => data && typeof data === 'object'
    }
  };
  
  const syncData = async (strategy: string, data: any) => {
    const config = strategies[strategy];
    if (!config) return false;
    
    if (config.validator && !config.validator(data)) {
      console.error(`Validation failed for strategy: ${strategy}`);
      return false;
    }
    
    setSyncStatus(prev => ({ ...prev, isActive: true }));
    
    try {
      switch (strategy) {
        case 'localStorage':
          await syncToLocalStorage(data);
          break;
        case 'cloud':
          await syncToCloud(data);
          break;
      }
      
      setSyncStatus(prev => ({
        ...prev,
        lastSync: new Date(),
        isActive: false
      }));
      
      return true;
    } catch (error) {
      console.error(`Sync failed for strategy: ${strategy}`, error);
      setSyncStatus(prev => ({ ...prev, isActive: false }));
      return false;
    }
  };
  
  return { syncStatus, syncData, strategies };
};
```

### 2. Конфликты и разрешение
```typescript
interface DataConflict {
  id: string;
  type: 'update' | 'delete' | 'create';
  localData: any;
  remoteData: any;
  timestamp: Date;
}

const useConflictResolution = () => {
  const [conflicts, setConflicts] = useState<DataConflict[]>([]);
  
  const detectConflicts = (localData: any, remoteData: any): DataConflict[] => {
    const conflicts: DataConflict[] = [];
    
    // Логика выявления конфликтов
    Object.keys(localData).forEach(key => {
      if (remoteData[key] && localData[key] !== remoteData[key]) {
        conflicts.push({
          id: generateId(),
          type: 'update',
          localData: localData[key],
          remoteData: remoteData[key],
          timestamp: new Date()
        });
      }
    });
    
    return conflicts;
  };
  
  const resolveConflict = (conflictId: string, resolution: 'local' | 'remote' | 'merge') => {
    setConflicts(prev => prev.filter(c => c.id !== conflictId));
    
    // Применение резолюции
    const conflict = conflicts.find(c => c.id === conflictId);
    if (!conflict) return;
    
    switch (resolution) {
      case 'local':
        return conflict.localData;
      case 'remote':
        return conflict.remoteData;
      case 'merge':
        return { ...conflict.remoteData, ...conflict.localData };
    }
  };
  
  return { conflicts, detectConflicts, resolveConflict };
};
```

## Оптимизация производительности

### 1. Селекторы и мемоизация
```typescript
// Селекторы для извлечения конкретных данных
const createHypothesesSelector = () => {
  return createSelector(
    (state: GlobalState) => state.hypotheses,
    (state: GlobalState) => state.filters,
    (hypotheses, filters) => {
      return hypotheses.filter(h => applyFilters(h, filters));
    }
  );
};

// Мемоизированные вычисления
const useStatistics = (hypotheses: EnhancedHypothesis[]) => {
  return useMemo(() => {
    return {
      total: hypotheses.length,
      active: hypotheses.filter(h => h.status === 'active').length,
      completed: hypotheses.filter(h => h.status === 'completed').length,
      averageProgress: hypotheses.reduce((sum, h) => sum + h.progress, 0) / hypotheses.length || 0
    };
  }, [hypotheses]);
};
```

### 2. Виртуализация больших списков
```typescript
const useVirtualizedList = <T>(items: T[], itemHeight: number) => {
  const [containerHeight, setContainerHeight] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );
    
    return items.slice(startIndex, endIndex).map((item, index) => ({
      item,
      index: startIndex + index,
      style: {
        position: 'absolute' as const,
        top: (startIndex + index) * itemHeight,
        height: itemHeight
      }
    }));
  }, [items, itemHeight, scrollTop, containerHeight]);
  
  return {
    visibleItems,
    totalHeight: items.length * itemHeight,
    setContainerHeight,
    setScrollTop
  };
};
```

### 3. Lazy loading и кеширование
```typescript
const useLazyLoad = <T>(
  fetchData: () => Promise<T>,
  deps: any[] = []
) => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const loadData = useCallback(async () => {
    if (isLoaded || isLoading) return;
    
    setIsLoading(true);
    try {
      const result = await fetchData();
      setData(result);
      setIsLoaded(true);
    } catch (error) {
      console.error('Lazy load error:', error);
    } finally {
      setIsLoading(false);
    }
  }, deps);
  
  return { data, isLoading, isLoaded, loadData };
};

// Кеширование вычислений
const useComputedCache = <T, R>(
  computeFn: (data: T) => R,
  data: T,
  cacheKey?: string
) => {
  const cache = useRef<Map<string, { result: R; timestamp: number }>>(new Map());
  
  return useMemo(() => {
    const key = cacheKey || JSON.stringify(data);
    const cached = cache.current.get(key);
    
    // Проверка актуальности кеша (5 минут)
    if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
      return cached.result;
    }
    
    const result = computeFn(data);
    cache.current.set(key, { result, timestamp: Date.now() });
    
    return result;
  }, [data, computeFn, cacheKey]);
};
```

## Отладка и мониторинг состояния

### 1. DevTools интеграция
```typescript
const useStateDebugger = <T>(state: T, name: string) => {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.group(`State Debug: ${name}`);
      console.log('Current State:', state);
      console.trace('State Update');
      console.groupEnd();
    }
  }, [state, name]);
  
  return state;
};

// Логирование изменений состояния
const useStateLogger = <T>(state: T, stateName: string) => {
  const prevState = useRef<T>();
  
  useEffect(() => {
    if (prevState.current !== undefined) {
      console.log(`[${stateName}] State changed:`, {
        from: prevState.current,
        to: state,
        timestamp: new Date().toISOString()
      });
    }
    prevState.current = state;
  }, [state, stateName]);
};
```

### 2. Метрики производительности
```typescript
const usePerformanceMetrics = () => {
  const [metrics, setMetrics] = useState<{
    renderCount: number;
    lastRenderTime: number;
    averageRenderTime: number;
  }>({
    renderCount: 0,
    lastRenderTime: 0,
    averageRenderTime: 0
  });
  
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      setMetrics(prev => ({
        renderCount: prev.renderCount + 1,
        lastRenderTime: renderTime,
        averageRenderTime: (prev.averageRenderTime * prev.renderCount + renderTime) / (prev.renderCount + 1)
      }));
    };
  });
  
  return metrics;
};
```

## Тестирование состояния

### 1. Unit тесты для хуков
```typescript
import { renderHook, act } from '@testing-library/react';
import { useEnhancedHypotheses } from './useEnhancedHypotheses';

describe('useEnhancedHypotheses', () => {
  beforeEach(() => {
    localStorage.clear();
  });
  
  it('should initialize with empty state', () => {
    const { result } = renderHook(() => useEnhancedHypotheses());
    
    expect(result.current.hypotheses).toHaveLength(0);
    expect(result.current.isLoading).toBe(false);
  });
  
  it('should create hypothesis correctly', async () => {
    const { result } = renderHook(() => useEnhancedHypotheses());
    
    const hypothesisData: HypothesisFormData = {
      // тестовые данные
    };
    
    await act(async () => {
      await result.current.createHypothesis(hypothesisData);
    });
    
    expect(result.current.hypotheses).toHaveLength(1);
    expect(result.current.hypotheses[0].id).toBeDefined();
  });
});
```

### 2. Интеграционные тесты
```typescript
import { render, screen } from '@testing-library/react';
import { GlobalDataProvider } from './GlobalDataProvider';
import { TestComponent } from './TestComponent';

describe('GlobalDataProvider Integration', () => {
  it('should provide data to child components', () => {
    render(
      <GlobalDataProvider>
        <TestComponent />
      </GlobalDataProvider>
    );
    
    expect(screen.getByText('No hypotheses yet')).toBeInTheDocument();
  });
  
  it('should update state when demo mode is toggled', async () => {
    const { result } = renderHook(() => useGlobalData(), {
      wrapper: GlobalDataProvider
    });
    
    await act(async () => {
      await result.current.toggleDemoMode();
    });
    
    expect(result.current.appState.isDemoMode).toBe(true);
  });
});
```

## Лучшие практики

### 1. Структурирование состояния
- Разделяйте глобальное и локальное состояние
- Используйте нормализованную структуру для сложных данных
- Группируйте связанные данные в одном месте

### 2. Производительность
- Мемоизируйте тяжелые вычисления
- Используйте селекторы для извлечения данных
- Избегайте лишних ре-рендеров через правильное использование зависимостей

### 3. Типизация
- Строго типизируйте все состояние
- Используйте дискриминируемые юнионы для действий
- Создавайте типы для форм и промежуточных состояний

### 4. Отладка
- Используйте инструменты разработчика
- Логируйте критические изменения состояния
- Мониторьте производительность в development режиме