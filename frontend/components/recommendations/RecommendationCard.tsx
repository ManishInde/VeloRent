import React from 'react';
import Link from 'next/link';
import { Recommendation } from '@/types';
import { Card, CardContent } from '@/components/ui/Card';
import { VehicleStatusBadge } from '@/components/ui/StatusBadge';
import { VehicleImage } from '@/components/vehicles/VehicleImage';
import { ArrowRight, Sparkles, Fuel, Gauge } from 'lucide-react';

const formatINR = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

export interface RecommendationCardProps {
  recommendation: Recommendation;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({ recommendation }) => {
  const { vehicle, finalScore, explanation } = recommendation;

  return (
    <Link href={`/customer/vehicles/${vehicle.id}`} className="block h-full group">
      <Card className="hover:border-slate-300 hover:shadow-lg transition-all duration-300 cursor-pointer h-full flex flex-col rounded-2xl overflow-hidden hover:-translate-y-0.5 bg-white border border-slate-200">
        {/* Vehicle Image */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900">
          <VehicleImage
            vehicle={vehicle}
            aspectRatio="auto"
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-slate-950/30 pointer-events-none" />

          <div className="absolute top-2.5 left-2.5 z-10">
            <VehicleStatusBadge status={vehicle.status} />
          </div>

          <div className="absolute top-2.5 right-2.5 z-10 bg-blue-600/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
            <Sparkles className="w-3 h-3 text-amber-300" />
            {Math.round(finalScore)}% match
          </div>
        </div>

        <CardContent className="p-4 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-baseline justify-between gap-1">
              <h4 className="text-sm font-bold text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors truncate">
                {vehicle.brand} {vehicle.model}
              </h4>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide shrink-0">
                {vehicle.type}
              </span>
            </div>

            <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <Fuel className="w-3 h-3 text-slate-400" />
                {vehicle.fuelType}
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1">
                <Gauge className="w-3 h-3 text-slate-400" />
                {vehicle.transmission}
              </span>
            </div>

            {explanation && (
              <p className="mt-2 text-[11px] text-slate-500 leading-relaxed line-clamp-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                {explanation}
              </p>
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-sm font-extrabold text-slate-900 tabular-nums">
              {formatINR(vehicle.baseRentalRate)}
              <span className="text-[10px] font-normal text-slate-400"> /day</span>
            </span>
            <div className="w-7 h-7 rounded-full bg-slate-50 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center text-slate-400 transition-all">
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
