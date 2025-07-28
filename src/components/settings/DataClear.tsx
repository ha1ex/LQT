import React, { useState } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { clearAllDemoData } from '@/utils/clearDemoData';

export const DataClear: React.FC = () => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const clearAllData = () => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        clearAllDemoData();
        
        toast({
          title: "Данные очищены",
          description: "Все данные успешно удалены. Перезагрузите страницу для применения изменений.",
        });
        
        setIsOpen(false);
        
        // Перезагружаем страницу через небольшую задержку
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        throw new Error('LocalStorage недоступен');
      }
    } catch (error) {
      toast({
        title: "Ошибка очистки",
        description: "Не удалось очистить данные",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trash2 className="h-5 w-5" />
          Очистка данных
        </CardTitle>
        <CardDescription>
          Удалить все сохраненные данные приложения
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full">
              <Trash2 className="h-4 w-4 mr-2" />
              Очистить все данные
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Подтверждение очистки
              </AlertDialogTitle>
              <AlertDialogDescription>
                Это действие удалит все ваши данные: оценки, гипотезы, цели и настройки. 
                Восстановить данные будет невозможно.
                
                <br/><br/>
                
                <strong>Рекомендуем сначала экспортировать данные!</strong>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Отмена</AlertDialogCancel>
              <AlertDialogAction 
                onClick={clearAllData}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Удалить все данные
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};