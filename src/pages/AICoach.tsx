import React from 'react';
import { AdaptiveDashboard } from '@/components/ai';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

const AICoach = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-primary" />
            AI Коуч
          </h1>
          <p className="text-muted-foreground mt-1">
            Персональные рекомендации и инсайты на основе ваших данных
          </p>
        </div>
      </div>

      <AdaptiveDashboard 
        weekData={[]}
        goals={[]}
        hypotheses={[]}
      />
    </div>
  );
};

export default AICoach;