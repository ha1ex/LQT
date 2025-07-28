import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { ArrowLeft, ArrowRight, CheckCircle, Target, Users, Lightbulb, BarChart3 } from 'lucide-react';
import { useSubjects, useEnhancedHypotheses } from '@/hooks/strategy';
import { HypothesisFormData } from '@/types/strategy';

interface HypothesisWizardProps {
  onComplete: () => void;
  onCancel: () => void;
  availableMetrics?: { id: string; name: string; icon: string; category: string }[];
}

export const HypothesisWizard: React.FC<HypothesisWizardProps> = ({ onComplete, onCancel, availableMetrics = [] }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<HypothesisFormData>>({
    subjects: [],
    impact: 5,
    confidence: 5,
    effort: 5,
    timeframe: 4,
    risk: 3
  });

  const { subjects, loading: subjectsLoading } = useSubjects();
  const { createHypothesis } = useEnhancedHypotheses();

  // Debug logging
  console.log('🔍 HypothesisWizard - subjects:', subjects.length, subjects);

  const steps = [
    { number: 1, title: 'Цель', icon: Target, description: 'Выберите цель для улучшения' },
    { number: 2, title: 'Субъекты', icon: Users, description: 'Выберите участников изменений' },
    { number: 3, title: 'Гипотеза', icon: Lightbulb, description: 'Сформулируйте ЕСЛИ-ТО-ПОТОМУ ЧТО' },
    { number: 4, title: 'Приоритизация', icon: BarChart3, description: 'Оцените параметры' }
  ];

  // Используем реальные метрики или fallback
  const goals = availableMetrics.length > 0 
    ? availableMetrics.map(metric => ({
        id: metric.id,
        name: metric.name,
        description: `Улучшить показатель "${metric.name}"`
      }))
    : [
        { id: 'peace_of_mind', name: 'Спокойствие ума', description: 'Улучшить внутреннюю гармонию' },
        { id: 'financial_cushion', name: 'Финансовая подушка', description: 'Увеличить финансовые резервы' },
        { id: 'wife_communication', name: 'Общение с женой', description: 'Улучшить качество отношений' },
        { id: 'physical_health', name: 'Физическое здоровье', description: 'Улучшить физическую форму' },
        { id: 'socialization', name: 'Социализация', description: 'Расширить социальные связи' }
      ];

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    if (isFormValid()) {
      const hypothesisData = {
        ...formData,
        // Добавляем базовые задачи для новой гипотезы
        tasks: [
          {
            description: "Ежедневные действия по гипотезе",
            frequency: 'daily' as const,
            priority: 'high' as const
          },
          {
            description: "Еженедельная оценка прогресса", 
            frequency: 'weekly' as const,
            priority: 'medium' as const
          }
        ]
      };
      createHypothesis(hypothesisData as HypothesisFormData);
      onComplete();
    }
  };

  const isFormValid = () => {
    return formData.goal && 
           formData.subjects && formData.subjects.length > 0 && 
           formData.conditions && 
           formData.expectedOutcome && 
           formData.reasoning;
  };

  const updateFormData = (updates: Partial<HypothesisFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  // Step 1: Goal Selection
  const Step1 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Выберите цель для улучшения</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map(goal => (
          <Card 
            key={goal.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              formData.goal?.description === goal.name ? 'ring-2 ring-primary bg-primary/5' : ''
            }`}
            onClick={() => updateFormData({ goal: { metricId: goal.id, description: goal.name, targetValue: 8, currentValue: 5 } })}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{goal.name}</CardTitle>
              <CardDescription className="text-sm">{goal.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );

  // Step 2: Subject Selection
  const Step2 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Выберите участников изменений</h3>
      <p className="text-sm text-muted-foreground">
        Кто будет влиять на достижение цели или чье поведение нужно изменить?
      </p>
      
      {subjectsLoading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Загрузка участников...</p>
        </div>
      ) : subjects.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Участники не найдены. Попробуйте обновить страницу.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subjects.map(subject => (
          <Card 
            key={subject.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              formData.subjects?.includes(subject.id) ? 'ring-2 ring-primary bg-primary/5' : ''
            }`}
            onClick={() => {
              const current = formData.subjects || [];
              const updated = current.includes(subject.id)
                ? current.filter(id => id !== subject.id)
                : [...current, subject.id];
              updateFormData({ subjects: updated });
            }}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{subject.name}</CardTitle>
                {formData.subjects?.includes(subject.id) && (
                  <CheckCircle className="h-5 w-5 text-primary" />
                )}
              </div>
              <CardDescription className="text-sm">{subject.description}</CardDescription>
            </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {formData.subjects && formData.subjects.length > 0 && (
        <div className="p-4 bg-muted/50 rounded-lg">
          <p className="text-sm font-medium mb-2">Выбранные участники:</p>
          <div className="flex flex-wrap gap-2">
            {formData.subjects.map(subjectId => {
              const subject = subjects.find(s => s.id === subjectId);
              return subject ? (
                <Badge key={subjectId} variant="secondary">
                  {subject.name}
                </Badge>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );

  // Step 3 content - используется inline для избежания пересоздания компонента
  const step3Content = (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Сформулируйте гипотезу</h3>
      <p className="text-sm text-muted-foreground">
        Используйте структуру: ЕСЛИ [условие], ТО [ожидаемый результат], ПОТОМУ ЧТО [обоснование]
      </p>

      <div className="space-y-4">
        <div>
          <Label htmlFor="condition">ЕСЛИ (условие/действие):</Label>
          <Textarea
            id="condition"
            placeholder="Например: я буду медитировать 10 минут каждое утро..."
            value={formData.conditions || ''}
            onChange={(e) => updateFormData({ conditions: e.target.value })}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="outcome">ТО (ожидаемый результат):</Label>
          <Textarea
            id="outcome"
            placeholder="Например: мой уровень стресса снизится на 2 балла..."
            value={formData.expectedOutcome || ''}
            onChange={(e) => updateFormData({ expectedOutcome: e.target.value })}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="reasoning">ПОТОМУ ЧТО (обоснование):</Label>
          <Textarea
            id="reasoning"
            placeholder="Например: медитация доказанно снижает кортизол и улучшает эмоциональную регуляцию..."
            value={formData.reasoning || ''}
            onChange={(e) => updateFormData({ reasoning: e.target.value })}
            className="mt-1"
          />
        </div>
      </div>

      {formData.conditions && formData.expectedOutcome && formData.reasoning && (
        <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <h4 className="font-medium mb-2">Ваша гипотеза:</h4>
          <p className="text-sm">
            <span className="font-medium">ЕСЛИ</span> {formData.conditions}, <br/>
            <span className="font-medium">ТО</span> {formData.expectedOutcome}, <br/>
            <span className="font-medium">ПОТОМУ ЧТО</span> {formData.reasoning}
          </p>
        </div>
      )}
    </div>
  );

  // Step 4: Prioritization
  const Step4 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Оцените параметры гипотезы</h3>
      <p className="text-sm text-muted-foreground">
        Оцените каждый параметр от 1 до 10 для расчета приоритета
      </p>

      <div className="space-y-6">
        <div>
          <div className="flex justify-between items-center mb-2">
            <Label>Влияние на цель</Label>
            <span className="text-sm font-medium">{formData.impact}/10</span>
          </div>
          <Slider
            value={[formData.impact || 5]}
            onValueChange={(value) => updateFormData({ impact: value[0] })}
            max={10}
            min={1}
            step={1}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Насколько сильно это повлияет на достижение цели?
          </p>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <Label>Уверенность в результате</Label>
            <span className="text-sm font-medium">{formData.confidence}/10</span>
          </div>
          <Slider
            value={[formData.confidence || 5]}
            onValueChange={(value) => updateFormData({ confidence: value[0] })}
            max={10}
            min={1}
            step={1}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Насколько вы уверены, что это сработает?
          </p>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <Label>Требуемые усилия</Label>
            <span className="text-sm font-medium">{formData.effort}/10</span>
          </div>
          <Slider
            value={[formData.effort || 5]}
            onValueChange={(value) => updateFormData({ effort: value[0] })}
            max={10}
            min={1}
            step={1}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Сколько усилий потребуется? (1 = очень мало, 10 = очень много)
          </p>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <Label>Временные рамки</Label>
            <span className="text-sm font-medium">{formData.timeframe}/10</span>
          </div>
          <Slider
            value={[formData.timeframe || 4]}
            onValueChange={(value) => updateFormData({ timeframe: value[0] })}
            max={10}
            min={1}
            step={1}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Как быстро можно увидеть результаты? (1 = очень долго, 10 = очень быстро)
          </p>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <Label>Уровень риска</Label>
            <span className="text-sm font-medium">{formData.risk}/10</span>
          </div>
          <Slider
            value={[formData.risk || 3]}
            onValueChange={(value) => updateFormData({ risk: value[0] })}
            max={10}
            min={1}
            step={1}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Насколько рискованная гипотеза? (1 = низкий риск, 10 = высокий риск)
          </p>
        </div>
      </div>

      <div className="p-4 bg-muted/50 rounded-lg">
        <h4 className="font-medium mb-2">Расчетный приоритет:</h4>
        <div className="text-2xl font-bold text-primary">
          {(((formData.impact || 5) * (formData.confidence || 5) * (10 - (formData.effort || 5)) * 
             (formData.timeframe || 4) * (10 - (formData.risk || 3))) / 100000 * 100).toFixed(1)}
        </div>
        <p className="text-xs text-muted-foreground">
          Рассчитано по формуле: (Влияние × Уверенность × (10-Усилия) × Временные рамки × (10-Риск)) / 1000
        </p>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step) => (
            <div key={step.number} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                currentStep >= step.number 
                  ? 'bg-primary text-primary-foreground border-primary' 
                  : 'border-muted-foreground text-muted-foreground'
              }`}>
                <step.icon className="h-5 w-5" />
              </div>
              <div className="ml-3 hidden md:block">
                <p className={`font-medium ${currentStep >= step.number ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {step.title}
                </p>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
              {step.number < 4 && (
                <div className={`hidden md:block w-12 h-0.5 mx-4 ${
                  currentStep > step.number ? 'bg-primary' : 'bg-muted'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>Шаг {currentStep} из 4</CardTitle>
        </CardHeader>
        <CardContent>
          {currentStep === 1 && <Step1 />}
          {currentStep === 2 && <Step2 />}
          {currentStep === 3 && step3Content}
          {currentStep === 4 && <Step4 />}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button 
          variant="outline" 
          onClick={currentStep === 1 ? onCancel : handlePrevious}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {currentStep === 1 ? 'Отмена' : 'Назад'}
        </Button>

        {currentStep === 4 ? (
          <Button 
            onClick={handleSubmit}
            disabled={!isFormValid()}
            className="flex items-center gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            Создать гипотезу
          </Button>
        ) : (
          <Button 
            onClick={handleNext}
            disabled={currentStep === 1 && !formData.goal}
            className="flex items-center gap-2"
          >
            Далее
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};