import { useState, useCallback } from 'react';
import { ChatMessage, ChatContext } from '@/types/ai';

export const useAIChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Загружаем историю чата из localStorage
  const loadChatHistory = useCallback(() => {
    try {
      const saved = localStorage.getItem('ai_chat_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        setMessages(parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })));
      }
    } catch (err) {
      console.warn('Ошибка загрузки истории чата:', err);
    }
  }, []);

  // Сохраняем историю чата (последние 50 сообщений)
  const saveChatHistory = useCallback((newMessages: ChatMessage[]) => {
    try {
      const toSave = newMessages.slice(-50); // Ограничиваем 50 сообщениями
      localStorage.setItem('ai_chat_history', JSON.stringify(toSave));
    } catch (err) {
      console.warn('Ошибка сохранения истории чата:', err);
    }
  }, []);

  // Получаем API ключ
  const getApiKey = () => {
    return localStorage.getItem('openai_api_key');
  };

  // Анализ намерений пользователя
  const analyzeUserIntent = (message: string) => {
    const lowerMessage = message.toLowerCase();
    
    if (/здоровье|health|спорт|тренировк|фитнес|сон|энерг/.test(lowerMessage)) {
      return 'health';
    }
    if (/финанс|деньги|доход|budget|бюджет|трат/.test(lowerMessage)) {
      return 'finance';
    }
    if (/цель|goal|target|план|достиж/.test(lowerMessage)) {
      return 'goals';
    }
    if (/корреляц|связь|влия|зависим|паттерн/.test(lowerMessage)) {
      return 'correlation';
    }
    if (/гипотез|hypothesis|если|то|потому/.test(lowerMessage)) {
      return 'hypothesis';
    }
    if (/настроен|эмоц|чувств|mood/.test(lowerMessage)) {
      return 'mood';
    }
    
    return 'general';
  };

  // Генерация контекстного промпта для чата
  const generateChatPrompt = (userMessage: string, context: ChatContext) => {
    const intent = analyzeUserIntent(userMessage);
    
    const baseContext = `
Ты - AI Life Coach в приложении Life Quality Tracker. Отвечай дружелюбно, персонализированно и конкретно.

Данные пользователя:
- Последние недельные оценки: ${JSON.stringify(context.weekData?.slice(-4) || [])}
- Текущие цели: ${JSON.stringify(context.goals || [])}
- Активные гипотезы: ${JSON.stringify(context.hypotheses || [])}
- Последние инсайты: ${JSON.stringify(context.lastInsights?.slice(-3) || [])}

Сообщение пользователя: "${userMessage}"
Определенное намерение: ${intent}

Инструкции для ответа:
1. Анализируй данные пользователя и давай персонализированные ответы
2. Ссылайся на конкретные цифры и тренды из данных  
3. Предлагай конкретные действия когда уместно
4. Используй дружелюбный, мотивирующий тон
5. Если можешь предложить создать цель или гипотезу - упомяни это
6. Отвечай на русском языке
7. Ответ должен быть 2-4 предложения, не более
`;

    const intentSpecificPrompts = {
      health: "Фокусируйся на метриках здоровья, спорта, сна, энергии. Анализируй тренды и корреляции.",
      finance: "Анализируй финансовые метрики, доходы, расходы, сбережения. Предлагай практические советы.",
      goals: "Помогай с постановкой и достижением целей. Анализируй прогресс текущих целей.",
      correlation: "Объясняй связи между метриками, выявляй закономерности и паттерны.",
      hypothesis: "Помогай с формулированием и улучшением гипотез в формате ЕСЛИ-ТО-ПОТОМУ ЧТО.",
      mood: "Анализируй эмоциональное состояние, настроение, стресс. Предлагай способы улучшения.",
      general: "Давай общие рекомендации на основе всех доступных данных."
    };

    return baseContext + "\n" + intentSpecificPrompts[intent as keyof typeof intentSpecificPrompts];
  };

  // Отправка сообщения в OpenAI
  const callOpenAI = async (prompt: string): Promise<string> => {
    const apiKey = getApiKey();
    if (!apiKey) {
      throw new Error('API ключ OpenAI не найден');
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
            content: 'Ты - AI Life Coach. Отвечай кратко, персонализированно и конструктивно на русском языке.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'Извините, не удалось получить ответ.';
  };

  // Отправка сообщения
  const sendMessage = useCallback(async (content: string, context: ChatContext) => {
    try {
      setLoading(true);
      setError(null);

      // Добавляем сообщение пользователя
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'user',
        content,
        timestamp: new Date(),
        context: {
          metrics: context.weekData?.map(w => w.date) || [],
          goals: context.goals?.map(g => g.id) || [],
          hypotheses: context.hypotheses?.map(h => h.id) || []
        }
      };

      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);

      // Генерируем ответ AI
      const prompt = generateChatPrompt(content, context);
      const aiResponse = await callOpenAI(prompt);

      // Добавляем ответ AI
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      };

      const finalMessages = [...updatedMessages, aiMessage];
      setMessages(finalMessages);
      saveChatHistory(finalMessages);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка отправки сообщения';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [messages, saveChatHistory]);

  // Очистка чата
  const clearChat = useCallback(() => {
    setMessages([]);
    localStorage.removeItem('ai_chat_history');
  }, []);

  // Получение предложений быстрых действий
  const getQuickActions = useCallback((context: ChatContext) => {
    const actions = [];
    
    // Анализ низких метрик
    const latestWeek = context.weekData?.[context.weekData.length - 1];
    if (latestWeek) {
      const lowMetrics = Object.entries(latestWeek)
        .filter(([key, value]) => key !== 'date' && typeof value === 'number' && value < 6)
        .map(([key]) => key);
      
      if (lowMetrics.length > 0) {
        actions.push(`Как улучшить ${lowMetrics[0]}?`);
      }
    }

    // Анализ целей
    if (context.goals?.length === 0) {
      actions.push('Помоги поставить цель');
    }

    // Анализ гипотез
    if (context.hypotheses?.length === 0) {
      actions.push('Создать гипотезу для улучшения');
    }

    actions.push('Покажи мой прогресс');
    actions.push('Какие у меня паттерны?');

    return actions.slice(0, 4); // Максимум 4 действия
  }, []);

  return {
    messages,
    loading,
    error,
    sendMessage,
    clearChat,
    loadChatHistory,
    getQuickActions,
    hasApiKey: !!getApiKey()
  };
};