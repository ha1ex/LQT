// Weekly Rating Types
export interface WeeklyRating {
  id: string;
  weekNumber: number;
  startDate: Date;
  endDate: Date;
  ratings: Record<string, number>; // metricId -> rating (1-10)
  notes: Record<string, string>; // metricId -> note
  mood: 'excellent' | 'good' | 'neutral' | 'poor' | 'terrible';
  keyEvents: string[];
  weather?: string;
  overallScore: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface WeeklyRatingData {
  [weekId: string]: WeeklyRating;
}

export interface CalendarDayData {
  date: Date;
  hasRating: boolean;
  overallScore?: number;
  mood?: WeeklyRating['mood'];
}

export interface WeeklyRatingAnalytics {
  averageByMetric: Record<string, number>;
  trendsOverTime: Array<{
    weekNumber: number;
    averageScore: number | null;
    date: string;
    hasData?: boolean;
  }>;
  bestWeek: WeeklyRating | null;
  worstWeek: WeeklyRating | null;
  moodDistribution: Record<WeeklyRating['mood'], number>;
  seasonalTrends: Record<string, number>;
}