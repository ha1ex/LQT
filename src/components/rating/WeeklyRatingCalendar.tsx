import React, { useState, useMemo } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format, isSameDay, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { ru } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { CalendarDayData, WeeklyRating } from '@/types/weeklyRating';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface WeeklyRatingCalendarProps {
  ratings: Record<string, WeeklyRating>;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onWeekSelect: (rating: WeeklyRating) => void;
}

const WeeklyRatingCalendar: React.FC<WeeklyRatingCalendarProps> = ({
  ratings,
  selectedDate,
  onDateSelect,
  onWeekSelect
}) => {
  const [calendarMode, setCalendarMode] = useState<'calendar' | 'list'>('calendar');

  // Get mood color
  const getMoodColor = (mood: WeeklyRating['mood']) => {
    switch (mood) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-green-400';
      case 'neutral': return 'bg-yellow-400';
      case 'poor': return 'bg-orange-400';
      case 'terrible': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-50';
    if (score >= 6.5) return 'text-green-500 bg-green-50';
    if (score >= 4) return 'text-yellow-600 bg-yellow-50';
    if (score >= 2.5) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  // Prepare calendar data
  const calendarData = useMemo(() => {
    const data: Record<string, CalendarDayData> = {};
    
    Object.values(ratings).forEach(rating => {
      const weekDays = eachDayOfInterval({
        start: rating.startDate,
        end: rating.endDate
      });
      
      weekDays.forEach(day => {
        const dayKey = format(day, 'yyyy-MM-dd');
        data[dayKey] = {
          date: day,
          hasRating: true,
          overallScore: rating.overallScore,
          mood: rating.mood
        };
      });
    });
    
    return data;
  }, [ratings]);

  // Custom day cell component
  const DayCell = ({ date }: { date: Date }) => {
    const dayKey = format(date, 'yyyy-MM-dd');
    const dayData = calendarData[dayKey];
    const isSelected = isSameDay(date, selectedDate);
    
    return (
      <div className={cn(
        "relative w-full h-full flex items-center justify-center",
        isSelected && "bg-primary text-primary-foreground rounded-md"
      )}>
        <span className="text-sm">{format(date, 'd')}</span>
        {dayData?.hasRating && (
          <div className={cn(
            "absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full",
            getMoodColor(dayData.mood!)
          )} />
        )}
      </div>
    );
  };

  // Get sorted ratings for list view
  const sortedRatings = useMemo(() => {
    return Object.values(ratings).sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
  }, [ratings]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Календарь оценок</h2>
        <div className="flex items-center gap-2">
          <Button
            variant={calendarMode === 'calendar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCalendarMode('calendar')}
          >
            <CalendarIcon className="w-4 h-4 mr-2" />
            Календарь
          </Button>
          <Button
            variant={calendarMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCalendarMode('list')}
          >
            Список
          </Button>
        </div>
      </div>

      {calendarMode === 'calendar' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {format(selectedDate, 'LLLL yyyy', { locale: ru })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && onDateSelect(date)}
                  locale={ru}
                  className="w-full"
                  components={{
                    Day: ({ date }) => <DayCell date={date} />
                  }}
                />
                
                {/* Legend */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <div className="flex items-center gap-1 text-sm">
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                    <span>Отлично</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <div className="w-3 h-3 bg-green-400 rounded-full" />
                    <span>Хорошо</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <div className="w-3 h-3 bg-yellow-400 rounded-full" />
                    <span>Нормально</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <div className="w-3 h-3 bg-orange-400 rounded-full" />
                    <span>Плохо</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <div className="w-3 h-3 bg-red-500 rounded-full" />
                    <span>Ужасно</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Selected week details */}
          <div className="space-y-4">
            {(() => {
              const weekStart = startOfWeek(selectedDate, { locale: ru });
              const weekEnd = endOfWeek(selectedDate, { locale: ru });
              const weekKey = format(weekStart, 'yyyy-MM-dd');
              const weekRating = ratings[weekKey];

              if (!weekRating) {
                return (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center text-muted-foreground">
                        <CalendarIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>Нет данных для этой недели</p>
                        <p className="text-sm mt-1">
                          {format(weekStart, 'dd.MM', { locale: ru })} - {format(weekEnd, 'dd.MM', { locale: ru })}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              }

              return (
                <Card className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => onWeekSelect(weekRating)}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        Неделя {weekRating.weekNumber}
                      </CardTitle>
                      <Badge className={cn("px-2 py-1", getScoreColor(weekRating.overallScore))}>
                        {weekRating.overallScore.toFixed(1)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {format(weekRating.startDate, 'dd.MM', { locale: ru })} - {format(weekRating.endDate, 'dd.MM', { locale: ru })}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-3 h-3 rounded-full", getMoodColor(weekRating.mood))} />
                      <span className="text-sm capitalize">{weekRating.mood}</span>
                    </div>
                    
                    {weekRating.keyEvents.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-1">Ключевые события:</p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {weekRating.keyEvents.map((event, index) => (
                            <li key={index} className="flex items-start gap-1">
                              <span className="w-1 h-1 bg-current rounded-full mt-2 flex-shrink-0" />
                              {event}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="text-sm text-muted-foreground">
                      Оценено критериев: {Object.keys(weekRating.ratings).length}
                    </div>
                  </CardContent>
                </Card>
              );
            })()}
          </div>
        </div>
      ) : (
        /* List view */
        <div className="space-y-4">
          {sortedRatings.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Нет сохраненных оценок</p>
              </CardContent>
            </Card>
          ) : (
            sortedRatings.map((rating) => (
              <Card key={rating.id} className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => onWeekSelect(rating)}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">Неделя {rating.weekNumber}</h3>
                      <p className="text-sm text-muted-foreground">
                        {format(rating.startDate, 'dd.MM.yyyy', { locale: ru })} - {format(rating.endDate, 'dd.MM.yyyy', { locale: ru })}
                      </p>
                    </div>
                    <Badge className={cn("px-2 py-1", getScoreColor(rating.overallScore))}>
                      {rating.overallScore.toFixed(1)}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-3 h-3 rounded-full", getMoodColor(rating.mood))} />
                      <span className="text-sm capitalize">{rating.mood}</span>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      {Object.keys(rating.ratings).length} критериев
                    </div>
                  </div>
                  
                  {rating.keyEvents.length > 0 && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      События: {rating.keyEvents.join(', ')}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default WeeklyRatingCalendar;