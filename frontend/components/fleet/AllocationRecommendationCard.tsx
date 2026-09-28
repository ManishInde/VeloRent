import React from 'react';
import { VehicleAllocationResult } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { HealthScoreBadge } from './HealthScoreBadge';
import { VehicleStatusBadge } from '@/components/ui/StatusBadge';
import { Sparkles, CheckCircle2, Car, Fuel, Settings } from 'lucide-react';

interface AllocationRecommendationCardProps {
  result: VehicleAllocationResult;
}

export const AllocationRecommendationCard: React.FC<AllocationRecommendationCardProps> = ({ result }) => {
  const { selectedVehicle, allocationScore, explanation } = result;

  return (
    <Card className="border-2 border-blue-500/20 bg-linear-to-b from-blue-50/30 to-white shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-sm flex items-center gap-2 text-blue-900 font-bold">
          <Sparkles className="w-4 h-4 text-blue-600" /> Optimal Vehicle Allocation Decision
        </CardTitle>
        <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-600 text-white shadow-2xs">
          Score: {allocationScore.toFixed(1)}/100
        </span>
      </CardHeader>
      <CardContent className="px-6 pb-6 pt-0 space-y-4">
        {/* Selected Vehicle Overview */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-slate-200 rounded-xl gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600 font-black text-lg">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 leading-tight">
                {selectedVehicle.brand} {selectedVehicle.model}
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Reg: {selectedVehicle.registrationNumber} • ID #{selectedVehicle.id}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <HealthScoreBadge score={selectedVehicle.healthScore} />
            <VehicleStatusBadge status={selectedVehicle.status} />
          </div>
        </div>

        {/* Vehicle Specs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-slate-400 block text-[11px]">Daily Rate</span>
            <span className="font-extrabold text-slate-900 text-sm tabular-nums">
              ₹{selectedVehicle.baseRentalRate.toLocaleString()}/day
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-slate-400 block text-[11px]">Fuel / Power</span>
            <span className="font-bold text-slate-800 uppercase flex items-center gap-1">
              <Fuel className="w-3.5 h-3.5 text-slate-500" /> {selectedVehicle.fuelType}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-slate-400 block text-[11px]">Transmission</span>
            <span className="font-bold text-slate-800 uppercase flex items-center gap-1">
              <Settings className="w-3.5 h-3.5 text-slate-500" /> {selectedVehicle.transmission}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-slate-400 block text-[11px]">Odometer</span>
            <span className="font-bold text-slate-800 tabular-nums">
              {selectedVehicle.odometerKm.toLocaleString()} km
            </span>
          </div>
        </div>

        {/* Engine Explanation */}
        <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-900 space-y-1">
          <span className="font-bold flex items-center gap-1.5 text-blue-800">
            <CheckCircle2 className="w-4 h-4 text-blue-600" /> C++ VehicleAllocationEngine Decision Rationale
          </span>
          <p className="text-slate-700 leading-relaxed">{explanation}</p>
        </div>
      </CardContent>
    </Card>
  );
};
