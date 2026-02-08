import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { startOfWeek, format, getWeek, parseISO, subWeeks, addWeeks } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useWeeklyRatings } from '@/hooks/useWeeklyRatings';
import { useMobile } from '@/hooks/use-mobile';
import WeekNavigator from './WeekNavigator';
import AssessmentPanel from './AssessmentPanel';
import type { WeeklyRating } from '@/types/weeklyRating';
import { ChevronLeft, ChevronRight, Plus, X, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface AssessmentSplitViewProps {
  allMetrics: Array<{
    id: string;
    name: string;
    icon: string;
    description: string;
    category: string;
    isCustom?: boolean;
  }>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const getWeekId = (date: Date): string =>
  format(startOfWeek(date, { locale: ru }), 'yyyy-MM-dd');

// ---------------------------------------------------------------------------
// Add Missing Week Dialog
// ---------------------------------------------------------------------------

const AddMissingWeekDialog: React.FC<{
  existingWeekIds: string[];
  onWeekSelect: (weekId: string) => void;
}> = ({ existingWeekIds, onWeekSelect }) => {
  const [open, setOpen] = useState(false);

  // Generate list of weeks for last 52 weeks
  const availableWeeks = useMemo(() => {
    const weeks: Array<{ weekId: string; weekNum: number; date: Date; hasData: boolean }> = [];
    const today = new Date();

    for (let i = 0; i < 52; i++) {
      const weekDate = subWeeks(today, i);
      const weekId = getWeekId(weekDate);
      const weekNum = getWeek(weekDate, { locale: ru });
      const hasData = existingWeekIds.includes(weekId);

      weeks.push({
        weekId,
        weekNum,
        date: startOfWeek(weekDate, { locale: ru }),
        hasData,
      });
    }

    return weeks;
  }, [existingWeekIds]);

  const missingWeeks = availableWeeks.filter(w => !w.hasData);

  const handleSelect = (weekId: string) => {
    onWeekSelect(weekId);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="shrink-0 gap-1.5 h-9 px-3 border-dashed"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Добавить неделю</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Добавить пропущенную неделю
          </DialogTitle>
        </DialogHeader>
        <div className="mt-2">
          <p className="text-sm text-muted-foreground mb-4">
            Выберите неделю, за которую хотите добавить оценки:
          </p>
          <div className="max-h-[50vh] overflow-y-auto space-y-1 pr-2">
            {missingWeeks.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Все недели за последний год уже оценены!
              </p>
            ) : (
              missingWeeks.map(week => (
                <button
                  key={week.weekId}
                  onClick={() => handleSelect(week.weekId)}
                  className="w-full flex items-center justify-between p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors text-left"
                >
                  <div>
                    <p className="font-medium">Неделя {week.weekNum}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(week.date, 'dd MMMM yyyy', { locale: ru })}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                    Нет данных
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ---------------------------------------------------------------------------
// Mobile Week Selector — horizontal scrollable chips
// ---------------------------------------------------------------------------

const MobileWeekSelector: React.FC<{
  ratings: Record<string, WeeklyRating>;
  selectedWeekId: string | null;
  currentWeekId: string;
  onWeekSelect: (weekId: string) => void;
  existingWeekIds: string[];
}> = ({ ratings, selectedWeekId, currentWeekId, onWeekSelect, existingWeekIds }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const sortedWeekIds = useMemo(() => {
    const ids = Object.keys(ratings).sort();
    if (!ids.includes(currentWeekId)) {
      ids.push(currentWeekId);
      ids.sort();
    }
    return ids;
  }, [ratings, currentWeekId]);

  // Scroll to selected week on mount
  useEffect(() => {
    if (scrollRef.current && selectedWeekId) {
      const el = scrollRef.current.querySelector(`[data-week="${selectedWeekId}"]`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [selectedWeekId]);

  return (
    <div className="md:hidden mb-3">
      <div className="flex items-center gap-2 mb-2">
        <AddMissingWeekDialog
          existingWeekIds={existingWeekIds}
          onWeekSelect={onWeekSelect}
        />
      </div>
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto pb-2 px-1 scrollbar-hide"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {sortedWeekIds.map(weekId => {
          const rating = ratings[weekId];
          const weekDate = parseISO(weekId);
          const weekNum = getWeek(weekDate, { locale: ru });
          const isSelected = weekId === selectedWeekId;
          const isCurrent = weekId === currentWeekId;
          const score = rating?.overallScore;
          const hasData = rating && Object.keys(rating.ratings || {}).length > 0;

          return (
            <button
              key={weekId}
              data-week={weekId}
              onClick={() => onWeekSelect(weekId)}
              className={`shrink-0 flex flex-col items-center px-3 py-2 rounded-xl border transition-all text-xs font-medium min-w-[56px] ${
                isSelected
                  ? 'bg-primary text-primary-foreground border-primary shadow-md'
                  : isCurrent
                    ? 'bg-primary/10 text-primary border-primary/30'
                    : hasData
                      ? 'bg-card text-foreground border-border'
                      : 'bg-muted/50 text-muted-foreground border-transparent'
              }`}
            >
              <span className="text-[11px] font-semibold">W{weekNum}</span>
              {hasData && score !== undefined && (
                <span className={`text-[10px] mt-0.5 ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                  {score.toFixed(1)}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const AssessmentSplitView: React.FC<AssessmentSplitViewProps> = ({ allMetrics }) => {
  const {
    ratings: weeklyRatings,
    currentWeek,
    updateWeekRating,
    updateMetricRating,
    deleteWeekRating,
  } = useWeeklyRatings();

  const isMobile = useMobile();

  // Current week id
  const currentWeekId = useMemo(() => getWeekId(currentWeek), [currentWeek]);

  // Selected week – default to current week
  const [selectedWeekId, setSelectedWeekId] = useState<string | null>(currentWeekId);

  // Autosave debounce ref
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Ensure we always have a selected week on mount
  useEffect(() => {
    if (!selectedWeekId) {
      setSelectedWeekId(currentWeekId);
    }
  }, [currentWeekId, selectedWeekId]);

  // Auto-create current week rating if it doesn't exist (so user can start rating immediately)
  useEffect(() => {
    if (selectedWeekId && !weeklyRatings[selectedWeekId]) {
      // Create an empty week entry so the panel shows the rating form
      const weekDate = parseISO(selectedWeekId);
      updateWeekRating(weekDate, {});
    }
  }, [selectedWeekId, weeklyRatings, updateWeekRating]);

  // Resolve selected rating
  const selectedRating: WeeklyRating | null = selectedWeekId
    ? weeklyRatings[selectedWeekId] ?? null
    : null;

  // ---- Autosave helper (2s debounce per docs) ----
  const scheduleAutosave = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      // Data is already persisted by updateMetricRating / updateWeekRating
      // This is a placeholder for any extra save logic if needed
    }, 2000);
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  // ---- Callbacks for AssessmentPanel ----

  const handleRate = useCallback(
    (metricId: string, value: number) => {
      if (!selectedWeekId) return;
      // Ensure week exists — updateMetricRating creates it if missing
      const weekDate = parseISO(selectedWeekId);
      updateMetricRating(weekDate, metricId, value);
      scheduleAutosave();
    },
    [selectedWeekId, updateMetricRating, scheduleAutosave],
  );

  const handleMoodChange = useCallback(
    (mood: WeeklyRating['mood']) => {
      if (!selectedWeekId) return;
      const weekDate = parseISO(selectedWeekId);
      updateWeekRating(weekDate, { mood });
      scheduleAutosave();
    },
    [selectedWeekId, updateWeekRating, scheduleAutosave],
  );

  const handleAddEvent = useCallback(
    (event: string) => {
      if (!selectedWeekId || !selectedRating) return;
      const weekDate = parseISO(selectedWeekId);
      const events = [...(selectedRating.keyEvents || []), event];
      updateWeekRating(weekDate, { keyEvents: events });
      scheduleAutosave();
    },
    [selectedWeekId, selectedRating, updateWeekRating, scheduleAutosave],
  );

  const handleRemoveEvent = useCallback(
    (index: number) => {
      if (!selectedWeekId || !selectedRating) return;
      const weekDate = parseISO(selectedWeekId);
      const events = selectedRating.keyEvents.filter((_, i) => i !== index);
      updateWeekRating(weekDate, { keyEvents: events });
      scheduleAutosave();
    },
    [selectedWeekId, selectedRating, updateWeekRating, scheduleAutosave],
  );

  const handleSave = useCallback(() => {
    // Explicit save — data is already persisted via hooks
    // Could show a toast notification here
  }, []);

  const handleDelete = useCallback(() => {
    if (!selectedWeekId) return;
    deleteWeekRating(selectedWeekId);
    // Select current week after deletion
    setSelectedWeekId(currentWeekId);
  }, [selectedWeekId, deleteWeekRating, currentWeekId]);

  const handleWeekSelect = useCallback((weekId: string) => {
    setSelectedWeekId(weekId);
  }, []);

  // ---- Render ----

  return (
    <div className="flex flex-col md:flex-row gap-4 h-auto md:h-[calc(100vh-160px)] md:min-h-[500px]">
      {/* Mobile: Horizontal week selector */}
      <MobileWeekSelector
        ratings={weeklyRatings}
        selectedWeekId={selectedWeekId}
        currentWeekId={currentWeekId}
        onWeekSelect={handleWeekSelect}
        existingWeekIds={Object.keys(weeklyRatings)}
      />

      {/* Desktop: Left Week Navigator (280px) */}
      <div className="hidden md:block">
        <WeekNavigator
          ratings={weeklyRatings}
          selectedWeekId={selectedWeekId}
          currentWeekId={currentWeekId}
          onWeekSelect={handleWeekSelect}
        />
      </div>

      {/* Right: Assessment Panel (flex-1) */}
      <div className="flex-1 min-w-0 w-full rounded-xl bg-card border border-border overflow-hidden">
        <AssessmentPanel
          weekId={selectedWeekId}
          rating={selectedRating}
          allMetrics={allMetrics}
          onRate={handleRate}
          onMoodChange={handleMoodChange}
          onAddEvent={handleAddEvent}
          onRemoveEvent={handleRemoveEvent}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
};

export default AssessmentSplitView;
