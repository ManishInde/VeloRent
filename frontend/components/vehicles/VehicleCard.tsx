import React from 'react';
import Link from 'next/link';
import { Vehicle } from '@/types';
import { Card, CardContent } from '@/components/ui/Card';
import { VehicleStatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Car, Fuel, Gauge, Users, ShieldCheck, ArrowRight } from 'lucide-react';

export interface VehicleCardProps {
  vehicle: Vehicle;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

const getHealthColor = (score: number) => {
  if (score >= 85) return 'bg-emerald-500';
  if (score >= 60) return 'bg-amber-500';
  return 'bg-rose-500';
};

export const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle }) => {
  return (
    <Card className="flex flex-col h-full group hover:border-slate-300 transition-all duration-200 hover:shadow-md">
      {/* Image placeholder */}
      <div className="relative h-44 bg-gradient-to-br from-slate-900 to-slate-800 rounded-t-xl flex items-center justify-center overflow-hidden">
        <Car className="w-16 h-16 text-slate-700 stroke-[0.75] group-hover:scale-110 transition-transform duration-300" />

        <div className="absolute top-3 left-3">
          <VehicleStatusBadge status={vehicle.status} />
        </div>
        <div className="absolute top-3 right-3 bg-slate-950/70 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-md border border-slate-700/50 uppercase tracking-wider">
          {vehicle.type}
        </div>

        {vehicle.healthScore > 0 && (
          <div className="absolute bottom-3 left-3 right-3 bg-slate-950/80 backdrop-blur-xs px-3 py-1.5 rounded-lg flex items-center justify-between text-xs text-white border border-slate-800">
            <span className="flex items-center gap-1 text-[11px] text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Health
            </span>
            <div className="flex items-center gap-2">
              <div className="w-16 bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${getHealthColor(vehicle.healthScore)}`}
                  style={{ width: `${Math.min(100, Math.max(0, vehicle.healthScore))}%` }}
                />
              </div>
              <span className="font-semibold text-xs tabular-nums">{vehicle.healthScore}%</span>
            </div>
          </div>
        )}
      </div>

      <CardContent className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-baseline justify-between gap-2">
            <h4 className="text-base font-bold text-slate-900 tracking-tight leading-snug">
              {vehicle.brand} {vehicle.model}
            </h4>
            <span className="text-[11px] font-medium text-slate-500 tabular-nums shrink-0">{vehicle.purchaseYear}</span>
          </div>

          <div className="mt-3.5 grid grid-cols-3 gap-1.5 text-[11px] text-slate-600">
            <div className="flex items-center gap-1 bg-slate-50 px-2 py-1.5 rounded-md border border-slate-100">
              <Fuel className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="truncate">{vehicle.fuelType}</span>
            </div>
            <div className="flex items-center gap-1 bg-slate-50 px-2 py-1.5 rounded-md border border-slate-100">
              <Gauge className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="truncate">{vehicle.transmission}</span>
            </div>
            <div className="flex items-center gap-1 bg-slate-50 px-2 py-1.5 rounded-md border border-slate-100">
              <Users className="w-3 h-3 text-slate-400 shrink-0" />
              <span>{vehicle.seats} seats</span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-medium">Daily Rate</span>
            <span className="text-lg font-bold text-slate-900 tabular-nums">
              {formatCurrency(vehicle.baseRentalRate)}
              <span className="text-[11px] font-normal text-slate-400"> /day</span>
            </span>
          </div>
          <Link href={`/customer/vehicles/${vehicle.id}`}>
            <Button size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              View Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
