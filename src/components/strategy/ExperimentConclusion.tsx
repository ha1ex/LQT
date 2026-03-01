import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Trophy,
  BarChart3,
  Calendar,
  Star
} from 'lucide-react';
import { EnhancedHypothesis, ExperimentConclusionData } from '@/types/strategy';
import { getRatingLabel } from '@/utils/strategy';
import { useEnhancedHypotheses } from '@/hooks/strategy';

interface ExperimentConclusionProps {
  hypothesis: EnhancedHypothesis;
}

export const ExperimentConclusion: React.FC<ExperimentConclusionProps> = ({ hypothesis }) => {
  const { completeExperiment } = useEnhancedHypotheses();
  const [selectedResult, setSelectedResult] = useState<ExperimentConclusionData['result'] | null>(null);

  const weeklyProgress = hypothesis.weeklyProgress;
  const ratedWeeks = weeklyProgress.filter(w => w.rating > 0);
  const averageRating = ratedWeeks.length > 0
    ? ratedWeeks.reduce((sum, w) => sum + w.rating, 0) / ratedWeeks.length
    : 0;

  // Rating distribution
  const distribution = [1, 2, 3, 4].map(r => ({
    rating: r,
    count: ratedWeeks.filter(w => w.rating === r).length,
    label: getRatingLabel(r)
  }));

  const maxCount = Math.max(...distribution.map(d => d.count), 1);

  const handleConfirm = (result: ExperimentConclusionData['result']) => {
    setSelectedResult(result);
    completeExperiment(hypothesis.id, result);
  };

  const getResultConfig = (result: ExperimentConclusionData['result']) => {
    switch (result) {
      case 'confirmed':
        return {
          icon: <CheckCircle2 className="h-6 w-6" />,
          label: 'Подтверждена',
          color: 'text-green-600',
          bgColor: 'bg-green-50 border-green-200',
          badgeClass: 'bg-green-100 text-green-800 border-green-300'
        };
      case 'not_confirmed':
        return {
          icon: <XCircle className="h-6 w-6" />,
          label: 'Не подтверждена',
          color: 'text-red-600',
          bgColor: 'bg-red-50 border-red-200',
          badgeClass: 'bg-red-100 text-red-800 border-red-300'
        };
      case 'inconclusive':
        return {
          icon: <HelpCircle className="h-6 w-6" />,
          label: 'Неопределённо',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50 border-gray-200',
          badgeClass: 'bg-gray-100 text-gray-800 border-gray-300'
        };
    }
  };

  // If conclusion already exists, show summary card
  if (hypothesis.conclusion) {
    const config = getResultConfig(hypothesis.conclusion.result);
    return (
      <Card className={`border-2 ${config.bgColor}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="h-5 w-5 text-amber-500" />
            Эксперимент завершён
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className={config.color}>{config.icon}</div>
            <div>
              <p className="font-semibold">Результат: {config.label}</p>
              <p className="text-sm text-muted-foreground">
                Средняя оценка: {hypothesis.conclusion.averageRating.toFixed(1)} / 4.0
              </p>
            </div>
            <Badge variant="outline" className={`ml-auto ${config.badgeClass}`}>
              {config.label}
            </Badge>
          </div>

          {hypothesis.conclusion.summary && (
            <p className="text-sm text-muted-foreground bg-background/50 p-3 rounded-lg">
              {hypothesis.conclusion.summary}
            </p>
          )}

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(hypothesis.conclusion.concludedAt).toLocaleDateString('ru-RU')}
            </span>
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              {ratedWeeks.length} из {weeklyProgress.length} недель оценено
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If user just selected a result (before next re-render with conclusion), show confirmation
  if (selectedResult) {
    const config = getResultConfig(selectedResult);
    return (
      <Card className={`border-2 ${config.bgColor}`}>
        <CardContent className="py-6">
          <div className="text-center space-y-3">
            <div className={`flex justify-center ${config.color}`}>{config.icon}</div>
            <p className="font-semibold text-lg">{config.label}</p>
            <p className="text-sm text-muted-foreground">Результат сохранён</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Main conclusion UI - experiment complete, awaiting user decision
  return (
    <Card className="border-2 border-amber-200 bg-amber-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy className="h-5 w-5 text-amber-500" />
          Эксперимент завершён!
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Hypothesis summary */}
        <div className="space-y-2 bg-background/70 p-4 rounded-lg">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Гипотеза</p>
            <p className="text-sm">
              <span className="font-medium">ЕСЛИ</span> {hypothesis.conditions}
            </p>
            <p className="text-sm">
              <span className="font-medium">ТО</span> {hypothesis.expectedOutcome}
            </p>
            <p className="text-sm">
              <span className="font-medium">ПОТОМУ ЧТО</span> {hypothesis.reasoning}
            </p>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 rounded-lg bg-background/70">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Star className="h-4 w-4 text-amber-500" />
              <span className="text-xl font-bold">{averageRating.toFixed(1)}</span>
            </div>
            <p className="text-xs text-muted-foreground">Средняя оценка</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-background/70">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-xl font-bold">{ratedWeeks.length}</span>
            </div>
            <p className="text-xs text-muted-foreground">Недель оценено</p>
          </div>
        </div>

        {/* Rating distribution */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            Распределение оценок
          </div>
          <div className="space-y-2">
            {distribution.map(d => (
              <div key={d.rating} className="flex items-center gap-2">
                <span className="text-xs w-16 text-muted-foreground">{d.label}</span>
                <div className="flex-1">
                  <Progress
                    value={maxCount > 0 ? (d.count / maxCount) * 100 : 0}
                    className="h-2"
                  />
                </div>
                <span className="text-xs font-medium w-6 text-right">{d.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Decision buttons */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-center">Была ли ваша гипотеза подтверждена?</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Button
              onClick={() => handleConfirm('confirmed')}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Подтверждена
            </Button>
            <Button
              onClick={() => handleConfirm('not_confirmed')}
              variant="destructive"
            >
              <XCircle className="h-4 w-4 mr-1" />
              Не подтверждена
            </Button>
            <Button
              onClick={() => handleConfirm('inconclusive')}
              variant="outline"
            >
              <HelpCircle className="h-4 w-4 mr-1" />
              Неопределённо
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
