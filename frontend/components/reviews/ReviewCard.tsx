import React from 'react';
import { Review } from '@/types';
import { Star, Calendar, KeyRound } from 'lucide-react';

interface ReviewCardProps {
  review: Review;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  return (
    <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1" aria-label={`Rating ${review.rating} out of 5 stars`}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-4 h-4 ${
                star <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
              }`}
            />
          ))}
          <span className="ml-1.5 text-xs font-bold text-slate-800">{review.rating}.0</span>
        </div>

        <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
          <Calendar className="w-3 h-3" /> {review.createdAt || 'Recent'}
        </span>
      </div>

      {review.comment && (
        <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100 italic">
          &quot;{review.comment}&quot;
        </p>
      )}

      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
        <span className="flex items-center gap-1">
          <KeyRound className="w-3 h-3 text-slate-400" /> Rental #{review.rentalId}
        </span>
        <span>Vehicle #{review.vehicleId}</span>
      </div>
    </div>
  );
};
