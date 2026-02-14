/// <reference types="vitest/globals" />
import {
  BASE_METRICS,
  adaptWeeklyRatingsToMockData,
  createEmptyDataStructure,
  getLastNWeeks,
  filterDataByPeriod,
  hasDataForPeriod,
  getMetricsFromData,
} from '../dataAdapter';
import type { WeeklyRating } from '@/types/weeklyRating';
import type { AppDataState } from '@/types/app';

// Helper to build a minimal WeeklyRating
function makeRating(overrides: Partial<WeeklyRating> & { startDate: Date; endDate: Date }): WeeklyRating {
  return {
    id: 'r1',
    weekNumber: 1,
    ratings: {},
    notes: {},
    mood: 'good',
    keyEvents: [],
    overallScore: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('BASE_METRICS', () => {
  it('contains at least one metric', () => {
    expect(BASE_METRICS.length).toBeGreaterThan(0);
  });

  it('each metric has required fields', () => {
    for (const m of BASE_METRICS) {
      expect(m).toHaveProperty('id');
      expect(m).toHaveProperty('name');
      expect(m).toHaveProperty('icon');
      expect(m).toHaveProperty('category');
    }
  });

  it('has unique ids', () => {
    const ids = BASE_METRICS.map(m => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('createEmptyDataStructure', () => {
  it('returns an empty array', () => {
    expect(createEmptyDataStructure()).toEqual([]);
  });
});

describe('getLastNWeeks', () => {
  const data = [{ week: 'W1' }, { week: 'W2' }, { week: 'W3' }, { week: 'W4' }, { week: 'W5' }];

  it('returns last N items', () => {
    expect(getLastNWeeks(data, 2)).toEqual([{ week: 'W4' }, { week: 'W5' }]);
  });

  it('returns entire array when N >= length', () => {
    expect(getLastNWeeks(data, 10)).toEqual(data);
  });

  it('returns empty array for empty input', () => {
    expect(getLastNWeeks([], 3)).toEqual([]);
  });
});

describe('filterDataByPeriod', () => {
  const data = Array.from({ length: 20 }, (_, i) => ({ week: `W${i + 1}` }));

  it('returns last 1 week for "week"', () => {
    const result = filterDataByPeriod(data, 'week');
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ week: 'W20' });
  });

  it('returns last 4 weeks for "month"', () => {
    expect(filterDataByPeriod(data, 'month')).toHaveLength(4);
  });

  it('returns last 12 weeks for "quarter"', () => {
    expect(filterDataByPeriod(data, 'quarter')).toHaveLength(12);
  });

  it('returns all data for "year"', () => {
    expect(filterDataByPeriod(data, 'year')).toHaveLength(20);
  });

  it('defaults to last 4 weeks for unknown period', () => {
    expect(filterDataByPeriod(data, 'unknown')).toHaveLength(4);
  });
});

describe('hasDataForPeriod', () => {
  it('returns true when data exists', () => {
    expect(hasDataForPeriod([{ week: 'W1' }], 'week')).toBe(true);
  });

  it('returns false for empty data', () => {
    expect(hasDataForPeriod([], 'month')).toBe(false);
  });
});

describe('getMetricsFromData', () => {
  it('returns empty array for empty data', () => {
    expect(getMetricsFromData([])).toEqual([]);
  });

  it('extracts metric keys from last entry, excluding week/date/overall', () => {
    const data = [
      { week: 'W1', date: '1-7 Jan', overall: 5, MetricA: 7, MetricB: 8 },
    ];
    const metrics = getMetricsFromData(data);
    expect(metrics).toContain('MetricA');
    expect(metrics).toContain('MetricB');
    expect(metrics).not.toContain('week');
    expect(metrics).not.toContain('date');
    expect(metrics).not.toContain('overall');
  });

  it('uses the last week entry for metric extraction', () => {
    const data = [
      { week: 'W1', date: 'd', overall: 5, A: 1 },
      { week: 'W2', date: 'd', overall: 6, A: 2, B: 3 },
    ];
    const metrics = getMetricsFromData(data);
    expect(metrics).toContain('A');
    expect(metrics).toContain('B');
  });
});

describe('adaptWeeklyRatingsToMockData', () => {
  const emptyState: AppDataState = {
    userState: 'empty',
    hasData: false,
    lastDataSync: null,
  };

  const realDataState: AppDataState = {
    userState: 'real_data',
    hasData: true,
    lastDataSync: new Date(),
  };

  it('returns empty array when userState is "empty"', () => {
    const ratings = { r1: makeRating({ startDate: new Date('2024-01-01'), endDate: new Date('2024-01-07') }) };
    expect(adaptWeeklyRatingsToMockData(ratings, emptyState)).toEqual([]);
  });

  it('returns empty array for empty ratings object', () => {
    expect(adaptWeeklyRatingsToMockData({}, realDataState)).toEqual([]);
  });

  it('transforms a single valid rating into mock data', () => {
    const rating = makeRating({
      id: 'r1',
      weekNumber: 5,
      startDate: new Date('2024-03-04'),
      endDate: new Date('2024-03-10'),
      ratings: { peace_of_mind: 8, income: 7 },
      overallScore: 7.5,
    });

    const result = adaptWeeklyRatingsToMockData({ r1: rating }, realDataState);
    expect(result).toHaveLength(1);

    const entry = result[0];
    expect(entry.week).toBe('W5');
    // Check that metric names (not ids) are used as keys
    expect(entry['Спокойствие ума']).toBe(8);
    expect(entry['Доход']).toBe(7);
    // overall should be average of the ratings: (8+7)/2 = 7.5
    expect(entry.overall).toBe(7.5);
  });

  it('sorts results by startDate ascending', () => {
    const r1 = makeRating({
      id: 'r1',
      weekNumber: 2,
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-02-07'),
      ratings: { peace_of_mind: 5 },
    });
    const r2 = makeRating({
      id: 'r2',
      weekNumber: 1,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-07'),
      ratings: { peace_of_mind: 3 },
    });

    const result = adaptWeeklyRatingsToMockData({ r1, r2 }, realDataState);
    expect(result[0].week).toBe('W1');
    expect(result[1].week).toBe('W2');
  });

  it('maps legacy metric ids to current ids', () => {
    const rating = makeRating({
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-07'),
      ratings: { physical_health: 9 },
    });

    const result = adaptWeeklyRatingsToMockData({ r1: rating }, realDataState);
    // physical_health maps to physical_activity -> "Уровень физической активности"
    expect(result[0]['Уровень физической активности']).toBe(9);
  });

  it('falls back to overallScore when ratings are empty', () => {
    const rating = makeRating({
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-07'),
      ratings: {},
      overallScore: 6.5,
    });

    const result = adaptWeeklyRatingsToMockData({ r1: rating }, realDataState);
    expect(result[0].overall).toBe(6.5);
  });

  it('filters out entries with missing startDate or endDate', () => {
    const good = makeRating({
      id: 'good',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-07'),
      ratings: { peace_of_mind: 5 },
    });
    // Deliberately create a malformed entry
    const bad = {
      id: 'bad',
      weekNumber: 2,
      startDate: null as unknown as Date,
      endDate: null as unknown as Date,
      ratings: {},
      notes: {},
      mood: 'good' as const,
      keyEvents: [],
      overallScore: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = adaptWeeklyRatingsToMockData({ good, bad }, realDataState);
    expect(result).toHaveLength(1);
  });

  it('ignores NaN or non-number rating values', () => {
    const rating = makeRating({
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-07'),
      ratings: { peace_of_mind: NaN, income: 'bad' as unknown as number, financial_cushion: 7 },
    });

    const result = adaptWeeklyRatingsToMockData({ r1: rating }, realDataState);
    expect(result[0]['Спокойствие ума']).toBeUndefined();
    expect(result[0]['Доход']).toBeUndefined();
    expect(result[0]['Финансовая подушка']).toBe(7);
  });
});
