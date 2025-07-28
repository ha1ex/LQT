import React, { useState } from 'react';
import { WeeklyRatingCalendar, WeekDetailModal } from '@/components/rating';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useWeeklyRatings } from '@/hooks/useWeeklyRatings';
import { Calendar, BarChart3 } from 'lucide-react';

const Ratings = () => {
  const [selectedWeekRating, setSelectedWeekRating] = useState(null);
  const [isWeekModalOpen, setIsWeekModalOpen] = useState(false);
  const [ratingTab, setRatingTab] = useState('current');
  
  const {
    ratings: weeklyRatings,
    currentWeek,
    getCurrentWeekRating,
    updateMetricRating,
    goToWeek
  } = useWeeklyRatings();

  const openWeekModal = (weekData: any) => {
    setSelectedWeekRating(weekData);
    setIsWeekModalOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Недельные оценки</h1>
          <p className="text-muted-foreground mt-1">
            Отслеживайте свой прогресс по неделям
          </p>
        </div>
      </div>

      <Tabs value={ratingTab} onValueChange={setRatingTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="current" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Текущая неделя
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Календарь
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="current" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Оценка текущей недели</CardTitle>
            </CardHeader>
            <CardContent>
              <WeeklyRatingCalendar 
                ratings={weeklyRatings}
                selectedDate={currentWeek}
                onDateSelect={goToWeek}
                onWeekSelect={openWeekModal}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>История оценок</CardTitle>
            </CardHeader>
            <CardContent>
              <WeeklyRatingCalendar 
                ratings={weeklyRatings}
                selectedDate={currentWeek}
                onDateSelect={goToWeek}
                onWeekSelect={openWeekModal}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <WeekDetailModal
        isOpen={isWeekModalOpen}
        onClose={() => setIsWeekModalOpen(false)}
        rating={selectedWeekRating}
        onSave={() => {}}
        allMetrics={[]}
      />
    </div>
  );
};

export default Ratings;