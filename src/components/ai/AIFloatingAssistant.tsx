import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAIInsights } from '@/hooks/useAIInsights';
import { useAIChat } from '@/hooks/useAIChat';
import { Brain, MessageCircle, X, Minimize2, Maximize2, Sparkles, Send, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ChatContext } from '@/types/ai';

interface AIFloatingAssistantProps {
  context: ChatContext;
  isVisible: boolean;
  onToggle: () => void;
}

export const AIFloatingAssistant: React.FC<AIFloatingAssistantProps> = ({
  context,
  isVisible,
  onToggle
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState<'insights' | 'chat'>('insights');
  const [inputValue, setInputValue] = useState('');
  
  const { insights, loading: insightsLoading, generateInsights, hasApiKey } = useAIInsights();
  const { messages, loading: chatLoading, sendMessage, getQuickActions } = useAIChat();

  const [hasNewInsights, setHasNewInsights] = useState(false);

  // Check for new insights
  useEffect(() => {
    if (insights.length > 0 && !isVisible) {
      setHasNewInsights(true);
    }
  }, [insights, isVisible]);

  // Clear new insights notification when opened
  useEffect(() => {
    if (isVisible) {
      setHasNewInsights(false);
    }
  }, [isVisible]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    const messageContent = inputValue.trim();
    setInputValue('');
    await sendMessage(messageContent, context);
  };

  const handleGenerateInsights = async () => {
    await generateInsights('dashboard', {
      weekData: context.weekData,
      goals: context.goals,
      hypotheses: context.hypotheses
    });
  };

  if (!hasApiKey) return null;

  if (!isVisible) {
    return (
      <Button
        onClick={onToggle}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary border-2 border-background z-50"
        size="icon"
      >
        <Brain className="h-6 w-6" />
        {hasNewInsights && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-xs text-white font-bold">!</span>
          </div>
        )}
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 h-[500px] shadow-2xl z-50 flex flex-col bg-background/95 backdrop-blur-sm border-2">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <span className="font-semibold">AI Assistant</span>
          <Sparkles className="h-4 w-4 text-yellow-500" />
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMinimized(!isMinimized)}
            className="h-8 w-8"
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Tabs */}
          <div className="flex border-b">
            <Button
              variant={activeTab === 'insights' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('insights')}
              className="flex-1 rounded-none"
            >
              <TrendingUp className="h-4 w-4 mr-1" />
              Инсайты
              {insights.length > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {insights.length}
                </Badge>
              )}
            </Button>
            <Button
              variant={activeTab === 'chat' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('chat')}
              className="flex-1 rounded-none"
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              Чат
              {messages.length > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {messages.length}
                </Badge>
              )}
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col min-h-0">
            {activeTab === 'insights' && (
              <div className="flex-1 flex flex-col">
                <div className="p-3 border-b">
                  <Button
                    size="sm"
                    onClick={handleGenerateInsights}
                    disabled={insightsLoading}
                    className="w-full"
                  >
                    {insightsLoading ? 'Анализируем...' : 'Обновить анализ'}
                  </Button>
                </div>
                <ScrollArea className="flex-1 p-3">
                  {insights.length === 0 ? (
                    <div className="text-center text-muted-foreground text-sm py-8">
                      <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Нет активных рекомендаций</p>
                      <p className="text-xs mt-1">Запустите анализ для получения инсайтов</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {insights.slice(0, 3).map((insight) => (
                        <Card key={insight.id} className="p-3">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="text-xs">
                                {insight.type === 'focus_area' && 'Фокус'}
                                {insight.type === 'goal_suggestion' && 'Цель'}
                                {insight.type === 'pattern' && 'Паттерн'}
                                {insight.type === 'hypothesis_improvement' && 'Гипотеза'}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {Math.round(insight.confidence * 100)}%
                              </span>
                            </div>
                            <h4 className="text-sm font-medium leading-tight">{insight.title}</h4>
                            <p className="text-xs text-muted-foreground">{insight.description}</p>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            )}

            {activeTab === 'chat' && (
              <div className="flex-1 flex flex-col min-h-0">
                <ScrollArea className="flex-1 p-3">
                  {messages.length === 0 ? (
                    <div className="text-center text-muted-foreground text-sm py-4">
                      <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Начните разговор с AI</p>
                      <div className="mt-3 space-y-1">
                        {getQuickActions(context).slice(0, 2).map((action, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => setInputValue(action)}
                            className="w-full text-xs h-auto py-2"
                          >
                            {action}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {messages.slice(-5).map((message) => (
                        <div
                          key={message.id}
                          className={`flex gap-2 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg px-3 py-2 text-xs ${
                              message.type === 'user'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{message.content}</p>
                          </div>
                        </div>
                      ))}
                      {chatLoading && (
                        <div className="flex gap-2 justify-start">
                          <div className="bg-muted rounded-lg px-3 py-2">
                            <div className="flex items-center gap-1">
                              <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" />
                              <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                              <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </ScrollArea>
                
                {/* Chat Input */}
                <div className="p-3 border-t">
                  <div className="flex gap-2">
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Спросите что-нибудь..."
                      className="text-sm"
                      disabled={chatLoading}
                    />
                    <Button
                      size="icon"
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim() || chatLoading}
                      className="h-9 w-9"
                    >
                      <Send className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {isMinimized && (
        <div className="p-4 text-center">
          <p className="text-sm text-muted-foreground">AI Assistant свернут</p>
          {hasNewInsights && (
            <Badge variant="destructive" className="mt-2 text-xs">
              Новые рекомендации!
            </Badge>
          )}
        </div>
      )}
    </Card>
  );
};