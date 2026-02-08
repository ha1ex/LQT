import { useState, useCallback } from 'react';
import { AIInsight, AIGoalSuggestion, AIHypothesisImprovement, AIAnalysisContext, AIResponse } from '@/types/ai';

export const useAIInsights = () => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Получаем API ключ из localStorage (временное решение)
  const getApiKey = () => {
    try {
      const apiKey = localStorage.getItem('openai_api_key');
      return apiKey;
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error getting API key:', error);
      return null;
    }
  };

  const generatePrompt = (context: 'dashboard' | 'goals' | 'hypothesis', data: AIAnalysisContext, hypothesisData?: any) => {
    const basePrompt = `Ты - AI Life Coach, который анализирует данные о качестве жизни и дает персональные рекомендации.

Контекст анализа: ${context}
Данные пользователя:
- Недельные рейтинги: ${data.weekData?.length || 0} недель
- Цели: ${data.goals?.length || 0} активных
- Гипотезы: ${data.hypotheses?.length || 0} активных

Ответь строго в формате JSON:
{
  "insights": [
    {
      "id": "unique_id",
      "type": "focus_area|goal_suggestion|hypothesis_improvement|pattern",
      "title": "Краткий заголовок",
      "description": "Подробное описание",
      "action": "Конкретное действие",
      "metricId": "metric_name",
      "confidence": 0.85
    }
  ],
  "goals": [
    {
      "metricId": "metric_name",
      "currentValue": 6.5,
      "suggestedTarget": 8.0,
      "reasoning": "Обоснование",
      "priority": "high|medium|low",
      "title": "Название цели"
    }
  ],
  "hypothesis_improvements": [
    {
      "field": "conditions|expectedOutcome|reasoning|tasks",
      "original": "Оригинальный текст",
      "improved": "Улучшенный текст",
      "explanation": "Объяснение улучшения"
    }
  ],
  "patterns": [
    {
      "title": "Название паттерна",
      "description": "Описание",
      "correlation": 0.75,
      "metrics": ["metric1", "metric2"]
    }
  ]
}`;

    if (context === 'hypothesis' && hypothesisData) {
      return `${basePrompt}

Анализируемая гипотеза:
${JSON.stringify(hypothesisData, null, 2)}

Предложи улучшения для этой гипотезы.`;
    }

    return basePrompt;
  };

  const callOpenAI = async (prompt: string, context: 'dashboard' | 'goals' | 'hypothesis'): Promise<AIResponse> => {
    const apiKey = getApiKey();
    if (!apiKey) {
      if (import.meta.env.DEV) console.error('No API key found');
      throw new Error('API ключ OpenAI не найден. Пожалуйста, введите его в настройках.');
    }

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
        if (import.meta.env.DEV) console.error('OpenAI API error:', response.status, errorText);
        throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('Пустой ответ от OpenAI API');
      }

      try {
        const parsedResponse = JSON.parse(content);
        return parsedResponse;
      } catch (e) {
        if (import.meta.env.DEV) console.error('JSON parsing error:', e, 'Content:', content);
        throw new Error('Ошибка парсинга ответа AI');
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error('Network error:', error);
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
    try {
      setLoading(true);
      setError(null);

      // Проверяем кэш (24 часа)
      const cacheKey = `ai_insights_${context}_${Date.now().toString().slice(0, -5)}`;
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const parsedCache = JSON.parse(cached);
          setInsights(parsedCache.insights || []);
          return parsedCache;
        }
      } catch (cacheError) {
        // Игнорируем ошибки кэша, продолжаем работу
      }

      const prompt = generatePrompt(context, data, hypothesisData);
      const response = await callOpenAI(prompt, context);

      // Кэшируем результат
      try {
        localStorage.setItem(cacheKey, JSON.stringify(response));
      } catch (cacheError) {
        // Игнорируем ошибки кэширования
      }

      if (response.insights) {
        setInsights(response.insights);
      }

      return response;
    } catch (err) {
      if (import.meta.env.DEV) console.error('generateInsights error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Произошла ошибка при генерации рекомендаций';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearCache = useCallback(() => {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('ai_insights_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
    }
  }, []);

  return {
    insights,
    loading,
    error,
    generateInsights,
    clearCache,
    hasApiKey: !!getApiKey()
  };
};
