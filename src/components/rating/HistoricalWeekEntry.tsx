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
      setKeyEvents(prev => [...prev, newEvent.trim()]);
      setNewEvent('');
    }
  };

  const removeKeyEvent = (index: number) => {
    setKeyEvents(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const ratingData: Partial<WeeklyRating> = {
      ratings,
      notes,
      mood,
      keyEvents
    };
    onSave(weekDate, ratingData);
    onClose();
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return 'bg-green-100 text-green-800 border-green-200';
    if (rating >= 6) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (rating >= 4) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (rating >= 2) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {existingRating ? 'Редактировать неделю' : 'Добавить историческую неделю'}
          </DialogTitle>
        </DialogHeader>

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
                    <Button variant="outline" className="w-[280px] justify-start text-left font-normal">
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
                <SelectTrigger className="w-[200px]">
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
                />
                <Button onClick={addKeyEvent} size="sm">
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