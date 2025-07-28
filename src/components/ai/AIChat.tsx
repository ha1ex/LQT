import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAIChat } from '@/hooks/useAIChat';
import { ChatContext } from '@/types/ai';
import { MessageCircle, Send, Trash2, Bot, User, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface AIChatProps {
  context: ChatContext;
}

export const AIChat: React.FC<AIChatProps> = ({ context }) => {
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

      {/* Chat Messages */}
      <Card className="flex flex-col h-[600px]">{/* Увеличил высоту для лучшего UX */}
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Bot className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Привет! Я ваш AI Life Coach</h3>
              <p className="text-muted-foreground mb-4">
                Задайте мне любой вопрос о ваших данных, целях или гипотезах. 
                Я проанализирую информацию и дам персонализированные рекомендации.
              </p>
              <p className="text-sm text-muted-foreground">
                Попробуйте быстрые вопросы выше или напишите что-то свое!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
                >
                  {message.type === 'ai' && (
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                  <div className="flex flex-col max-w-[75%]">
                    <div
                      className={`rounded-2xl px-4 py-3 ${
                        message.type === 'user'
                          ? 'bg-primary text-primary-foreground ml-auto'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    </div>
                    <p className={`text-xs text-muted-foreground mt-1 ${
                      message.type === 'user' ? 'text-right mr-2' : 'ml-2'
                    }`}>
                      {message.timestamp.toLocaleTimeString('ru-RU', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                  {message.type === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 mt-1">
                      <User className="h-4 w-4 text-secondary-foreground" />
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex gap-3 justify-start mb-4">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div className="bg-muted rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Задайте вопрос о ваших данных..."
              disabled={loading}
              className="flex-1"
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={!inputValue.trim() || loading}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          {error && (
            <p className="text-sm text-destructive mt-2">{error}</p>
          )}
        </div>
      </Card>
    </div>
  );
};