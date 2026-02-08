import React, { useState, useEffect, useRef, useCallback } from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { cn } from "@/lib/utils";
import CriteriaCard from "./CriteriaCard";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import type { WeeklyRating } from "@/types/weeklyRating";

interface AssessmentPanelProps {
  weekId: string | null;
  rating: WeeklyRating | null;
  allMetrics: Array<{
    id: string;
    name: string;
    icon: string;
    description: string;
    category: string;
  }>;
  onRate: (metricId: string, value: number) => void;
  onMoodChange: (mood: WeeklyRating["mood"]) => void;
  onAddEvent: (event: string) => void;
  onRemoveEvent: (index: number) => void;
  onSave: () => void;
  onDelete: () => void;
}

type TabKey = "ratings" | "journal";

const MOOD_OPTIONS: Array<{
  value: WeeklyRating["mood"];
  emoji: string;
  label: string;
}> = [
  { value: "excellent", emoji: "😂", label: "Отлично" },
  { value: "good", emoji: "😊", label: "Хорошо" },
  { value: "neutral", emoji: "😐", label: "Нейтрально" },
  { value: "poor", emoji: "😞", label: "Плохо" },
  { value: "terrible", emoji: "😠", label: "Ужасно" },
];

const AssessmentPanel: React.FC<AssessmentPanelProps> = ({
  weekId,
  rating,
  allMetrics,
  onRate,
  onMoodChange,
  onAddEvent,
  onRemoveEvent,
  onSave,
  onDelete,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>("ratings");
  const [quickRating, setQuickRating] = useState(false);
  const [newEvent, setNewEvent] = useState("");
  const [moodNotes, setMoodNotes] = useState("");

  // Save confirmation state
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "autosaved">("idle");
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevRatingRef = useRef<string | null>(null);

  // Track changes for autosave indicator
  useEffect(() => {
    if (!rating) return;
    const ratingsSnapshot = JSON.stringify(rating.ratings) + rating.mood + JSON.stringify(rating.keyEvents);
    if (prevRatingRef.current !== null && prevRatingRef.current !== ratingsSnapshot) {
      // Data changed → show autosaved indicator
      setSaveStatus("autosaved");
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => setSaveStatus("idle"), 2500);
    }
    prevRatingRef.current = ratingsSnapshot;
  }, [rating]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  const handleManualSave = useCallback(() => {
    onSave();
    setSaveStatus("saved");
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => setSaveStatus("idle"), 3000);
  }, [onSave]);

  // Empty state
  if (!weekId || !rating) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-4xl mb-3 opacity-50">📋</div>
          <p className="text-muted-foreground text-sm">
            Выберите неделю для оценки
          </p>
        </div>
      </div>
    );
  }

  const ratedCount = Object.keys(rating.ratings).length;
  const totalCount = allMetrics.length;
  const progressPercent = totalCount > 0 ? (ratedCount / totalCount) * 100 : 0;

  const formattedStart = format(new Date(rating.startDate), "dd MMMM", {
    locale: ru,
  });
  const formattedEnd = format(new Date(rating.endDate), "dd MMMM yyyy", {
    locale: ru,
  });
  const lastUpdated = format(
    new Date(rating.updatedAt),
    "dd MMM yyyy, HH:mm",
    { locale: ru }
  );

  const getScoreColor = (score: number) => {
    if (score >= 7) return "bg-emerald-500/15 text-emerald-500";
    if (score >= 4) return "bg-amber-500/15 text-amber-500";
    return "bg-red-500/15 text-red-500";
  };

  const handleAddEvent = () => {
    const trimmed = newEvent.trim();
    if (trimmed) {
      onAddEvent(trimmed);
      setNewEvent("");
    }
  };

  const handleEventKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddEvent();
    }
  };

  const tabs: Array<{ key: TabKey; label: string }> = [
    { key: "ratings", label: "Оценки" },
    { key: "journal", label: "Дневник" },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-3 sm:px-5 pt-4 sm:pt-5 pb-3 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-1">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-foreground">
                Неделя {rating.weekNumber}
              </h2>
              {rating.overallScore > 0 && (
                <span
                  className={cn(
                    "text-xs font-semibold px-2 py-0.5 rounded-full",
                    getScoreColor(rating.overallScore)
                  )}
                >
                  {rating.overallScore.toFixed(1)}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {formattedStart} &mdash; {formattedEnd}
            </p>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Tabs */}
            <div className="flex bg-card rounded-lg p-0.5 border border-border">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    "px-4 py-1.5 rounded-md text-xs font-medium transition-colors",
                    activeTab === tab.key
                      ? "bg-muted text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Edit button */}
            <button
              type="button"
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Редактировать"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                <path d="m15 5 4 4" />
              </svg>
            </button>

            {/* Delete button with confirmation */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  type="button"
                  className="p-1.5 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                  title="Удалить"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    <line x1="10" x2="10" y1="11" y2="17" />
                    <line x1="14" x2="14" y1="11" y2="17" />
                  </svg>
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Удалить оценку?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Все оценки и данные за неделю {rating.weekNumber} будут
                    безвозвратно удалены. Это действие нельзя отменить.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Отмена</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onDelete}
                    className="bg-red-600 text-white hover:bg-red-700"
                  >
                    Удалить
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-muted-foreground">
              Оценено критериев:
            </span>
            <span className="text-xs font-medium text-foreground">
              {ratedCount}/{totalCount}
            </span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-300",
                ratedCount === totalCount ? "bg-emerald-500" : "bg-blue-500"
              )}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Quick rating toggle */}
        {activeTab === "ratings" && (
          <div className="flex items-center gap-2.5 mt-3">
            <button
              type="button"
              onClick={() => setQuickRating(!quickRating)}
              className={cn(
                "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200",
                quickRating ? "bg-blue-500" : "bg-muted"
              )}
              role="switch"
              aria-checked={quickRating}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 mt-0.5",
                  quickRating ? "translate-x-[18px] ml-0" : "translate-x-0.5"
                )}
              />
            </button>
            <span className="text-xs text-muted-foreground">
              ✨ Быстрая оценка эмодзи
            </span>
          </div>
        )}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-5 py-4">
        {/* Ratings tab */}
        {activeTab === "ratings" && (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3">
            {allMetrics.map((metric) => (
              <CriteriaCard
                key={metric.id}
                metricId={metric.id}
                name={metric.name}
                icon={metric.icon}
                category={metric.category}
                value={rating.ratings[metric.id]}
                onRate={onRate}
              />
            ))}
          </div>
        )}

        {/* Journal tab (Mood + Events combined) */}
        {activeTab === "journal" && (
          <div className="space-y-6">
            {/* Mood section */}
            <div>
              <h3 className="text-sm font-medium text-foreground mb-3">
                Как прошла неделя?
              </h3>
              <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                {MOOD_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => onMoodChange(option.value)}
                    className={cn(
                      "flex flex-col items-center gap-1 px-2 py-2 sm:px-4 sm:py-3 rounded-lg border transition-all",
                      rating.mood === option.value
                        ? "border-blue-500 bg-blue-500/10 shadow-sm"
                        : "border-border bg-card hover:border-muted-foreground/50 hover:bg-muted/50"
                    )}
                  >
                    <span className="text-2xl">{option.emoji}</span>
                    <span
                      className={cn(
                        "text-[11px] font-medium",
                        rating.mood === option.value
                          ? "text-blue-500"
                          : "text-muted-foreground"
                      )}
                    >
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Mood notes */}
            <div>
              <label
                htmlFor="mood-notes"
                className="text-sm font-medium text-foreground mb-2 block"
              >
                Заметки о настроении
              </label>
              <textarea
                id="mood-notes"
                value={moodNotes}
                onChange={(e) => setMoodNotes(e.target.value)}
                placeholder="Опишите своё настроение за эту неделю..."
                className="w-full h-24 px-3 py-2 text-sm rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 resize-none"
              />
            </div>

            {/* Divider */}
            <div className="border-t border-border" />

            {/* Events section */}
            <div>
              <h3 className="text-sm font-medium text-foreground mb-2">
                Ключевые события
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newEvent}
                  onChange={(e) => setNewEvent(e.target.value)}
                  onKeyDown={handleEventKeyDown}
                  placeholder="Добавить событие..."
                  className="flex-1 px-3 py-2 text-sm rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={handleAddEvent}
                  disabled={!newEvent.trim()}
                  className="px-3 py-2 text-sm font-medium rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Добавить
                </button>
              </div>
            </div>

            {/* Event list */}
            {rating.keyEvents.length > 0 && (
              <ul className="space-y-2">
                {rating.keyEvents.map((event, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-card border border-border group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-muted-foreground text-xs shrink-0">
                        {index + 1}.
                      </span>
                      <span className="text-sm text-foreground truncate">
                        {event}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveEvent(index)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all shrink-0"
                      title="Удалить событие"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M18 6 6 18" />
                        <path d="m6 6 12 12" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {/* Stats card */}
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                Информация
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Создано</p>
                  <p className="text-sm font-medium text-foreground mt-0.5">
                    {format(new Date(rating.createdAt), "dd MMM yyyy", {
                      locale: ru,
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Обновлено</p>
                  <p className="text-sm font-medium text-foreground mt-0.5">
                    {format(new Date(rating.updatedAt), "dd MMM yyyy", {
                      locale: ru,
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Критериев</p>
                  <p className="text-sm font-medium text-foreground mt-0.5">
                    {ratedCount} из {totalCount}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 sm:px-5 py-3 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground hidden sm:inline">
            {lastUpdated}
          </span>
          {/* Autosave / save confirmation */}
          {saveStatus === "autosaved" && (
            <span className="text-xs text-emerald-500 flex items-center gap-1 animate-in fade-in duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
              Автосохранено
            </span>
          )}
          {saveStatus === "saved" && (
            <span className="text-xs text-emerald-500 font-medium flex items-center gap-1 animate-in fade-in duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
              Сохранено!
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="px-3 py-1.5 text-xs font-medium rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            + Добавить критерий
          </button>
          <button
            type="button"
            onClick={handleManualSave}
            className={cn(
              "px-4 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5",
              saveStatus === "saved"
                ? "bg-emerald-500 text-white"
                : "bg-blue-500 text-white hover:bg-blue-600"
            )}
          >
            {saveStatus === "saved" ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                Сохранено
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
                  <path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7" />
                  <path d="M7 3v4a1 1 0 0 0 1 1h7" />
                </svg>
                Сохранить
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssessmentPanel;
