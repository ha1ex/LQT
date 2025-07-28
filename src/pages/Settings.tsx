import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AIKeySetup } from '@/components/ai/AIKeySetup';
import { Settings as SettingsIcon, Brain, Key } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const Settings: React.FC = () => {
  const { toast } = useToast();

  const handleKeyUpdate = () => {
    toast({
      title: "Настройки сохранены",
      description: "API ключ для AI помощника обновлен",
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <SettingsIcon className="h-8 w-8" />
          Настройки
        </h1>
        <p className="text-muted-foreground mt-2">
          Управление настройками приложения и AI помощника
        </p>
      </div>

      <Separator />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Помощник
            </CardTitle>
            <CardDescription>
              Настройка API ключа для получения персонализированных рекомендаций
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AIKeySetup onKeySet={handleKeyUpdate} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};