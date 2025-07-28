import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, TrendingUp, Star, AlertCircle, CheckCircle2, Zap, History, BarChart3, Clock } from 'lucide-react';
import { useEnhancedHypotheses } from '@/hooks/strategy';
import { getRatingColor, getRatingLabel, createTestWeeklyProgress } from '@/utils/strategy';
import { WeeklyProgressHistory } from './WeeklyProgressHistory';
import { WeekDetailModal } from './WeekDetailModal';
import { ProgressAnalytics } from './ProgressAnalytics';
import { WeeklyProgress } from '@/types/strategy';

interface WeeklyProgressTrackerProps {
  hypothesisId: string;
}

export const WeeklyProgressTracker: React.FC<WeeklyProgressTrackerProps> = ({ hypothesisId }) => {
  const { getHypothesis, updateWeeklyRating, updateHypothesis } = useEnhancedHypotheses();
  const hypothesis = getHypothesis(hypothesisId);
  const [selectedWeek, setSelectedWeek] = useState<WeeklyProgress | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!hypothesis || !hypothesis.weeklyProgress) return null;

  // Функция для создания тестовых данных
  const generateTestData = () => {
    const testData = createTestWeeklyProgress(hypothesis.experimentStartDate);
    updateHypothesis(hypothesisId, { weeklyProgress: testData });
  };

  const getRatingIcon = (rating: number) => {
    switch (rating) {
      case 1: return <AlertCircle className="h-3 w-3" />;
      case 2: return <TrendingUp className="h-3 w-3" />;
      case 3: return <CheckCircle2 className="h-3 w-3" />;
      case 4: return <Star className="h-3 w-3" />;
      default: return null;
    }
  };

  const getRatingButtonClass = (weekRating: number, buttonRating: number) => {
    const isSelected = weekRating === buttonRating;
    const baseClass = "h-10 w-10 p-0 transition-all duration-200 border-2";
    
    if (isSelected) {
      switch (buttonRating) {
        case 1: return `${baseClass} bg-destructive text-destructive-foreground border-destructive shadow-sm`;
        case 2: return `${baseClass} bg-warning text-warning-foreground border-warning shadow-sm`;
        case 3: return `${baseClass} bg-success text-success-foreground border-success shadow-sm`;
        case 4: return `${baseClass} bg-primary text-primary-foreground border-primary shadow-sm`;
        default: return baseClass;
      }
    }
    
    return `${baseClass} bg-background hover:bg-muted border-border`;
  };

  const getStatistics = () => {
    const ratedWeeks = hypothesis.weeklyProgress.filter(week => week.rating > 0);
    const totalWeeks = hypothesis.weeklyProgress.length;
    const averageRating = ratedWeeks.length > 0 
      ? ratedWeeks.reduce((sum, week) => sum + week.rating, 0) / ratedWeeks.length 
      : 0;
    const completionRate = Math.round((ratedWeeks.length / totalWeeks) * 100);
    
    return { ratedWeeks: ratedWeeks.length, totalWeeks, averageRating, completionRate };
  };

  const stats = getStatistics();

  const handleWeekSelect = (week: WeeklyProgress) => {
    setSelectedWeek(week);
    setIsModalOpen(true);
  };

  const handleWeekSave = (updatedWeek: WeeklyProgress) => {
    const updatedProgress = hypothesis.weeklyProgress.map(w => 
      w.week === updatedWeek.week ? updatedWeek : w
    );
    updateHypothesis(hypothesisId, { weeklyProgress: updatedProgress });
  };

  const updateWeeklyRatingEnhanced = (weekIndex: number, rating: number) => {
    const week = hypothesis.weeklyProgress[weekIndex];
    const updatedWeek = {
      ...week,
      rating: rating as WeeklyProgress['rating'],
      lastModified: new Date()
    };
    const updatedProgress = [...hypothesis.weeklyProgress];
    updatedProgress[weekIndex] = updatedWeek;
    updateHypothesis(hypothesisId, { weeklyProgress: updatedProgress });
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Еженедельный прогресс
        </CardTitle>
        <CardDescription className="flex items-center justify-between">
          <span>Комплексная система отслеживания прогресса гипотезы</span>
          {hypothesis.weeklyProgress.length < 10 && (
            <Button variant="outline" size="sm" onClick={generateTestData}>
              <Clock className="h-4 w-4 mr-1" />
              Тестовые данные (10 недель)
            </Button>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs defaultValue="current" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="current" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Текущий период
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Аналитика
            </TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="space-y-6">
            {/* Статистика */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <div className="text-2xl font-bold text-primary">
                  {stats.averageRating.toFixed(1)}
                </div>
                <div className="text-xs text-muted-foreground">Средняя оценка</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <div className="text-2xl font-bold text-primary">
                  {stats.completionRate}%
                </div>
                <div className="text-xs text-muted-foreground">Заполнено</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <div className="text-2xl font-bold text-primary">
                  {hypothesis.progress}%
                </div>
                <div className="text-xs text-muted-foreground">Общий прогресс</div>
              </div>
            </div>

            {/* Прогресс бар */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Прогресс эксперимента</span>
                <span className="font-medium">{hypothesis.progress}%</span>
              </div>
              <Progress value={hypothesis.progress} className="h-2" />
            </div>

            {/* Легенда оценок */}
            <div className="flex flex-wrap gap-2 justify-center">
              {[1, 2, 3, 4].map(rating => (
                <Badge key={rating} variant="outline" className="text-xs">
                  {getRatingIcon(rating)}
                  <span className="ml-1">{getRatingLabel(rating)}</span>
                </Badge>
              ))}
            </div>

            {/* Сетка недель */}
            <div className="space-y-4">
              {hypothesis.weeklyProgress.map((week, weekIndex) => (
                <div key={week.week} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Неделя {week.week}</span>
                      {week.rating > 0 && (
                        <Badge 
                          variant="outline" 
                          className="text-xs cursor-pointer hover:bg-muted"
                          style={{ borderColor: getRatingColor(week.rating), color: getRatingColor(week.rating) }}
                          onClick={() => handleWeekSelect(week)}
                        >
                          {getRatingIcon(week.rating)}
                          <span className="ml-1">{getRatingLabel(week.rating)}</span>
                        </Badge>
                      )}
                      {week.note && (
                        <Badge variant="secondary" className="text-xs">
                          Есть заметка
                        </Badge>
                      )}
                    </div>
                    {week.rating > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleWeekSelect(week)}
                        className="text-xs"
                      >
                        Подробнее
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex gap-2 justify-center">
                    {[1, 2, 3, 4].map(rating => (
                      <Button
                        key={rating}
                        variant="outline"
                        size="sm"
                        className={getRatingButtonClass(week.rating, rating)}
                        onClick={() => updateWeeklyRatingEnhanced(weekIndex, rating)}
                        title={getRatingLabel(rating)}
                      >
                        {getRatingIcon(rating)}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {hypothesis.weeklyProgress.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Еженедельный трекинг не настроен</p>
                <p className="text-sm">Прогресс будет создан автоматически</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics">
            <ProgressAnalytics
              weeklyProgress={hypothesis.weeklyProgress}
              hypothesisTitle={hypothesis.goal.description}
            />
          </TabsContent>
        </Tabs>

        <WeekDetailModal
          week={selectedWeek}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleWeekSave}
        />
      </CardContent>
    </Card>
  );
};