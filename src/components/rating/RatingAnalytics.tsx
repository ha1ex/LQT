import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WeeklyRatingAnalytics } from '@/types/weeklyRating';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from '@/components/ui/safe-recharts';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Calendar, Target, Award, BarChart3 } from 'lucide-react';

interface RatingAnalyticsProps {
  analytics: WeeklyRatingAnalytics;
  allMetrics: Array<{ id: string; name: string; icon: string; description: string; category: string }>;
}

const RatingAnalytics: React.FC<RatingAnalyticsProps> = ({ analytics, allMetrics }) => {
  const { averageByMetric, trendsOverTime, bestWeek, worstWeek, moodDistribution } = analytics;

  // Данные для графика включая пропуски
  const chartData = trendsOverTime.map(item => ({
    ...item,
    averageScore: item.hasData === false ? null : item.averageScore
  }));
  // Если данных нет, показываем сообщение о загрузке
  if (trendsOverTime.length === 0) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Загрузка...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">...</div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Prepare metrics data for charts
  const metricsChartData = useMemo(() => {
    return Object.entries(averageByMetric)
      .filter(([metricId, average]) => typeof average === 'number' && !isNaN(average))
      .map(([metricId, average]) => {
        const metric = allMetrics.find(m => m.id === metricId);
        return {
          name: metric?.name || metricId,
          value: average,
          icon: metric?.icon || '📊'
        };
      }).sort((a, b) => b.value - a.value);
  }, [averageByMetric, allMetrics]);

  // Mood colors
  const moodColors = {
    excellent: '#22c55e',
    good: '#84cc16',
    neutral: '#eab308',
    poor: '#f97316',
    terrible: '#ef4444'
  };

  // Mood chart data
  const moodChartData = Object.entries(moodDistribution).map(([mood, count]) => ({
    name: mood,
    value: count,
    color: moodColors[mood as keyof typeof moodColors]
  }));

  const getScoreColor = (score: number) => {
    if (score >= 7) return 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800';
    if (score >= 5) return 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800';
    return 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800';
  };

  const getBarColor = (score: number) => {
    if (score >= 7) return 'bg-emerald-500 dark:bg-emerald-400';
    if (score >= 5) return 'bg-amber-500 dark:bg-amber-400';
    return 'bg-red-500 dark:bg-red-400';
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (current < previous) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <div className="w-4 h-4" />;
  };

  const overallTrend = trendsOverTime.length >= 2 ? 
    (trendsOverTime[trendsOverTime.length - 1]?.averageScore || 0) - (trendsOverTime[trendsOverTime.length - 2]?.averageScore || 0) : 0;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Всего недель</p>
                <p className="text-2xl font-bold">{trendsOverTime.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Средний балл</p>
                <div className="flex items-center gap-2">
                <p className="text-2xl font-bold">
                  {trendsOverTime.length > 0 
                    ? (() => {
                        const validScores = trendsOverTime.filter(week => typeof week.averageScore === 'number' && !isNaN(week.averageScore));
                        return validScores.length > 0 
                          ? (validScores.reduce((sum, week) => sum + week.averageScore, 0) / validScores.length).toFixed(1)
                          : '0.0';
                      })()
                    : '0.0'
                  }
                  </p>
                  {getTrendIcon(
                    trendsOverTime[trendsOverTime.length - 1]?.averageScore || 0,
                    trendsOverTime[trendsOverTime.length - 2]?.averageScore || 0
                  )}
                </div>
              </div>
              <Target className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Лучшая неделя</p>
                <p className="text-2xl font-bold">
                  {bestWeek ? bestWeek.overallScore.toFixed(1) : '—'}
                </p>
                {bestWeek && (
                  <p className="text-xs text-muted-foreground">
                    {format(bestWeek.startDate, 'dd.MM', { locale: ru })}
                  </p>
                )}
              </div>
              <Award className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Оценено метрик</p>
                <p className="text-2xl font-bold">{Object.keys(averageByMetric).length}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trends Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Динамика оценок по времени</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      stroke="hsl(var(--muted-foreground))"
                      tickFormatter={(value) => {
                        try {
                          return new Date(value).toLocaleDateString('ru-RU', { 
                            month: 'short', 
                            day: 'numeric' 
                          });
                        } catch {
                          return value;
                        }
                      }}
                    />
                    <YAxis 
                      domain={[0, 10]} 
                      stroke="hsl(var(--muted-foreground))"
                      tickFormatter={(value) => value.toFixed(1)}
                    />
                    <Tooltip 
                      formatter={(value: any) => [`${value.toFixed(1)}`, 'Средний балл']}
                      labelFormatter={(label) => {
                        try {
                          return `Неделя: ${new Date(label).toLocaleDateString('ru-RU')}`;
                        } catch {
                          return `Неделя: ${label}`;
                        }
                      }}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        color: 'hsl(var(--card-foreground))'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="averageScore" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                      name="Средний балл"
                      connectNulls={false}
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Нет данных для отображения</p>
                  <p className="text-sm">Добавьте оценки за несколько недель</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Metrics Ranking — ultra-compact */}
        {metricsChartData.length > 0 && (
          <Card className="p-3">
            <p className="text-xs font-medium text-muted-foreground mb-2">Средние оценки по критериям</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
              {metricsChartData.map((metric) => (
                <div key={metric.name} className="flex items-center gap-1.5">
                  <span className="text-xs shrink-0">{metric.icon}</span>
                  <span className="text-[11px] truncate min-w-0 flex-1 text-muted-foreground">{metric.name}</span>
                  <div className="w-12 bg-muted rounded-full h-1 shrink-0">
                    <div
                      className={cn("h-1 rounded-full", getBarColor(metric.value))}
                      style={{ width: `${(metric.value / 10) * 100}%` }}
                    />
                  </div>
                  <span className={cn(
                    "text-[11px] font-semibold tabular-nums shrink-0",
                    metric.value >= 7 ? 'text-emerald-600 dark:text-emerald-400' :
                    metric.value >= 5 ? 'text-amber-600 dark:text-amber-400' :
                    'text-red-600 dark:text-red-400'
                  )}>
                    {metric.value.toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Mood Distribution */}
        {moodChartData.some(mood => mood.value > 0) && (
          <Card>
            <CardHeader>
              <CardTitle>Распределение настроения</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={moodChartData.filter(mood => 
                        mood.value > 0 && 
                        typeof mood.value === 'number' && 
                        !isNaN(mood.value) && 
                        isFinite(mood.value)
                      )}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {moodChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                     </Pie>
                     <Tooltip 
                       contentStyle={{
                         backgroundColor: 'hsl(var(--card))',
                         border: '1px solid hsl(var(--border))',
                         borderRadius: '8px',
                         color: 'hsl(var(--card-foreground))'
                       }}
                     />
                   </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Best/Worst Weeks */}
      {(bestWeek || worstWeek) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {bestWeek && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-green-500" />
                  Лучшая неделя
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Неделя {bestWeek.weekNumber}</span>
                  <Badge className={cn("px-2 py-1", getScoreColor(bestWeek.overallScore))}>
                    {bestWeek.overallScore.toFixed(1)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {format(bestWeek.startDate, 'dd MMMM', { locale: ru })} - {format(bestWeek.endDate, 'dd MMMM yyyy', { locale: ru })}
                </p>
                {bestWeek.keyEvents.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-1">Ключевые события:</p>
                    <ul className="text-sm text-muted-foreground">
                      {bestWeek.keyEvents.map((event, index) => (
                        <li key={index}>• {event}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {worstWeek && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-red-500" />
                  Сложная неделя
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Неделя {worstWeek.weekNumber}</span>
                  <Badge className={cn("px-2 py-1", getScoreColor(worstWeek.overallScore))}>
                    {worstWeek.overallScore.toFixed(1)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {format(worstWeek.startDate, 'dd MMMM', { locale: ru })} - {format(worstWeek.endDate, 'dd MMMM yyyy', { locale: ru })}
                </p>
                {worstWeek.keyEvents.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-1">Ключевые события:</p>
                    <ul className="text-sm text-muted-foreground">
                      {worstWeek.keyEvents.map((event, index) => (
                        <li key={index}>• {event}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Рекомендации на основе данных</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {trendsOverTime.length < 3 && (
            <div className="bg-info-light border border-info/20 rounded-lg p-3">
              <p className="text-sm text-info">
                📊 Продолжайте заполнять оценки для получения более точной аналитики
              </p>
            </div>
          )}
          
          {overallTrend > 0.5 && (
            <div className="bg-success-light border border-success/20 rounded-lg p-3">
              <p className="text-sm text-success">
                📈 Отлично! Ваши показатели растут. Продолжайте в том же духе!
              </p>
            </div>
          )}
          
          {overallTrend < -0.5 && (
            <div className="bg-warning-light border border-warning/20 rounded-lg p-3">
              <p className="text-sm text-warning">
                📉 Заметен спад показателей. Возможно, стоит обратить внимание на проблемные области
              </p>
            </div>
          )}

          {Object.keys(averageByMetric).length > 0 && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
              <p className="text-sm text-primary">
                🎯 Самые сильные области: {metricsChartData.slice(0, 2).map(m => m.name).join(', ')}
              </p>
            </div>
          )}

          {metricsChartData.length > 2 && (
            <div className="bg-warning-light border border-warning/20 rounded-lg p-3">
              <p className="text-sm text-warning">
                🔍 Области для развития: {metricsChartData.slice(-2).map(m => m.name).join(', ')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RatingAnalytics;