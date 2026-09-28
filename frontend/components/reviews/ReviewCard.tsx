import React from 'react';
import { Review, Vehicle } from '@/types';
import { VehicleImage } from '@/components/vehicles/VehicleImage';
import { Star, Calendar, KeyRound, Car } from 'lucide-react';

interface ReviewCardProps {
  review: Review;
  vehicle?: Vehicle;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ review, vehicle }) => {
  return (
    <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-3 hover:border-slate-300 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Vehicle Thumbnail & Name */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-14 h-11 rounded-lg overflow-hidden bg-slate-900 shrink-0 border border-slate-200/80 shadow-2xs relative">
            {vehicle ? (
              <VehicleImage
                vehicle={vehicle}
                aspectRatio="4:3"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <Car className="w-5 h-5 stroke-1" />
              </div>
            )}
          </div>
          <div className="truncate">
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
              {vehicle ? `${vehicle.brand} ${vehicle.model}` : `Vehicle #${review.vehicleId}`}
            </h4>
            <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
              <Calendar className="w-3 h-3" /> {review.createdAt || 'Recent trip'}
            </span>
          </div>
        </div>

        {/* Right: Stars */}
        <div className="flex items-center gap-1 shrink-0" aria-label={`Rating ${review.rating} out of 5 stars`}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-4 h-4 ${
                star <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
              }`}
            />
          ))}
          <span className="ml-1 text-xs font-bold text-slate-800">{review.rating}.0</span>
        </div>
      </div>

      {review.comment && (
        <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
          &ldquo;{review.comment}&rdquo;
        </p>
      )}

      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
        <span className="flex items-center gap-1">
          <KeyRound className="w-3 h-3 text-slate-400" /> Rental #{review.rentalId}
        </span>
        {vehicle && (
          <span className="font-mono text-slate-500 font-semibold">{vehicle.registrationNumber}</span>
        )}
      </div>
    </div>
  );
};
