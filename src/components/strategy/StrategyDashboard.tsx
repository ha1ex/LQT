import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Plus, Target, Users, CheckCircle, AlertTriangle, Sparkles } from 'lucide-react';
import { useEnhancedHypotheses } from '@/hooks/strategy';
import { HypothesisCard } from './HypothesisCard';
import type { StrategyMetrics } from '@/types/strategy';

const EmptyState: React.FC<{ onCreateHypothesis: () => void }> = ({ onCreateHypothesis }) => (
  <div className="relative overflow-hidden">
    {/* Hero Background */}
    <div className="absolute inset-0 rounded-3xl" style={{ background: 'var(--gradient-card)' }} />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.1),transparent_50%)]" />
    
    <div className="relative flex flex-col items-center justify-center min-h-[300px] sm:min-h-[500px] text-center space-y-6 sm:space-y-8 p-4 sm:p-8">
      <div className="relative">
        <div className="absolute inset-0 rounded-full blur-xl animate-pulse" style={{ background: 'var(--gradient-primary)' }} />
        <div className="relative p-6 rounded-full border border-primary/20" style={{ background: 'var(--gradient-secondary)' }}>
          <Lightbulb className="h-12 w-12 sm:h-20 sm:w-20 text-primary animate-fade-in" />
        </div>
        <Sparkles className="absolute -top-2 -right-2 h-8 w-8 text-secondary animate-pulse" />
      </div>
      
      <div className="space-y-4 max-w-lg">
        <h3 className="text-xl sm:text-3xl font-bold text-primary">
          Начните научный эксперимент
        </h3>
        <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
          Превратите улучшение качества жизни в увлекательный научный процесс. 
          Создавайте гипотезы, тестируйте их и получайте измеримые результаты.
        </p>
      </div>
      
      <Button 
        onClick={onCreateHypothesis}
        size="lg"
        className="shadow-lg hover:shadow-xl transition-all duration-300 text-lg px-8 py-6 rounded-xl hover:scale-105"
        style={{ background: 'var(--gradient-primary)', color: 'white' }}
      >
        <Plus className="h-6 w-6 mr-3" />
        Создать первую гипотезу
      </Button>
      
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-4 sm:mt-8 text-sm text-muted-foreground max-w-md">
        <div className="text-center">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
            <span className="text-primary font-bold">1</span>
          </div>
          <span>Формулируйте</span>
        </div>
        <div className="text-center">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
            <span className="text-primary font-bold">2</span>
          </div>
          <span>Тестируйте</span>
        </div>
        <div className="text-center">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
            <span className="text-primary font-bold">3</span>
          </div>
          <span>Улучшайтесь</span>
        </div>
      </div>
    </div>
  </div>
);

const MetricsOverview: React.FC<{ metrics: StrategyMetrics }> = ({ metrics }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 group">
      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardContent className="p-6 relative">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Активные гипотезы</p>
            <p className="text-3xl font-bold text-primary">{metrics.activeHypotheses}</p>
          </div>
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <Target className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>

    <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 group">
      <div className="absolute inset-0 bg-success/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardContent className="p-6 relative">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Валидные</p>
            <p className="text-3xl font-bold text-emerald-600">{metrics.validatedHypotheses}</p>
          </div>
          <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-emerald-600" />
          </div>
        </div>
      </CardContent>
    </Card>

    <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 group">
      <div className="absolute inset-0 bg-info/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardContent className="p-6 relative">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Субъекты</p>
            <p className="text-3xl font-bold text-primary">{metrics.totalSubjects}</p>
          </div>
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <Users className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>

    <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 group">
      <div className="absolute inset-0 bg-warning/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardContent className="p-6 relative">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Средний прогресс</p>
            <p className="text-3xl font-bold text-amber-600">{metrics.averageProgress}%</p>
          </div>
          <div className="w-12 h-12 bg-warning/10 rounded-xl flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-amber-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

interface StrategyDashboardProps {
  onCreateHypothesis: () => void;
  onViewHypothesis: (id: string) => void;
}

export const StrategyDashboard: React.FC<StrategyDashboardProps> = ({
  onCreateHypothesis,
  onViewHypothesis
}) => {
  const { getActiveHypotheses, getStrategyMetrics, loading } = useEnhancedHypotheses();
  
  const activeHypotheses = getActiveHypotheses();
  const metrics = getStrategyMetrics();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 rounded-2xl" style={{ background: 'var(--gradient-secondary)' }} />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 p-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-primary">
              Стратегия развития
            </h1>
            <p className="text-muted-foreground text-lg">
              Научный подход к улучшению качества жизни через эксперименты
            </p>
          </div>
          
          {activeHypotheses.length > 0 && (
            <Button 
              onClick={onCreateHypothesis}
              size="lg"
              className="shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              style={{ background: 'var(--gradient-primary)', color: 'white' }}
            >
              <Plus className="h-5 w-5 mr-2" />
              Новая гипотеза
            </Button>
          )}
        </div>
      </div>

      {/* Show empty state or content */}
      {activeHypotheses.length === 0 ? (
        <EmptyState onCreateHypothesis={onCreateHypothesis} />
      ) : (
        <>
          {/* Metrics Overview */}
          <MetricsOverview metrics={metrics} />
          
          {/* Hypotheses List */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">
                Активные эксперименты
              </h2>
              <Badge variant="outline" className="text-muted-foreground px-3 py-1">
                {activeHypotheses.length} в работе
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {activeHypotheses.map((hypothesis, index) => (
                <div key={hypothesis.id} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                  <HypothesisCard
                    hypothesis={hypothesis}
                    priority={index + 1}
                    onView={() => onViewHypothesis(hypothesis.id)}
                  />
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};