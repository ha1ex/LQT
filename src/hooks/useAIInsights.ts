import { useState, useCallback } from 'react';
import { AIInsight, AIGoalSuggestion, AIHypothesisImprovement, AIAnalysisContext, AIResponse } from '@/types/ai';

export const useAIInsights = () => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Получаем API ключ из localStorage (временное решение)
  const getApiKey = () => {
    return localStorage.getItem('openai_api_key');
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

  const callOpenAI = async (prompt: string): Promise<AIResponse> => {
    const apiKey = getApiKey();
    if (!apiKey) {
      throw new Error('API ключ OpenAI не найден. Пожалуйста, введите его в настройках.');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
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
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    try {
      return JSON.parse(content);
    } catch (e) {
      throw new Error('Ошибка парсинга ответа AI');
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
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsedCache = JSON.parse(cached);
        setInsights(parsedCache.insights || []);
        return parsedCache;
      }

      const prompt = generatePrompt(context, data, hypothesisData);
      const response = await callOpenAI(prompt);

      // Кэшируем результат
      localStorage.setItem(cacheKey, JSON.stringify(response));
      
      if (response.insights) {
        setInsights(response.insights);
      }

      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Произошла ошибка при генерации рекомендаций';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

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
    hasApiKey: !!getApiKey()
  };
};