import { useState, useEffect } from 'react';

/**
 * Единый хук для определения и управления демо режимом
 */
export const useDemoMode = () => {
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const demoMode = localStorage.getItem('lqt_demo_mode') === 'true';
      setIsDemoMode(demoMode);
      console.log('useDemoMode: Demo mode active:', demoMode);
    } catch (error) {
      console.error('Error reading demo mode:', error);
      setIsDemoMode(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { isDemoMode, isLoading };
};

/**
 * Проверяет наличие демо данных в localStorage
 */
export const hasDemoData = (): boolean => {
  const keys = ['lqt_weekly_ratings', 'lqt_hypotheses', 'lqt_subjects', 'lqt_ai_insights'];
  return keys.some(key => {
    const data = localStorage.getItem(key);
    return data && data !== 'null' && data !== '[]' && data !== '{}';
  });
};

/**
 * Получает демо данные если они есть, независимо от флага демо режима
 */
export const getDemoDataIfAvailable = <T>(key: string, fallback: T): T => {
  try {
    const stored = localStorage.getItem(key);
    if (stored && stored !== 'null') {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error(`Error parsing data for key ${key}:`, error);
  }
  return fallback;
};