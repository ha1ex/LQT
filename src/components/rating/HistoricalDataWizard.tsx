import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronLeft, ChevronRight, Calendar, Target, Zap } from 'lucide-react';
import { format, startOfWeek, endOfWeek, subWeeks } from 'date-fns';
import { ru } from 'date-fns/locale';
import { WeeklyRating } from '@/types/weeklyRating';
import { BASE_METRICS } from '@/utils/dataAdapter';

interface HistoricalDataWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onBulkSave: (weeks: Array<{ date: Date; data: Partial<WeeklyRating> }>) => void;
  existingRatings: Record<string, WeeklyRating>;
}

interface WeekTemplate {
  ratings: Record<string, number>;
  mood: WeeklyRating['mood'];
  keyEvents: string[];
}

export const HistoricalDataWizard: React.FC<HistoricalDataWizardProps> = ({
  isOpen,
  onClose,
  onBulkSave,
  existingRatings
}) => {
  const [step, setStep] = useState(1);
  const [weeksToFill, setWeeksToFill] = useState(10);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(BASE_METRICS.slice(0, 5).map(m => m.id));
  const [fillMode, setFillMode] = useState<'template' | 'individual'>('template');
  const [template, setTemplate] = useState<WeekTemplate>({
    ratings: {},
    mood: 'neutral',
    keyEvents: []
  });
  const [individualWeeks, setIndividualWeeks] = useState<Record<number, WeekTemplate>>({});
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);

  // Generate weeks that need data
  const weeksToProcess = useMemo(() => {
    const weeks = [];
    for (let i = 1; i <= weeksToFill; i++) {
      const weekDate = subWeeks(new Date(), i);
      const weekStart = startOfWeek(weekDate, { locale: ru });
      const weekId = format(weekStart, 'yyyy-MM-dd');
      const hasData = !!existingRatings[weekId];
      
      weeks.push({
        index: i,
        date: weekDate,
        weekStart,
        weekEnd: endOfWeek(weekDate, { locale: ru }),
        weekId,
        hasData
      });
    }
    return weeks;
  }, [weeksToFill, existingRatings]);

  const emptyWeeks = weeksToProcess.filter(w => !w.hasData);

  const resetWizard = () => {
    setStep(1);
    setWeeksToFill(10);
    setSelectedMetrics(BASE_METRICS.slice(0, 5).map(m => m.id));
    setFillMode('template');
    setTemplate({ ratings: {}, mood: 'neutral', keyEvents: [] });
    setIndividualWeeks({});
    setCurrentWeekIndex(0);
  };

  const handleClose = () => {
    resetWizard();
    onClose();
  };

  const updateTemplate = (field: keyof WeekTemplate, value: any) => {
    setTemplate(prev => ({ ...prev, [field]: value }));
  };

  const updateIndividualWeek = (weekIndex: number, field: keyof WeekTemplate, value: any) => {
    setIndividualWeeks(prev => ({
      ...prev,
      [weekIndex]: {
        ...prev[weekIndex] || { ratings: {}, mood: 'neutral', keyEvents: [] },
        [field]: value
      }
    }));
  };

  const handleFinish = () => {
    const weeksData = emptyWeeks.map(week => {
      const weekData = fillMode === 'template' 
        ? template 
        : individualWeeks[week.index] || template;

      return {
        date: week.date,
        data: {
          ratings: weekData.ratings,
          mood: weekData.mood,
          keyEvents: weekData.keyEvents,
          notes: {}
        }
      };
    });

    onBulkSave(weeksData);
    handleClose();
  };

  const getCurrentWeek = () => emptyWeeks[currentWeekIndex];
  const currentWeek = getCurrentWeek();

  const renderStep1 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          Настройка заполнения
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="text-base font-medium">Сколько недель назад заполнить?</Label>
          <div className="mt-2 flex gap-2">
            {[5, 10, 15, 20].map(weeks => (
              <Button
                key={weeks}
                variant={weeksToFill === weeks ? "default" : "outline"}
                onClick={() => setWeeksToFill(weeks)}
              >
                {weeks} недель
              </Button>
            ))}
          </div>
          <div className="mt-2">
            <Input
              type="number"
              value={weeksToFill}
              onChange={(e) => setWeeksToFill(parseInt(e.target.value) || 10)}
              min={1}
              max={52}
              className="w-32"
            />
          </div>
        </div>

        <div>
          <Label className="text-base font-medium">Выберите ключевые критерии</Label>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {BASE_METRICS.map(metric => (
              <div key={metric.id} className="flex items-center space-x-2">
                <Checkbox
                  id={metric.id}
                  checked={selectedMetrics.includes(metric.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedMetrics(prev => [...prev, metric.id]);
                    } else {
                      setSelectedMetrics(prev => prev.filter(id => id !== metric.id));
                    }
                  }}
                />
                <Label htmlFor={metric.id} className="text-sm">{metric.name}</Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-base font-medium">Режим заполнения</Label>
          <div className="mt-2 space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="template"
                checked={fillMode === 'template'}
                onCheckedChange={() => setFillMode('template')}
              />
              <Label htmlFor="template">Использовать шаблон для всех недель</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="individual"
                checked={fillMode === 'individual'}
                onCheckedChange={() => setFillMode('individual')}
              />
              <Label htmlFor="individual">Заполнить каждую неделю отдельно</Label>
            </div>
          </div>
        </div>

        <div className="bg-muted p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">
            Будет обработано <strong>{weeksToProcess.length}</strong> недель, 
            из них <strong>{emptyWeeks.length}</strong> без данных
          </p>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep2 = () => {
    const weekData = fillMode === 'template' ? template : 
      (currentWeek ? individualWeeks[currentWeek.index] || { ratings: {}, mood: 'neutral', keyEvents: [] } : template);

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              {fillMode === 'template' ? 'Создание шаблона' : 
                `Неделя ${currentWeek?.index || 1}: ${currentWeek ? format(currentWeek.weekStart, 'dd.MM', { locale: ru }) : ''} - ${currentWeek ? format(currentWeek.weekEnd, 'dd.MM', { locale: ru }) : ''}`}
            </div>
            {fillMode === 'individual' && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentWeekIndex(Math.max(0, currentWeekIndex - 1))}
                  disabled={currentWeekIndex === 0}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm">{currentWeekIndex + 1} из {emptyWeeks.length}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentWeekIndex(Math.min(emptyWeeks.length - 1, currentWeekIndex + 1))}
                  disabled={currentWeekIndex >= emptyWeeks.length - 1}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-base font-medium">Оценки критериев</Label>
            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedMetrics.map(metricId => {
                const metric = BASE_METRICS.find(m => m.id === metricId);
                if (!metric) return null;

                return (
                  <div key={metricId} className="space-y-2">
                    <Label className="text-sm">{metric.name}</Label>
                    <div className="grid grid-cols-5 gap-1">
                      {[2, 4, 6, 8, 10].map(value => (
                        <Button
                          key={value}
                          variant={weekData.ratings[metricId] === value ? "default" : "outline"}
                          size="sm"
                          className="aspect-square p-0 text-xs"
                          onClick={() => {
                            if (fillMode === 'template') {
                              updateTemplate('ratings', { ...weekData.ratings, [metricId]: value });
                            } else if (currentWeek) {
                              updateIndividualWeek(currentWeek.index, 'ratings', { ...weekData.ratings, [metricId]: value });
                            }
                          }}
                        >
                          {value}
                        </Button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <Label className="text-base font-medium">Общее настроение</Label>
            <Select
              value={weekData.mood}
              onValueChange={(value) => {
                if (fillMode === 'template') {
                  updateTemplate('mood', value);
                } else if (currentWeek) {
                  updateIndividualWeek(currentWeek.index, 'mood', value);
                }
              }}
            >
              <SelectTrigger className="w-[200px] mt-2">
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
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Мастер заполнения исторических данных
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress */}
          <div className="flex items-center gap-4">
            <Progress value={(step / 2) * 100} className="flex-1" />
            <span className="text-sm text-muted-foreground">Шаг {step} из 2</span>
          </div>

          {/* Steps */}
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => step === 1 ? handleClose() : setStep(step - 1)}
            >
              {step === 1 ? 'Отмена' : 'Назад'}
            </Button>
            
            <div className="flex gap-2">
              {step === 2 && (
                <Button variant="outline" onClick={handleClose}>
                  Отмена
                </Button>
              )}
              <Button
                onClick={() => step === 2 ? handleFinish() : setStep(step + 1)}
                disabled={step === 1 && selectedMetrics.length === 0}
              >
                {step === 2 ? 'Заполнить недели' : 'Далее'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};