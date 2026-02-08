import { useEffect, useCallback, useState, useRef } from 'react';
import {
  fullSync,
  collectLocalData,
  pushToServer,
  fetchFromServer,
  applyServerData,
} from '@/services/syncService';

interface SyncStatus {
  isSyncing: boolean;
  lastSyncTime: Date | null;
  error: string | null;
  isOnline: boolean;
}

export const useSync = () => {
  const [status, setStatus] = useState<SyncStatus>({
    isSyncing: false,
    lastSyncTime: null,
    error: null,
    isOnline: navigator.onLine,
  });

  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isAuthenticated = localStorage.getItem('lqt_authenticated') === 'true';

  // Синхронизация при старте приложения
  const initialSync = useCallback(async () => {
    if (!isAuthenticated) return;

    setStatus(s => ({ ...s, isSyncing: true, error: null }));

    try {
      // Пробуем загрузить данные с сервера
      const serverData = await fetchFromServer();

      if (serverData) {
        // Есть данные на сервере - мержим
        const localData = collectLocalData();

        // Если локально пусто - применяем серверные
        const hasLocalRatings = Object.keys(localData.ratings || {}).length > 0;

        if (!hasLocalRatings && serverData.ratings) {
          applyServerData(serverData);
          console.log('Applied server data to local');
        } else if (hasLocalRatings) {
          // Мержим и отправляем обратно
          const mergedRatings = {
            ...serverData.ratings as Record<string, unknown>,
            ...localData.ratings as Record<string, unknown>,
          };
          const mergedData = {
            ...serverData,
            ...localData,
            ratings: mergedRatings,
          };
          applyServerData(mergedData);
          await pushToServer(mergedData);
          console.log('Merged and synced data');
        }
      } else {
        // Нет данных на сервере - пушим локальные
        const localData = collectLocalData();
        if (Object.keys(localData.ratings || {}).length > 0) {
          await pushToServer(localData);
          console.log('Pushed local data to server');
        }
      }

      setStatus(s => ({
        ...s,
        isSyncing: false,
        lastSyncTime: new Date(),
      }));
    } catch (error) {
      console.error('Initial sync error:', error);
      setStatus(s => ({
        ...s,
        isSyncing: false,
        error: error instanceof Error ? error.message : 'Sync failed',
      }));
    }
  }, [isAuthenticated]);

  // Синхронизация с дебаунсом (вызывается при изменении данных)
  const syncWithDebounce = useCallback((delayMs: number = 3000) => {
    if (!isAuthenticated) return;

    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = setTimeout(async () => {
      setStatus(s => ({ ...s, isSyncing: true }));

      try {
        const localData = collectLocalData();
        await pushToServer(localData);
        setStatus(s => ({
          ...s,
          isSyncing: false,
          lastSyncTime: new Date(),
        }));
      } catch (error) {
        setStatus(s => ({
          ...s,
          isSyncing: false,
          error: error instanceof Error ? error.message : 'Sync failed',
        }));
      }
    }, delayMs);
  }, [isAuthenticated]);

  // Принудительная полная синхронизация
  const forceSync = useCallback(async () => {
    if (!isAuthenticated) return;

    setStatus(s => ({ ...s, isSyncing: true, error: null }));

    try {
      await fullSync();
      setStatus(s => ({
        ...s,
        isSyncing: false,
        lastSyncTime: new Date(),
      }));
    } catch (error) {
      setStatus(s => ({
        ...s,
        isSyncing: false,
        error: error instanceof Error ? error.message : 'Sync failed',
      }));
    }
  }, [isAuthenticated]);

  // Отслеживание онлайн/офлайн статуса
  useEffect(() => {
    const handleOnline = () => {
      setStatus(s => ({ ...s, isOnline: true }));
      // Синхронизируем когда вернулись онлайн
      syncWithDebounce(1000);
    };

    const handleOffline = () => {
      setStatus(s => ({ ...s, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncWithDebounce]);

  // Начальная синхронизация при монтировании
  useEffect(() => {
    initialSync();
  }, [initialSync]);

  // Очистка таймаута при размонтировании
  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, []);

  return {
    ...status,
    syncWithDebounce,
    forceSync,
  };
};
