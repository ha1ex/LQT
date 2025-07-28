export interface AIInsight {
  id: string;
  type: 'focus_area' | 'goal_suggestion' | 'hypothesis_improvement' | 'pattern';
  title: string;
  description: string;
  action?: string;
  metricId?: string;
  confidence: number;
  createdAt: Date;
}

export interface AIGoalSuggestion {
  metricId: string;
  currentValue: number;
  suggestedTarget: number;
  reasoning: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
}

export interface AIHypothesisImprovement {
  field: 'conditions' | 'expectedOutcome' | 'reasoning' | 'tasks';
  original: string;
  improved: string;
  explanation: string;
}

export interface AIAnalysisContext {
  weekData: any[];
  goals: any[];
  hypotheses: any[];
  correlations?: any[];
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  context?: {
    metrics?: string[];
    goals?: string[];
    hypotheses?: string[];
  };
}

export interface ChatContext {
  weekData: any[];
  goals: any[];
  hypotheses: any[];
  lastInsights: AIInsight[];
}

export interface AIResponse {
  insights: AIInsight[];
  goals: AIGoalSuggestion[];
  hypothesis_improvements: AIHypothesisImprovement[];
  patterns: {
    title: string;
    description: string;
    correlation: number;
    metrics: string[];
  }[];
}