import React from 'react';

interface QuickEmojiRatingProps {
  value: number | null;
  onChange: (value: number) => void;
  disabled?: boolean;
}

const emojiMap = {
  1: '😢', 2: '😞', 3: '😐', 4: '🙂', 5: '😊',
  6: '😄', 7: '😍', 8: '🤩', 9: '🚀', 10: '🎉'
};

const QuickEmojiRating: React.FC<QuickEmojiRatingProps> = ({ value, onChange, disabled = false }) => {
  return (
    <div className="flex justify-center items-center gap-2">
      {[1, 3, 5, 7, 9].map(rating => (
        <button
          key={rating}
          onClick={() => onChange(rating)}
          disabled={disabled}
          className={`w-12 h-12 rounded-xl text-2xl transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
            value === rating 
              ? 'bg-primary/20 border-2 border-primary shadow-medium' 
              : 'bg-muted/50 border border-border hover:bg-primary/5'
          }`}
        >
          {emojiMap[rating as keyof typeof emojiMap]}
        </button>
      ))}
    </div>
  );
};

export default QuickEmojiRating;