import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { useEnhancedHypotheses } from '@/hooks/strategy';
import { HypothesisHero } from './HypothesisHero';
import { CompactProgressTracker } from './CompactProgressTracker';
import { ExperimentConclusion } from './ExperimentConclusion';
import { ExperimentJournal } from './ExperimentJournal';

interface HypothesisDetailProps {
  hypothesisId: string;
  onBack: () => void;
}

export const HypothesisDetail: React.FC<HypothesisDetailProps> = ({ hypothesisId, onBack }) => {
  const { getHypothesis } = useEnhancedHypotheses();

  const hypothesis = getHypothesis(hypothesisId);
  
  const allWeeksRated = useMemo(() => {
    if (!hypothesis || !hypothesis.weeklyProgress || hypothesis.weeklyProgress.length === 0) return false;
    return hypothesis.weeklyProgress.every(w => w.rating > 0);
  }, [hypothesis]);

  const showConclusion = allWeeksRated || hypothesis?.conclusion;

  if (!hypothesis) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-4">Гипотеза не найдена</h2>
        <button onClick={onBack} className="btn-outline">
          Вернуться к списку
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <HypothesisHero hypothesis={hypothesis} onBack={onBack} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hypothesis Details */}
          <Card>
            <CardHeader>
              <CardTitle>Детали гипотезы</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">ЕСЛИ (условия):</p>
                  <p className="p-3 bg-muted/50 rounded-lg">{hypothesis.conditions}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">ТО (ожидаемый результат):</p>
                  <p className="p-3 bg-muted/50 rounded-lg">{hypothesis.expectedOutcome}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">ПОТОМУ ЧТО (обоснование):</p>
                  <p className="p-3 bg-muted/50 rounded-lg">{hypothesis.reasoning}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Validation Errors */}
          {hypothesis.validationErrors && hypothesis.validationErrors.length > 0 && (
            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="text-destructive flex items-center gap-2 text-base">
                  <AlertTriangle className="h-4 w-4" />
                  Требует доработки
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {hypothesis.validationErrors.map((error, index) => (
                    <li key={index} className="text-sm text-destructive">
                      • {error.message}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Experiment Conclusion */}
          {showConclusion && (
            <ExperimentConclusion hypothesis={hypothesis} />
          )}

          {/* Progress Tracker */}
          <CompactProgressTracker hypothesisId={hypothesisId} />
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Experiment Journal */}
          <ExperimentJournal hypothesisId={hypothesisId} />
        </div>
      </div>
    </div>
  );
};