import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAIInsights } from '@/hooks/useAIInsights';
import { AIHypothesisImprovement } from '@/types/ai';
import { Lightbulb, RefreshCw, Check, X, Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

interface AIHypothesisHelperProps {
  hypothesis: {
    conditions?: string;
    expectedOutcome?: string;
    reasoning?: string;
  };
  onApplyImprovement?: (field: string, improvedText: string) => void;
}

export const AIHypothesisHelper: React.FC<AIHypothesisHelperProps> = ({
  hypothesis,
  onApplyImprovement
}) => {
  const [improvements, setImprovements] = useState<AIHypothesisImprovement[]>([]);
  const [appliedImprovements, setAppliedImprovements] = useState<string[]>([]);
  const { loading, error, generateInsights, hasApiKey } = useAIInsights();
  const { toast } = useToast();

  const handleAnalyzeHypothesis = async () => {
    try {
      const response = await generateInsights('hypothesis', { weekData: [], goals: [], hypotheses: [] }, hypothesis);
      if (response.hypothesis_improvements) {
        setImprovements(response.hypothesis_improvements);
        toast({
          title: "Анализ завершен",
          description: `AI предложил ${response.hypothesis_improvements.length} улучшений`,
        });
      }
    } catch (_err) {
      toast({
        title: "Ошибка анализа",
        description: error || "Не удалось проанализировать гипотезу",
        variant: "destructive"
      });
    }
  };

  const handleApplyImprovement = (improvement: AIHypothesisImprovement) => {
    if (onApplyImprovement) {
      onApplyImprovement(improvement.field, improvement.improved);
      setAppliedImprovements(prev => [...prev, `${improvement.field}-${improvement.improved}`]);
      toast({
        title: "Улучшение применено",
        description: `Поле "${getFieldLabel(improvement.field)}" обновлено`,
      });
    }
  };

  const getFieldLabel = (field: string) => {
    switch (field) {
      case 'conditions': return 'ЕСЛИ (условие)';
      case 'expectedOutcome': return 'ТО (результат)';
      case 'reasoning': return 'ПОТОМУ ЧТО (обоснование)';
      case 'tasks': return 'Задачи';
      default: return field;
    }
  };

  const getFieldColor = (field: string) => {
    switch (field) {
      case 'conditions': return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800';
      case 'expectedOutcome': return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800';
      case 'reasoning': return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-800';
      case 'tasks': return 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 border-orange-200 dark:border-orange-800';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700';
    }
  };

  const isImprovementApplied = (improvement: AIHypothesisImprovement) => {
    return appliedImprovements.includes(`${improvement.field}-${improvement.improved}`);
  };

  if (!hasApiKey) {
    return (
      <Alert>
        <Lightbulb className="h-4 w-4" />
        <AlertDescription>
          Настройте API ключ OpenAI в разделе AI Coach для получения предложений по улучшению гипотезы.
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
            <Lightbulb className="h-5 w-5" />
            AI помощник по гипотезам
            <Sparkles className="h-4 w-4 text-yellow-500" />
          </h3>
          <p className="text-sm text-muted-foreground">
            Анализ и улучшение структуры ЕСЛИ-ТО-ПОТОМУ ЧТО
          </p>
        </div>
        <Button 
          onClick={handleAnalyzeHypothesis} 
          disabled={loading || !hypothesis.conditions}
          variant="outline"
        >
          {loading ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4 mr-2" />
          )}
          {loading ? 'Анализируем...' : 'Проанализировать'}
        </Button>
      </div>

      {/* Current hypothesis preview */}
      {(hypothesis.conditions || hypothesis.expectedOutcome || hypothesis.reasoning) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Текущая гипотеза</CardTitle>
            <CardDescription>Ваша формулировка для анализа</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {hypothesis.conditions && (
              <div>
                <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800 mb-2">
                  ЕСЛИ
                </Badge>
                <p className="text-sm text-muted-foreground">{hypothesis.conditions}</p>
              </div>
            )}
            {hypothesis.expectedOutcome && (
              <div>
                <Badge variant="outline" className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800 mb-2">
                  ТО
                </Badge>
                <p className="text-sm text-muted-foreground">{hypothesis.expectedOutcome}</p>
              </div>
            )}
            {hypothesis.reasoning && (
              <div>
                <Badge variant="outline" className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-800 mb-2">
                  ПОТОМУ ЧТО
                </Badge>
                <p className="text-sm text-muted-foreground">{hypothesis.reasoning}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Error state */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading state */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-1/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full mb-3" />
                <Skeleton className="h-8 w-1/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Improvements */}
      {!loading && improvements.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium">Предложения по улучшению:</h4>
          {improvements.map((improvement, index) => (
            <Card key={index} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className={getFieldColor(improvement.field)}>
                    {getFieldLabel(improvement.field)}
                  </Badge>
                  {isImprovementApplied(improvement) && (
                    <Badge variant="outline" className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800">
                      <Check className="h-3 w-3 mr-1" />
                      Применено
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Объяснение */}
                <div>
                  <p className="text-sm font-medium mb-1">Пояснение:</p>
                  <p className="text-sm text-muted-foreground">{improvement.explanation}</p>
                </div>

                {/* Сравнение */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium mb-2 text-red-600">Было:</p>
                    <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-sm">{improvement.original}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2 text-green-600">Предлагается:</p>
                    <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                      <p className="text-sm">{improvement.improved}</p>
                    </div>
                  </div>
                </div>

                {/* Действия */}
                {onApplyImprovement && !isImprovementApplied(improvement) && (
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleApplyImprovement(improvement)}
                      size="sm"
                      className="flex-1"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Применить улучшение
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && improvements.length === 0 && (hypothesis.conditions || hypothesis.expectedOutcome || hypothesis.reasoning) && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Lightbulb className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Нет предложений</h3>
            <p className="text-muted-foreground text-center mb-4">
              Нажмите "Проанализировать" для получения предложений по улучшению гипотезы
            </p>
            <Button onClick={handleAnalyzeHypothesis} disabled={loading}>
              Запустить анализ
            </Button>
          </CardContent>
        </Card>
      )}

      {/* No hypothesis state */}
      {!hypothesis.conditions && !hypothesis.expectedOutcome && !hypothesis.reasoning && (
        <Alert>
          <Lightbulb className="h-4 w-4" />
          <AlertDescription>
            Начните заполнять поля гипотезы (ЕСЛИ-ТО-ПОТОМУ ЧТО), чтобы получить предложения AI по улучшению.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};