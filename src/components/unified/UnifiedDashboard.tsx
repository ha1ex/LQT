import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Network,
  Brain,
  Activity,
  Zap,
  Users,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';
import { SystemConnectionsView } from './SystemConnectionsView';
import { NetworkVisualization } from './NetworkVisualization';
import { useUnifiedSystem } from '@/hooks/useUnifiedSystem';

interface UnifiedDashboardProps {
  onNavigateToSection?: (section: string, id?: string) => void;
}

export const UnifiedDashboard: React.FC<UnifiedDashboardProps> = ({
  onNavigateToSection
}) => {
  const { 
    unifiedMetrics, 
    systemHealth, 
    crossSectionAnalytics,
    unifiedRecommendations,
    isAnalyzing 
  } = useUnifiedSystem();

  const [selectedTab, setSelectedTab] = useState('overview');

  // Группировка метрик по категориям
  const metricsByCategory = unifiedMetrics.reduce((acc, metric) => {
    if (!acc[metric.category]) acc[metric.category] = [];
    acc[metric.category].push(metric);
    return acc;
  }, {} as Record<string, typeof unifiedMetrics>);

  // Топ проблемных метрик
  const problemMetrics = unifiedMetrics
    .filter(m => m.currentValue <= 5)
    .sort((a, b) => a.currentValue - b.currentValue)
    .slice(0, 3);

  // Топ успешных метрик
  const successMetrics = unifiedMetrics
    .filter(m => m.currentValue >= 8)
    .sort((a, b) => b.currentValue - a.currentValue)
    .slice(0, 3);

  // Метрики с активными экспериментами
  const metricsWithExperiments = unifiedMetrics.filter(m => m.relatedHypotheses.length > 0);

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <ArrowUpRight className="h-4 w-4 text-green-600" />;
      case 'down': return <ArrowDownRight className="h-4 w-4 text-red-600" />;
      case 'stable': return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getMetricColor = (value: number) => {
    if (value >= 8) return 'text-green-600 dark:text-green-400';
    if (value >= 6) return 'text-yellow-600 dark:text-yellow-400';
    if (value >= 4) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'health': return '💪';
      case 'relationships': return '❤️';
      case 'career': return '💼';
      case 'finance': return '💰';
      case 'education': return '📚';
      case 'hobbies': return '🎨';
      default: return '📊';
    }
  };

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Единая система</h1>
          <p className="text-muted-foreground">
            Интегрированный взгляд на все ваши данные и их взаимосвязи
          </p>
        </div>
        {isAnalyzing && (
          <Badge variant="outline" className="animate-pulse">
            <Brain className="h-3 w-3 mr-1" />
            Анализируется...
          </Badge>
        )}
      </div>

      {/* Общие KPI */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Здоровье системы</p>
                <p className="text-2xl font-bold">{systemHealth.overall}%</p>
              </div>
              <div className="p-2 rounded-lg bg-gradient-to-br from-green-500/20 to-green-600/20">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <Progress value={systemHealth.overall} className="mt-3 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Активных экспериментов</p>
                <p className="text-2xl font-bold">{systemHealth.activeExperiments}</p>
              </div>
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-600/20">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Системных связей</p>
                <p className="text-2xl font-bold">{systemHealth.totalConnections}</p>
              </div>
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/20">
                <Network className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Рекомендаций</p>
                <p className="text-2xl font-bold">{unifiedRecommendations.length}</p>
              </div>
              <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-600/20">
                <Brain className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="metrics">Метрики</TabsTrigger>
          <TabsTrigger value="connections">Связи</TabsTrigger>
          <TabsTrigger value="network">Сеть</TabsTrigger>
        </TabsList>

        {/* Обзор */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Проблемные области */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <TrendingDown className="h-5 w-5" />
                  Требуют внимания
                </CardTitle>
                <CardDescription>
                  Метрики с низкими оценками
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {problemMetrics.length > 0 ? (
                  problemMetrics.map((metric) => (
                    <div 
                      key={metric.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => onNavigateToSection?.('dashboard', metric.id)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{metric.icon}</span>
                        <div>
                          <div className="font-medium">{metric.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {metric.relatedHypotheses.length > 0 
                              ? `${metric.relatedHypotheses.length} активных экспериментов`
                              : 'Нет активных экспериментов'
                            }
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-lg font-bold ${getMetricColor(metric.currentValue)}`}>
                          {metric.currentValue.toFixed(1)}
                        </span>
                        {getTrendIcon(metric.trend)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Все метрики в норме!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Успешные области */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <TrendingUp className="h-5 w-5" />
                  Сильные стороны
                </CardTitle>
                <CardDescription>
                  Метрики с высокими оценками
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {successMetrics.length > 0 ? (
                  successMetrics.map((metric) => (
                    <div 
                      key={metric.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => onNavigateToSection?.('dashboard', metric.id)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{metric.icon}</span>
                        <div>
                          <div className="font-medium">{metric.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Можно использовать как основу для других целей
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-lg font-bold ${getMetricColor(metric.currentValue)}`}>
                          {metric.currentValue.toFixed(1)}
                        </span>
                        {getTrendIcon(metric.trend)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Пока нет выдающихся результатов</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Активные эксперименты */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Активные эксперименты
              </CardTitle>
              <CardDescription>
                Метрики с запущенными гипотезами
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {metricsWithExperiments.map((metric) => (
                  <div 
                    key={metric.id}
                    className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => onNavigateToSection?.('strategy', metric.relatedHypotheses[0])}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg">{metric.icon}</span>
                      <Badge variant="outline">
                        {metric.relatedHypotheses.length} экс.
                      </Badge>
                    </div>
                    <h4 className="font-medium mb-1">{metric.name}</h4>
                    <div className="flex items-center justify-between">
                      <span className={`font-bold ${getMetricColor(metric.currentValue)}`}>
                        {metric.currentValue.toFixed(1)}
                      </span>
                      {metric.targetValue && (
                        <span className="text-sm text-muted-foreground">
                          → {metric.targetValue}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {metricsWithExperiments.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Нет активных экспериментов</p>
                  <Button 
                    variant="outline" 
                    className="mt-2"
                    onClick={() => onNavigateToSection?.('strategy')}
                  >
                    Создать гипотезу
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Детализация метрик */}
        <TabsContent value="metrics" className="space-y-6">
          {Object.entries(metricsByCategory).map(([category, metrics]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-xl">{getCategoryIcon(category)}</span>
                  {category === 'health' ? 'Здоровье' :
                   category === 'relationships' ? 'Отношения' :
                   category === 'career' ? 'Карьера' :
                   category === 'finance' ? 'Финансы' :
                   category === 'education' ? 'Обучение' :
                   category === 'hobbies' ? 'Хобби' : category}
                </CardTitle>
                <CardDescription>
                  {metrics.length} метрик в категории
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {metrics.map((metric) => (
                    <div 
                      key={metric.id}
                      className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => onNavigateToSection?.('dashboard', metric.id)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xl">{metric.icon}</span>
                        <div className="flex items-center gap-1">
                          {getTrendIcon(metric.trend)}
                          <span className={`text-lg font-bold ${getMetricColor(metric.currentValue)}`}>
                            {metric.currentValue.toFixed(1)}
                          </span>
                        </div>
                      </div>
                      
                      <h4 className="font-medium mb-2">{metric.name}</h4>
                      
                      <div className="space-y-2">
                        {metric.targetValue && (
                          <div className="text-sm text-muted-foreground">
                            Цель: {metric.targetValue}
                          </div>
                        )}
                        
                        <div className="flex flex-wrap gap-1">
                          {metric.relatedHypotheses.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {metric.relatedHypotheses.length} экс.
                            </Badge>
                          )}
                          {metric.correlations.length > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {metric.correlations.length} связей
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Системные связи */}
        <TabsContent value="connections">
          <SystemConnectionsView onNavigateToSection={onNavigateToSection} />
        </TabsContent>

        {/* Сетевая визуализация */}
        <TabsContent value="network">
          <NetworkVisualization onNodeClick={onNavigateToSection} />
        </TabsContent>
      </Tabs>
    </div>
  );
};