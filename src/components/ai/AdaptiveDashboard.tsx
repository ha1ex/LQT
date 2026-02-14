import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAIInsights } from '@/hooks/useAIInsights';
import type { AIInsight } from '@/types/ai';
import { AIInsightsCard } from './AIInsightsCard';
import { AIWelcomeWizard } from './AIWelcomeWizard';
import { AIChat } from './AIChat';
import { Brain, Sparkles, TrendingUp, Target, BarChart3, MessageCircle, RefreshCw, Settings } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { AIKeySetup } from './AIKeySetup';

interface AdaptiveDashboardProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- dynamic week data with metric keys
  weekData: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- goals data has dynamic structure
  goals: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- hypotheses data has dynamic structure
  hypotheses: any[];
  onInsightAction?: (insight: AIInsight) => void;
}

export const AdaptiveDashboard: React.FC<AdaptiveDashboardProps> = ({
  weekData,
  goals,
  hypotheses,
  onInsightAction
}) => {
  const { insights, loading, error, generateInsights, hasApiKey } = useAIInsights();
  const [showWizard, setShowWizard] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [userJourney, setUserJourney] = useState<'new' | 'growing' | 'advanced'>('new');
  const { toast } = useToast();

  // Determine user journey stage
  const journeyStage = useMemo(() => {
    const dataPoints = weekData.length;
    const activeGoals = goals.length;
    // hypotheses.length is available but not used for stage calculation currently
    void hypotheses;

    if (dataPoints === 0 && activeGoals === 0) return 'new';
    if (dataPoints < 4 || activeGoals < 2) return 'growing';
    return 'advanced';
  }, [weekData, goals, hypotheses]);

  useEffect(() => {
    setUserJourney(journeyStage);
  }, [journeyStage]);

  // Check if this is first visit
  useEffect(() => {
    const hasSeenWizard = localStorage.getItem('ai_wizard_seen');
    if (!hasSeenWizard && !hasApiKey) {
      setShowWizard(true);
    }
  }, [hasApiKey]);

  const handleWizardComplete = () => {
    localStorage.setItem('ai_wizard_seen', 'true');
    setShowWizard(false);
    toast({
      title: "Добро пожаловать!",
      description: "AI Life Coach готов к работе"
    });
  };

  const handleAnalyze = async () => {
    try {
      await generateInsights('dashboard', { weekData, goals, hypotheses });
      toast({
        title: "Анализ завершен",
        description: "Получены новые рекомендации"
      });
    } catch (_err) {
      toast({
        title: "Ошибка анализа",
        description: error || "Не удалось получить рекомендации",
        variant: "destructive"
      });
    }
  };

  // Show wizard for new users
  if (showWizard) {
    return (
      <div className="min-h-[600px] flex items-center justify-center">
        <AIWelcomeWizard
          onComplete={handleWizardComplete}
          onSkip={() => {
            setShowWizard(false);
            localStorage.setItem('ai_wizard_seen', 'true');
          }}
        />
      </div>
    );
  }

  // API key setup for users without key
  if (!hasApiKey) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
          <CardHeader className="relative text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              <Brain className="h-7 w-7" />
              AI Life Coach
              <Sparkles className="h-6 w-6 text-yellow-500" />
            </CardTitle>
            <CardDescription className="text-base max-w-2xl mx-auto">
              Получайте персонализированные рекомендации на основе ваших данных
            </CardDescription>
          </CardHeader>
          <CardContent className="relative">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="text-center p-6 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border border-blue-200 dark:border-blue-800">
                <TrendingUp className="h-10 w-10 text-blue-600 mx-auto mb-3" />
                <h4 className="font-semibold text-lg mb-2">Умные инсайты</h4>
                <p className="text-sm text-muted-foreground">Анализ паттернов в данных</p>
              </div>
              <div className="text-center p-6 rounded-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border border-green-200 dark:border-green-800">
                <Target className="h-10 w-10 text-green-600 mx-auto mb-3" />
                <h4 className="font-semibold text-lg mb-2">Цели и рекомендации</h4>
                <p className="text-sm text-muted-foreground">Персональные предложения</p>
              </div>
              <div className="text-center p-6 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border border-purple-200 dark:border-purple-800">
                <MessageCircle className="h-10 w-10 text-purple-600 mx-auto mb-3" />
                <h4 className="font-semibold text-lg mb-2">AI Чат</h4>
                <p className="text-sm text-muted-foreground">Интерактивные консультации</p>
              </div>
            </div>
            <div className="max-w-md mx-auto">
              <AIKeySetup onKeySet={() => window.location.reload()} />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Compact Header */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        <CardHeader className="relative pb-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Brain className="h-6 w-6" />
                <CardTitle className="text-xl">AI Life Coach</CardTitle>
                <Sparkles className="h-5 w-5 text-yellow-500" />
                <Badge variant="outline" className="ml-2">
                  {userJourney === 'new' && 'Новичок'}
                  {userJourney === 'growing' && 'Развиваетесь'}
                  {userJourney === 'advanced' && 'Эксперт'}
                </Badge>
              </div>
              <CardDescription className="text-sm">
                {userJourney === 'new' && 'Добро пожаловать! Начните собирать данные для получения первых рекомендаций'}
                {userJourney === 'growing' && 'Отлично! Добавьте больше данных для более точных рекомендаций'}
                {userJourney === 'advanced' && 'Вы опытный пользователь! Получайте продвинутые инсайты и гипотезы'}
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings(!showSettings)}
              className="shrink-0"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>

          {/* Compact Progress for growing users */}
          {userJourney === 'growing' && (
            <div className="mt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Прогресс развития</span>
                <span>{Math.min(Math.round((weekData.length / 8) * 100), 100)}%</span>
              </div>
              <Progress value={Math.min((weekData.length / 8) * 100, 100)} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Добавьте еще {Math.max(8 - weekData.length, 0)} недель данных для получения продвинутых рекомендаций
              </p>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Settings Panel */}
      {showSettings && (
        <Card>
          <CardContent className="pt-6">
            <AIKeySetup onKeySet={() => {
              setShowSettings(false);
              toast({
                title: "API ключ обновлен",
                description: "Настройки сохранены"
              });
            }} />
          </CardContent>
        </Card>
      )}

      {/* Quick Actions for New Users */}
      {userJourney === 'new' && weekData.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Первые шаги</CardTitle>
            <CardDescription>Начните использовать AI Coach с этих действий</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/50">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-sm text-primary-foreground font-bold">1</span>
                </div>
                <div>
                  <h4 className="font-medium">Добавьте первую неделю данных</h4>
                  <p className="text-sm text-muted-foreground">Перейдите в раздел "Оценка" и оцените свою неделю</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/50 opacity-60">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-sm text-muted-foreground font-bold">2</span>
                </div>
                <div>
                  <h4 className="font-medium text-muted-foreground">Получите первые рекомендации</h4>
                  <p className="text-sm text-muted-foreground">После 2-3 недель данных AI даст первые инсайты</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs for Insights and Chat */}
      <Tabs defaultValue="insights" className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
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
          {/* AI Insights */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Персональные рекомендации
                  </CardTitle>
                  <CardDescription>
                    Анализ ваших данных и предложения по улучшению
                  </CardDescription>
                </div>
                <Button 
                  onClick={handleAnalyze}
                  disabled={loading}
                  variant="outline"
                  size="sm"
                >
                  {loading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <TrendingUp className="h-4 w-4 mr-2" />
                  )}
                  {loading ? 'Анализируем...' : 'Обновить'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-32 bg-muted rounded-lg" />
                    </div>
                  ))}
                </div>
              )}

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

              {!loading && insights.length === 0 && weekData.length > 0 && (
                <div className="text-center py-12">
                  <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Нет активных рекомендаций</h3>
                  <p className="text-muted-foreground mb-4">
                    {userJourney === 'new' 
                      ? 'Добавьте больше данных для получения первых рекомендаций'
                      : 'Нажмите "Обновить" для получения новых инсайтов'
                    }
                  </p>
                  <Button onClick={handleAnalyze} disabled={loading}>
                    Запустить анализ
                  </Button>
                </div>
              )}

              {!loading && insights.length === 0 && weekData.length === 0 && (
                <div className="text-center py-12">
                  <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Готовы начать?</h3>
                  <p className="text-muted-foreground mb-4">
                    Добавьте первые данные в разделе "Оценка" для получения персональных рекомендаций
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chat" className="mt-6">
          <AIChat context={{ weekData, goals, hypotheses, lastInsights: insights }} />
        </TabsContent>
      </Tabs>
    </div>
  );
};