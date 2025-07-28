import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Plus, Target, Users, CheckCircle, AlertTriangle, Sparkles } from 'lucide-react';
import { useEnhancedHypotheses } from '@/hooks/strategy';
import { HypothesisCard } from './HypothesisCard';

const EmptyState: React.FC<{ onCreateHypothesis: () => void }> = ({ onCreateHypothesis }) => (
  <div className="relative overflow-hidden">
    {/* Hero Background */}
    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 rounded-3xl" />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.1),transparent_50%)]" />
    
    <div className="relative flex flex-col items-center justify-center min-h-[500px] text-center space-y-8 p-8">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-xl animate-pulse" />
        <div className="relative bg-gradient-to-br from-primary/10 to-secondary/10 p-6 rounded-full border border-primary/20">
          <Lightbulb className="h-20 w-20 text-primary animate-fade-in" />
        </div>
        <Sparkles className="absolute -top-2 -right-2 h-8 w-8 text-secondary animate-pulse" />
      </div>
      
      <div className="space-y-4 max-w-lg">
        <h3 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Начните научный эксперимент
        </h3>
        <p className="text-muted-foreground text-lg leading-relaxed">
          Превратите улучшение качества жизни в увлекательный научный процесс. 
          Создавайте гипотезы, тестируйте их и получайте измеримые результаты.
        </p>
      </div>
      
      <Button 
        onClick={onCreateHypothesis}
        size="lg"
        className="bg-gradient-to-r from-primary via-primary/90 to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg hover:shadow-xl transition-all duration-300 text-lg px-8 py-6 rounded-xl hover:scale-105"
      >
        <Plus className="h-6 w-6 mr-3" />
        Создать первую гипотезу
      </Button>
      
      <div className="grid grid-cols-3 gap-4 mt-8 text-sm text-muted-foreground max-w-md">
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

const MetricsOverview: React.FC<{ metrics: any }> = ({ metrics }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 group">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardContent className="p-6 relative">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Активные гипотезы</p>
            <p className="text-3xl font-bold text-primary">{metrics.activeHypotheses}</p>
          </div>
          <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/20 rounded-xl flex items-center justify-center">
            <Target className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>

    <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 group">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardContent className="p-6 relative">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Валидные</p>
            <p className="text-3xl font-bold text-emerald-600">{metrics.validatedHypotheses}</p>
          </div>
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/10 to-emerald-500/20 rounded-xl flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-emerald-600" />
          </div>
        </div>
      </CardContent>
    </Card>

    <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 group">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardContent className="p-6 relative">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Субъекты</p>
            <p className="text-3xl font-bold text-blue-600">{metrics.totalSubjects}</p>
          </div>
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500/10 to-blue-500/20 rounded-xl flex items-center justify-center">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </CardContent>
    </Card>

    <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 group">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardContent className="p-6 relative">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Средний прогресс</p>
            <p className="text-3xl font-bold text-amber-600">{metrics.averageProgress}%</p>
          </div>
          <div className="w-12 h-12 bg-gradient-to-br from-amber-500/10 to-amber-500/20 rounded-xl flex items-center justify-center">
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
  
  console.log('StrategyDashboard: loading =', loading);
  const activeHypotheses = getActiveHypotheses();
  const metrics = getStrategyMetrics();
  console.log('StrategyDashboard: activeHypotheses =', activeHypotheses);
  console.log('StrategyDashboard: metrics =', metrics);

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
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 rounded-2xl" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 p-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
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
              className="bg-gradient-to-r from-primary via-primary/90 to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
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