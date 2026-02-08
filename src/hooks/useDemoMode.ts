import { useState } from 'react';

export const useDemoMode = () => {
  return { isDemoMode: false, isLoading: false };
};

export const checkDemoData = (key: string) => {
  return localStorage.getItem(key) !== null;
};

export const getDemoDataIfAvailable = (key: string, defaultValue: any) => {
  try {
    const data = localStorage.getItem(key);
    if (data) {
      return JSON.parse(data);
    }
    return defaultValue;
  } catch (error) {
    if (import.meta.env.DEV) console.error(`Error parsing data for key ${key}:`, error);
    return defaultValue;
  }
};
