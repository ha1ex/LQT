import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Brain, Sparkles, Target, TrendingUp, MessageCircle, ChevronRight, ArrowLeft } from 'lucide-react';
import { AIKeySetup } from './AIKeySetup';

interface AIWelcomeWizardProps {
  onComplete: () => void;
  onSkip: () => void;
}

const wizardSteps = [
  {
    id: 'welcome',
    title: 'Добро пожаловать в AI Life Coach',
    description: 'Ваш персональный помощник для улучшения качества жизни',
    icon: Brain,
    content: 'AI Life Coach анализирует ваши данные и предоставляет персонализированные рекомендации для достижения целей.'
  },
  {
    id: 'features',
    title: 'Что умеет ваш AI помощник',
    description: 'Откройте возможности умного анализа',
    icon: Sparkles,
    content: 'Система выявляет паттерны в ваших данных, предлагает цели и гипотезы, дает рекомендации по улучшению метрик.'
  },
  {
    id: 'setup',
    title: 'Настройка API ключа',
    description: 'Подключите OpenAI для начала работы',
    icon: Target,
    content: null
  }
];

export const AIWelcomeWizard: React.FC<AIWelcomeWizardProps> = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [hasApiKey, setHasApiKey] = useState(Boolean(localStorage.getItem('openai_api_key')));

  const progress = ((currentStep + 1) / wizardSteps.length) * 100;
  const step = wizardSteps[currentStep];
  const Icon = step.icon;

  const handleNext = () => {
    if (currentStep < wizardSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleKeySet = () => {
    setHasApiKey(true);
  };

  const canProceed = currentStep !== wizardSteps.length - 1 || hasApiKey;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Шаг {currentStep + 1} из {wizardSteps.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Main Card */}
      <Card className="relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        
        <CardHeader className="relative text-center pb-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
            <Icon className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-xl">{step.title}</CardTitle>
          <CardDescription className="text-base">{step.description}</CardDescription>
        </CardHeader>

        <CardContent className="relative space-y-6">
          {step.id === 'welcome' && (
            <div className="text-center space-y-4">
              <p className="text-muted-foreground leading-relaxed">{step.content}</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
                  <TrendingUp className="h-6 w-6 text-blue-600 mb-2 mx-auto" />
                  <h4 className="font-medium text-sm">Умные инсайты</h4>
                  <p className="text-xs text-muted-foreground mt-1">Анализ паттернов и трендов</p>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
                  <Target className="h-6 w-6 text-green-600 mb-2 mx-auto" />
                  <h4 className="font-medium text-sm">Цели и гипотезы</h4>
                  <p className="text-xs text-muted-foreground mt-1">Персонализированные рекомендации</p>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
                  <MessageCircle className="h-6 w-6 text-purple-600 mb-2 mx-auto" />
                  <h4 className="font-medium text-sm">AI Чат</h4>
                  <p className="text-xs text-muted-foreground mt-1">Интерактивные консультации</p>
                </div>
              </div>
            </div>
          )}

          {step.id === 'features' && (
            <div className="space-y-4">
              <p className="text-muted-foreground leading-relaxed text-center">{step.content}</p>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/50">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-primary-foreground font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Анализ данных</h4>
                    <p className="text-xs text-muted-foreground">Выявление скрытых паттернов в ваших метриках</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/50">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-primary-foreground font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Умные рекомендации</h4>
                    <p className="text-xs text-muted-foreground">Предложения целей и действий на основе ваших данных</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/50">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-primary-foreground font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Интерактивный чат</h4>
                    <p className="text-xs text-muted-foreground">Получайте ответы на любые вопросы о ваших данных</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step.id === 'setup' && (
            <div className="space-y-4">
              <p className="text-muted-foreground text-center">
                Последний шаг - настройте API ключ OpenAI для активации AI функций
              </p>
              <AIKeySetup onKeySet={handleKeySet} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button 
          variant="ghost" 
          onClick={handlePrevious}
          disabled={currentStep === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Назад
        </Button>

        <Button variant="ghost" onClick={onSkip}>
          Пропустить
        </Button>

        <Button 
          onClick={handleNext}
          disabled={!canProceed}
        >
          {currentStep === wizardSteps.length - 1 ? 'Завершить' : 'Далее'}
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};