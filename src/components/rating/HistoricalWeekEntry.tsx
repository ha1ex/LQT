import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Plus, Trash2 } from 'lucide-react';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { ru } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { WeeklyRating } from '@/types/weeklyRating';
import { BASE_METRICS } from '@/utils/dataAdapter';
import { useToast } from '@/hooks/use-toast';

interface HistoricalWeekEntryProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (weekDate: Date, rating: Partial<WeeklyRating>) => void;
  existingRating?: WeeklyRating | null;
  selectedDate?: Date;
}

export const HistoricalWeekEntry: React.FC<HistoricalWeekEntryProps> = ({
  isOpen,
  onClose,
  onSave,
  existingRating,
  selectedDate
}) => {
  const { toast } = useToast();
  const [weekDate, setWeekDate] = useState<Date>(selectedDate || new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [mood, setMood] = useState<WeeklyRating['mood']>('neutral');
  const [keyEvents, setKeyEvents] = useState<string[]>([]);
  const [newEvent, setNewEvent] = useState('');

  // Reset form when dialog opens/closes or existing rating changes
  useEffect(() => {
    if (isOpen) {
      setWeekDate(selectedDate || new Date());
      if (existingRating) {
        setRatings(existingRating.ratings || {});
        setNotes(existingRating.notes || {});
        setMood(existingRating.mood);
        setKeyEvents(existingRating.keyEvents || []);
      } else {
        setRatings({});
        setNotes({});
        setMood('neutral');
        setKeyEvents([]);
      }
      setNewEvent('');
    }
  }, [isOpen, existingRating, selectedDate]);

  const weekStart = startOfWeek(weekDate, { locale: ru });
  const weekEnd = endOfWeek(weekDate, { locale: ru });

  const updateRating = (metricId: string, value: number) => {
    setRatings(prev => ({ ...prev, [metricId]: value }));
  };

  const updateNote = (metricId: string, note: string) => {
    setNotes(prev => ({ ...prev, [metricId]: note }));
  };

  const addKeyEvent = () => {
    if (newEvent.trim()) {
      if (keyEvents.length >= 10) {
        toast({
          title: "Слишком много событий",
          description: "Максимум 10 ключевых событий на неделю",
          variant: "destructive"
        });
        return;
      }
      setKeyEvents(prev => [...prev, newEvent.trim()]);
      setNewEvent('');
    }
  };

  const removeKeyEvent = (index: number) => {
    setKeyEvents(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    // Validate data before saving
    const ratingData: Partial<WeeklyRating> = {
      ratings,
      notes,
      mood,
      keyEvents
    };

    // Basic validation
    if (Object.keys(ratings).length === 0) {
      toast({
        title: "Ошибка валидации",
        description: "Необходимо оценить хотя бы один критерий",
        variant: "destructive"
      });
      return;
    }

    // Validate ratings are in correct range
    const hasInvalidRatings = Object.values(ratings).some(rating => 
      typeof rating !== 'number' || rating < 1 || rating > 10 || !Number.isInteger(rating)
    );

    if (hasInvalidRatings) {
      toast({
        title: "Ошибка валидации",
        description: "Все оценки должны быть целыми числами от 1 до 10",
        variant: "destructive"
      });
      return;
    }

    try {
      onSave(weekDate, ratingData);
      toast({
        title: "Успешно сохранено",
        description: existingRating ? "Неделя обновлена" : "Новая неделя добавлена"
      });
      onClose();
    } catch (error) {
      toast({
        title: "Ошибка сохранения",
        description: "Не удалось сохранить данные. Попробуйте еще раз.",
        variant: "destructive"
      });
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800';
    if (rating >= 6) return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800';
    if (rating >= 4) return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800';
    if (rating >= 2) return 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 border-orange-200 dark:border-orange-800';
    return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-4xl max-h-[90vh] overflow-y-auto"
        aria-describedby="historical-week-description"
      >
        <DialogHeader>
          <DialogTitle>
            {existingRating ? 'Редактировать неделю' : 'Добавить историческую неделю'}
          </DialogTitle>
        </DialogHeader>
        
        <div id="historical-week-description" className="sr-only">
          Форма для добавления или редактирования оценок качества жизни за выбранную неделю
        </div>

        <div className="space-y-6">
          {/* Week Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Выбор недели</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-[280px] justify-start text-left font-normal"
                      aria-label="Выберите неделю для оценки"
                      aria-expanded={calendarOpen}
                      aria-haspopup="dialog"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(weekStart, 'dd.MM.yyyy', { locale: ru })} - {format(weekEnd, 'dd.MM.yyyy', { locale: ru })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={weekDate}
                      onSelect={(date) => {
                        if (date) {
                          setWeekDate(date);
                          setCalendarOpen(false);
                        }
                      }}
                      locale={ru}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </CardContent>
          </Card>

          {/* Metrics Rating */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Оценка критериев</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {BASE_METRICS.map((metric) => (
                  <div key={metric.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="font-medium">{metric.name}</Label>
                      {ratings[metric.id] && (
                        <Badge className={cn("px-2 py-1", getRatingColor(ratings[metric.id]))}>
                          {ratings[metric.id]}/10
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-10 gap-1">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                        <Button
                          key={value}
                          variant={ratings[metric.id] === value ? "default" : "outline"}
                          size="sm"
                          className="aspect-square p-0 text-xs"
                          onClick={() => updateRating(metric.id, value)}
                          aria-label={`Оценить ${metric.name} на ${value} из 10`}
                          aria-pressed={ratings[metric.id] === value}
                        >
                          {value}
                        </Button>
                      ))}
                    </div>
                    <Textarea
                      placeholder="Заметка..."
                      value={notes[metric.id] || ''}
                      onChange={(e) => updateNote(metric.id, e.target.value)}
                      className="min-h-[60px]"
                      aria-label={`Заметка для ${metric.name}`}
                      maxLength={500}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Mood */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Общее настроение</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={mood} onValueChange={(value) => setMood(value as WeeklyRating['mood'])}>
                <SelectTrigger className="w-[200px]" aria-label="Выберите общее настроение">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excellent">😍 Отлично</SelectItem>
                  <SelectItem value="good">😊 Хорошо</SelectItem>
                  <SelectItem value="neutral">😐 Нормально</SelectItem>
                  <SelectItem value="poor">😔 Плохо</SelectItem>
                  <SelectItem value="terrible">😫 Ужасно</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Key Events */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ключевые события</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Добавить событие..."
                  value={newEvent}
                  onChange={(e) => setNewEvent(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addKeyEvent()}
                  aria-label="Добавить ключевое событие"
                  maxLength={100}
                />
                <Button onClick={addKeyEvent} size="sm" aria-label="Добавить событие">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {keyEvents.length > 0 && (
                <div className="space-y-2">
                  {keyEvents.map((event, index) => (
                    <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                      <span>{event}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeKeyEvent(index)}
                        aria-label={`Удалить событие: ${event}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button onClick={handleSave}>
              {existingRating ? 'Сохранить изменения' : 'Добавить неделю'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};