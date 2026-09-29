import React from 'react';
import { Review, Vehicle } from '@/types';
import { VehicleImage } from '@/components/vehicles/VehicleImage';
import { Star, Calendar, Car } from 'lucide-react';

interface ReviewCardProps {
  review: Review;
  vehicle?: Vehicle;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ review, vehicle }) => {
  return (
    <div className="p-5 bg-[#FFFFFF] border border-[#111111]/25 shadow-[2px_2px_0px_rgba(17,17,17,0.06)] hover:border-[#111111] transition-all duration-150 space-y-3 font-mono">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Vehicle Thumbnail & Name */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-16 h-12 bg-[#111111] overflow-hidden shrink-0 border border-[#111111]/20 relative">
            {vehicle ? (
              <VehicleImage
                vehicle={vehicle}
                aspectRatio="auto"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#888880]">
                <Car className="w-5 h-5 stroke-1" />
              </div>
            )}
          </div>
          <div className="truncate">
            <span className="micro-tag text-[#888880] block">
              {vehicle?.brand || 'FLEET'}
            </span>
            <h4 className="font-display text-sm font-black text-[#111111] uppercase tracking-tight truncate">
              {vehicle ? vehicle.model : `VEHICLE #${review.vehicleId}`}
            </h4>
            <span className="text-[10px] text-[#777770] flex items-center gap-1">
              <Calendar className="w-3 h-3 text-[#888880]" /> {review.createdAt || 'RECENT RIDE'}
            </span>
          </div>
        </div>

        {/* Right: Stars */}
        <div className="flex items-center gap-1 shrink-0" aria-label={`Rating ${review.rating} out of 5 stars`}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-3.5 h-3.5 ${
                star <= review.rating ? 'fill-[#111111] text-[#111111]' : 'text-[#D3CCC0]'
              }`}
            />
          ))}
          <span className="ml-1 text-xs font-bold text-[#111111]">{review.rating}.0</span>
        </div>
      </div>

      {review.comment && (
        <p className="text-xs text-[#333330] leading-relaxed bg-[#FAF8F5] p-3.5 border border-[#111111]/10">
          &ldquo;{review.comment}&rdquo;
        </p>
      )}

      <div className="flex items-center justify-between text-[10px] text-[#888880] pt-2 border-t border-[#111111]/10 uppercase">
        <span>RENTAL #{review.rentalId}</span>
        {vehicle && (
          <span className="font-bold text-[#111111]">{vehicle.registrationNumber}</span>
        )}
      </div>
    </div>
  );
};
