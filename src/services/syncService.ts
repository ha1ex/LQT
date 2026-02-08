// Сервис синхронизации данных с бэкендом

const API_BASE = '/api';

interface SyncData {
  ratings?: Record<string, unknown>;
  hypotheses?: unknown;
  subjects?: unknown;
  goals?: unknown;
  chat_history?: unknown;
  preferences?: unknown;
}

interface SyncResponse {
  success: boolean;
  data?: SyncData;
  timestamp?: number;
  error?: string;
}

// Получаем токен авторизации
const getAuthToken = (): string | null => {
  // Используем тот же пароль что и для входа
  if (localStorage.getItem('lqt_authenticated') === 'true') {
    return 'qwerty87';
  }
  return null;
};

// Базовый fetch с авторизацией
const authFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });
};

// Загрузить данные с сервера
export const fetchFromServer = async (): Promise<SyncData | null> => {
  try {
    const response = await authFetch(`${API_BASE}/sync`);

    if (!response.ok) {
      if (response.status === 401) {
        console.warn('Sync: Not authorized');
        return null;
      }
      throw new Error(`Sync failed: ${response.status}`);
    }

    const result: SyncResponse = await response.json();
    return result.data || null;
  } catch (error) {
    console.error('Sync fetch error:', error);
    return null;
  }
};

// Отправить данные на сервер
export const pushToServer = async (data: SyncData): Promise<boolean> => {
  try {
    const response = await authFetch(`${API_BASE}/sync`, {
      method: 'POST',
      body: JSON.stringify({ data }),
    });

    if (!response.ok) {
      throw new Error(`Sync push failed: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('Sync push error:', error);
    return false;
  }
};

// Сохранить только ratings
export const saveRatings = async (ratings: Record<string, unknown>): Promise<boolean> => {
  try {
    const response = await authFetch(`${API_BASE}/ratings`, {
      method: 'POST',
      body: JSON.stringify({ ratings }),
    });

    return response.ok;
  } catch (error) {
    console.error('Save ratings error:', error);
    return false;
  }
};

// Загрузить только ratings
export const loadRatings = async (): Promise<Record<string, unknown> | null> => {
  try {
    const response = await authFetch(`${API_BASE}/ratings`);

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Load ratings error:', error);
    return null;
  }
};

// Собрать все данные из localStorage
export const collectLocalData = (): SyncData => {
  const data: SyncData = {};

  const keys = [
    { local: 'lqt_weekly_ratings', sync: 'ratings' },
    { local: 'lqt_hypotheses', sync: 'hypotheses' },
    { local: 'lqt_subjects', sync: 'subjects' },
    { local: 'lqt_goals', sync: 'goals' },
    { local: 'lqt_ai_chat_history', sync: 'chat_history' },
    { local: 'lqt_user_preferences', sync: 'preferences' },
  ];

  for (const { local, sync } of keys) {
    const value = localStorage.getItem(local);
    if (value) {
      try {
        (data as Record<string, unknown>)[sync] = JSON.parse(value);
      } catch {
        (data as Record<string, unknown>)[sync] = value;
      }
    }
  }

  return data;
};

// Применить данные с сервера в localStorage
export const applyServerData = (data: SyncData): void => {
  const keyMap: Record<string, string> = {
    ratings: 'lqt_weekly_ratings',
    hypotheses: 'lqt_hypotheses',
    subjects: 'lqt_subjects',
    goals: 'lqt_goals',
    chat_history: 'lqt_ai_chat_history',
    preferences: 'lqt_user_preferences',
  };

  for (const [syncKey, localKey] of Object.entries(keyMap)) {
    const value = (data as Record<string, unknown>)[syncKey];
    if (value !== null && value !== undefined) {
      localStorage.setItem(localKey, JSON.stringify(value));
    }
  }
};

// Полная синхронизация (загрузить с сервера -> мержить -> отправить обратно)
export const fullSync = async (): Promise<boolean> => {
  try {
    // 1. Загружаем данные с сервера
    const serverData = await fetchFromServer();

    // 2. Собираем локальные данные
    const localData = collectLocalData();

    // 3. Мержим (локальные имеют приоритет если есть)
    const mergedData: SyncData = {
      ...serverData,
      ...localData,
    };

    // Для ratings делаем глубокий мерж
    if (serverData?.ratings && localData.ratings) {
      mergedData.ratings = {
        ...serverData.ratings as Record<string, unknown>,
        ...localData.ratings as Record<string, unknown>,
      };
    }

    // 4. Применяем мерженные данные локально
    applyServerData(mergedData);

    // 5. Отправляем на сервер
    await pushToServer(mergedData);

    console.log('Full sync completed');
    return true;
  } catch (error) {
    console.error('Full sync error:', error);
    return false;
  }
};

// Отложенная синхронизация (дебаунс)
let syncTimeout: NodeJS.Timeout | null = null;

export const debouncedSync = (delayMs: number = 5000): void => {
  if (syncTimeout) {
    clearTimeout(syncTimeout);
  }

  syncTimeout = setTimeout(async () => {
    const localData = collectLocalData();
    await pushToServer(localData);
  }, delayMs);
};
