import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Target, AlertTriangle, CheckCircle, TrendingUp, Clock } from 'lucide-react';
import { EnhancedHypothesis } from '@/types/strategy';
import { getPriorityCategory, getRatingColor } from '@/utils/strategy';

interface HypothesisHeroProps {
  hypothesis: EnhancedHypothesis;
  onBack: () => void;
}

export const HypothesisHero: React.FC<HypothesisHeroProps> = ({ hypothesis, onBack }) => {
  const priorityCategory = getPriorityCategory(hypothesis.calculatedPriority || 0);
  
  // Вычисляем последнюю оценку для отображения тренда
  const recentRatings = hypothesis.weeklyProgress
    ?.filter(w => w.rating > 0)
    ?.slice(-2) || [];
  
  const currentRating = recentRatings[recentRatings.length - 1]?.rating || 0;
  const prevRating = recentRatings[recentRatings.length - 2]?.rating || 0;
  const trend = currentRating - prevRating;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-secondary/5 to-background p-8">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary rounded-full -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary rounded-full translate-y-24 -translate-x-24" />
      </div>
      
      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button 
            onClick={onBack} 
            variant="outline" 
            className="flex items-center gap-2 hover:scale-105 transition-all duration-200 bg-background/80 backdrop-blur-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Вернуться
          </Button>
          
          <div className="flex items-center gap-3">
            {/* Validation Status */}
            <Badge 
              variant={hypothesis.validationStatus === 'validated' ? 'default' : 'secondary'}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium"
            >
              {hypothesis.validationStatus === 'validated' ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
              {hypothesis.validationStatus === 'validated' ? 'Валидная' : 'Требует доработки'}
            </Badge>
            
            {/* Priority Badge */}
            <Badge 
              className={`${priorityCategory.gradient} text-white border-0 px-4 py-2 text-sm font-medium shadow-lg`}
            >
              {priorityCategory.label} приоритет
            </Badge>
          </div>
        </div>

        {/* Goal & Main Info */}
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 space-y-2">
              <h1 className="text-3xl font-bold text-foreground leading-tight">
                {hypothesis.goal.description}
              </h1>
              <p className="text-lg text-muted-foreground">
                Цель: {hypothesis.goal.targetValue} (текущее: {hypothesis.goal.currentValue})
              </p>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Priority Score */}
          <div className="bg-background/60 backdrop-blur-sm border border-border/50 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold mb-1" style={{ color: priorityCategory.color }}>
              {hypothesis.calculatedPriority?.toFixed(1)}
            </div>
            <div className="text-sm text-muted-foreground">Приоритет</div>
          </div>
          
          {/* Progress */}
          <div className="bg-background/60 backdrop-blur-sm border border-border/50 rounded-xl p-4">
            <div className="text-3xl font-bold mb-1 text-primary">
              {hypothesis.progress || 0}%
            </div>
            <div className="text-sm text-muted-foreground mb-2">Прогресс</div>
            <Progress value={hypothesis.progress || 0} className="h-2" />
          </div>
          
          {/* Current Rating */}
          <div className="bg-background/60 backdrop-blur-sm border border-border/50 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-3xl font-bold" style={{ color: getRatingColor(currentRating) }}>
                {currentRating || '?'}
              </span>
              {trend !== 0 && (
                <div className={`flex items-center text-sm ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  <TrendingUp className={`h-4 w-4 ${trend < 0 ? 'rotate-180' : ''}`} />
                  <span className="ml-1">{trend > 0 ? '+' : ''}{trend}</span>
                </div>
              )}
            </div>
            <div className="text-sm text-muted-foreground">Текущая оценка</div>
          </div>
          
          {/* Time Progress */}
          <div className="bg-background/60 backdrop-blur-sm border border-border/50 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold mb-1 text-primary">
              {hypothesis.timeframe}
            </div>
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <Clock className="h-3 w-3" />
              недель
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};