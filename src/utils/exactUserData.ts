import { loadAllUserData } from './realUserData';

// Создание точных данных пользователя - делегирует загрузку реальных данных из xlsx
export const createExactUserData = async (): Promise<void> => {
  try {
    loadAllUserData();
  } catch (error) {
    if (import.meta.env.DEV) console.error('Ошибка при создании точных данных:', error);
  }
};
