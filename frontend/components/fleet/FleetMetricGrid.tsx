import React from 'react';
import { StatCard } from '@/components/ui/StatCard';
import { FleetAnalyticsReport } from '@/types';
import { Car, Activity, DollarSign, TrendingUp } from 'lucide-react';

interface FleetMetricGridProps {
  report: FleetAnalyticsReport | null;
  totalFleetCount?: number;
  isLoading?: boolean;
}

export const FleetMetricGrid: React.FC<FleetMetricGridProps> = ({
  report,
  totalFleetCount,
  isLoading,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      <StatCard
        title="Fleet Vehicles"
        value={isLoading || !report ? '—' : totalFleetCount ?? report.totalVehicles}
        subtitle={
          report
            ? `${report.availableVehicles} available • ${report.reservedVehicles || 0} reserved • ${report.rentedVehicles} rented • ${report.maintenanceVehicles} maint.`
            : 'Operational inventory'
        }
        icon={<Car className="w-5 h-5 text-blue-600" />}
      />

      <StatCard
        title="Fleet Utilization"
        value={isLoading || !report ? '—' : `${report.fleetUtilizationPct.toFixed(1)}%`}
        subtitle={report && report.fleetUtilizationPct > 50 ? 'Active fleet load' : 'Normal capacity'}
        icon={<Activity className="w-5 h-5 text-emerald-600" />}
      />

      <StatCard
        title="Total Revenue (INR)"
        value={
          isLoading || !report
            ? '—'
            : `₹${report.totalRevenueINR.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
        }
        subtitle="Gross rental receipts"
        icon={<DollarSign className="w-5 h-5 text-amber-500" />}
      />

      <StatCard
        title="Estimated Net Profit"
        value={
          isLoading || !report
            ? '—'
            : `₹${report.netEstimatedProfitINR.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
        }
        subtitle={
          report
            ? `Cost: ₹${report.totalMaintenanceCostINR.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
            : 'Revenue minus maintenance'
        }
        icon={<TrendingUp className="w-5 h-5 text-indigo-600" />}
      />
    </div>
  );
};
