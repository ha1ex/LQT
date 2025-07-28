import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  Target, 
  Bot, 
  Calendar, 
  TrendingUp, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle,
  Lightbulb,
  Users,
  Database
} from 'lucide-react';
import { useGlobalData } from '@/contexts/GlobalDataProvider';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  content: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface OnboardingWizardProps {
  onComplete: () => void;
  onSkip: () => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const { generateDemoData } = useGlobalData();

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Добро пожаловать в Life Quality Tracker!',
      description: 'Ваш персональный инструмент для системного улучшения качества жизни',
      icon: <CheckCircle className="w-8 h-8 text-primary" />,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Life Quality Tracker поможет вам:
          </p>
          <ul className="space-y-2">
            {[
              'Отслеживать важные аспекты жизни',
              'Создавать научно-обоснованные эксперименты',
              'Получать персональные рекомендации от ИИ',
              'Видеть прогресс и закономерности'
            ].map((item, index) => (
              <li key={index} className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )
    },
    {
      id: 'dashboard',
      title: 'Dashboard - Ваш центр управления',
      description: 'Отслеживайте ключевые метрики и получайте общую картину прогресса',
      icon: <BarChart3 className="w-8 h-8 text-blue-500" />,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium">Сильные стороны</span>
              </div>
              <p className="text-xs text-muted-foreground">Области, где вы преуспеваете</p>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium">Проблемные зоны</span>
              </div>
              <p className="text-xs text-muted-foreground">Области для улучшения</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Dashboard автоматически анализирует ваши данные и показывает самое важное.
          </p>
        </div>
      )
    },
    {
      id: 'strategy',
      title: 'Стратегия - Научный подход к изменениям',
      description: 'Создавайте гипотезы и проводите персональные эксперименты',
      icon: <Lightbulb className="w-8 h-8 text-yellow-500" />,
      content: (
        <div className="space-y-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2">Пример гипотезы:</h4>
            <div className="text-sm space-y-1">
              <p><strong>ЕСЛИ:</strong> Буду заниматься спортом 4 раза в неделю</p>
              <p><strong>ТО:</strong> Улучшится физическое состояние и энергия</p>
              <p><strong>ПОТОМУ ЧТО:</strong> Регулярные тренировки стимулируют выработку эндорфинов</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Превратите желания в конкретные эксперименты с измеримыми результатами.
          </p>
        </div>
      )
    },
    {
      id: 'ai-coach',
      title: 'ИИ-Коуч - Ваш персональный помощник',
      description: 'Получайте инсайты, рекомендации и поддержку от искусственного интеллекта',
      icon: <Bot className="w-8 h-8 text-purple-500" />,
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            {[
              { title: 'Анализ паттернов', desc: 'ИИ находит скрытые закономерности в ваших данных' },
              { title: 'Персональные рекомендации', desc: 'Советы, основанные на вашем прогрессе' },
              { title: 'Интерактивный чат', desc: 'Задавайте вопросы и получайте поддержку' }
            ].map((item, index) => (
              <div key={index} className="flex gap-3">
                <Bot className="w-5 h-5 text-purple-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'rating',
      title: 'Еженедельные оценки',
      description: 'Отслеживайте ваш прогресс по ключевым аспектам жизни',
      icon: <Calendar className="w-8 h-8 text-green-500" />,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-5 gap-1">
            {[1, 2, 3, 4, 5].map((rating) => (
              <div 
                key={rating} 
                className={`h-8 rounded text-xs flex items-center justify-center font-medium ${
                  rating <= 3 ? 'bg-green-500 text-white' : 'bg-muted'
                }`}
              >
                {rating}
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Еженедельно оценивайте важные аспекты жизни от 1 до 10. Это поможет отслеживать прогресс и находить паттерны.
          </p>
        </div>
      )
    },
    {
      id: 'demo',
      title: 'Попробуйте демо-версию',
      description: 'Загрузите пример данных, чтобы увидеть все возможности системы',
      icon: <Database className="w-8 h-8 text-blue-500" />,
      content: (
        <div className="space-y-4">
          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <h4 className="font-medium mb-2 text-blue-700">Демо данные включают:</h4>
            <ul className="text-sm space-y-1 text-blue-600">
              <li>• 20 недель исторических оценок</li>
              <li>• 3 активных эксперимента с прогрессом</li>
              <li>• ИИ инсайты и рекомендации</li>
              <li>• Аналитика и визуализации</li>
            </ul>
          </div>
          <p className="text-sm text-muted-foreground">
            Рекомендуем начать с демо-версии, чтобы понять как работает система.
          </p>
        </div>
      ),
      action: {
        label: 'Загрузить демо данные',
        onClick: () => {
          generateDemoData();
          onComplete();
        }
      }
    }
  ];

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
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

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <Badge variant="outline">
              Шаг {currentStep + 1} из {steps.length}
            </Badge>
            <Button variant="ghost" size="sm" onClick={onSkip}>
              Пропустить
            </Button>
          </div>
          
          <Progress value={progress} className="mb-4" />
          
          <div className="flex items-center gap-3">
            {currentStepData.icon}
            <div>
              <CardTitle className="text-xl">{currentStepData.title}</CardTitle>
              <CardDescription className="text-base">
                {currentStepData.description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="mb-6">
            {currentStepData.content}
          </div>
          
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад
            </Button>
            
            <div className="flex gap-2">
              {currentStepData.action && (
                <Button onClick={currentStepData.action.onClick}>
                  {currentStepData.action.label}
                </Button>
              )}
              
              <Button onClick={handleNext}>
                {currentStep === steps.length - 1 ? 'Завершить' : 'Далее'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};