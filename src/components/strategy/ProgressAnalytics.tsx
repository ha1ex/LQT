import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WeeklyProgress } from '@/types/strategy';
import { getRatingColor, getRatingLabel } from '@/utils/strategy';
import { TrendingUp, Calendar, Target, BarChart3, PieChart, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell } from 'recharts';

interface ProgressAnalyticsProps {
  weeklyProgress: WeeklyProgress[];
  hypothesisTitle: string;
}

export const ProgressAnalytics: React.FC<ProgressAnalyticsProps> = ({ 
  weeklyProgress, 
  hypothesisTitle 
}) => {
  // Подготовка данных для графиков
  const chartData = weeklyProgress.map(week => ({
    week: `Н${week.week}`,
    rating: week.rating > 0 && !isNaN(week.rating) ? week.rating : null,
    hasNote: !!week.note,
    tags: week.tags?.length || 0
  })).filter(item => item.rating !== null && typeof item.rating === 'number' && !isNaN(item.rating));

  // Статистика по рейтингам
  const ratingStats = [1, 2, 3, 4].map(rating => ({
    rating,
    label: getRatingLabel(rating),
    count: weeklyProgress.filter(w => w.rating === rating).length,
    color: getRatingColor(rating)
  }));

  // Общая статистика
  const totalWeeks = weeklyProgress.length;
  const ratedWeeks = weeklyProgress.filter(w => w.rating > 0).length;
  const averageRating = ratedWeeks > 0 
    ? weeklyProgress.filter(w => w.rating > 0).reduce((sum, w) => sum + w.rating, 0) / ratedWeeks 
    : 0;
  const validAverageRating = isNaN(averageRating) ? 0 : averageRating;
  console.log('Average rating calculation:', { ratedWeeks, averageRating, validAverageRating });
  const completionRate = Math.round((ratedWeeks / totalWeeks) * 100);
  const weeksWithNotes = weeklyProgress.filter(w => w.note && w.note.trim()).length;
  const totalTags = weeklyProgress.reduce((sum, w) => sum + (w.tags?.length || 0), 0);

  // Тренд (улучшение/ухудшение)
  const recentWeeks = chartData.slice(-4);
  const olderWeeks = chartData.slice(0, -4);
  const recentAvg = recentWeeks.length > 0 
    ? recentWeeks.reduce((sum, w) => sum + (w.rating || 0), 0) / recentWeeks.length 
    : 0;
  const olderAvg = olderWeeks.length > 0 
    ? olderWeeks.reduce((sum, w) => sum + (w.rating || 0), 0) / olderWeeks.length 
    : 0;
  const trend = recentAvg - olderAvg;

  // Анализ паттернов
  const getConsistencyScore = () => {
    if (chartData.length < 3) return 0;
    const ratings = chartData.map(w => w.rating || 0);
    const avg = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
    const variance = ratings.reduce((sum, r) => sum + Math.pow(r - avg, 2), 0) / ratings.length;
    return Math.max(0, 100 - variance * 25); // Нормализация в процентах
  };

  const consistencyScore = Math.round(getConsistencyScore());

  return (
    <div className="space-y-6">
      {/* Основная статистика */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {validAverageRating.toFixed(1)}
            </div>
            <div className="text-sm text-muted-foreground">Средняя оценка</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {completionRate}%
            </div>
            <div className="text-sm text-muted-foreground">Заполнено</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {consistencyScore}%
            </div>
            <div className="text-sm text-muted-foreground">Стабильность</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className={`text-2xl font-bold ${trend > 0 ? 'text-success' : trend < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
              {trend > 0 ? '↗' : trend < 0 ? '↘' : '→'}
            </div>
            <div className="text-sm text-muted-foreground">Тренд</div>
          </CardContent>
        </Card>
      </div>

      {/* График трендов */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Динамика оценок по неделям
          </CardTitle>
          <CardDescription>
            Изменение ваших оценок с течением времени
          </CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis domain={[0, 4]} ticks={[1, 2, 3, 4]} />
                <Tooltip 
                  labelFormatter={(value) => `Неделя ${value}`}
                  formatter={(value: number) => [getRatingLabel(value), 'Оценка']}
                />
                <Line 
                  type="monotone" 
                  dataKey="rating" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Недостаточно данных для отображения графика</p>
                <p className="text-sm">Добавьте больше недельных оценок</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Распределение оценок */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Распределение оценок
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ratingStats.map(stat => (
                <div key={stat.rating} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: stat.color }}
                    />
                    <span className="text-sm">{stat.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{stat.count}</span>
                    <div className="w-20 bg-muted rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all"
                        style={{ 
                          width: `${ratedWeeks > 0 ? (stat.count / ratedWeeks) * 100 : 0}%`,
                          backgroundColor: stat.color 
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Активность ведения записей
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Недель с заметками</span>
              <span className="font-medium">{weeksWithNotes}/{totalWeeks}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Всего тэгов</span>
              <span className="font-medium">{totalTags}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Активность записей</span>
              <Badge variant={weeksWithNotes / totalWeeks > 0.7 ? "default" : weeksWithNotes / totalWeeks > 0.4 ? "secondary" : "outline"}>
                {weeksWithNotes / totalWeeks > 0.7 ? 'Высокая' : weeksWithNotes / totalWeeks > 0.4 ? 'Средняя' : 'Низкая'}
              </Badge>
            </div>
            {trend !== 0 && (
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-sm text-muted-foreground">Тренд последних недель</span>
                <Badge variant={trend > 0 ? "default" : "destructive"}>
                  {trend > 0 ? `+${trend.toFixed(1)}` : trend.toFixed(1)}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Рекомендации */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Аналитические выводы
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {averageRating >= 3.5 && (
              <div className="p-3 bg-success/10 rounded-lg border border-success/20">
                <p className="text-sm text-success-foreground">
                  <strong>Отличные результаты!</strong> Ваша средняя оценка {averageRating.toFixed(1)} показывает, что гипотеза работает эффективно.
                </p>
              </div>
            )}
            
            {averageRating < 2.5 && ratedWeeks >= 3 && (
              <div className="p-3 bg-warning/10 rounded-lg border border-warning/20">
                <p className="text-sm text-warning-foreground">
                  <strong>Стоит пересмотреть подход.</strong> Низкая средняя оценка {averageRating.toFixed(1)} может указывать на необходимость корректировки гипотезы.
                </p>
              </div>
            )}

            {consistencyScore < 50 && ratedWeeks >= 4 && (
              <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                <p className="text-sm text-primary-foreground">
                  <strong>Нестабильные результаты.</strong> Попробуйте проанализировать факторы, влияющие на колебания оценок.
                </p>
              </div>
            )}

            {trend > 0.5 && (
              <div className="p-3 bg-success/10 rounded-lg border border-success/20">
                <p className="text-sm text-success-foreground">
                  <strong>Позитивная динамика!</strong> Ваши оценки улучшаются, продолжайте в том же духе.
                </p>
              </div>
            )}

            {weeksWithNotes / totalWeeks < 0.5 && (
              <div className="p-3 bg-muted/50 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">
                  <strong>Больше деталей.</strong> Попробуйте добавлять заметки к оценкам для лучшего анализа в будущем.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};