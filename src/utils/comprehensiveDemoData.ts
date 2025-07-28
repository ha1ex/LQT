import { WeeklyRating, WeeklyRatingData } from '@/types/weeklyRating';
import { EnhancedHypothesis, ValidationStatus, ExperimentStatus, WeeklyProgress } from '@/types/strategy';
import { AIInsight } from '@/types/ai';
import { generateId, calculatePriority, calculateHypothesisProgress } from '@/utils/strategy';

// Re-export BASE_METRICS from dataAdapter for backward compatibility
export { BASE_METRICS } from '@/utils/dataAdapter';
export const generateComprehensiveRatingData = (): WeeklyRatingData => {
  const ratings: WeeklyRatingData = {};
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (20 * 7)); // 20 weeks ago

  const metrics = [
    'physical_health', 'mental_health', 'productivity', 'relationships',
    'financial_situation', 'personal_growth', 'stress_level', 'sleep_quality',
    'social_connections', 'life_satisfaction'
  ];

  const moods: Array<'excellent' | 'good' | 'neutral' | 'poor' | 'terrible'> = 
    ['excellent', 'good', 'neutral', 'poor', 'terrible'];

  for (let week = 0; week < 20; week++) {
    const weekStart = new Date(startDate);
    weekStart.setDate(weekStart.getDate() + (week * 7));
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const weekId = `${weekStart.getFullYear()}-W${Math.ceil((weekStart.getTime() - new Date(weekStart.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000))}`;

    // Create seasonal and trend variations
    const seasonalFactor = Math.sin((week / 20) * Math.PI * 2) * 0.3 + 1;
    const trendFactor = (week / 20) * 0.5 + 0.75; // Gradual improvement over time

    const weeklyRatings: Record<string, number> = {};
    const weeklyNotes: Record<string, string> = {};

    metrics.forEach(metric => {
      const baseRating = 5 + Math.random() * 3; // 5-8 base range
      const adjustedRating = Math.max(1, Math.min(10, 
        Math.round(baseRating * seasonalFactor * trendFactor + (Math.random() - 0.5))
      ));
      
      weeklyRatings[metric] = adjustedRating;
      
      if (Math.random() > 0.7) { // 30% chance of having a note
        const notes = [
          'Отличная неделя!', 'Были сложности, но справился', 'Стабильный прогресс',
          'Нужно больше внимания этому аспекту', 'Заметные улучшения',
          'Было напряженно', 'Хорошие результаты', 'Требует доработки'
        ];
        weeklyNotes[metric] = notes[Math.floor(Math.random() * notes.length)];
      }
    });

    const overallScore = Math.round(
      Object.values(weeklyRatings).reduce((sum, rating) => sum + rating, 0) / metrics.length
    );

    const mood = overallScore >= 8 ? 'excellent' :
                 overallScore >= 6 ? 'good' :
                 overallScore >= 4 ? 'neutral' :
                 overallScore >= 2 ? 'poor' : 'terrible';

    const keyEvents = [];
    if (Math.random() > 0.6) {
      const events = [
        'Важная встреча на работе', 'Время с семьей', 'Новый проект',
        'Спортивные достижения', 'Обучение новому', 'Путешествие',
        'Здоровье и самочувствие', 'Финансовые решения'
      ];
      keyEvents.push(events[Math.floor(Math.random() * events.length)]);
    }

    ratings[weekId] = {
      id: weekId,
      weekNumber: week + 1,
      startDate: weekStart,
      endDate: weekEnd,
      ratings: weeklyRatings,
      notes: weeklyNotes,
      mood,
      keyEvents,
      weather: Math.random() > 0.5 ? 'sunny' : 'cloudy',
      overallScore,
      createdAt: weekStart,
      updatedAt: weekStart,
    };
  }

  return ratings;
};

// Generate comprehensive demo hypotheses with realistic progress
export const generateComprehensiveHypotheses = (): EnhancedHypothesis[] => {
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() - (12 * 7)); // 12 weeks ago

  const hypotheses: EnhancedHypothesis[] = [
    {
      id: generateId(),
      goal: {
        metricId: 'physical_health',
        description: 'Кардинально улучшить физическое состояние',
        targetValue: 9,
        currentValue: 4
      },
      subjects: ['self'],
      conditions: 'Буду заниматься спортом 5 раз в неделю: 3 раза силовые + 2 раза кардио по 60 минут, соблюдать режим питания',
      expectedOutcome: 'Увеличится выносливость на 40%, улучшится композиция тела, повысится энергия',
      reasoning: 'Систематические тренировки стимулируют адаптацию организма, улучшают метаболизм и работу сердечно-сосудистой системы',
      impact: 9,
      effort: 8,
      confidence: 7,
      risk: 3,
      timeframe: 12,
      calculatedPriority: 0,
      validationStatus: ValidationStatus.VALIDATED,
      validationErrors: [],
      experimentStartDate: new Date(baseDate.getTime() + (2 * 7 * 24 * 60 * 60 * 1000)),
      experimentStatus: ExperimentStatus.IN_PROGRESS,
      experimentResults: [],
      successCriteria: [
        'Тренировки 5 раз в неделю',
        'Показатель физического здоровья 8+',
        'Снижение веса на 5-8 кг'
      ],
      weeklyProgress: generateRealisticWeeklyProgress(12, baseDate, 'fitness'),
      status: 'active',
      progress: 0,
      journal: [
        {
          id: generateId(),
          date: new Date(baseDate.getTime() + (3 * 7 * 24 * 60 * 60 * 1000)),
          entry: 'Первые 3 недели даются тяжело, но уже чувствую больше энергии утром.',
          mood: 'positive'
        },
        {
          id: generateId(),
          date: new Date(baseDate.getTime() + (6 * 7 * 24 * 60 * 60 * 1000)),
          entry: 'Пропустил несколько тренировок из-за командировки. Нужна более гибкая система.',
          mood: 'negative'
        },
        {
          id: generateId(),
          date: new Date(baseDate.getTime() + (9 * 7 * 24 * 60 * 60 * 1000)),
          entry: 'Отличный прогресс! Вес снизился на 3 кг, чувствую себя намного лучше.',
          mood: 'positive'
        }
      ],
      createdAt: baseDate,
      updatedAt: new Date()
    },
    {
      id: generateId(),
      goal: {
        metricId: 'relationships',
        description: 'Построить глубокие отношения с близкими',
        targetValue: 9,
        currentValue: 6
      },
      subjects: ['self', 'family', 'friends'],
      conditions: 'Буду проводить качественное время с семьей 2 часа в день, звонить друзьям раз в неделю, практиковать активное слушание',
      expectedOutcome: 'Укрепятся семейные связи, появится больше близких друзей, улучшится эмоциональная поддержка',
      reasoning: 'Качественное время и эмоциональная доступность создают прочные связи и взаимную поддержку',
      impact: 8,
      effort: 5,
      confidence: 8,
      risk: 2,
      timeframe: 8,
      calculatedPriority: 0,
      validationStatus: ValidationStatus.VALIDATED,
      validationErrors: [],
      experimentStartDate: new Date(baseDate.getTime() + (4 * 7 * 24 * 60 * 60 * 1000)),
      experimentStatus: ExperimentStatus.IN_PROGRESS,
      experimentResults: [],
      successCriteria: [
        'Ежедневное качественное время с семьей',
        'Еженедельные звонки друзьям',
        'Показатель отношений 8+'
      ],
      weeklyProgress: generateRealisticWeeklyProgress(8, new Date(baseDate.getTime() + (4 * 7 * 24 * 60 * 60 * 1000)), 'relationships'),
      status: 'active',
      progress: 0,
      journal: [
        {
          id: generateId(),
          date: new Date(baseDate.getTime() + (5 * 7 * 24 * 60 * 60 * 1000)),
          entry: 'Жена заметила, что я стал более внимательным. Дети тоже стали больше открываться.',
          mood: 'positive'
        },
        {
          id: generateId(),
          date: new Date(baseDate.getTime() + (8 * 7 * 24 * 60 * 60 * 1000)),
          entry: 'Встретился с двумя старыми друзьями. Понял, как мне не хватало таких разговоров.',
          mood: 'positive'
        }
      ],
      createdAt: new Date(baseDate.getTime() + (4 * 7 * 24 * 60 * 60 * 1000)),
      updatedAt: new Date()
    },
    {
      id: generateId(),
      goal: {
        metricId: 'productivity',
        description: 'Достичь пикового уровня продуктивности',
        targetValue: 8,
        currentValue: 5
      },
      subjects: ['self'],
      conditions: 'Буду использовать технику Pomodoro, планировать день с вечера, убрать отвлекающие факторы, работать блоками по 90 минут',
      expectedOutcome: 'Увеличится количество выполненных задач на 50%, улучшится фокус, снизится прокрастинация',
      reasoning: 'Структурированный подход к работе и управление вниманием повышают эффективность и качество результатов',
      impact: 7,
      effort: 6,
      confidence: 8,
      risk: 2,
      timeframe: 6,
      calculatedPriority: 0,
      validationStatus: ValidationStatus.VALIDATED,
      validationErrors: [],
      experimentStartDate: new Date(baseDate.getTime() + (6 * 7 * 24 * 60 * 60 * 1000)),
      experimentStatus: ExperimentStatus.COMPLETED,
      experimentResults: [],
      successCriteria: [
        'Использование Pomodoro ежедневно',
        'Планирование с вечера',
        'Показатель продуктивности 7+'
      ],
      weeklyProgress: generateRealisticWeeklyProgress(6, new Date(baseDate.getTime() + (6 * 7 * 24 * 60 * 60 * 1000)), 'productivity'),
      status: 'completed',
      progress: 0,
      journal: [
        {
          id: generateId(),
          date: new Date(baseDate.getTime() + (7 * 7 * 24 * 60 * 60 * 1000)),
          entry: 'Первая неделя с Pomodoro - сложно привыкнуть, но уже вижу результаты.',
          mood: 'neutral'
        },
        {
          id: generateId(),
          date: new Date(baseDate.getTime() + (10 * 7 * 24 * 60 * 60 * 1000)),
          entry: 'Невероятно! Успеваю намного больше. Энергии хватает на весь день.',
          mood: 'positive'
        }
      ],
      createdAt: new Date(baseDate.getTime() + (6 * 7 * 24 * 60 * 60 * 1000)),
      updatedAt: new Date()
    }
  ];

  // Calculate priorities and progress
  return hypotheses.map(h => ({
    ...h,
    calculatedPriority: calculatePriority(h),
    progress: calculateHypothesisProgress(h.weeklyProgress)
  }));
};

// Generate realistic weekly progress patterns
const generateRealisticWeeklyProgress = (weeks: number, startDate: Date, type: 'fitness' | 'relationships' | 'productivity'): WeeklyProgress[] => {
  const progress: WeeklyProgress[] = [];
  
  for (let i = 0; i < weeks; i++) {
    const weekStart = new Date(startDate);
    weekStart.setDate(weekStart.getDate() + (i * 7));
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    // Different patterns for different experiment types
    let rating: 0 | 1 | 2 | 3 | 4 = 0;
    let note = '';
    let mood: 'positive' | 'negative' | 'neutral' = 'neutral';
    let tags: string[] = [];

    if (type === 'fitness') {
      // Fitness typically has ups and downs, gradual improvement
      if (i === 0) { rating = 2; note = 'Сложный старт, мышцы болят'; mood = 'neutral'; tags = ['старт', 'адаптация']; }
      else if (i === 1) { rating = 3; note = 'Привыкаю к нагрузкам'; mood = 'positive'; tags = ['прогресс']; }
      else if (i === 2) { rating = 1; note = 'Пропустил тренировки из-за простуды'; mood = 'negative'; tags = ['болезнь']; }
      else if (i === 3) { rating = 4; note = 'Вернулся в ритм, чувствую прилив сил'; mood = 'positive'; tags = ['восстановление', 'энергия']; }
      else if (i < weeks - 2) { 
        rating = Math.random() > 0.3 ? (Math.random() > 0.5 ? 3 : 4) : 2;
        const notes = ['Стабильные тренировки', 'Хорошая неделя', 'Были сложности с мотивацией', 'Отличные результаты'];
        note = notes[Math.floor(Math.random() * notes.length)];
        mood = rating >= 3 ? 'positive' : 'neutral';
        tags = rating >= 3 ? ['успех'] : ['вызовы'];
      }
      else { rating = 4; note = 'Достигаю поставленных целей!'; mood = 'positive'; tags = ['успех', 'цель']; }
    }
    else if (type === 'relationships') {
      // Relationships tend to have steady improvement with occasional setbacks
      if (i === 0) { rating = 3; note = 'Начинаю уделять больше внимания близким'; mood = 'positive'; tags = ['внимание']; }
      else if (i === 1) { rating = 4; note = 'Семья заметила изменения'; mood = 'positive'; tags = ['признание']; }
      else if (i === 2) { rating = 2; note = 'Была ссора, но быстро помирились'; mood = 'neutral'; tags = ['конфликт', 'решение']; }
      else { 
        rating = Math.random() > 0.2 ? (Math.random() > 0.4 ? 4 : 3) : 2;
        const notes = ['Качественное время вместе', 'Глубокие разговоры', 'Больше понимания', 'Эмоциональная близость'];
        note = notes[Math.floor(Math.random() * notes.length)];
        mood = rating >= 3 ? 'positive' : 'neutral';
        tags = rating >= 3 ? ['близость', 'общение'] : ['работа над отношениями'];
      }
    }
    else if (type === 'productivity') {
      // Productivity shows quick wins and then stabilization
      if (i === 0) { rating = 2; note = 'Привыкаю к новой системе'; mood = 'neutral'; tags = ['система']; }
      else if (i === 1) { rating = 4; note = 'Pomodoro работает отлично!'; mood = 'positive'; tags = ['техника', 'эффективность']; }
      else if (i === 2) { rating = 3; note = 'Иногда срываюсь на старые привычки'; mood = 'neutral'; tags = ['привычки']; }
      else { 
        rating = Math.random() > 0.1 ? (Math.random() > 0.3 ? 4 : 3) : 2;
        const notes = ['Высокая продуктивность', 'Выполнил все запланированное', 'Хорошая фокусировка', 'Меньше отвлечений'];
        note = notes[Math.floor(Math.random() * notes.length)];
        mood = rating >= 3 ? 'positive' : 'neutral';
        tags = rating >= 3 ? ['фокус', 'результат'] : ['улучшения'];
      }
    }

    progress.push({
      week: i + 1,
      startDate: weekStart,
      endDate: weekEnd,
      rating,
      note,
      mood,
      tags,
      keyEvents: Math.random() > 0.7 ? ['Важное событие недели'] : [],
      photos: [],
      lastModified: weekStart
    });
  }

  return progress;
};

// Generate AI insights based on demo data
export const generateDemoAIInsights = (): AIInsight[] => {
  return [
    {
      id: generateId(),
      type: 'focus_area',
      title: 'Физическое здоровье требует внимания',
      description: 'Анализ показывает, что показатели физического здоровья находятся ниже среднего. Рекомендуется создать системный подход к улучшению.',
      action: 'Создать гипотезу для улучшения физического состояния',
      metricId: 'physical_health',
      confidence: 85,
      createdAt: new Date()
    },
    {
      id: generateId(),
      type: 'pattern',
      title: 'Корреляция между сном и продуктивностью',
      description: 'Обнаружена сильная связь между качеством сна и продуктивностью на следующий день. Коэффициент корреляции: 0.78',
      confidence: 92,
      createdAt: new Date()
    },
    {
      id: generateId(),
      type: 'goal_suggestion',
      title: 'Рекомендуется работа над стресс-менеджментом',
      description: 'Высокий уровень стресса негативно влияет на большинство жизненных показателей. Предлагается целенаправленная работа в этом направлении.',
      action: 'Создать цель по снижению уровня стресса',
      metricId: 'stress_level',
      confidence: 88,
      createdAt: new Date()
    }
  ];
};

// Main function to create all demo data
// Generate demo subjects
export const generateDemoSubjects = () => {
  return [
    {
      id: 'self',
      name: 'Я',
      type: 'self',
      description: 'Личные изменения и саморазвитие',
      influenceLevel: 'high',
      relationshipType: 'self',
      motivationFactors: ['самореализация', 'здоровье', 'карьера'],
      resistanceFactors: ['лень', 'страхи', 'старые привычки']
    },
    {
      id: 'family',
      name: 'Семья',
      type: 'family',
      description: 'Отношения с близкими родственниками',
      influenceLevel: 'high',
      relationshipType: 'family',
      motivationFactors: ['любовь', 'поддержка', 'общие цели'],
      resistanceFactors: ['непонимание', 'разные взгляды']
    }
  ];
};

export const createComprehensiveDemoData = async (): Promise<void> => {
  try {
    console.log('🔄 Generating comprehensive demo data with 20 weeks of interconnected data...');
    
    // Generate comprehensive data
    const ratingData = generateComprehensiveRatingData();
    const hypothesesData = generateComprehensiveHypotheses();
    const aiInsights = generateDemoAIInsights();
    const subjects = generateDemoSubjects();

    // Save all demo data with comprehensive chat history
    localStorage.setItem('lqt_weekly_ratings', JSON.stringify(ratingData));
    localStorage.setItem('lqt_hypotheses', JSON.stringify(hypothesesData));
    localStorage.setItem('lqt_ai_insights', JSON.stringify(aiInsights));
    localStorage.setItem('lqt_subjects', JSON.stringify(subjects));
    localStorage.setItem('lqt_ai_chat_history', JSON.stringify([
      {
        id: 'demo-1',
        message: 'Привет! Я анализирую твои данные за 20 недель. Вижу хорошую динамику в физическом здоровье!',
        sender: 'ai',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
      },
      {
        id: 'demo-2', 
        message: 'Спасибо! Да, регулярные тренировки действительно помогают.',
        sender: 'user',
        timestamp: new Date(Date.now() - 23 * 60 * 60 * 1000)
      },
      {
        id: 'demo-3',
        message: 'Рекомендую обратить внимание на связь между физическими упражнениями и качеством общения с семьей - данные показывают положительную корреляцию!',
        sender: 'ai',
        timestamp: new Date(Date.now() - 22 * 60 * 60 * 1000)
      }
    ]));
    localStorage.setItem('lqt_demo_mode', 'true');

    console.log('✅ Comprehensive demo data created successfully:', {
      weeklyRatings: Object.keys(ratingData).length + ' weeks',
      hypotheses: hypothesesData.length + ' active experiments',
      aiInsights: aiInsights.length + ' insights',
      subjects: subjects.length + ' subjects',
      chatHistory: '3 demo messages'
    });
  } catch (error) {
    console.error('❌ Error creating comprehensive demo data:', error);
    throw error;
  }
};