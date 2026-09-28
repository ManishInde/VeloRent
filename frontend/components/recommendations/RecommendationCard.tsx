import React from 'react';
import Link from 'next/link';
import { Recommendation } from '@/types';
import { Card, CardContent } from '@/components/ui/Card';
import { VehicleStatusBadge } from '@/components/ui/StatusBadge';
import { Car, ArrowRight, Sparkles, Fuel, Gauge, Users } from 'lucide-react';

const formatINR = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

export interface RecommendationCardProps {
  recommendation: Recommendation;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({ recommendation }) => {
  const { vehicle, finalScore, explanation } = recommendation;

  return (
    <Link href={`/customer/vehicles/${vehicle.id}`}>
      <Card className="hover:border-slate-300 hover:shadow-md transition-all duration-200 group cursor-pointer h-full flex flex-col">
        <div className="relative h-32 bg-gradient-to-br from-slate-900 to-slate-800 rounded-t-xl flex items-center justify-center overflow-hidden">
          <Car className="w-12 h-12 text-slate-700 stroke-[0.75] group-hover:scale-110 transition-transform duration-300" />
          <div className="absolute top-2.5 left-2.5">
            <VehicleStatusBadge status={vehicle.status} />
          </div>
          <div className="absolute top-2.5 right-2.5 bg-blue-600/90 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            {Math.round(finalScore)}% match
          </div>
        </div>
        <CardContent className="p-4 flex-1 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900 tracking-tight">{vehicle.brand} {vehicle.model}</h4>
            <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500">
              <span className="flex items-center gap-0.5"><Fuel className="w-3 h-3" />{vehicle.fuelType}</span>
              <span className="text-slate-300">|</span>
              <span className="flex items-center gap-0.5"><Gauge className="w-3 h-3" />{vehicle.transmission}</span>
              <span className="text-slate-300">|</span>
              <span className="flex items-center gap-0.5"><Users className="w-3 h-3" />{vehicle.seats}</span>
            </div>
            {explanation && (
              <p className="mt-2 text-[11px] text-slate-500 leading-relaxed line-clamp-2">{explanation}</p>
            )}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-sm font-bold text-slate-900 tabular-nums">{formatINR(vehicle.baseRentalRate)}<span className="text-[10px] font-normal text-slate-400">/day</span></span>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
