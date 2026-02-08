import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAIInsights } from '@/hooks/useAIInsights';
import { AIInsightsCard } from './AIInsightsCard';
import { AIChat } from './AIChat';
import { Brain, RefreshCw, Sparkles, TrendingUp, MessageCircle, BarChart3, Settings, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

interface AIDashboardProps {
  weekData: any[];
  goals: any[];
  hypotheses: any[];
  onInsightAction?: (insight: any) => void;
}

export const AIDashboard: React.FC<AIDashboardProps> = ({ 
  weekData, 
  goals, 
  hypotheses,
  onInsightAction 
}) => {
  const { insights, loading, error, generateInsights, hasApiKey } = useAIInsights();
  const [lastAnalysis, setLastAnalysis] = useState<Date | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const { toast } = useToast();

  const shouldAutoAnalyze = () => {
    // Автоматический анализ при новых данных
    const lastWeekData = weekData?.[weekData.length - 1];
    if (!lastWeekData || !hasApiKey) return false;
    
    const dataDate = new Date(lastWeekData.date);
    const now = new Date();
    const timeDiff = now.getTime() - dataDate.getTime();
    const daysDiff = timeDiff / (1000 * 3600 * 24);
    
    // Анализируем если данные свежие (меньше 3 дней) и не было анализа
    return daysDiff < 3 && !lastAnalysis;
  };

  useEffect(() => {
    if (shouldAutoAnalyze()) {
      handleAnalyze();
    }
  }, [weekData, hasApiKey]);

  const handleAnalyze = async () => {
    try {
      await generateInsights('dashboard', { weekData, goals, hypotheses });
      setLastAnalysis(new Date());
      toast({
        title: "Анализ завершен",
        description: "AI сгенерировал новые рекомендации",
      });
    } catch (err) {
      toast({
        title: "Ошибка анализа",
        description: error || "Не удалось получить рекомендации",
        variant: "destructive"
      });
    }
  };

  if (!hasApiKey) {
    return (
      <div className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>API ключ не настроен.</strong> Перейдите в Настройки для подключения AI помощника.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Создаем контекст для чата
  const chatContext = {
    weekData,
    goals,
    hypotheses,
    lastInsights: insights
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Life Coach
                <Sparkles className="h-4 w-4 text-yellow-500" />
              </CardTitle>
              <CardDescription>
                Персонализированные рекомендации и интерактивные консультации на основе ваших данных
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
      </Card>


      {/* Tabs for Insights and Chat */}
      <Tabs defaultValue="insights" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Инсайты
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            AI Чат
          </TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="mt-6">
          <div className="space-y-6">
            {/* Analysis Button */}
            <div className="flex justify-end">
              <Button 
                onClick={handleAnalyze} 
                disabled={loading}
                variant="outline"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <TrendingUp className="h-4 w-4 mr-2" />
                )}
                {loading ? 'Анализируем...' : 'Обновить анализ'}
              </Button>
            </div>

            {/* Error state */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Loading state */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-16 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Insights */}
            {!loading && insights.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {insights.map((insight) => (
                  <AIInsightsCard
                    key={insight.id}
                    insight={insight}
                    onActionClick={onInsightAction}
                  />
                ))}
              </div>
            )}

            {/* Empty state */}
            {!loading && insights.length === 0 && hasApiKey && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Brain className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Нет активных рекомендаций</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Добавьте больше данных или нажмите "Обновить анализ" для получения персонализированных рекомендаций
                  </p>
                  <Button onClick={handleAnalyze} disabled={loading}>
                    Запустить анализ
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Last analysis info */}
            {lastAnalysis && (
              <div className="text-xs text-muted-foreground text-center">
                Последний анализ: {lastAnalysis.toLocaleString('ru-RU')}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="chat" className="mt-6">
          <AIChat context={chatContext} />
        </TabsContent>
      </Tabs>
    </div>
  );
};