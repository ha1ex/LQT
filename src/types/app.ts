// Global App Types
export type UserState = 'empty' | 'real_data';

export interface AppDataState {
  userState: UserState;
  hasData: boolean;
  lastDataSync: Date | null;
}

export interface DataSection {
  hypotheses: boolean;
  weeklyRatings: boolean;
  subjects: boolean;
  aiInsights: boolean;
  goals: boolean;
}

export interface DataSyncStatus {
  isLoading: boolean;
  lastSync: Date | null;
  sections: DataSection;
}
