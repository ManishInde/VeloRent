import React from 'react';
import { StatCard } from '@/components/ui/StatCard';
import { FleetAnalyticsReport } from '@/types';
import { Car, Activity, DollarSign, TrendingUp } from 'lucide-react';

interface AdminStatGridProps {
  report: FleetAnalyticsReport | null;
  isLoading?: boolean;
}

export const AdminStatGrid: React.FC<AdminStatGridProps> = ({ report, isLoading }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      <StatCard
        title="Total Fleet Vehicles"
        value={isLoading || !report ? '—' : report.totalVehicles}
        subtitle={
          report
            ? `${report.availableVehicles} available • ${report.rentedVehicles} rented • ${report.maintenanceVehicles} maint.`
            : 'Fleet breakdown'
        }
        icon={<Car className="w-5 h-5 text-blue-600" />}
      />

      <StatCard
        title="Fleet Utilization"
        value={isLoading || !report ? '—' : `${report.fleetUtilizationPct.toFixed(1)}%`}
        subtitle={report && report.fleetUtilizationPct > 50 ? 'High active utilization' : 'Normal capacity'}
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
