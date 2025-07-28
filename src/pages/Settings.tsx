import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DemoModeToggle } from '@/components/ui/demo-mode-toggle';
import { Separator } from '@/components/ui/separator';
import { Settings as SettingsIcon, Database, User, Bell, Shield } from 'lucide-react';

const Settings: React.FC = () => {
  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <SettingsIcon className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Настройки</h1>
          <p className="text-muted-foreground">Управление приложением и персонализация</p>
        </div>
      </div>

      {/* Demo Mode Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Режимы работы
          </CardTitle>
          <CardDescription>
            Переключайтесь между демо-режимом и работой с реальными данными
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DemoModeToggle />
        </CardContent>
      </Card>

      <Separator />

      {/* User Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Пользовательские настройки
          </CardTitle>
          <CardDescription>
            Персонализация интерфейса и поведения приложения
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Настройки пользователя будут добавлены в следующих версиях
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Уведомления
          </CardTitle>
          <CardDescription>
            Управление уведомлениями и напоминаниями
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Настройки уведомлений будут добавлены в следующих версиях
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Конфиденциальность и безопасность
          </CardTitle>
          <CardDescription>
            Управление данными и настройки безопасности
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Настройки безопасности будут добавлены в следующих версиях
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;