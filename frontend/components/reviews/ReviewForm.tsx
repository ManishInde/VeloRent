import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { submitReview } from '@/lib/api/reviews';
import { Review } from '@/types';
import { Star, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ReviewFormProps {
  rentalId: number;
  onSuccess: (review: Review) => void;
  onCancel?: () => void;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({ rentalId, onSuccess, onCancel }) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      setError('Please select a star rating from 1 to 5.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const review = await submitReview(rentalId, rating, comment);
      onSuccess(review);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'This rental is not eligible for a review yet.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h4 className="text-sm font-bold text-slate-900">Leave a Rental Review</h4>
        <span className="text-xs text-slate-400">Rental #{rentalId}</span>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-2">Overall Rating (1–5 Stars)</label>
        <div className="flex items-center gap-1.5" role="radiogroup" aria-label="Rating">
          {[1, 2, 3, 4, 5].map((star) => {
            const isFilled = star <= (hoverRating || rating);
            return (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 focus:outline-none focus:ring-2 focus:ring-amber-400 rounded-md transition-transform hover:scale-110"
                aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
              >
                <Star
                  className={`w-6 h-6 transition-colors ${
                    isFilled ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                  }`}
                />
              </button>
            );
          })}
          <span className="ml-2 text-xs font-bold text-slate-700">{rating} / 5</span>
        </div>
      </div>

      <div>
        <label htmlFor="review-comment" className="block text-xs font-semibold text-slate-700 mb-1">
          Review Comments
        </label>
        <textarea
          id="review-comment"
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience regarding vehicle condition, cleanliness, and service..."
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder:text-slate-400"
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          size="sm"
          isLoading={isSubmitting}
          leftIcon={<CheckCircle2 className="w-4 h-4" />}
        >
          Submit Review
        </Button>
      </div>
    </form>
  );
};
