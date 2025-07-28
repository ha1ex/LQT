
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WeeklyRatingAnalytics, WeeklyRating } from '@/types/weeklyRating';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Calendar, Target, Award, BarChart3 } from 'lucide-react';

interface RatingAnalyticsProps {
  analytics: WeeklyRatingAnalytics;
  allMetrics: Array<{ id: string; name: string; icon: string; description: string; category: string }>;
}

// Helper function to ensure valid numeric values
const ensureValidNumber = (value: number, defaultValue: number = 0): number => {
  if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
    return defaultValue;
  }
  return value;
};

// Helper function to filter valid trend data
const filterValidTrends = (trends: any[]): any[] => {
  return trends.filter(trend => {
    const score = trend.averageScore;
    return typeof score === 'number' && !isNaN(score) && isFinite(score);
  });
};

const RatingAnalytics: React.FC<RatingAnalyticsProps> = ({ analytics, allMetrics }) => {
  const { averageByMetric, trendsOverTime, bestWeek, worstWeek, moodDistribution, seasonalTrends } = analytics;

  // Filter valid trends first
  const validTrends = filterValidTrends(trendsOverTime);

  // Prepare metrics data for charts
  const metricsChartData = useMemo(() => {
    return Object.entries(averageByMetric)
      .filter(([metricId, average]) => typeof average === 'number' && !isNaN(average) && isFinite(average))
      .map(([metricId, average]) => {
        const metric = allMetrics.find(m => m.id === metricId);
        return {
          name: metric?.name || metricId,
          value: ensureValidNumber(average, 0),
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
    if (score >= 8) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 6.5) return 'text-green-500 bg-green-50 border-green-200';
    if (score >= 4) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (score >= 2.5) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getTrendIcon = (current: number, previous: number) => {
    const validCurrent = ensureValidNumber(current, 0);
    const validPrevious = ensureValidNumber(previous, 0);
    
    if (validCurrent > validPrevious) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (validCurrent < validPrevious) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <div className="w-4 h-4" />;
  };

  const overallTrend = validTrends.length >= 2 ? 
    ensureValidNumber(validTrends[validTrends.length - 1].averageScore, 0) - ensureValidNumber(validTrends[validTrends.length - 2].averageScore, 0) : 0;

  // Calculate overall average from valid trends
  const overallAverage = useMemo(() => {
    if (validTrends.length === 0) return 0;
    const sum = validTrends.reduce((acc, trend) => acc + ensureValidNumber(trend.averageScore, 0), 0);
    return ensureValidNumber(sum / validTrends.length, 0);
  }, [validTrends]);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Всего недель</p>
                <p className="text-2xl font-bold">{validTrends.length}</p>
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
                     {overallAverage.toFixed(1)}
                   </p>
                  {validTrends.length >= 2 && getTrendIcon(
                    validTrends[validTrends.length - 1]?.averageScore || 0,
                    validTrends[validTrends.length - 2]?.averageScore || 0
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
                  {bestWeek ? ensureValidNumber(bestWeek.overallScore, 0).toFixed(1) : '—'}
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
      {validTrends.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Динамика оценок по времени</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="h-64">
               <ResponsiveContainer width="100%" height="100%">
                 <RechartsLineChart data={validTrends}>
                   <CartesianGrid strokeDasharray="3 3" />
                   <XAxis dataKey="date" />
                   <YAxis domain={[0, 10]} />
                   <Tooltip 
                     formatter={(value: any) => {
                       const numValue = ensureValidNumber(value, 0);
                       return [`${numValue.toFixed(1)}`, 'Средний балл'];
                     }}
                     labelFormatter={(label) => `Неделя: ${label}`}
                   />
                   <Line 
                     type="monotone" 
                     dataKey="averageScore" 
                     stroke="hsl(var(--primary))" 
                     strokeWidth={2}
                     dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                   />
                 </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Metrics Ranking */}
        {metricsChartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Средние оценки по критериям</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {metricsChartData.map((metric, index) => (
                <div key={metric.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{metric.icon}</span>
                    <span className="font-medium">{metric.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(metric.value / 10) * 100}%` }}
                      />
                    </div>
                    <Badge className={cn("px-2 py-1", getScoreColor(metric.value))}>
                      {metric.value.toFixed(1)}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
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
                      data={moodChartData.filter(mood => mood.value > 0)}
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
                    <Tooltip />
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
                  <Badge className={cn("px-2 py-1", getScoreColor(ensureValidNumber(bestWeek.overallScore, 0)))}>
                    {ensureValidNumber(bestWeek.overallScore, 0).toFixed(1)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {format(bestWeek.startDate, 'dd MMMM', { locale: ru })} - {format(bestWeek.endDate, 'dd MMMM yyyy', { locale: ru })}
                </p>
                {bestWeek.keyEvents && bestWeek.keyEvents.length > 0 && (
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
                  <Badge className={cn("px-2 py-1", getScoreColor(ensureValidNumber(worstWeek.overallScore, 0)))}>
                    {ensureValidNumber(worstWeek.overallScore, 0).toFixed(1)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {format(worstWeek.startDate, 'dd MMMM', { locale: ru })} - {format(worstWeek.endDate, 'dd MMMM yyyy', { locale: ru })}
                </p>
                {worstWeek.keyEvents && worstWeek.keyEvents.length > 0 && (
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
          {validTrends.length < 3 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                📊 Продолжайте заполнять оценки для получения более точной аналитики
              </p>
            </div>
          )}
          
          {overallTrend > 0.5 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-800">
                📈 Отлично! Ваши показатели растут. Продолжайте в том же духе!
              </p>
            </div>
          )}
          
          {overallTrend < -0.5 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <p className="text-sm text-orange-800">
                📉 Заметен спад показателей. Возможно, стоит обратить внимание на проблемные области
              </p>
            </div>
          )}

          {Object.keys(averageByMetric).length > 0 && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <p className="text-sm text-purple-800">
                🎯 Самые сильные области: {metricsChartData.slice(0, 2).map(m => m.name).join(', ')}
              </p>
            </div>
          )}

          {metricsChartData.length > 2 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
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
