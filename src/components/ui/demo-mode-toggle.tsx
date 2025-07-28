import React from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useGlobalData } from '@/contexts/GlobalDataProvider';
import { Database, Trash2, RefreshCw } from 'lucide-react';

export const DemoModeToggle: React.FC = () => {
  const { appState, syncStatus, toggleDemoMode, clearAllData, refreshData } = useGlobalData();

  return (
    <div className="flex items-center gap-4">
      {/* Demo Mode Status Badge */}
      {appState.isDemoMode && (
        <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
          <Database className="w-3 h-3 mr-1" />
          Демо режим
        </Badge>
      )}

      {/* User State Badge */}
      <Badge 
        variant={appState.userState === 'real_data' ? 'default' : 'outline'}
        className={
          appState.userState === 'empty' ? 'text-muted-foreground' :
          appState.userState === 'demo' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
          'bg-green-500/10 text-green-600 border-green-500/20'
        }
      >
        {appState.userState === 'empty' ? 'Новый пользователь' :
         appState.userState === 'demo' ? 'Демо данные' :
         'Реальные данные'}
      </Badge>

      {/* Demo Mode Toggle */}
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2">
              <Switch
                checked={appState.isDemoMode}
                onCheckedChange={toggleDemoMode}
                disabled={syncStatus.isLoading}
              />
              <span className="text-sm font-medium">Демо режим</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs">
              Включите демо режим, чтобы увидеть как выглядит сервис с 20 неделями данных
            </p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshData}
              disabled={syncStatus.isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${syncStatus.isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Обновить данные</p>
          </TooltipContent>
        </Tooltip>

        {appState.hasData && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllData}
                disabled={syncStatus.isLoading}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Очистить все данные</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* Sync Status Indicator */}
      {syncStatus.isLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Синхронизация...</span>
        </div>
      )}
    </div>
  );
};