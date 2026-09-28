import React from 'react';
import Link from 'next/link';
import { Vehicle } from '@/types';
import { Card, CardContent } from '@/components/ui/Card';
import { VehicleStatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { VehicleImage } from '@/components/vehicles/VehicleImage';
import { Fuel, Gauge, Users, ShieldCheck, ArrowRight } from 'lucide-react';

export interface VehicleCardProps {
  vehicle: Vehicle;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

export const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle }) => {
  const isAvailable = vehicle.status === 'AVAILABLE';

  return (
    <Card className="flex flex-col h-full group bg-white border border-slate-200 hover:border-slate-300 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
      {/* Image Section */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900">
        <VehicleImage
          vehicle={vehicle}
          aspectRatio="auto"
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Gradient Overlay for Top Badges */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-slate-950/40 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 z-10">
          <VehicleStatusBadge status={vehicle.status} />
        </div>
        <div className="absolute top-3 right-3 z-10 bg-slate-950/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/10 uppercase tracking-wider">
          {vehicle.type}
        </div>

        {/* Bottom Health Overlay Pill */}
        {vehicle.healthScore > 0 && (
          <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 text-white text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold">{vehicle.healthScore}% Health</span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <CardContent className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-baseline justify-between gap-2">
            <h4 className="text-base font-bold text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">
              {vehicle.brand} {vehicle.model}
            </h4>
            <span className="text-[11px] font-semibold text-slate-400 font-mono">
              {vehicle.purchaseYear}
            </span>
          </div>

          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
            {vehicle.registrationNumber} • {vehicle.type}
          </p>

          {/* Quick Specifications */}
          <div className="mt-3.5 grid grid-cols-3 gap-2 text-xs text-slate-600">
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
              <Fuel className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate text-[11px] font-medium">{vehicle.fuelType}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
              <Gauge className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate text-[11px] font-medium">{vehicle.transmission}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
              <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-[11px] font-medium">{vehicle.seats} seats</span>
            </div>
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
              Daily Rate
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-extrabold text-slate-900 tabular-nums">
                {formatCurrency(vehicle.baseRentalRate)}
              </span>
              <span className="text-xs text-slate-500 font-normal">/day</span>
            </div>
          </div>

          <Link href={`/customer/vehicles/${vehicle.id}`}>
            <Button
              size="sm"
              variant={isAvailable ? 'primary' : 'outline'}
              rightIcon={<ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />}
            >
              {isAvailable ? 'View Details' : 'Inspect'}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
