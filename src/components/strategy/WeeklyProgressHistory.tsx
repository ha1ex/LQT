import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WeeklyProgress } from '@/types/strategy';
import { getRatingColor, getRatingLabel } from '@/utils/strategy';
import { format, startOfWeek, endOfWeek, eachWeekOfInterval, isSameWeek } from 'date-fns';
import { ru } from 'date-fns/locale';

interface WeeklyProgressHistoryProps {
  weeklyProgress: WeeklyProgress[];
  onWeekSelect: (week: WeeklyProgress) => void;
}

export const WeeklyProgressHistory: React.FC<WeeklyProgressHistoryProps> = ({ 
  weeklyProgress, 
  onWeekSelect 
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState<string>('all');

  // Создаем календарную сетку для текущего месяца
  const monthStart = startOfWeek(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1));
  const monthEnd = endOfWeek(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0));
  const weeksInMonth = eachWeekOfInterval({ start: monthStart, end: monthEnd });

  // Функция поиска прогресса для конкретной недели
  const getProgressForWeek = (weekStart: Date): WeeklyProgress | undefined => {
    return weeklyProgress.find(progress => 
      isSameWeek(progress.startDate, weekStart, { locale: ru })
    );
  };

  // Фильтрация недель по поиску и рейтингу
  const filteredProgress = weeklyProgress.filter(week => {
    const matchesSearch = !searchQuery || 
      week.note?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      week.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      week.keyEvents?.some(event => event.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesRating = ratingFilter === 'all' || 
      (ratingFilter === 'rated' && week.rating > 0) ||
      (ratingFilter === 'unrated' && week.rating === 0) ||
      week.rating.toString() === ratingFilter;

    return matchesSearch && matchesRating;
  });

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentMonth(newMonth);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          История оценок
        </CardTitle>
        <CardDescription>
          Просмотр всех недельных оценок с возможностью поиска и фильтрации
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Поиск и фильтры */}
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Поиск по заметкам, тэгам, событиям..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <Select value={ratingFilter} onValueChange={setRatingFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Фильтр по рейтингу" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все оценки</SelectItem>
              <SelectItem value="rated">Оценённые</SelectItem>
              <SelectItem value="unrated">Не оценённые</SelectItem>
              <SelectItem value="4">Отлично (4)</SelectItem>
              <SelectItem value="3">Хорошо (3)</SelectItem>
              <SelectItem value="2">Средне (2)</SelectItem>
              <SelectItem value="1">Плохо (1)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Навигация по месяцам */}
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-semibold">
            {format(currentMonth, 'LLLL yyyy', { locale: ru })}
          </h3>
          <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Календарная сетка */}
        <div className="grid grid-cols-7 gap-2">
          {/* Заголовки дней недели */}
          {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
              {day}
            </div>
          ))}
          
          {/* Недели месяца */}
          {weeksInMonth.map((weekStart, index) => {
            const progress = getProgressForWeek(weekStart);
            const isCurrentWeek = isSameWeek(weekStart, new Date(), { locale: ru });
            
            return (
              <div
                key={index}
                className={`
                  relative border rounded-lg p-2 cursor-pointer transition-all
                  ${progress ? 'hover:shadow-md' : 'border-dashed opacity-50'}
                  ${isCurrentWeek ? 'ring-2 ring-primary' : ''}
                `}
                style={{ 
                  backgroundColor: progress ? getRatingColor(progress.rating) + '20' : undefined,
                  borderColor: progress ? getRatingColor(progress.rating) : undefined
                }}
                onClick={() => progress && onWeekSelect(progress)}
              >
                <div className="text-xs text-center">
                  {format(weekStart, 'dd.MM', { locale: ru })}
                </div>
                {progress && (
                  <div className="mt-1 space-y-1">
                    <Badge 
                      variant="outline" 
                      className="text-xs w-full justify-center"
                      style={{ borderColor: getRatingColor(progress.rating), color: getRatingColor(progress.rating) }}
                    >
                      {progress.rating > 0 ? getRatingLabel(progress.rating) : 'Не оценено'}
                    </Badge>
                    {progress.tags && progress.tags.length > 0 && (
                      <div className="text-xs text-muted-foreground truncate">
                        #{progress.tags[0]}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Результаты поиска */}
        {(searchQuery || ratingFilter !== 'all') && (
          <div className="space-y-3">
            <h4 className="font-medium">Результаты поиска ({filteredProgress.length})</h4>
            {filteredProgress.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Не найдено недель, соответствующих критериям поиска
              </p>
            ) : (
              <div className="grid gap-3">
                {filteredProgress.map((week) => (
                  <Card 
                    key={`${week.week}-${week.startDate}`}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => onWeekSelect(week)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Неделя {week.week}</span>
                            <Badge 
                              variant="outline"
                              style={{ borderColor: getRatingColor(week.rating), color: getRatingColor(week.rating) }}
                            >
                              {getRatingLabel(week.rating)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {format(week.startDate, 'dd.MM.yyyy', { locale: ru })} - {format(week.endDate, 'dd.MM.yyyy', { locale: ru })}
                          </p>
                          {week.note && (
                            <p className="text-sm">{week.note}</p>
                          )}
                          {week.tags && week.tags.length > 0 && (
                            <div className="flex gap-1 flex-wrap">
                              {week.tags.map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  #{tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};