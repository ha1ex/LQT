import React from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export const DataExport: React.FC = () => {
  const { toast } = useToast();

  const exportData = () => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        toast({
          title: "Ошибка экспорта",
          description: "Локальное хранилище недоступно",
          variant: "destructive",
        });
        return;
      }

      // Собираем все данные из localStorage
      const exportData = {
        weekly_ratings: localStorage.getItem('lqt_weekly_ratings'),
        hypotheses: localStorage.getItem('lqt_hypotheses'),
        subjects: localStorage.getItem('lqt_subjects'),
        ai_insights: localStorage.getItem('lqt_ai_insights'),
        ai_chat_history: localStorage.getItem('lqt_ai_chat_history'),
        goals: localStorage.getItem('lqt_goals'),
        user_preferences: localStorage.getItem('lqt_user_preferences'),
        export_date: new Date().toISOString(),
      };

      // Создаем и скачиваем файл
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `life-quality-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);

      toast({
        title: "Экспорт завершен",
        description: "Ваши данные успешно сохранены в файл",
      });
    } catch (_error) {
      toast({
        title: "Ошибка экспорта",
        description: "Не удалось экспортировать данные",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Экспорт данных
        </CardTitle>
        <CardDescription>
          Скачать все ваши данные в формате JSON
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={exportData} className="w-full">
          <Download className="h-4 w-4 mr-2" />
          Скачать данные
        </Button>
      </CardContent>
    </Card>
  );
};