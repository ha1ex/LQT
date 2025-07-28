import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAIChat } from '@/hooks/useAIChat';
import { ChatContext } from '@/types/ai';
import { MessageCircle, Send, Trash2, Bot, User, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { EmptyStateCard } from '@/components/ui/empty-state-card';
import { useGlobalData } from '@/contexts/GlobalDataProvider';

interface AIChatProps {
  context: ChatContext;
}

export const AIChat: React.FC<AIChatProps> = ({ context }) => {
  const { isNewUser } = useGlobalData();
  const { messages, loading, error, sendMessage, clearChat, loadChatHistory, getQuickActions, hasApiKey } = useAIChat();
  const [inputValue, setInputValue] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Show empty state for new users
  if (isNewUser) {
    return (
      <div className="p-6">
        <EmptyStateCard
          icon={MessageCircle}
          title="AI Coach"
          description="Когда у вас появятся данные, AI сможет анализировать их и давать персональные рекомендации"
          actionLabel="Начать заполнение данных"
          onAction={() => window.location.hash = '#rating'}
        />
      </div>
    );
  }

  // Загружаем историю при монтировании
  useEffect(() => {
    loadChatHistory();
  }, [loadChatHistory]);

  // Автоскролл к последнему сообщению
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || loading) return;

    const messageContent = inputValue.trim();
    setInputValue('');

    try {
      await sendMessage(messageContent, context);
    } catch (err) {
      toast({
        title: "Ошибка отправки",
        description: error || "Не удалось отправить сообщение",
        variant: "destructive"
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickAction = (action: string) => {
    setInputValue(action);
  };

  const handleClearChat = () => {
    clearChat();
    toast({
      title: "Чат очищен",
      description: "История сообщений удалена"
    });
  };

  if (!hasApiKey) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">API ключ не найден</h3>
          <p className="text-muted-foreground text-center">
            Настройте API ключ OpenAI во вкладке "Инсайты" для начала общения с AI
          </p>
        </CardContent>
      </Card>
    );
  }

  const quickActions = getQuickActions(context);

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              AI Life Coach
              <Sparkles className="h-4 w-4 text-yellow-500" />
            </CardTitle>
            {messages.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleClearChat}>
                <Trash2 className="h-4 w-4 mr-2" />
                Очистить
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Quick Actions */}
      {messages.length === 0 && quickActions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Быстрые вопросы</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => handleQuickAction(action)}
                >
                  {action}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Horizontal Layout: Input Left, Chat Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[600px]">
        {/* Input Panel - Left Side */}
        <Card className="lg:col-span-1 flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Send className="h-4 w-4" />
              Ваш вопрос
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-4">
            <div className="flex-1 flex flex-col gap-3">
              <Textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Задайте развернутый вопрос о ваших данных, целях, гипотезах или попросите совет по улучшению жизни..."
                disabled={loading}
                className="flex-1 min-h-[120px] resize-none"
              />
              
              {/* Quick Actions in Input Panel */}
              {quickActions.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Или выберите готовый вопрос:</p>
                  <div className="flex flex-wrap gap-2">
                    {quickActions.slice(0, 4).map((action, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="cursor-pointer hover:bg-muted text-xs"
                        onClick={() => handleQuickAction(action)}
                      >
                        {action}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Button 
                onClick={handleSendMessage} 
                disabled={!inputValue.trim() || loading}
                className="w-full"
                size="lg"
              >
                <Send className="h-4 w-4 mr-2" />
                {loading ? 'Отправка...' : 'Отправить'}
              </Button>
              
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Chat Panel - Right Side */}
        <Card className="lg:col-span-2 flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Bot className="h-4 w-4" />
              Ответы AI Coach
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Bot className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Привет! Я ваш AI Life Coach</h3>
                  <p className="text-muted-foreground mb-4">
                    Задайте мне любой вопрос о ваших данных, целях или гипотезах. 
                    Я проанализирую информацию и дам персонализированные рекомендации.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Введите вопрос в поле слева или выберите быстрый вопрос!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div key={message.id} className="space-y-2">
                      {message.type === 'user' && (
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                            <User className="h-4 w-4 text-secondary-foreground" />
                          </div>
                          <div className="flex-1">
                            <div className="bg-secondary rounded-lg px-4 py-3">
                              <p className="text-sm font-medium mb-1">Ваш вопрос:</p>
                              <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 ml-2">
                              {message.timestamp.toLocaleTimeString('ru-RU', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {message.type === 'ai' && (
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                            <Bot className="h-4 w-4 text-primary-foreground" />
                          </div>
                          <div className="flex-1">
                            <div className="bg-muted rounded-lg px-4 py-3">
                              <p className="text-sm font-medium mb-2 flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-yellow-500" />
                                Ответ AI Coach:
                              </p>
                              <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 ml-2">
                              {message.timestamp.toLocaleTimeString('ru-RU', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {loading && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-primary-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="bg-muted rounded-lg px-4 py-3">
                          <p className="text-sm font-medium mb-2 flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-yellow-500" />
                            AI Coach думает...
                          </p>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};