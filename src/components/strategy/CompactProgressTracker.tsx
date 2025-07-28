import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, BarChart3, Star, AlertCircle, CheckCircle2, TrendingUp, Clock, Edit3 } from 'lucide-react';
import { useEnhancedHypotheses } from '@/hooks/strategy';
import { getRatingColor, getRatingLabel, createTestWeeklyProgress } from '@/utils/strategy';
import { WeekDetailModal } from './WeekDetailModal';
import { ProgressAnalytics } from './ProgressAnalytics';
import { WeeklyProgress } from '@/types/strategy';

interface CompactProgressTrackerProps {
  hypothesisId: string;
}

export const CompactProgressTracker: React.FC<CompactProgressTrackerProps> = ({ hypothesisId }) => {
  const { getHypothesis, updateHypothesis } = useEnhancedHypotheses();
  const hypothesis = getHypothesis(hypothesisId);
  const [selectedWeek, setSelectedWeek] = useState<WeeklyProgress | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!hypothesis || !hypothesis.weeklyProgress) return null;

  const getRatingIcon = (rating: number) => {
    switch (rating) {
      case 1: return <AlertCircle className="h-3 w-3" />;
      case 2: return <TrendingUp className="h-3 w-3" />;
      case 3: return <CheckCircle2 className="h-3 w-3" />;
      case 4: return <Star className="h-3 w-3" />;
      default: return null;
    }
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

  const handleQuickRating = (weekIndex: number, rating: number) => {
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

  const generateTestData = () => {
    const testData = createTestWeeklyProgress(hypothesis.experimentStartDate);
    updateHypothesis(hypothesisId, { weeklyProgress: testData });
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-secondary/10 via-secondary/5 to-transparent">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-secondary" />
          Прогресс недель
        </CardTitle>
        <CardDescription className="flex items-center justify-between">
          <span>Отслеживание еженедельного прогресса эксперимента</span>
          {hypothesis.weeklyProgress.length < 10 && (
            <Button variant="outline" size="sm" onClick={generateTestData}>
              <Clock className="h-4 w-4 mr-1" />
              Тестовые данные
            </Button>
          )}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-6">
        <Tabs defaultValue="progress" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="progress" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Прогресс
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Аналитика
            </TabsTrigger>
          </TabsList>

          <TabsContent value="progress" className="space-y-6 mt-6">
            {/* Компактная статистика */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <div className="text-xl font-bold text-primary">
                  {stats.averageRating.toFixed(1)}
                </div>
                <div className="text-xs text-muted-foreground">Средняя оценка</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <div className="text-xl font-bold text-primary">
                  {stats.completionRate}%
                </div>
                <div className="text-xs text-muted-foreground">Заполнено</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <div className="text-xl font-bold text-primary">
                  {stats.ratedWeeks}/{stats.totalWeeks}
                </div>
                <div className="text-xs text-muted-foreground">Недель оценено</div>
              </div>
            </div>

            {/* Общий прогресс */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Прогресс эксперимента</span>
                <span className="font-medium">{hypothesis.progress}%</span>
              </div>
              <Progress value={hypothesis.progress} className="h-3" />
            </div>

            {/* Компактная сетка недель */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Оценки по неделям</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {hypothesis.weeklyProgress.map((week, weekIndex) => (
                  <div 
                    key={week.week} 
                    className={`
                      relative p-3 rounded-lg border transition-all duration-200 hover:shadow-md cursor-pointer
                      ${week.rating > 0 ? 'border-primary/30 bg-primary/5' : 'border-dashed border-muted-foreground/30'}
                    `}
                    onClick={() => week.rating > 0 && handleWeekSelect(week)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Неделя {week.week}</span>
                      {week.rating > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleWeekSelect(week);
                          }}
                        >
                          <Edit3 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    
                    {week.rating > 0 ? (
                      <div className="space-y-2">
                        <Badge 
                          variant="outline" 
                          className="w-full justify-center text-xs"
                          style={{ borderColor: getRatingColor(week.rating), color: getRatingColor(week.rating) }}
                        >
                          {getRatingIcon(week.rating)}
                          <span className="ml-1">{getRatingLabel(week.rating)}</span>
                        </Badge>
                        {week.note && (
                          <p className="text-xs text-muted-foreground truncate" title={week.note}>
                            {week.note}
                          </p>
                        )}
                        {week.tags && week.tags.length > 0 && (
                          <div className="text-xs text-muted-foreground">
                            #{week.tags[0]}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="text-xs text-muted-foreground text-center mb-2">
                          Быстрая оценка:
                        </div>
                        <div className="grid grid-cols-4 gap-1">
                          {[1, 2, 3, 4].map(rating => (
                            <Button
                              key={rating}
                              variant="outline"
                              size="sm"
                              className="h-6 w-6 p-0 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleQuickRating(weekIndex, rating);
                              }}
                              title={getRatingLabel(rating)}
                            >
                              {rating}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {hypothesis.weeklyProgress.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Еженедельный трекинг не настроен</p>
                <p className="text-sm">Прогресс будет создан автоматически</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
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