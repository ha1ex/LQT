import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Plus, Smile, Meh, Frown } from 'lucide-react';
import { useEnhancedHypotheses } from '@/hooks/strategy';
import { formatDate } from '@/utils/strategy';

interface ExperimentJournalProps {
  hypothesisId: string;
}

export const ExperimentJournal: React.FC<ExperimentJournalProps> = ({ hypothesisId }) => {
  const [newEntry, setNewEntry] = useState('');
  const [selectedMood, setSelectedMood] = useState<'positive' | 'negative' | 'neutral'>('neutral');
  const [isAdding, setIsAdding] = useState(false);
  
  const { getHypothesis, addJournalEntry } = useEnhancedHypotheses();
  const hypothesis = getHypothesis(hypothesisId);

  if (!hypothesis) return null;

  const handleAddEntry = () => {
    if (newEntry.trim()) {
      addJournalEntry(hypothesisId, newEntry.trim(), selectedMood);
      setNewEntry('');
      setSelectedMood('neutral');
      setIsAdding(false);
    }
  };

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case 'positive':
        return <Smile className="h-4 w-4 text-green-500" />;
      case 'negative':
        return <Frown className="h-4 w-4 text-red-500" />;
      default:
        return <Meh className="h-4 w-4 text-gray-500" />;
    }
  };

  const getMoodLabel = (mood: string) => {
    switch (mood) {
      case 'positive':
        return 'Положительное';
      case 'negative':
        return 'Отрицательное';
      default:
        return 'Нейтральное';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            <CardTitle>Журнал эксперимента</CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Добавить запись
          </Button>
        </div>
        <CardDescription>
          Ведите наблюдения и записывайте изменения в процессе эксперимента
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Форма добавления записи */}
        {isAdding && (
          <Card className="border-primary/20">
            <CardContent className="pt-4">
              <div className="space-y-4">
                <Textarea
                  placeholder="Опишите ваши наблюдения, изменения или мысли..."
                  value={newEntry}
                  onChange={(e) => setNewEntry(e.target.value)}
                  className="min-h-24"
                />
                
                {/* Выбор настроения */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Настроение записи:</label>
                  <div className="flex gap-2">
                    {[
                      { value: 'positive', label: 'Позитивное', icon: Smile, color: 'text-green-500' },
                      { value: 'neutral', label: 'Нейтральное', icon: Meh, color: 'text-gray-500' },
                      { value: 'negative', label: 'Негативное', icon: Frown, color: 'text-red-500' }
                    ].map((mood) => (
                      <Button
                        key={mood.value}
                        variant={selectedMood === mood.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedMood(mood.value as 'positive' | 'negative' | 'neutral')}
                        className="flex items-center gap-2"
                      >
                        <mood.icon className={`h-4 w-4 ${selectedMood === mood.value ? '' : mood.color}`} />
                        {mood.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleAddEntry} disabled={!newEntry.trim()}>
                    Сохранить запись
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setIsAdding(false);
                    setNewEntry('');
                    setSelectedMood('neutral');
                  }}>
                    Отмена
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Список записей */}
        {hypothesis.journal.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Записей пока нет</p>
            <p className="text-sm">Добавьте первую запись наблюдений</p>
          </div>
        ) : (
          <div className="space-y-4">
            {hypothesis.journal
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((entry) => (
                <Card key={entry.id} className="border-l-4 border-l-primary/30">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getMoodIcon(entry.mood)}
                        <Badge variant="outline">
                          {getMoodLabel(entry.mood)}
                        </Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(new Date(entry.date))}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed">{entry.entry}</p>
                  </CardContent>
                </Card>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};