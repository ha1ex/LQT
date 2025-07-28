import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGlobalData } from '@/contexts/GlobalDataProvider';
import { 
  Target, 
  TrendingUp, 
  Brain, 
  Calendar, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface EmptyStateViewProps {
  onGetStarted: () => void;
  onViewDemo: () => void;
}

export const EmptyStateView: React.FC<EmptyStateViewProps> = ({
  onGetStarted,
  onViewDemo
}) => {
  const { generateDemoData } = useGlobalData();

  const features = [
    {
      icon: Target,
      title: 'Трекинг метрик',
      description: 'Отслеживайте 10+ ключевых областей жизни'
    },
    {
      icon: TrendingUp,
      title: 'Аналитика',
      description: 'Анализируйте паттерны и корреляции'
    },
    {
      icon: Brain,
      title: 'AI Coach',
      description: 'Получайте персональные рекомендации'
    },
    {
      icon: Calendar,
      title: 'Еженедельные оценки',
      description: 'Простая система оценки прогресса'
    }
  ];

  const handleDemoClick = () => {
    generateDemoData();
    onViewDemo();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Добро пожаловать в Life Quality Tracker</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Качество жизни <br />
            <span className="text-primary">под контролем</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Трекер для осознанного улучшения качества жизни через системный подход, 
            научные эксперименты и AI-рекомендации.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="text-center border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
              <CardHeader className="pb-3">
                <div className="w-12 h-12 mx-auto bg-primary/10 rounded-xl flex items-center justify-center mb-3">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold">{feature.title}</h3>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Get Started Card */}
          <Card className="p-6 border-2 border-dashed border-border hover:border-primary/50 transition-all duration-300">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                <Target className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Начать использование</h3>
              <p className="text-muted-foreground mb-6">
                Создайте свою первую оценку недели и начните отслеживать прогресс
              </p>
              <Button 
                onClick={onGetStarted}
                className="w-full"
                size="lg"
              >
                Начать трекинг
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>

          {/* Demo Card */}
          <Card className="p-6 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-primary/20 rounded-2xl flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Посмотреть демо</h3>
              <p className="text-muted-foreground mb-4">
                Изучите возможности сервиса на примере 20+ недель данных
              </p>
              <Badge variant="secondary" className="mb-4">
                Полнофункциональная демо-версия
              </Badge>
              <Button 
                onClick={handleDemoClick}
                variant="outline"
                className="w-full border-primary/30 hover:bg-primary/10"
                size="lg"
              >
                Загрузить демо
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>
        </div>

        {/* Quick Info */}
        <div className="text-center mt-12 text-sm text-muted-foreground">
          <p>
            🔒 Все данные хранятся локально в вашем браузере
            <span className="mx-2">•</span>
            ⚡ Работает без подключения к интернету
            <span className="mx-2">•</span>
            🧠 AI-функции опциональны
          </p>
        </div>
      </div>
    </div>
  );
};