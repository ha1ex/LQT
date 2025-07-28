import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from '@/components/ui/safe-recharts';
import { Activity, Info, TrendingUp, TrendingDown, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface CorrelationData {
  metric: string;
  correlation: number;
  strength: 'strong' | 'moderate' | 'weak';
  description?: string;
  recommendation?: string;
}

interface CorrelationAnalysisProps {
  data: CorrelationData[];
  targetMetric: string;
}

const CorrelationAnalysis: React.FC<CorrelationAnalysisProps> = ({ data, targetMetric }) => {
  const [selectedCorrelation, setSelectedCorrelation] = useState<CorrelationData | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  
  const getCorrelationColor = (correlation: number) => {
    const abs = Math.abs(correlation);
    if (abs >= 0.7) return correlation > 0 ? 'hsl(var(--success))' : 'hsl(var(--destructive))';
    if (abs >= 0.4) return correlation > 0 ? 'hsl(var(--warning))' : 'hsl(var(--orange))';
    return 'hsl(var(--muted-foreground))';
  };

  const getRecommendation = (item: CorrelationData) => {
    const [metric1, metric2] = item.metric.split(' ↔ ');
    const isPositive = item.correlation > 0;
    const strength = item.strength;
    
    if (strength === 'strong') {
      return isPositive 
        ? `Улучшение "${metric1}" сильно повышает "${metric2}". Фокус на этой области даст максимальный эффект.`
        : `"${metric1}" и "${metric2}" работают в противофазе. Балансируйте эти области осознанно.`;
    } else if (strength === 'moderate') {
      return isPositive
        ? `"${metric1}" и "${metric2}" умеренно связаны. Работа над одной областью поможет другой.`
        : `Между "${metric1}" и "${metric2}" есть обратная связь. Учитывайте это при планировании.`;
    } else {
      return `Связь между "${metric1}" и "${metric2}" слабая, но может быть важной в вашем конкретном случае.`;
    }
  };

  const handleBarClick = (data: any) => {
    const correlation = data?.payload;
    if (correlation) {
      setSelectedCorrelation({
        ...correlation,
        recommendation: getRecommendation(correlation)
      });
      setShowDetails(true);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">
                {targetMetric === 'Общий индекс' 
                  ? 'Взаимосвязи между метриками' 
                  : `Корреляции с "${targetMetric}"`}
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="text-muted-foreground hover:text-foreground"
            >
              <Info className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
      
          <div className="h-64 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.filter(item => 
                item && 
                typeof item.correlation === 'number' && 
                !isNaN(item.correlation) && 
                isFinite(item.correlation)
              )} layout="horizontal">
                <XAxis 
                  type="number" 
                  domain={[-1, 1]} 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  type="category" 
                  dataKey="metric" 
                  axisLine={false} 
                  tickLine={false} 
                  width={targetMetric === 'Общий индекс' ? 180 : 120}
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip 
                  formatter={(value: any) => [`${(Number(value) * 100).toFixed(0)}%`, 'Корреляция']}
                  labelFormatter={(label) => `${label}`}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    fontSize: '12px'
                  }}
                />
                <Bar 
                  dataKey="correlation" 
                  radius={[0, 4, 4, 0]}
                  onClick={handleBarClick}
                  className="cursor-pointer transition-all duration-200 hover:opacity-80"
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={getCorrelationColor(entry.correlation)}
                      className="hover:brightness-110 transition-all duration-200"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
      
          {data.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">Недостаточно данных для анализа корреляций</p>
              <p className="text-xs mt-1">Добавьте больше оценок для получения инсайтов</p>
            </div>
          ) : (
            <>
              <Collapsible open={showDetails} onOpenChange={setShowDetails}>
                <CollapsibleContent className="mb-4">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <div className="space-y-2 text-sm">
                        <p className="font-medium text-blue-900 dark:text-blue-100">Как читать корреляции:</p>
                        <div className="space-y-1 text-blue-800 dark:text-blue-200">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-green-600" />
                            <span>Положительная: улучшение одного → улучшение другого</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <TrendingDown className="w-4 h-4 text-red-600" />
                            <span>Отрицательная: улучшение одного → ухудшение другого</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Интерактивные корреляции */}
              <div className="space-y-3 mb-4">
                {data.slice(0, 5).map((item, index) => {
                  const isPositive = item.correlation > 0;
                  const strengthLabel = item.strength === 'strong' ? 'сильная' : 
                                      item.strength === 'moderate' ? 'умеренная' : 'слабая';
                  
                  return (
                    <div 
                      key={index} 
                      className="group bg-gradient-to-r from-muted/30 to-muted/10 hover:from-muted/50 hover:to-muted/20 rounded-xl p-4 border border-border/50 hover:border-border transition-all duration-200 cursor-pointer"
                      onClick={() => {
                        setSelectedCorrelation({
                          ...item,
                          recommendation: getRecommendation(item)
                        });
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${
                            isPositive ? 'bg-green-500' : 'bg-red-500'
                          }`} />
                          <div>
                            <p className="font-medium text-sm group-hover:text-foreground transition-colors">
                              {item.metric}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                item.strength === 'strong' ? 'bg-primary/20 text-primary' :
                                item.strength === 'moderate' ? 'bg-warning/20 text-warning' :
                                'bg-muted text-muted-foreground'
                              }`}>
                                {strengthLabel}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {(item.correlation * 100).toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        </div>
                        {isPositive ? (
                          <TrendingUp className="w-5 h-5 text-green-600 group-hover:scale-110 transition-transform" />
                        ) : (
                          <TrendingDown className="w-5 h-5 text-red-600 group-hover:scale-110 transition-transform" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Общие инсайты */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium mb-2 text-amber-900 dark:text-amber-100">
                      💡 Ключевые инсайты:
                    </h4>
                    <div className="space-y-1 text-xs text-amber-800 dark:text-amber-200">
                      {data.length > 0 && (
                        <>
                          <p>• Самая сильная связь: {data[0]?.metric} ({(data[0]?.correlation * 100).toFixed(0)}%)</p>
                          <p>• Найдено {data.filter(d => d.strength === 'strong').length} сильных корреляций</p>
                          <p>• Кликните на корреляцию для получения персональных рекомендаций</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Детальная панель выбранной корреляции */}
      {selectedCorrelation && (
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Детальный анализ
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedCorrelation(null)}
                className="h-8 w-8 p-0"
              >
                ×
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-sm mb-2">{selectedCorrelation.metric}</h4>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Сила связи:</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      selectedCorrelation.strength === 'strong' ? 'bg-primary/20 text-primary' :
                      selectedCorrelation.strength === 'moderate' ? 'bg-warning/20 text-warning' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {selectedCorrelation.strength === 'strong' ? 'Сильная' :
                       selectedCorrelation.strength === 'moderate' ? 'Умеренная' : 'Слабая'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Корреляция:</span>
                    <span className="font-medium">
                      {(selectedCorrelation.correlation * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium mb-1">Персональная рекомендация:</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {selectedCorrelation.recommendation}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CorrelationAnalysis;