import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAIInsights } from '@/hooks/useAIInsights';
import { AIGoalSuggestion } from '@/types/ai';
import { Target, TrendingUp, RefreshCw, Plus, Lightbulb } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

interface AIGoalSuggestionsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- week data with dynamic metric keys
  weekData: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- goals data has dynamic structure
  existingGoals: any[];
  onCreateGoal?: (goal: AIGoalSuggestion) => void;
}

export const AIGoalSuggestions: React.FC<AIGoalSuggestionsProps> = ({
  weekData,
  existingGoals,
  onCreateGoal
}) => {
  const [suggestions, setSuggestions] = useState<AIGoalSuggestion[]>([]);
  const { loading, error, generateInsights, hasApiKey } = useAIInsights();
  const { toast } = useToast();

  const handleGenerateGoals = async () => {
    try {
      const response = await generateInsights('goals', { weekData, goals: existingGoals, hypotheses: [] });
      if (response.goals) {
        setSuggestions(response.goals);
        toast({
          title: "Предложения готовы",
          description: `AI сгенерировал ${response.goals.length} предложений целей`,
        });
      }
    } catch (_err) {
      toast({
        title: "Ошибка генерации",
        description: error || "Не удалось получить предложения целей",
        variant: "destructive"
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800';
      case 'medium': return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800';
      case 'low': return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Высокий приоритет';
      case 'medium': return 'Средний приоритет';
      case 'low': return 'Низкий приоритет';
      default: return 'Не определен';
    }
  };

  if (!hasApiKey) {
    return (
      <Alert>
        <Lightbulb className="h-4 w-4" />
        <AlertDescription>
          Настройте API ключ OpenAI в разделе AI Coach для получения персонализированных предложений целей.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Target className="h-5 w-5" />
            AI предложения целей
          </h3>
          <p className="text-sm text-muted-foreground">
            Персонализированные SMART-цели на основе ваших данных
          </p>
        </div>
        <Button onClick={handleGenerateGoals} disabled={loading} variant="outline">
          {loading ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <TrendingUp className="h-4 w-4 mr-2" />
          )}
          {loading ? 'Генерируем...' : 'Получить предложения'}
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

      {/* Suggestions */}
      {!loading && suggestions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suggestions.map((suggestion, index) => (
            <Card key={index} className="relative overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base leading-tight mb-2">
                      {suggestion.title}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getPriorityColor(suggestion.priority)}>
                        {getPriorityLabel(suggestion.priority)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Цель метрики */}
                <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Цель:</span>
                    <span className="text-lg font-bold text-primary">
                      {suggestion.currentValue} → {suggestion.suggestedTarget}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Метрика: {suggestion.metricId}
                  </p>
                </div>

                {/* Обоснование */}
                <div>
                  <p className="text-sm font-medium mb-1">Обоснование:</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {suggestion.reasoning}
                  </p>
                </div>

                {/* Действие */}
                {onCreateGoal && (
                  <Button 
                    onClick={() => onCreateGoal(suggestion)}
                    className="w-full"
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Создать цель
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && suggestions.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Нет предложений целей</h3>
            <p className="text-muted-foreground text-center mb-4">
              Нажмите "Получить предложения" для анализа ваших данных и генерации персонализированных целей
            </p>
            <Button onClick={handleGenerateGoals} disabled={loading}>
              Запросить предложения
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};