import React, { useState } from 'react';
import { StrategyDashboard, HypothesisWizard, HypothesisDetail } from '@/components/strategy';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus } from 'lucide-react';

const Strategies = () => {
  const [strategyView, setStrategyView] = useState<'dashboard' | 'create' | 'detail'>('dashboard');
  const [selectedHypothesisId, setSelectedHypothesisId] = useState<string | null>(null);

  const handleCreateHypothesis = () => {
    setStrategyView('create');
  };

  const handleHypothesisCreated = () => {
    setStrategyView('dashboard');
  };

  const handleHypothesisCancel = () => {
    setStrategyView('dashboard');
  };

  const handleViewHypothesis = (id: string) => {
    setSelectedHypothesisId(id);
    setStrategyView('detail');
  };

  const handleBackToDashboard = () => {
    setSelectedHypothesisId(null);
    setStrategyView('dashboard');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {strategyView !== 'dashboard' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToDashboard}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Назад
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {strategyView === 'dashboard' && 'Стратегии'}
              {strategyView === 'create' && 'Создание гипотезы'}
              {strategyView === 'detail' && 'Детали гипотезы'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {strategyView === 'dashboard' && 'Управляйте своими стратегиями и гипотезами'}
              {strategyView === 'create' && 'Создайте новую гипотезу для тестирования'}
              {strategyView === 'detail' && 'Подробная информация о гипотезе'}
            </p>
          </div>
        </div>
        
        {strategyView === 'dashboard' && (
          <Button onClick={handleCreateHypothesis} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Создать гипотезу
          </Button>
        )}
      </div>

      {strategyView === 'dashboard' && (
        <StrategyDashboard 
          onCreateHypothesis={handleCreateHypothesis}
          onViewHypothesis={handleViewHypothesis} 
        />
      )}

      {strategyView === 'create' && (
        <Card>
          <CardContent className="p-6">
            <HypothesisWizard
              onComplete={handleHypothesisCreated}
              onCancel={handleHypothesisCancel}
            />
          </CardContent>
        </Card>
      )}

      {strategyView === 'detail' && selectedHypothesisId && (
        <HypothesisDetail
          hypothesisId={selectedHypothesisId}
          onBack={handleBackToDashboard}
        />
      )}
    </div>
  );
};

export default Strategies;