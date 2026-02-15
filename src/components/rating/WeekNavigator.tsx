import React, { useState, useMemo, useCallback } from 'react';
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  subMonths,
  isSameDay,
  getWeek,
} from 'date-fns';
import { ru } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WeeklyRating } from '@/types/weeklyRating';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface WeekNavigatorProps {
  ratings: Record<string, WeeklyRating>;
  selectedWeekId: string | null;
  currentWeekId: string;
  onWeekSelect: (weekId: string) => void;
}

interface WeekListItem {
  weekId: string;
  weekNumber: number;
  start: Date;
  end: Date;
  score: number | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const getWeekId = (date: Date): string =>
  format(startOfWeek(date, { locale: ru }), 'yyyy-MM-dd');

const WEEKDAY_LABELS = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'];

/**
 * Returns Tailwind text/bg classes for a score value.
 *  - dot   → small colored dot on the calendar
 *  - badge → score badge in the week list
 */
const scoreColorClasses = (
  score: number | null,
  variant: 'dot' | 'badge',
): string => {
  if (score === null) {
    return variant === 'dot'
      ? 'bg-muted-foreground/40'
      : 'bg-muted text-muted-foreground';
  }
  if (score >= 7) {
    return variant === 'dot'
      ? 'bg-emerald-500 dark:bg-emerald-400'
      : 'bg-emerald-500/15 text-emerald-700 dark:bg-emerald-400/20 dark:text-emerald-300';
  }
  if (score >= 5) {
    return variant === 'dot'
      ? 'bg-lime-500 dark:bg-lime-400'
      : 'bg-lime-500/15 text-lime-700 dark:bg-lime-400/20 dark:text-lime-300';
  }
  if (score >= 4) {
    return variant === 'dot'
      ? 'bg-yellow-500 dark:bg-yellow-400'
      : 'bg-yellow-500/15 text-yellow-700 dark:bg-yellow-400/20 dark:text-yellow-300';
  }
  if (score >= 2.5) {
    return variant === 'dot'
      ? 'bg-orange-500 dark:bg-orange-400'
      : 'bg-orange-500/15 text-orange-700 dark:bg-orange-400/20 dark:text-orange-300';
  }
  return variant === 'dot'
    ? 'bg-red-500 dark:bg-red-400'
    : 'bg-red-500/15 text-red-700 dark:bg-red-400/20 dark:text-red-300';
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const WeekNavigator: React.FC<WeekNavigatorProps> = ({
  ratings,
  selectedWeekId,
  currentWeekId,
  onWeekSelect,
}) => {
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());

  // ---- derived data -------------------------------------------------------

  /** Map weekId → overallScore (or null) for quick lookup */
  const scoreByWeekId = useMemo<Record<string, number | null>>(() => {
    const map: Record<string, number | null> = {};
    for (const [id, rating] of Object.entries(ratings)) {
      map[id] = rating.overallScore ?? null;
    }
    return map;
  }, [ratings]);

  /** Calendar grid days – always starts on Monday (ru locale) */
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(calendarMonth);
    const monthEnd = endOfMonth(calendarMonth);

    // We need to fill in leading/trailing days so the grid aligns to weeks.
    const gridStart = startOfWeek(monthStart, { locale: ru });
    const gridEnd = endOfWeek(monthEnd, { locale: ru });

    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [calendarMonth]);

  /** Sorted week list (newest first) */
  const weekList = useMemo<WeekListItem[]>(() => {
    const items: WeekListItem[] = Object.entries(ratings).map(([id, r]) => ({
      weekId: id,
      weekNumber: r.weekNumber ?? getWeek(new Date(id), { locale: ru }),
      start: r.startDate instanceof Date ? r.startDate : new Date(r.startDate),
      end: r.endDate instanceof Date ? r.endDate : new Date(r.endDate),
      score: r.overallScore ?? null,
    }));

    items.sort((a, b) => b.start.getTime() - a.start.getTime());
    return items;
  }, [ratings]);

  // ---- handlers -----------------------------------------------------------

  const handlePrevMonth = useCallback(
    () => setCalendarMonth((m) => subMonths(m, 1)),
    [],
  );

  const handleNextMonth = useCallback(
    () => setCalendarMonth((m) => addMonths(m, 1)),
    [],
  );

  const handleDayClick = useCallback(
    (day: Date) => {
      onWeekSelect(getWeekId(day));
    },
    [onWeekSelect],
  );

  // ---- render helpers -----------------------------------------------------

  const isCurrentMonth = (day: Date): boolean =>
    day.getMonth() === calendarMonth.getMonth();

  const getDayDotScore = (day: Date): number | null => {
    const wid = getWeekId(day);
    return scoreByWeekId[wid] ?? null;
  };

  const hasDayData = (day: Date): boolean => {
    const wid = getWeekId(day);
    return wid in scoreByWeekId;
  };

  // ---- render -------------------------------------------------------------

  return (
    <aside className="flex h-full w-[280px] shrink-0 flex-col overflow-hidden rounded-xl bg-card border border-border">
      {/* ------ Mini Calendar ------ */}
      <div className="border-b border-border px-3 pb-3 pt-4">
        {/* Month selector */}
        <div className="mb-3 flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Предыдущий месяц"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <span className="text-sm font-medium capitalize text-foreground">
            {format(calendarMonth, 'LLLL yyyy', { locale: ru })}
          </span>

          <button
            type="button"
            onClick={handleNextMonth}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Следующий месяц"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Weekday headers */}
        <div className="mb-1 grid grid-cols-7 text-center">
          {WEEKDAY_LABELS.map((label) => (
            <span
              key={label}
              className="text-[10px] font-medium uppercase text-muted-foreground"
            >
              {label}
            </span>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7 gap-y-0.5">
          {calendarDays.map((day) => {
            const inMonth = isCurrentMonth(day);
            const dayWeekId = getWeekId(day);
            const hasData = hasDayData(day);
            const dotScore = getDayDotScore(day);
            const isSelected =
              selectedWeekId !== null && dayWeekId === selectedWeekId;
            const isToday = isSameDay(day, new Date());

            return (
              <button
                key={day.toISOString()}
                type="button"
                onClick={() => handleDayClick(day)}
                className={cn(
                  'relative mx-auto flex h-7 w-7 flex-col items-center justify-center rounded-md text-xs transition-colors',
                  inMonth
                    ? 'text-foreground'
                    : 'text-muted-foreground/40',
                  isSelected &&
                    'bg-blue-500/15 ring-1 ring-blue-500 dark:bg-blue-400/20 dark:ring-blue-400',
                  isToday && !isSelected && 'font-bold',
                  !isSelected && 'hover:bg-secondary',
                )}
              >
                <span className="leading-none">{format(day, 'd')}</span>
                {hasData && (
                  <span
                    className={cn(
                      'absolute bottom-0.5 h-1 w-1 rounded-full',
                      scoreColorClasses(dotScore, 'dot'),
                    )}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ------ Week List ------ */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {weekList.length === 0 && (
          <p className="px-2 py-6 text-center text-xs text-muted-foreground">
            Нет данных за выбранный период
          </p>
        )}

        <div className="flex flex-col gap-1">
          {weekList.map((week) => {
            const isSelected = selectedWeekId === week.weekId;
            const isCurrent = currentWeekId === week.weekId;
            const scoreLabel =
              week.score !== null ? week.score.toFixed(1) : '—';

            return (
              <button
                key={week.weekId}
                type="button"
                onClick={() => onWeekSelect(week.weekId)}
                className={cn(
                  'group relative flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors',
                  'hover:bg-secondary/80',
                  isSelected &&
                    'border border-blue-500 bg-blue-500/10 dark:border-blue-400 dark:bg-blue-400/10',
                  !isSelected && 'border border-transparent',
                  isCurrent &&
                    !isSelected &&
                    'border-l-[3px] border-l-amber-400 dark:border-l-amber-400',
                )}
              >
                {/* Text block */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    Неделя {week.weekNumber}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {format(week.start, 'dd.MM', { locale: ru })}
                    {' — '}
                    {format(week.end, 'dd.MM', { locale: ru })}
                  </p>
                </div>

                {/* Score badge */}
                <span
                  className={cn(
                    'inline-flex h-6 min-w-[2.25rem] items-center justify-center rounded-md px-1.5 text-xs font-semibold',
                    scoreColorClasses(week.score, 'badge'),
                  )}
                >
                  {scoreLabel}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
};

export default WeekNavigator;
