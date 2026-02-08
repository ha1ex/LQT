import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WeeklyProgress } from '@/types/strategy';
import { getRatingColor, getRatingLabel } from '@/utils/strategy';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Calendar, Clock, Tag, Heart, Save, X, Plus } from 'lucide-react';

interface WeekDetailModalProps {
  week: WeeklyProgress | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedWeek: WeeklyProgress) => void;
}

export const WeekDetailModal: React.FC<WeekDetailModalProps> = ({ 
  week, 
  isOpen, 
  onClose, 
  onSave 
}) => {
  const [editedWeek, setEditedWeek] = useState<WeeklyProgress | null>(week);
  const [newTag, setNewTag] = useState('');
  const [newEvent, setNewEvent] = useState('');

  React.useEffect(() => {
    setEditedWeek(week);
  }, [week]);

  if (!week || !editedWeek) return null;

  const handleSave = () => {
    const updatedWeek = {
      ...editedWeek,
      lastModified: new Date()
    };
    onSave(updatedWeek);
    onClose();
  };

  const addTag = () => {
    if (newTag.trim()) {
      setEditedWeek(prev => ({
        ...prev!,
        tags: [...(prev!.tags || []), newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setEditedWeek(prev => ({
      ...prev!,
      tags: prev!.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const addEvent = () => {
    if (newEvent.trim()) {
      setEditedWeek(prev => ({
        ...prev!,
        keyEvents: [...(prev!.keyEvents || []), newEvent.trim()]
      }));
      setNewEvent('');
    }
  };

  const removeEvent = (eventToRemove: string) => {
    setEditedWeek(prev => ({
      ...prev!,
      keyEvents: prev!.keyEvents?.filter(event => event !== eventToRemove) || []
    }));
  };

  const getRatingIcon = (rating: number) => {
    switch (rating) {
      case 1: return '😞';
      case 2: return '😐';
      case 3: return '😊';
      case 4: return '🚀';
      default: return '❓';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Неделя {week.week} - Детальный просмотр
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4" />
            {format(week.startDate, 'dd MMMM yyyy', { locale: ru })} - {format(week.endDate, 'dd MMMM yyyy', { locale: ru })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Рейтинг */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Общая оценка недели</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map(rating => (
                <Button
                  key={rating}
                  variant={editedWeek.rating === rating ? "default" : "outline"}
                  size="lg"
                  className="h-16 w-16 flex-col gap-1"
                  style={editedWeek.rating === rating ? {
                    backgroundColor: getRatingColor(rating),
                    borderColor: getRatingColor(rating)
                  } : {}}
                  onClick={() => setEditedWeek(prev => ({ ...prev!, rating: rating as any }))}
                >
                  <span className="text-xl">{getRatingIcon(rating)}</span>
                  <span className="text-xs">{getRatingLabel(rating)}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Настроение */}
          <div className="space-y-3">
            <Label className="text-base font-medium flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Настроение на неделе
            </Label>
            <Select 
              value={editedWeek.mood || 'neutral'} 
              onValueChange={(value: 'positive' | 'negative' | 'neutral') => 
                setEditedWeek(prev => ({ ...prev!, mood: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="positive">😊 Позитивное</SelectItem>
                <SelectItem value="neutral">😐 Нейтральное</SelectItem>
                <SelectItem value="negative">😞 Негативное</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Основная заметка */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Основная заметка</Label>
            <Textarea
              value={editedWeek.note || ''}
              onChange={(e) => setEditedWeek(prev => ({ ...prev!, note: e.target.value }))}
              placeholder="Опишите как прошла неделя, что получилось, что не получилось..."
              rows={4}
            />
          </div>

          {/* Тэги */}
          <div className="space-y-3">
            <Label className="text-base font-medium flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Тэги для категоризации
            </Label>
            {editedWeek.tags && editedWeek.tags.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {editedWeek.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    #{tag}
                    <X 
                      className="h-3 w-3 cursor-pointer hover:text-destructive" 
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Добавить тэг..."
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
              />
              <Button onClick={addTag} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Ключевые события */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Ключевые события недели</Label>
            {editedWeek.keyEvents && editedWeek.keyEvents.length > 0 && (
              <div className="space-y-2">
                {editedWeek.keyEvents.map((event, index) => (
                  <div key={index} className="flex items-start gap-2 p-2 bg-muted rounded">
                    <span className="text-sm flex-1">{event}</span>
                    <X 
                      className="h-4 w-4 cursor-pointer hover:text-destructive flex-shrink-0" 
                      onClick={() => removeEvent(event)}
                    />
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Input
                value={newEvent}
                onChange={(e) => setNewEvent(e.target.value)}
                placeholder="Добавить событие..."
                onKeyPress={(e) => e.key === 'Enter' && addEvent()}
              />
              <Button onClick={addEvent} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* История изменений */}
          {editedWeek.lastModified && (
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Последнее изменение: {format(editedWeek.lastModified, 'dd.MM.yyyy HH:mm', { locale: ru })}
              </p>
            </div>
          )}

          {/* Кнопки действий */}
          <div className="flex gap-3 pt-4">
            <Button onClick={handleSave} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              Сохранить изменения
            </Button>
            <Button variant="outline" onClick={onClose}>
              Отменить
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};