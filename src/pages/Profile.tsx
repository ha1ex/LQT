import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useGlobalData } from '@/contexts/GlobalDataProvider';
import { User, Calendar, Target, TrendingUp, Award } from 'lucide-react';

const Profile: React.FC = () => {
  const { appState } = useGlobalData();

  const getUserStateLabel = (state: string) => {
    switch (state) {
      case 'empty': return 'Новый пользователь';
      case 'demo': return 'Демо режим';
      case 'real_data': return 'Активный пользователь';
      default: return 'Неизвестно';
    }
  };

  const getUserStateBadgeVariant = (state: string) => {
    switch (state) {
      case 'empty': return 'outline';
      case 'demo': return 'secondary';
      case 'real_data': return 'default';
      default: return 'outline';
    }
  };

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <User className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Профиль</h1>
          <p className="text-muted-foreground">Информация о вашем аккаунте и прогрессе</p>
        </div>
      </div>

      {/* User Info */}
      <Card>
        <CardHeader>
          <CardTitle>Информация о пользователе</CardTitle>
          <CardDescription>Основные данные вашего профиля</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="text-xl">
                <User className="w-8 h-8" />
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Пользователь</h3>
              <Badge variant={getUserStateBadgeVariant(appState.userState)}>
                {getUserStateLabel(appState.userState)}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Последняя синхронизация</p>
                <p className="font-semibold">
                  {appState.lastDataSync 
                    ? new Date(appState.lastDataSync).toLocaleDateString('ru-RU')
                    : 'Никогда'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Статус данных</p>
                <p className="font-semibold">{appState.hasData ? 'Есть данные' : 'Нет данных'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Режим</p>
                <p className="font-semibold">{appState.isDemoMode ? 'Демо' : 'Реальные данные'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Версия</p>
                <p className="font-semibold">2.0.0</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Действия с аккаунтом</CardTitle>
          <CardDescription>Управление вашими данными и настройками</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Дополнительные действия с аккаунтом будут добавлены в следующих версиях
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;