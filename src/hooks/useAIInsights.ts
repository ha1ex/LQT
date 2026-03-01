import { useState, useCallback } from 'react';
import { AIInsight, AIAnalysisContext, AIResponse } from '@/types/ai';

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

  // Подготовка реальных данных для промпта
  const prepareDataSummary = (data: AIAnalysisContext): string => {
    const weeks = data.weekData || [];
    if (weeks.length === 0) return 'Данных пока нет.';

    // Последние 4 недели с реальными значениями
    const recentWeeks = weeks.slice(-4);
    const metricNames = Object.keys(recentWeeks[0] || {}).filter(k => k !== 'date' && k !== 'overall');

    // Средние по метрикам за последние 4 недели
    const averages: Record<string, number> = {};
    const latest: Record<string, number> = {};
    const trends: Record<string, number> = {};

    for (const name of metricNames) {
      const vals = recentWeeks.map(w => typeof w[name] === 'number' ? w[name] as number : 0).filter(v => v > 0);
      if (vals.length > 0) {
        averages[name] = Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
        latest[name] = vals[vals.length - 1];
        if (vals.length >= 2) {
          trends[name] = Math.round((vals[vals.length - 1] - vals[0]) * 10) / 10;
        }
      }
    }

    // Проблемные и сильные метрики
    const problems = Object.entries(latest).filter(([, v]) => v <= 4).sort((a, b) => a[1] - b[1]);
    const strengths = Object.entries(latest).filter(([, v]) => v >= 8).sort((a, b) => b[1] - a[1]);

    let summary = `Данные за ${weeks.length} недель (шкала 1-10).\n\n`;
    summary += `Последняя неделя (${recentWeeks[recentWeeks.length - 1]?.date || '?'}):\n`;
    for (const [name, val] of Object.entries(latest)) {
      const trend = trends[name];
      const trendStr = trend ? (trend > 0 ? ` ↑${trend}` : ` ↓${Math.abs(trend)}`) : '';
      summary += `  ${name}: ${val}/10${trendStr}\n`;
    }

    if (problems.length > 0) {
      summary += `\nПроблемные области (≤4): ${problems.map(([n, v]) => `${n}=${v}`).join(', ')}\n`;
    }
    if (strengths.length > 0) {
      summary += `Сильные стороны (≥8): ${strengths.map(([n, v]) => `${n}=${v}`).join(', ')}\n`;
    }

    // Persistent trends: metrics declining or improving 3+ weeks in a row
    const persistent: string[] = [];
    for (const name of metricNames) {
      const vals = recentWeeks.map(w => typeof w[name] === 'number' ? w[name] as number : 0).filter(v => v > 0);
      if (vals.length >= 3) {
        const allUp = vals.every((v, i) => i === 0 || v >= vals[i - 1]);
        const allDown = vals.every((v, i) => i === 0 || v <= vals[i - 1]);
        if (allUp && vals[vals.length - 1] > vals[0]) persistent.push(`${name} растёт ${vals.length} нед.`);
        if (allDown && vals[vals.length - 1] < vals[0]) persistent.push(`${name} падает ${vals.length} нед.`);
      }
    }
    if (persistent.length > 0) {
      summary += `\nУстойчивые тренды: ${persistent.join(', ')}\n`;
    }

    // Гипотезы
    if (data.hypotheses && data.hypotheses.length > 0) {
      summary += `\nАктивные эксперименты (${data.hypotheses.length}):\n`;
      for (const h of data.hypotheses.slice(0, 3)) {
        summary += `  - ${h.title || h.id}\n`;
      }
    }

    return summary;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- hypothesis data shape varies
  const generatePrompt = (context: 'dashboard' | 'goals' | 'hypothesis', data: AIAnalysisContext, hypothesisData?: any) => {
    const dataSummary = prepareDataSummary(data);

    const basePrompt = `Ты — AI Life Coach. Анализируй ТОЛЬКО предоставленные данные. Не выдумывай метрики и значения.

${dataSummary}

На основе ЭТИХ КОНКРЕТНЫХ данных дай 2-4 рекомендации. Ответь строго JSON:
{
  "insights": [
    {
      "id": "unique_id",
      "type": "focus_area|goal_suggestion|pattern",
      "title": "Краткий заголовок",
      "description": "Описание на основе реальных данных выше",
      "action": "Конкретное действие",
      "metricId": "точное_имя_метрики_из_данных",
      "confidence": 0.85
    }
  ],
  "goals": [],
  "hypothesis_improvements": [],
  "patterns": []
}`;

    if (context === 'hypothesis' && hypothesisData) {
      return `${basePrompt}

Анализируемая гипотеза:
${JSON.stringify(hypothesisData, null, 2)}

Предложи улучшения для этой гипотезы.`;
    }

    return basePrompt;
  };

  const callOpenAI = async (prompt: string, _context: 'dashboard' | 'goals' | 'hypothesis'): Promise<AIResponse> => {
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
              content: 'Ты — AI Life Coach для приложения отслеживания качества жизни. Анализируй ТОЛЬКО предоставленные данные. Никогда не выдумывай метрики или значения. Если данных недостаточно — скажи об этом. Не давай медицинских советов. Отвечай только валидным JSON без дополнительного текста.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.4,
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- hypothesis data shape varies
    hypothesisData?: any
  ) => {
    try {
      setLoading(true);
      setError(null);

      // Проверяем кэш (1 час TTL)
      const cacheKey = `ai_insights_${context}`;
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const parsedCache = JSON.parse(cached);
          const cacheAge = Date.now() - (parsedCache._cachedAt || 0);
          const ONE_HOUR = 60 * 60 * 1000;
          if (cacheAge < ONE_HOUR) {
            setInsights(parsedCache.insights || []);
            return parsedCache;
          }
          // Cache expired, remove it
          localStorage.removeItem(cacheKey);
        }
      } catch (_cacheError) {
        // Ignore cache errors, continue with fresh request
      }

      const prompt = generatePrompt(context, data, hypothesisData);
      const response = await callOpenAI(prompt, context);

      // Кэшируем результат с timestamp
      try {
        localStorage.setItem(cacheKey, JSON.stringify({ ...response, _cachedAt: Date.now() }));
      } catch (_cacheError) {
        // Ignore caching errors
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
  // eslint-disable-next-line react-hooks/exhaustive-deps -- callOpenAI is stable (no state deps)
  }, []);

  const clearCache = useCallback(() => {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('ai_insights_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (_error) {
      // Ignore storage errors
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
