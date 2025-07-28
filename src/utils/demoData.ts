import { 
  EnhancedHypothesis, 
  ValidationStatus, 
  ExperimentStatus, 
  SubjectType 
} from '@/types/strategy';
import { generateId, createDefaultWeeklyProgress } from '@/utils/strategy';

export const createDemoHypotheses = (): EnhancedHypothesis[] => {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  return [
    {
      id: generateId(),
      goal: {
        metricId: 'physical_health',
        description: 'Улучшить физическое состояние и энергетику',
        targetValue: 8,
        currentValue: 4
      },
      subjects: ['self'],
      conditions: 'Буду заниматься спортом 4 раза в неделю по 45 минут: 2 раза силовые тренировки, 2 раза кардио',
      expectedOutcome: 'Увеличится выносливость, улучшится самочувствие, повысится уровень энергии в течение дня',
      reasoning: 'Регулярные физические упражнения стимулируют выработку эндорфинов, улучшают кровообращение и укрепляют сердечно-сосудистую систему',
      impact: 9,
      effort: 7,
      confidence: 8,
      risk: 2,
      timeframe: 8,
      calculatedPriority: 0,
      validationStatus: ValidationStatus.VALIDATED,
      validationErrors: [],
      experimentStartDate: weekAgo,
      experimentStatus: ExperimentStatus.IN_PROGRESS,
      experimentResults: [],
      successCriteria: [
        'Тренировки 4 раза в неделю',
        'Повышение показателя "Физическое здоровье" до 7+',
        'Улучшение самочувствия'
      ],
      weeklyProgress: createDefaultWeeklyProgress(8, weekAgo).map((w, i) => {
        if (i === 0) return { ...w, rating: 3, note: 'Хорошая неделя тренировок', mood: 'positive', tags: ['спорт', 'энергия'] };
        if (i === 1) return { ...w, rating: 2, note: 'Пропустил несколько тренировок', mood: 'neutral', tags: ['пропуски'] };
        if (i === 2) return { ...w, rating: 4, note: 'Отличная неделя!', mood: 'positive', tags: ['успех', 'мотивация'] };
        return w;
      }),
      status: 'active',
      progress: 0,
      journal: [
        {
          id: generateId(),
          date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
          entry: 'Первая неделя тренировок. Чувствую себя более энергичным, хотя мышцы болят.',
          mood: 'positive'
        },
        {
          id: generateId(),
          date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
          entry: 'Пропустил тренировку из-за работы. Нужно лучше планировать время.',
          mood: 'negative'
        }
      ],
      createdAt: weekAgo,
      updatedAt: now
    },
    {
      id: generateId(),
      goal: {
        metricId: 'wife_communication',
        description: 'Улучшить качество общения с женой',
        targetValue: 9,
        currentValue: 6
      },
      subjects: ['self', 'partner'],
      conditions: 'Буду проводить 30 минут качественного времени с женой каждый день без телефонов и ТВ, активно слушать и задавать открытые вопросы',
      expectedOutcome: 'Улучшится взаимопонимание, появится больше близости, снизится количество конфликтов',
      reasoning: 'Качественное общение без отвлекающих факторов способствует эмоциональной близости и пониманию потребностей партнера',
      impact: 8,
      effort: 4,
      confidence: 9,
      risk: 1,
      timeframe: 4,
      calculatedPriority: 0,
      validationStatus: ValidationStatus.VALIDATED,
      validationErrors: [],
      experimentStartDate: weekAgo,
      experimentStatus: ExperimentStatus.IN_PROGRESS,
      experimentResults: [],
      successCriteria: [
        'Ежедневное качественное время 30+ минут',
        'Повышение показателя отношений до 8+',
        'Снижение количества конфликтов'
      ],
      weeklyProgress: createDefaultWeeklyProgress(4, weekAgo).map((w, i) => {
        if (i === 0) return { ...w, rating: 4, note: 'Отличная неделя общения', mood: 'positive', tags: ['общение', 'близость'] };
        if (i === 1) return { ...w, rating: 3, note: 'Хорошо, но были отвлечения', mood: 'neutral', tags: ['отвлечения'] };
        return w;
      }),
      status: 'active',
      progress: 0,
      journal: [
        {
          id: generateId(),
          date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
          entry: 'Жена отметила, что я стал более внимательным. Чувствую, что мы стали ближе.',
          mood: 'positive'
        }
      ],
      createdAt: weekAgo,
      updatedAt: now
    },
    {
      id: generateId(),
      goal: {
        metricId: 'financial_cushion',
        description: 'Увеличить финансовую подушку безопасности',
        targetValue: 6,
        currentValue: 2
      },
      subjects: ['self', 'partner'],
      conditions: 'Буду откладывать 20% дохода каждый месяц на отдельный накопительный счет и вести детальный учет трат',
      expectedOutcome: 'Накопится резерв на 3-6 месяцев расходов, появится чувство финансовой безопасности',
      reasoning: 'Регулярные накопления создают финансовую подушку, которая снижает стресс и повышает уверенность в будущем',
      impact: 7,
      effort: 6,
      confidence: 6,
      risk: 3,
      timeframe: 12,
      calculatedPriority: 0,
      validationStatus: ValidationStatus.FAILED_VALIDATION,
      validationErrors: [
        {
          type: 'content',
          message: 'Недостаточно конкретные действия для достижения цели'
        }
      ],
      experimentStartDate: now,
      experimentStatus: ExperimentStatus.NOT_STARTED,
      experimentResults: [],
      successCriteria: [
        'Откладывать 20% дохода ежемесячно',
        'Накопить резерв на 3 месяца',
        'Повысить показатель до 6+'
      ],
      weeklyProgress: createDefaultWeeklyProgress(12, now),
      status: 'active',
      progress: 0,
      journal: [],
      createdAt: now,
      updatedAt: now
    }
  ];
};

export const saveDemoData = () => {
  const demoHypotheses = createDemoHypotheses();
  
  // Calculate priorities and progress for demo data
  const updatedHypotheses = demoHypotheses.map(h => {
    const { calculatePriority, calculateHypothesisProgress } = require('@/utils/strategy');
    return {
      ...h,
      calculatedPriority: calculatePriority(h),
      progress: calculateHypothesisProgress(h.weeklyProgress)
    };
  });
  
  localStorage.setItem('lqt_hypotheses', JSON.stringify(updatedHypotheses));
  console.log('Demo data saved to localStorage');
};

export const clearDemoData = () => {
  localStorage.removeItem('lqt_hypotheses');
  localStorage.removeItem('lqt_subjects');
  localStorage.removeItem('lqt_journal');
  console.log('Demo data cleared from localStorage');
};