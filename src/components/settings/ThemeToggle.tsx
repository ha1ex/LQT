import React from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const themes = [
    { value: 'light', label: 'Светлая', icon: Sun },
    { value: 'dark', label: 'Темная', icon: Moon },
    { value: 'system', label: 'Система', icon: Monitor },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sun className="h-5 w-5" />
          Тема оформления
        </CardTitle>
        <CardDescription>
          Выберите предпочитаемую тему интерфейса
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3">
          {themes.map((themeOption) => {
            const Icon = themeOption.icon;
            return (
              <Button
                key={themeOption.value}
                variant={theme === themeOption.value ? "default" : "outline"}
                onClick={() => setTheme(themeOption.value)}
                className="h-16 flex flex-col items-center justify-center gap-2"
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs">{themeOption.label}</span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};