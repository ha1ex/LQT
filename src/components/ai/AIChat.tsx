import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

  // Show empty state for new users
  if (isNewUser) {
    return (
      <div className="max-w-2xl mx-auto">
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

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Левая панель - ввод и быстрые действия */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageCircle className="w-5 h-5" />
                AI Coach
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Быстрые действия */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Быстрые вопросы</h4>
                <div className="space-y-2">
                  {getQuickActions(context).map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-left h-auto p-2"
                      onClick={() => handleQuickAction(action)}
                    >
                      <Sparkles className="w-3 h-3 mr-2 flex-shrink-0" />
                      <span className="text-xs">{action}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Поле ввода */}
              <div className="space-y-2">
                <Textarea
                  placeholder="Задайте вопрос AI Coach..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="min-h-[100px] resize-none"
                  disabled={loading || !hasApiKey}
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || loading || !hasApiKey}
                    className="flex-1"
                    size="sm"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Отправить
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearChat}
                    disabled={messages.length === 0}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Статус API */}
              {!hasApiKey && (
                <div className="text-xs text-muted-foreground text-center p-2 bg-muted rounded">
                  API ключ не настроен
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Правая панель - чат */}
        <div className="lg:col-span-3">
          <Card className="h-[500px] flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Чат с AI Coach</CardTitle>
                <Badge variant={hasApiKey ? "default" : "secondary"}>
                  {hasApiKey ? "Подключен" : "Не подключен"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <ScrollArea ref={scrollAreaRef} className="h-full p-4">
                <div className="space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Начните разговор с AI Coach</p>
                      <p className="text-sm">Задайте вопрос о ваших данных или попросите совета</p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${
                          message.type === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        {message.type === 'ai' && (
                          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                            <Bot className="w-4 h-4 text-primary-foreground" />
                          </div>
                        )}
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            message.type === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                        {message.type === 'user' && (
                          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    ))
                  )}
                  {loading && (
                    <div className="flex gap-3 justify-start">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-primary-foreground" />
                      </div>
                      <div className="bg-muted rounded-lg p-3">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};