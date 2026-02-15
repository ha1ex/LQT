import { useState, useCallback } from 'react';
import { ChatMessage, ChatContext } from '@/types/ai';

const STORAGE_KEY = 'ai_chat_history';

export const useAIChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Загрузка истории чата
  const loadChatHistory = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const messagesWithDates = parsed.map((msg: Omit<ChatMessage, 'timestamp'> & { timestamp: string }) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(messagesWithDates);
      }
    } catch (_err) {
      setMessages([]);
    }
  }, []);

  // Сохранение истории чата
  const saveChatHistory = useCallback((messages: ChatMessage[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (_err) {
      // Ignore storage errors
    }
  }, []);

  // Получение API ключа
  const getApiKey = () => {
    try {
      return localStorage.getItem('openai_api_key');
    } catch (_error) {
      return null;
    }
  };

  // Генерация промпта для чата
  const generateChatPrompt = (content: string, context: ChatContext) => {
    const contextInfo = `
Контекст пользователя:
- Недельные данные: ${context.weekData?.length || 0} недель
- Цели: ${context.goals?.length || 0} активных
- Гипотезы: ${context.hypotheses?.length || 0} активных
- Последние инсайты: ${context.lastInsights?.length || 0} штук

Вопрос пользователя: ${content}

Отвечай как AI Life Coach, давая конкретные, практичные советы на основе данных пользователя.
Используй эмодзи для лучшего восприятия. Отвечай на русском языке.
`;

    return contextInfo;
  };

  // Вызов OpenAI API
  const callOpenAI = async (prompt: string): Promise<string> => {
    const apiKey = getApiKey();
    if (!apiKey) {
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
              content: 'Ты - AI Life Coach, который помогает пользователям улучшить качество жизни. Отвечай дружелюбно, используй эмодзи и давай практичные советы.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.8,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('Пустой ответ от OpenAI API');
      }

      return content;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Ошибка сети. Проверьте подключение к интернету.');
      }
      throw error;
    }
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
  // eslint-disable-next-line react-hooks/exhaustive-deps -- callOpenAI is stable (no state deps)
  }, [messages, saveChatHistory]);

  // Очистка чата
  const clearChat = useCallback(() => {
    setMessages([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (_error) {
      // Ignore storage errors
    }
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
