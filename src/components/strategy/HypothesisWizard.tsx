import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ArrowRight, CheckCircle, Target, Lightbulb } from 'lucide-react';
import { useEnhancedHypotheses } from '@/hooks/strategy';
import { HypothesisFormData } from '@/types/strategy';

interface HypothesisWizardProps {
  onComplete: () => void;
  onCancel: () => void;
  availableMetrics?: { id: string; name: string; icon: string; category: string }[];
}

export const HypothesisWizard: React.FC<HypothesisWizardProps> = ({ onComplete, onCancel, availableMetrics = [] }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<HypothesisFormData>>({
    impact: 5,
    confidence: 5,
    effort: 5,
    timeframe: 4,
    risk: 3
  });

  const { createHypothesis } = useEnhancedHypotheses();


  const steps = [
    { number: 1, title: 'Цель', icon: Target, description: 'Выберите цель для улучшения' },
    { number: 2, title: 'Гипотеза', icon: Lightbulb, description: 'Сформулируйте ЕСЛИ-ТО-ПОТОМУ ЧТО' },
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
    if (currentStep < 2) {
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
      createHypothesis(formData as HypothesisFormData);
      onComplete();
    }
  };

  const isFormValid = () => {
    return formData.goal &&
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

  // Step 2 content - IF-THEN-BECAUSE formulation
  const step2Content = (
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

  return (
    <div className="max-w-4xl mx-auto">
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
              {step.number < 2 && (
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
          <CardTitle>Шаг {currentStep} из 2</CardTitle>
        </CardHeader>
        <CardContent>
          {currentStep === 1 && <Step1 />}
          {currentStep === 2 && step2Content}
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

        {currentStep === 2 ? (
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
