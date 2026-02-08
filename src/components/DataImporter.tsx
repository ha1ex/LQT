import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, CheckCircle, AlertCircle, Database } from 'lucide-react';
import { importQuarterData, replaceWithRealData } from '@/utils/importRealData';

export const DataImporter: React.FC = () => {
  const [jsonData, setJsonData] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    importedWeeks?: number;
  } | null>(null);

  const handleImport = async () => {
    if (!jsonData.trim()) {
      setResult({
        success: false,
        message: 'Пожалуйста, введите данные в формате JSON'
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const data = JSON.parse(jsonData);
      
      // Проверяем структуру данных
      if (!data.weeks || !data.metrics) {
        throw new Error('Неверный формат данных. Ожидается объект с полями "weeks" и "metrics"');
      }

      // Импортируем данные
      const ratings = importQuarterData(data);
      
      if (ratings.length === 0) {
        throw new Error('Не удалось извлечь данные из JSON');
      }

      // Сохраняем в localStorage
      replaceWithRealData(ratings);

      setResult({
        success: true,
        message: `Данные успешно импортированы! Страница перезагрузится через 3 секунды...`,
        importedWeeks: ratings.length
      });

      // Очищаем поле ввода
      setJsonData('');

      // Перезагружаем страницу после показа результата
      setTimeout(() => {
        window.location.reload();
      }, 3000);

    } catch (error) {
      setResult({
        success: false,
        message: `Ошибка импорта: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadExampleData = () => {
    const exampleData = {
      weeks: ['W08', 'W09', 'W10', 'W11', 'W12', 'W13', 'W14'],
      metrics: {
        'Спокойствие ума': {
          'W08': 3, 'W09': 5, 'W10': 2, 'W11': 4, 'W12': 5, 'W13': 4, 'W14': 6
        },
        'Фин подушка': {
          'W08': 2, 'W09': 3, 'W10': 3, 'W11': 4, 'W12': 4, 'W13': 3, 'W14': 3
        },
        'Доход': {
          'W08': 3, 'W09': 4, 'W10': 4, 'W11': 4, 'W12': 4, 'W13': 4, 'W14': 4
        },
        'Качество общения с женой': {
          'W08': 3, 'W09': 5, 'W10': 5, 'W11': 5, 'W12': 5, 'W13': 5, 'W14': 4
        },
        'Качество общения с семьёй': {
          'W08': 5, 'W09': 6, 'W10': 4, 'W11': 3, 'W12': 2, 'W13': 3, 'W14': 4
        },
        'Физическое здоровье': {
          'W08': 4, 'W09': 5, 'W10': 2, 'W11': 3, 'W12': 3, 'W13': 3, 'W14': 4
        },
        'Социализация': {
          'W08': 4, 'W09': 5, 'W10': 3, 'W11': 2, 'W12': 2, 'W13': 2, 'W14': 4
        },
        'Проявленность': {
          'W08': 7, 'W09': 7, 'W10': 5, 'W11': 4, 'W12': 3, 'W13': 4, 'W14': 4
        },
        'Путшествия': {
          'W08': 1, 'W09': 1, 'W10': 1, 'W11': 2, 'W12': 2, 'W13': 2, 'W14': 2
        },
        'Ментальное здоровье': {
          'W08': 1, 'W09': 1, 'W10': 1, 'W11': 1, 'W12': 2, 'W13': 2, 'W14': 4
        }
      },
      year: 2024
    };

    setJsonData(JSON.stringify(exampleData, null, 2));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Импорт реальных данных
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="json-data">
              Вставьте данные в формате JSON
            </Label>
            <Textarea
              id="json-data"
              value={jsonData}
              onChange={(e) => setJsonData(e.target.value)}
              placeholder="Вставьте JSON данные здесь..."
              rows={15}
              className="font-mono text-sm"
            />
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleImport} 
              disabled={isLoading || !jsonData.trim()}
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              {isLoading ? 'Импортирую...' : 'Импортировать данные'}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={loadExampleData}
              className="flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Загрузить пример
            </Button>
          </div>

          {result && (
            <Alert className={result.success ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950' : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950'}>
              {result.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={result.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}>
                {result.message}
                {result.importedWeeks && (
                  <span className="block mt-1">
                    Импортировано недель: {result.importedWeeks}
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Формат данных</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Структура JSON:</h4>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`{
  "weeks": ["W08", "W09", "W10", ...],
  "metrics": {
    "Спокойствие ума": {
      "W08": 3,
      "W09": 5,
      "W10": 2,
      ...
    },
    "Фин подушка": {
      "W08": 4,
      "W09": 4,
      ...
    }
  },
  "year": 2024
}`}
              </pre>
            </div>

            <div>
              <h4 className="font-medium mb-2">Поддерживаемые метрики:</h4>
              <ul className="text-sm space-y-1">
                <li>• Спокойствие ума</li>
                <li>• Фин подушка</li>
                <li>• Доход</li>
                <li>• Качество общения с женой</li>
                <li>• Качество общения с семьёй</li>
                <li>• Физическое здоровье</li>
                <li>• Социализация</li>
                <li>• Проявленность</li>
                <li>• Путшествия</li>
                <li>• Ментальное здоровье</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">Важные замечания:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Оценки должны быть от 1 до 7 (будут автоматически переведены в шкалу 1-10)</li>
                <li>• Пустые ячейки можно пропускать</li>
                <li>• Недели должны быть в формате "W08", "W09" и т.д.</li>
                <li>• После импорта страница перезагрузится автоматически</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 