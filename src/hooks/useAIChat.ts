import { useState, useCallback, useEffect } from 'react';
import { ChatMessage, ChatContext } from '@/types/ai';
import { useDemoMode } from './useDemoMode';

export const useAIChat = () => {
  const { isDemoMode, isLoading: demoLoading } = useDemoMode();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log('🔍 useAIChat - isDemoMode:', isDemoMode, 'demoLoading:', demoLoading);

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
    try {
      const apiKey = localStorage.getItem('openai_api_key');
      console.log('🔑 Chat API Key found:', !!apiKey);
      return apiKey;
    } catch (error) {
      console.error('❌ Error getting chat API key:', error);
      return null;
    }
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

  // Генерация демо ответов для AI Coach
  const generateDemoResponse = (userMessage: string, intent: string): string => {
    const demoResponses = {
      health: [
        "Вижу, что ваши показатели здоровья улучшаются! Рекомендую продолжать в том же духе и добавить 15 минут прогулки после обеда.",
        "Заметил снижение энергии на этой неделе. Попробуйте ложиться спать на час раньше - это может значительно улучшить ваше самочувствие.",
        "Отличные результаты по физической активности! Можно поставить цель увеличить интенсивность тренировок на 10%."
      ],
      finance: [
        "Ваши финансовые показатели стабильны. Рассмотрите возможность создания гипотезы о связи доходов и настроения.",
        "Хорошая динамика в финансовой сфере! Предлагаю поставить цель сократить расходы на 5% в следующем месяце.",
        "Финансовое планирование идет хорошо. Попробуйте отслеживать корреляцию между тратами и уровнем стресса."
      ],
      goals: [
        "Пора поставить новую цель! На основе ваших данных рекомендую сосредоточиться на улучшении сна или физической активности.",
        "Видим отличный прогресс в достижении целей! Может быть, стоит добавить более амбициозную цель?",
        "Предлагаю создать SMART-цель для области с самыми низкими показателями на этой неделе."
      ],
      correlation: [
        "Интересная корреляция: когда вы занимаетесь спортом утром, ваша продуктивность на работе повышается на 23%!",
        "Заметил закономерность: в дни с высоким стрессом ваш сон ухудшается на 15%. Попробуйте медитацию перед сном.",
        "Выявил связь между качеством питания и настроением - корреляция 67%. Стоит обратить внимание на рацион."
      ],
      hypothesis: [
        "Отличная идея для гипотезы! Сформулируем ее так: 'ЕСЛИ я буду медитировать 10 минут каждое утро, ТО мой уровень стресса снизится, ПОТОМУ ЧТО медитация помогает регулировать эмоции.'",
        "Предлагаю создать гипотезу о влиянии времени отхода ко сну на продуктивность следующего дня. Это поможет оптимизировать ваш режим.",
        "Интересная гипотеза! Давайте протестируем связь между физической активностью и качеством сна в течение 4 недель."
      ],
      mood: [
        "Ваше настроение показывает положительную динамику! Что помогло вам на этой неделе чувствовать себя лучше?",
        "Заметил небольшое снижение настроения. Попробуйте техники благодарности - записывайте 3 хорошие вещи каждый день.",
        "Отличное эмоциональное состояние! Поделитесь секретом - что работает лучше всего для поддержания позитива?"
      ],
      general: [
        "На основе ваших данных вижу общий прогресс! Особенно хорошо идут дела с [метрика]. Продолжайте в том же духе!",
        "Рекомендую сосредоточиться на создании устойчивых привычек. Выберите одну область и работайте с ней 3 недели.",
        "Ваши показатели стабильны. Попробуйте добавить новую метрику для отслеживания или создать гипотезу для эксперимента."
      ]
    };

    const responses = demoResponses[intent as keyof typeof demoResponses] || demoResponses.general;
    return responses[Math.floor(Math.random() * responses.length)];
  };

  // Отправка сообщения в OpenAI
  const callOpenAI = async (prompt: string): Promise<string> => {
    console.log('🚀 callOpenAI (chat) called - isDemoMode:', isDemoMode);
    
    // В демо режиме возвращаем мок-ответ
    if (isDemoMode) {
      console.log('📱 Chat demo mode: generating mock response');
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 500));
      const intent = analyzeUserIntent(prompt);
      const response = generateDemoResponse(prompt, intent);
      console.log('✅ Chat demo response generated');
      return response;
    }

    const apiKey = getApiKey();
    if (!apiKey) {
      console.error('❌ No chat API key found');
      throw new Error('API ключ OpenAI не найден');
    }

    console.log('🌐 Making real chat API call to OpenAI');

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
        const errorText = await response.text();
        console.error('❌ Chat OpenAI API error:', response.status, errorText);
        throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('Пустой ответ от OpenAI API');
      }

      console.log('✅ Chat OpenAI response received');
      return content;
    } catch (error) {
      console.error('❌ Chat network error:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Ошибка сети. Проверьте подключение к интернету.');
      }
      throw error;
    }
  };

  // Отправка сообщения
  const sendMessage = useCallback(async (content: string, context: ChatContext) => {
    console.log('💬 sendMessage called:', { content, isDemoMode, demoLoading });
    
    // Ждем загрузки демо режима
    if (demoLoading) {
      console.log('⏳ Waiting for demo mode to load...');
      return;
    }
    
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
      console.error('❌ sendMessage error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Ошибка отправки сообщения';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [messages, saveChatHistory, isDemoMode, demoLoading]);

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
    hasApiKey: !!getApiKey() || isDemoMode // В демо режиме всегда считаем что API ключ есть
  };
};