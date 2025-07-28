import { useState, useCallback, useEffect } from 'react';
import { AIInsight, AIGoalSuggestion, AIHypothesisImprovement, AIAnalysisContext, AIResponse } from '@/types/ai';
import { useDemoMode } from './useDemoMode';

export const useAIInsights = () => {
  const { isDemoMode, isLoading: demoLoading } = useDemoMode();
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log('🔍 useAIInsights - isDemoMode:', isDemoMode, 'demoLoading:', demoLoading);

  // Получаем API ключ из localStorage (временное решение)
  const getApiKey = () => {
    try {
      const apiKey = localStorage.getItem('openai_api_key');
      console.log('🔑 API Key found:', !!apiKey);
      return apiKey;
    } catch (error) {
      console.error('❌ Error getting API key:', error);
      return null;
    }
  };

  const generatePrompt = (context: 'dashboard' | 'goals' | 'hypothesis', data: AIAnalysisContext, hypothesisData?: any) => {
    const basePrompt = `
Ты - AI Life Coach для приложения Life Quality Tracker. Анализируй данные пользователя и предоставляй персонализированные рекомендации.

Данные пользователя:
- Последние оценки по неделям: ${JSON.stringify(data.weekData?.slice(-8) || [])}
- Текущие цели: ${JSON.stringify(data.goals || [])}
- Активные гипотезы: ${JSON.stringify(data.hypotheses || [])}

Отвечай строго в JSON формате без дополнительного текста:
`;

    switch (context) {
      case 'dashboard':
        return basePrompt + `
{
  "insights": [
    {
      "id": "unique_id",
      "type": "focus_area",
      "title": "Короткий заголовок рекомендации",
      "description": "Детальное объяснение (2-3 предложения)",
      "action": "Конкретное действие для пользователя",
      "metricId": "id_метрики_если_применимо",
      "confidence": 0.85,
      "createdAt": "${new Date().toISOString()}"
    }
  ],
  "patterns": [
    {
      "title": "Выявленная закономерность",
      "description": "Объяснение паттерна",
      "correlation": 0.7,
      "metrics": ["metric1", "metric2"]
    }
  ]
}

Предоставь 2-3 наиболее важные рекомендации на основе трендов в данных.`;

      case 'goals':
        return basePrompt + `
{
  "goals": [
    {
      "metricId": "id_метрики",
      "currentValue": 5,
      "suggestedTarget": 7,
      "reasoning": "Объяснение почему именно эта цель и это значение",
      "priority": "high",
      "title": "Название SMART-цели"
    }
  ]
}

Предложи 3-5 реалистичных SMART-целей для метрик с низкими значениями.`;

      case 'hypothesis':
        return basePrompt + `
Анализируемая гипотеза: ${JSON.stringify(hypothesisData)}

{
  "hypothesis_improvements": [
    {
      "field": "conditions",
      "original": "текущий_текст",
      "improved": "улучшенный_текст",
      "explanation": "Почему это улучшение"
    }
  ]
}

Предложи улучшения для структуры ЕСЛИ-ТО-ПОТОМУ ЧТО, сделай формулировки более конкретными и измеримыми.`;

      default:
        return basePrompt;
    }
  };

  // Генерация демо ответов
  const generateDemoResponse = (context: 'dashboard' | 'goals' | 'hypothesis'): AIResponse => {
    switch (context) {
      case 'dashboard':
        return {
          insights: [
            {
              id: `demo_insight_${Date.now()}`,
              type: 'focus_area',
              title: 'Отличная динамика роста',
              description: 'Ваши показатели показывают устойчивый рост на 34% за последний месяц. Особенно впечатляют результаты в области ментального здоровья и финансов.',
              action: 'Продолжайте придерживаться текущей стратегии и рассмотрите увеличение физической активности для максимального эффекта',
              metricId: 'mental_health',
              confidence: 0.89,
              createdAt: new Date()
            },
            {
              id: `demo_insight_${Date.now() + 1}`,
              type: 'pattern',
              title: 'Возможность для баланса',
              description: 'Заметна небольшая нестабильность в области ментального здоровья на фоне роста других показателей. Это может указывать на переутомление.',
              action: 'Добавьте 15-20 минут медитации или дыхательных практик в ежедневную рутину',
              metricId: 'mental_health',
              confidence: 0.75,
              createdAt: new Date()
            }
          ],
          goals: [],
          hypothesis_improvements: [],
          patterns: [
            {
              title: 'Сильная корреляция: физическая активность и настроение',
              description: 'В дни с высокой физической активностью ваше общее настроение улучшается на 67%',
              correlation: 0.67,
              metrics: ['physical_health', 'mood']
            }
          ]
        };

      case 'goals':
        return {
          insights: [],
          goals: [
            {
              metricId: 'physical_health',
              currentValue: 6,
              suggestedTarget: 8,
              reasoning: 'Физическое здоровье показывает хороший потенциал для роста и положительно влияет на все остальные сферы',
              priority: 'high',
              title: 'Улучшить физическую форму до уровня 8/10 за 6 недель'
            },
            {
              metricId: 'mental_health',
              currentValue: 5,
              suggestedTarget: 7,
              reasoning: 'Ментальное здоровье требует внимания для поддержания общего баланса',
              priority: 'medium',
              title: 'Стабилизировать ментальное состояние на уровне 7/10'
            }
          ],
          hypothesis_improvements: [],
          patterns: []
        };

      case 'hypothesis':
        return {
          insights: [],
          goals: [],
          hypothesis_improvements: [
            {
              field: 'conditions',
              original: 'если буду заниматься спортом',
              improved: 'если буду заниматься кардио-тренировками 30 минут, 4 раза в неделю по утрам',
              explanation: 'Более конкретные условия позволят точнее отслеживать выполнение гипотезы'
            },
            {
              field: 'expectedOutcome',
              original: 'то буду чувствовать себя лучше',
              improved: 'то мой уровень энергии повысится с 6/10 до 8/10, а качество сна улучшится на 20%',
              explanation: 'Измеримые результаты помогут объективно оценить эффективность'
            }
          ],
          patterns: []
        };

      default:
        return { 
          insights: [], 
          goals: [], 
          hypothesis_improvements: [], 
          patterns: [] 
        };
    }
  };

  const callOpenAI = async (prompt: string, context: 'dashboard' | 'goals' | 'hypothesis'): Promise<AIResponse> => {
    console.log('🚀 callOpenAI called - isDemoMode:', isDemoMode, 'context:', context);
    
    // В демо режиме возвращаем мок-ответ
    if (isDemoMode) {
      console.log('📱 Demo mode: generating mock response');
      // Имитируем задержку API
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
      const response = generateDemoResponse(context);
      console.log('✅ Demo response generated:', response);
      return response;
    }

    const apiKey = getApiKey();
    if (!apiKey) {
      console.error('❌ No API key found');
      throw new Error('API ключ OpenAI не найден. Пожалуйста, введите его в настройках.');
    }

    console.log('🌐 Making real API call to OpenAI');
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'Ты - AI Life Coach. Отвечай только валидным JSON без дополнительного текста.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ OpenAI API error:', response.status, errorText);
        throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('Пустой ответ от OpenAI API');
      }
      
      try {
        const parsedResponse = JSON.parse(content);
        console.log('✅ OpenAI response parsed successfully');
        return parsedResponse;
      } catch (e) {
        console.error('❌ JSON parsing error:', e, 'Content:', content);
        throw new Error('Ошибка парсинга ответа AI');
      }
    } catch (error) {
      console.error('❌ Network error:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Ошибка сети. Проверьте подключение к интернету.');
      }
      throw error;
    }
  };

  const generateInsights = useCallback(async (
    context: 'dashboard' | 'goals' | 'hypothesis',
    data: AIAnalysisContext,
    hypothesisData?: any
  ) => {
    console.log('🎯 generateInsights called:', { context, isDemoMode, demoLoading });
    
    // Ждем загрузки демо режима
    if (demoLoading) {
      console.log('⏳ Waiting for demo mode to load...');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);

      // В демо режиме не используем кэш и сразу генерируем ответ
      if (isDemoMode) {
        console.log('📱 Demo mode: generating insights directly');
        await new Promise(resolve => setTimeout(resolve, 800));
        const response = generateDemoResponse(context);
        console.log('✅ Demo insights generated:', response.insights?.length);
        if (response.insights) {
          setInsights(response.insights);
        }
        return response;
      }

      // Проверяем кэш только в реальном режиме (24 часа)
      const cacheKey = `ai_insights_${context}_${Date.now().toString().slice(0, -5)}`;
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const parsedCache = JSON.parse(cached);
          console.log('📦 Using cached insights');
          setInsights(parsedCache.insights || []);
          return parsedCache;
        }
      } catch (cacheError) {
        console.warn('⚠️ Cache error:', cacheError);
      }

      const prompt = generatePrompt(context, data, hypothesisData);
      const response = await callOpenAI(prompt, context);

      // Кэшируем результат только в реальном режиме
      try {
        localStorage.setItem(cacheKey, JSON.stringify(response));
        console.log('💾 Response cached');
      } catch (cacheError) {
        console.warn('⚠️ Failed to cache response:', cacheError);
      }
      
      if (response.insights) {
        setInsights(response.insights);
      }

      return response;
    } catch (err) {
      console.error('❌ generateInsights error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Произошла ошибка при генерации рекомендаций';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isDemoMode, demoLoading]);

  const clearCache = useCallback(() => {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('ai_insights_')) {
        localStorage.removeItem(key);
      }
    });
  }, []);

  return {
    insights,
    loading,
    error,
    generateInsights,
    clearCache,
    hasApiKey: !!getApiKey() || isDemoMode // В демо режиме всегда считаем что API ключ есть
  };
};