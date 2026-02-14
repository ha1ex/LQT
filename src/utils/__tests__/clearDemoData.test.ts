/// <reference types="vitest/globals" />
import { clearAllDemoData, logCurrentLocalStorageState } from '../clearDemoData';

describe('clearAllDemoData', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const LQT_KEYS = [
    'lqt_hypotheses',
    'lqt_weekly_ratings',
    'lqt_subjects',
    'lqt_ai_insights',
    'lqt_ai_chat_history',
    'weekly_ratings_data',
    'lqt_journal',
    'lqt_goals',
    'lqt_user_preferences',
  ];

  it('removes all known LQT keys from localStorage', () => {
    // Seed localStorage with all known keys
    for (const key of LQT_KEYS) {
      localStorage.setItem(key, JSON.stringify({ test: true }));
    }

    clearAllDemoData();

    for (const key of LQT_KEYS) {
      expect(localStorage.getItem(key)).toBeNull();
    }
  });

  it('does not throw when localStorage is already empty', () => {
    expect(() => clearAllDemoData()).not.toThrow();
  });

  it('preserves unrelated keys in localStorage', () => {
    localStorage.setItem('unrelated_key', 'keep_me');
    localStorage.setItem('lqt_hypotheses', 'remove_me');

    clearAllDemoData();

    expect(localStorage.getItem('unrelated_key')).toBe('keep_me');
    expect(localStorage.getItem('lqt_hypotheses')).toBeNull();
  });

  it('handles partial data — only some keys present', () => {
    localStorage.setItem('lqt_journal', '[]');
    localStorage.setItem('lqt_goals', '{}');

    clearAllDemoData();

    expect(localStorage.getItem('lqt_journal')).toBeNull();
    expect(localStorage.getItem('lqt_goals')).toBeNull();
  });
});

describe('logCurrentLocalStorageState', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('does not throw when localStorage is empty', () => {
    expect(() => logCurrentLocalStorageState()).not.toThrow();
  });

  it('does not throw when localStorage has valid JSON values', () => {
    localStorage.setItem('lqt_hypotheses', JSON.stringify([{ id: 1 }]));
    localStorage.setItem('lqt_weekly_ratings', JSON.stringify({}));

    expect(() => logCurrentLocalStorageState()).not.toThrow();
  });

  it('does not throw when localStorage has invalid JSON', () => {
    localStorage.setItem('lqt_hypotheses', 'not valid json {{{');

    expect(() => logCurrentLocalStorageState()).not.toThrow();
  });
});
