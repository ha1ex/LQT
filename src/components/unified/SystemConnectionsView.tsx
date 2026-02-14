import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Network, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Brain, 
  Activity,
  Zap,
  ArrowRight,
  GitBranch
} from 'lucide-react';
import { useUnifiedSystem } from '@/hooks/useUnifiedSystem';

interface SystemConnectionsViewProps {
  className?: string;
  onNavigateToSection?: (section: string, id?: string) => void;
}

export const SystemConnectionsView: React.FC<SystemConnectionsViewProps> = ({
  className = '',
  onNavigateToSection
}) => {
  const { 
    unifiedMetrics, 
    systemConnections, 
    crossSectionAnalytics, 
    systemHealth,
    unifiedRecommendations 
  } = useUnifiedSystem();

  const [, setSelectedConnection] = useState<string | null>(null);

  // Группировка связей по типам
  const connectionsByType = useMemo(() => {
    return systemConnections.reduce((acc, conn) => {
      if (!acc[conn.type]) acc[conn.type] = [];
      acc[conn.type].push(conn);
      return acc;
    }, {} as Record<string, typeof systemConnections>);
  }, [systemConnections]);

  // Топ корреляций
  const topCorrelations = useMemo(() => {
    return crossSectionAnalytics.metricCorrelations
      .sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation))
      .slice(0, 5);
  }, [crossSectionAnalytics.metricCorrelations]);

  const getConnectionIcon = (type: string) => {
    switch (type) {
      case 'metric-hypothesis': return <Target className="h-4 w-4" />;
      case 'metric-rating': return <Activity className="h-4 w-4" />;
      case 'hypothesis-insight': return <Brain className="h-4 w-4" />;
      case 'rating-insight': return <Zap className="h-4 w-4" />;
      default: return <Network className="h-4 w-4" />;
    }
  };

  const getMetricName = (metricId: string) => {
    return unifiedMetrics.find(m => m.id === metricId)?.name || metricId;
  };

  const getCorrelationColor = (correlation: number) => {
    const abs = Math.abs(correlation);
    if (abs >= 0.8) return 'text-red-600 dark:text-red-400';
    if (abs >= 0.6) return 'text-orange-600 dark:text-orange-400';
    if (abs >= 0.4) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-blue-600 dark:text-blue-400';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Заголовок системы */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10">
              <Network className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>Системные связи</CardTitle>
              <CardDescription>
                Взаимосвязи между метриками, гипотезами и инсайтами
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Здоровье системы */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{systemHealth.overall}%</div>
              <div className="text-sm text-muted-foreground">Общее здоровье</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{systemHealth.activeExperiments}</div>
              <div className="text-sm text-muted-foreground">Активных экспериментов</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{systemHealth.totalConnections}</div>
              <div className="text-sm text-muted-foreground">Системных связей</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{topCorrelations.length}</div>
              <div className="text-sm text-muted-foreground">Сильных корреляций</div>
            </div>
          </div>

          {/* Прогресс по категориям */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Метрики</span>
              <span>{systemHealth.metrics}%</span>
            </div>
            <Progress value={systemHealth.metrics} className="h-2" />
            
            <div className="flex justify-between text-sm">
              <span>Эксперименты</span>
              <span>{systemHealth.experiments}%</span>
            </div>
            <Progress value={systemHealth.experiments} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="correlations" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="correlations">Корреляции</TabsTrigger>
          <TabsTrigger value="connections">Связи</TabsTrigger>
          <TabsTrigger value="effectiveness">Эффективность</TabsTrigger>
          <TabsTrigger value="recommendations">Рекомендации</TabsTrigger>
        </TabsList>

        {/* Корреляции */}
        <TabsContent value="correlations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                Топ корреляций между метриками
              </CardTitle>
              <CardDescription>
                Сильные взаимосвязи, которые можно использовать для улучшений
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {topCorrelations.length > 0 ? (
                topCorrelations.map((correlation, _index) => (
                  <div
                    key={`${correlation.metric1}-${correlation.metric2}`}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => onNavigateToSection?.('analytics', 'correlations')}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{getMetricName(correlation.metric1)}</span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{getMetricName(correlation.metric2)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline" 
                        className={getCorrelationColor(correlation.correlation)}
                      >
                        {correlation.correlation > 0 ? '+' : ''}{(correlation.correlation * 100).toFixed(0)}%
                      </Badge>
                      {correlation.correlation > 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <GitBranch className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Недостаточно данных для анализа корреляций</p>
                  <p className="text-sm">Добавьте больше еженедельных оценок</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Системные связи */}
        <TabsContent value="connections" className="space-y-4">
          {Object.entries(connectionsByType).map(([type, connections]) => (
            <Card key={type}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getConnectionIcon(type)}
                  {type === 'metric-hypothesis' && 'Метрики → Гипотезы'}
                  {type === 'metric-rating' && 'Метрики → Рейтинги'}
                  {type === 'hypothesis-insight' && 'Гипотезы → Инсайты'}
                  {type === 'rating-insight' && 'Рейтинги → Инсайты'}
                </CardTitle>
                <CardDescription>
                  {connections.length} активных связей
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {connections.slice(0, 3).map((connection, _index) => (
                  <div 
                    key={connection.id}
                    className="flex items-center justify-between p-2 rounded border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedConnection(connection.id)}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className="text-sm">{connection.description}</span>
                    </div>
                    <Badge variant="outline">
                      Сила: {Math.round(connection.strength * 100)}%
                    </Badge>
                  </div>
                ))}
                {connections.length > 3 && (
                  <Button variant="ghost" size="sm" className="w-full mt-2">
                    Показать еще {connections.length - 3} связей
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Эффективность гипотез */}
        <TabsContent value="effectiveness" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Эффективность экспериментов
              </CardTitle>
              <CardDescription>
                Как гипотезы влияют на ваши метрики
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {crossSectionAnalytics.hypothesesEffectiveness.length > 0 ? (
                crossSectionAnalytics.hypothesesEffectiveness.map((effectiveness, index) => (
                  <div 
                    key={effectiveness.hypothesisId}
                    className="p-4 rounded-lg border bg-card space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Эксперимент #{index + 1}</span>
                      <Badge 
                        variant={effectiveness.overallSuccess >= 70 ? "default" : effectiveness.overallSuccess >= 40 ? "secondary" : "destructive"}
                      >
                        {Math.round(effectiveness.overallSuccess)}% успех
                      </Badge>
                    </div>
                    
                    <Progress 
                      value={effectiveness.overallSuccess} 
                      className="h-2"
                    />
                    
                    <div className="text-sm text-muted-foreground">
                      Время до эффекта: {effectiveness.timeToEffect} недель
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Нет завершенных экспериментов для анализа</p>
                  <p className="text-sm">Создайте и проведите гипотезы для получения данных</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Унифицированные рекомендации */}
        <TabsContent value="recommendations" className="space-y-4">
          {unifiedRecommendations.slice(0, 5).map((recommendation) => (
            <Card key={recommendation.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{recommendation.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {recommendation.description}
                    </CardDescription>
                  </div>
                  <Badge 
                    variant={recommendation.priority === 'high' ? 'destructive' : recommendation.priority === 'medium' ? 'default' : 'secondary'}
                  >
                    {recommendation.priority === 'high' ? 'Высокий' : recommendation.priority === 'medium' ? 'Средний' : 'Низкий'} приоритет
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  <strong>Обоснование:</strong> {recommendation.reasoning}
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {recommendation.affectedSections.map((section) => (
                    <Badge key={section} variant="outline" className="text-xs">
                      {section === 'dashboard' ? 'Дашборд' : 
                       section === 'strategy' ? 'Стратегия' :
                       section === 'ratings' ? 'Оценки' :
                       section === 'ai' ? 'ИИ' : 
                       section === 'analytics' ? 'Аналитика' : section}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Ожидаемый результат:</span>
                    <br />
                    <span>{recommendation.expectedOutcome}</span>
                  </div>
                  <div className="text-right text-sm">
                    <div className="text-muted-foreground">Уверенность</div>
                    <div className="font-semibold">{recommendation.confidence}%</div>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-2">
                  {recommendation.actions.slice(0, 2).map((action, index) => (
                    <Button 
                      key={index}
                      variant="outline" 
                      size="sm"
                      onClick={() => onNavigateToSection?.(action.section, action.params?.metricId as string | undefined)}
                    >
                      {action.action === 'CREATE_HYPOTHESIS' ? 'Создать гипотезу' :
                       action.action === 'CREATE_CORRELATION_HYPOTHESIS' ? 'Создать связную гипотезу' :
                       action.action === 'REPLICATE_HYPOTHESIS' ? 'Повторить успех' :
                       'Выполнить'}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
          
          {unifiedRecommendations.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Пока нет рекомендаций</p>
              <p className="text-sm">Добавьте больше данных для получения персональных советов</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};