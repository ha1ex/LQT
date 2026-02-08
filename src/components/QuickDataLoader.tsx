import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Database, 
  CheckCircle, 
  AlertCircle, 
  Download, 
  Calendar,
  TrendingUp,
  Heart
} from 'lucide-react';
import {
  forceReloadAllUserData,
  loadQ1Data,
  loadQ2Data,
  loadQ3Data,
  loadQ4Data,
  loadQ1_2026Data
} from '@/utils/realUserData';

export const QuickDataLoader: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    weeksLoaded?: number;
  } | null>(null);

  const handleLoadData = (loaderFunction: () => void, quarterName: string) => {
    setIsLoading(true);
    setResult(null);

    try {
      loaderFunction();

      // Проверяем что данные реально сохранились в localStorage
      const savedData = localStorage.getItem('lqt_weekly_ratings');
      if (!savedData || savedData === '{}') {
        throw new Error('Данные не были сохранены в хранилище');
      }

      const weeksCount = Object.keys(JSON.parse(savedData)).length;

      setResult({
        success: true,
        message: `Данные ${quarterName} успешно загружены! Страница перезагрузится через 3 секунды...`,
        weeksLoaded: weeksCount
      });

      // Перезагружаем страницу после показа результата
      setTimeout(() => {
        window.location.reload();
      }, 3000);

    } catch (error) {
      setResult({
        success: false,
        message: `Ошибка загрузки ${quarterName}: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const dataSets = [
    {
      id: 'all',
      title: 'Все данные',
      description: 'Q1-Q4 2025 + Q1 2026 (45 недель)',
      icon: Database,
      color: 'bg-gradient-to-r from-blue-500 to-purple-600',
      loader: () => forceReloadAllUserData(),
      stats: {
        weeks: 45,
        metrics: 14,
        ratings: 540
      }
    },
    {
      id: 'q1',
      title: 'Q1 2025',
      description: 'Недели W08-W14 (7 недель)',
      icon: Calendar,
      color: 'bg-gradient-to-r from-green-500 to-emerald-600',
      loader: () => loadQ1Data(),
      stats: {
        weeks: 7,
        metrics: 10,
        ratings: 70
      }
    },
    {
      id: 'q2',
      title: 'Q2 2025',
      description: 'Недели W14-W22 (9 недель)',
      icon: TrendingUp,
      color: 'bg-gradient-to-r from-orange-500 to-red-600',
      loader: () => loadQ2Data(),
      stats: {
        weeks: 9,
        metrics: 10,
        ratings: 90
      }
    },
    {
      id: 'q3',
      title: 'Q3 2025',
      description: 'Недели W27-W38 (12 недель)',
      icon: Heart,
      color: 'bg-gradient-to-r from-purple-500 to-pink-600',
      loader: () => loadQ3Data(),
      stats: {
        weeks: 12,
        metrics: 12,
        ratings: 144
      }
    },
    {
      id: 'q4',
      title: 'Q4 2025',
      description: 'Недели W39-W52 (14 недель)',
      icon: TrendingUp,
      color: 'bg-gradient-to-r from-amber-500 to-orange-600',
      loader: () => loadQ4Data(),
      stats: {
        weeks: 14,
        metrics: 12,
        ratings: 168
      }
    },
    {
      id: 'q1_2026',
      title: 'Q1 2026',
      description: 'Недели W02-W04 (3 недели)',
      icon: Calendar,
      color: 'bg-gradient-to-r from-cyan-500 to-blue-600',
      loader: () => loadQ1_2026Data(),
      stats: {
        weeks: 3,
        metrics: 14,
        ratings: 42
      }
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Быстрая загрузка ваших данных
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dataSets.map((dataSet) => {
              const Icon = dataSet.icon;
              return (
                <Card key={dataSet.id} className="overflow-hidden">
                  <div className={`${dataSet.color} p-4 text-white`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="h-5 w-5" />
                      <h3 className="font-semibold">{dataSet.title}</h3>
                    </div>
                    <p className="text-sm opacity-90">{dataSet.description}</p>
                  </div>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Недель:</span>
                        <Badge variant="secondary">{dataSet.stats.weeks}</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Метрик:</span>
                        <Badge variant="secondary">{dataSet.stats.metrics}</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Оценок:</span>
                        <Badge variant="secondary">{dataSet.stats.ratings}</Badge>
                      </div>
                      
                      <Button
                        onClick={() => handleLoadData(dataSet.loader, dataSet.title)}
                        disabled={isLoading}
                        className="w-full mt-3"
                        variant="outline"
                      >
                        {isLoading ? 'Загружаю...' : `Загрузить ${dataSet.title}`}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {result && (
            <Alert className={`mt-4 ${result.success ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950' : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950'}`}>
              {result.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={result.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}>
                {result.message}
                {result.weeksLoaded && (
                  <span className="block mt-1">
                    Загружено недель: {result.weeksLoaded}
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Информация о данных</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">📊 Ваши метрики:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>• Спокойствие ума</div>
                <div>• Фин подушка</div>
                <div>• Доход</div>
                <div>• Общение с женой</div>
                <div>• Общение с семьёй</div>
                <div>• Физическая активность</div>
                <div>• Социализация</div>
                <div>• Проявленность</div>
                <div>• Путешествия</div>
                <div>• Ментальное здоровье</div>
                <div>• Уровень тревожности</div>
                <div>• Состояние здоровья</div>
                <div>• Ощущение счастья</div>
                <div>• Самооценка</div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">📅 Периоды данных:</h4>
              <div className="space-y-1 text-sm">
                <div>• <strong>Q1 2025:</strong> W08-W14 (февраль-март)</div>
                <div>• <strong>Q2 2025:</strong> W14-W22 (март-май)</div>
                <div>• <strong>Q3 2025:</strong> W27-W38 (июль-сентябрь)</div>
                <div>• <strong>Q4 2025:</strong> W39-W52 (сентябрь-декабрь)</div>
                <div>• <strong>Q1 2026:</strong> W02-W04 (январь)</div>
                <div className="text-muted-foreground">• Пропущенные недели: W23-W26</div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">⚡ Что произойдет после загрузки:</h4>
              <div className="space-y-1 text-sm">
                <div>• Демо-данные будут заменены на ваши реальные</div>
                <div>• Страница автоматически перезагрузится</div>
                <div>• Вы увидите ваши данные во всех разделах приложения</div>
                <div>• AI Coach будет работать с вашими реальными данными</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 