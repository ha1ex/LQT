import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WeeklyRating } from '@/types/weeklyRating';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { 
  Calendar, Edit, Save, X, Plus, Trash2, 
  Star, Heart, Brain, DollarSign, Users, Trophy,
  Smile, Meh, Frown, Angry, Laugh
} from 'lucide-react';

interface WeekDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  rating: WeeklyRating | null;
  onSave: (updatedRating: WeeklyRating) => void;
  allMetrics: Array<{ id: string; name: string; icon: string; description: string; category: string }>;
}

const WeekDetailModal: React.FC<WeekDetailModalProps> = ({
  isOpen,
  onClose,
  rating,
  onSave,
  allMetrics
}) => {
  const [editedRating, setEditedRating] = useState<WeeklyRating | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newEvent, setNewEvent] = useState('');

  useEffect(() => {
    if (rating) {
      setEditedRating({ ...rating });
    }
  }, [rating]);

  if (!rating || !editedRating) return null;

  const handleSave = () => {
    if (editedRating) {
      // Recalculate overall score
      const ratingsValues = Object.values(editedRating.ratings);
      const overallScore = ratingsValues.length > 0 
        ? ratingsValues.reduce((sum, r) => sum + r, 0) / ratingsValues.length
        : 0;

      const updatedRating = {
        ...editedRating,
        overallScore,
        updatedAt: new Date()
      };

      onSave(updatedRating);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditedRating({ ...rating });
    setIsEditing(false);
  };

  const getMoodIcon = (mood: WeeklyRating['mood']) => {
    switch (mood) {
      case 'excellent': return <Laugh className="w-5 h-5 text-green-600" />;
      case 'good': return <Smile className="w-5 h-5 text-green-500" />;
      case 'neutral': return <Meh className="w-5 h-5 text-yellow-500" />;
      case 'poor': return <Frown className="w-5 h-5 text-orange-500" />;
      case 'terrible': return <Angry className="w-5 h-5 text-red-500" />;
    }
  };

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

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-50';
    if (score >= 6.5) return 'text-green-500 bg-green-50';
    if (score >= 4) return 'text-yellow-600 bg-yellow-50';
    if (score >= 2.5) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const updateRating = (metricId: string, newRating: number) => {
    setEditedRating(prev => prev ? {
      ...prev,
      ratings: {
        ...prev.ratings,
        [metricId]: newRating
      }
    } : null);
  };

  const updateNote = (metricId: string, note: string) => {
    setEditedRating(prev => prev ? {
      ...prev,
      notes: {
        ...prev.notes,
        [metricId]: note
      }
    } : null);
  };

  const addKeyEvent = () => {
    if (newEvent.trim()) {
      setEditedRating(prev => prev ? {
        ...prev,
        keyEvents: [...prev.keyEvents, newEvent.trim()]
      } : null);
      setNewEvent('');
    }
  };

  const removeKeyEvent = (index: number) => {
    setEditedRating(prev => prev ? {
      ...prev,
      keyEvents: prev.keyEvents.filter((_, i) => i !== index)
    } : null);
  };

  const updateMood = (mood: WeeklyRating['mood']) => {
    setEditedRating(prev => prev ? { ...prev, mood } : null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">
                Неделя {rating.weekNumber}
              </DialogTitle>
              <p className="text-muted-foreground">
                {format(rating.startDate, 'dd MMMM', { locale: ru })} - {format(rating.endDate, 'dd MMMM yyyy', { locale: ru })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={cn("px-3 py-1 text-lg", getScoreColor(editedRating.overallScore))}>
                {editedRating.overallScore.toFixed(1)}
              </Badge>
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Редактировать
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={handleSave} size="sm">
                    <Save className="w-4 h-4 mr-2" />
                    Сохранить
                  </Button>
                  <Button onClick={handleCancel} variant="outline" size="sm">
                    <X className="w-4 h-4 mr-2" />
                    Отмена
                  </Button>
                </div>
              )}
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="ratings" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="ratings">Оценки</TabsTrigger>
            <TabsTrigger value="mood">Настроение</TabsTrigger>
            <TabsTrigger value="events">События</TabsTrigger>
          </TabsList>

          <TabsContent value="ratings" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allMetrics
                .filter(metric => editedRating.ratings[metric.id] !== undefined)
                .map((metric) => (
                  <Card key={metric.id}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <span className="text-lg">{metric.icon}</span>
                        {metric.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Оценка:</span>
                        <Badge className={cn("px-2 py-1", getScoreColor(editedRating.ratings[metric.id]))}>
                          {editedRating.ratings[metric.id]}/10
                        </Badge>
                      </div>
                      
                      {isEditing && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                              <button
                                key={rating}
                                onClick={() => updateRating(metric.id, rating)}
                                className={cn(
                                  "w-8 h-8 rounded text-sm font-medium transition-colors",
                                  editedRating.ratings[metric.id] === rating
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted hover:bg-muted/80"
                                )}
                              >
                                {rating}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {editedRating.notes[metric.id] && (
                        <div>
                          <p className="text-sm font-medium mb-1">Заметка:</p>
                          {isEditing ? (
                            <Textarea
                              value={editedRating.notes[metric.id] || ''}
                              onChange={(e) => updateNote(metric.id, e.target.value)}
                              placeholder="Добавить заметку..."
                              className="min-h-[60px]"
                            />
                          ) : (
                            <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
                              {editedRating.notes[metric.id]}
                            </p>
                          )}
                        </div>
                      )}
                      
                      {isEditing && !editedRating.notes[metric.id] && (
                        <Textarea
                          value={editedRating.notes[metric.id] || ''}
                          onChange={(e) => updateNote(metric.id, e.target.value)}
                          placeholder="Добавить заметку..."
                          className="min-h-[60px]"
                        />
                      )}
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="mood" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getMoodIcon(editedRating.mood)}
                  Настроение недели
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-4">
                  <div className={cn("w-4 h-4 rounded-full", getMoodColor(editedRating.mood))} />
                  <span className="capitalize">{editedRating.mood}</span>
                </div>
                
                {isEditing && (
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                    {([
                      { mood: 'excellent' as const, label: 'Отлично', icon: Laugh, color: 'text-green-600' },
                      { mood: 'good' as const, label: 'Хорошо', icon: Smile, color: 'text-green-500' },
                      { mood: 'neutral' as const, label: 'Нормально', icon: Meh, color: 'text-yellow-500' },
                      { mood: 'poor' as const, label: 'Плохо', icon: Frown, color: 'text-orange-500' },
                      { mood: 'terrible' as const, label: 'Ужасно', icon: Angry, color: 'text-red-500' }
                    ]).map(({ mood, label, icon: Icon, color }) => (
                      <button
                        key={mood}
                        onClick={() => updateMood(mood)}
                        className={cn(
                          "p-3 rounded-lg border-2 transition-all",
                          editedRating.mood === mood
                            ? "border-primary bg-primary/10"
                            : "border-muted hover:border-primary/50"
                        )}
                      >
                        <Icon className={cn("w-6 h-6 mx-auto mb-1", color)} />
                        <div className="text-sm">{label}</div>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Ключевые события</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {editedRating.keyEvents.length > 0 && (
                  <div className="space-y-2">
                    {editedRating.keyEvents.map((event, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="text-sm">{event}</span>
                        {isEditing && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeKeyEvent(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                {isEditing && (
                  <div className="flex gap-2">
                    <Input
                      value={newEvent}
                      onChange={(e) => setNewEvent(e.target.value)}
                      placeholder="Новое событие..."
                      onKeyPress={(e) => e.key === 'Enter' && addKeyEvent()}
                    />
                    <Button onClick={addKeyEvent} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                
                {editedRating.keyEvents.length === 0 && !isEditing && (
                  <p className="text-muted-foreground text-center py-4">
                    Ключевые события не указаны
                  </p>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Статистика недели</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Создана:</span>
                  <span>{format(rating.createdAt, 'dd.MM.yyyy HH:mm', { locale: ru })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Обновлена:</span>
                  <span>{format(rating.updatedAt, 'dd.MM.yyyy HH:mm', { locale: ru })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Оценено метрик:</span>
                  <span>{Object.keys(rating.ratings).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Средний балл:</span>
                  <Badge className={cn("px-2 py-1", getScoreColor(rating.overallScore))}>
                    {rating.overallScore.toFixed(1)}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default WeekDetailModal;