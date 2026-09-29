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
    } catch (err: unknown) {
      const rawMsg = err instanceof Error ? err.message : 'This rental is not eligible for a review yet.';
      if (
        rawMsg.includes('already') ||
        rawMsg.includes('Duplicate entry') ||
        rawMsg.includes('uq_review_rental') ||
        rawMsg.includes('1062') ||
        (typeof err === 'object' && err !== null && 'status' in err && (err as { status: number }).status === 409)
      ) {
        setError('This rental has already been reviewed.');
      } else {
        setError(rawMsg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-[#FFFFFF] border-2 border-[#111111] shadow-[4px_4px_0px_#111111] space-y-4 font-mono text-xs">
      <div className="flex items-center justify-between pb-3 border-b border-[#111111]/15">
        <h4 className="font-display font-black text-sm uppercase text-[#111111]">
          SUBMIT RIDE REVIEW
        </h4>
        <span className="micro-tag text-[#777770]">RENTAL #{rentalId}</span>
      </div>

      {error && (
        <div className="p-3 bg-[#FFF0ED] border border-[#FF654A] text-[#C4381F] text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <label className="block micro-tag text-[#777770] mb-2">
          OVERALL EXPERIENCE (1–5 STARS)
        </label>
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
                className="p-1 focus:outline-none transition-transform hover:scale-110 cursor-pointer"
                aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
              >
                <Star
                  className={`w-6 h-6 transition-colors ${
                    isFilled ? 'fill-[#111111] text-[#111111]' : 'text-[#D3CCC0]'
                  }`}
                />
              </button>
            );
          })}
          <span className="ml-3 font-display font-bold text-sm text-[#111111]">{rating} / 5</span>
        </div>
      </div>

      <div>
        <label htmlFor="review-comment" className="block micro-tag text-[#777770] mb-1">
          RIDE FEEDBACK COMMENTS
        </label>
        <textarea
          id="review-comment"
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your driving experience regarding vehicle handling, cleanliness, and service..."
          className="w-full p-3 bg-[#FAF8F5] border border-[#111111]/30 font-mono text-xs text-[#111111] focus:bg-white focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] placeholder:text-[#888880]"
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={isSubmitting}>
            CANCEL
          </Button>
        )}
        <Button
          type="submit"
          size="sm"
          isLoading={isSubmitting}
          leftIcon={<CheckCircle2 className="w-4 h-4" />}
        >
          SUBMIT REVIEW
        </Button>
      </div>
    </form>
  );
};
