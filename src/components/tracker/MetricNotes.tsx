import React, { useState } from 'react';
import { MessageCircle, Edit3, Save, X } from 'lucide-react';

interface MetricNotesProps {
  metricName: string;
  currentNote: string;
  onSaveNote: (note: string) => void;
}

const MetricNotes: React.FC<MetricNotesProps> = ({ metricName, currentNote, onSaveNote }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [note, setNote] = useState(currentNote);

  const handleSave = () => {
    onSaveNote(note);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setNote(currentNote);
    setIsEditing(false);
  };

  return (
    <div className="bg-muted/30 rounded-2xl p-4 mt-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Заметка</span>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        )}
      </div>
      
      {isEditing ? (
        <div className="space-y-3">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={`Добавьте заметку о "${metricName}"...`}
            className="w-full p-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
            rows={3}
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-1 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors"
            >
              <Save className="w-4 h-4" />
              Сохранить
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-1 px-3 py-2 bg-muted text-muted-foreground rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors"
            >
              <X className="w-4 h-4" />
              Отмена
            </button>
          </div>
        </div>
      ) : (
        <div className="text-sm text-muted-foreground">
          {currentNote || (
            <span className="italic">
              Нажмите на иконку редактирования, чтобы добавить заметку
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default MetricNotes;