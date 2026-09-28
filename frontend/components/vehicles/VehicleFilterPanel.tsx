import React from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Search, RotateCcw } from 'lucide-react';
import { VehicleFilterParams, SortOption } from '@/types';

export interface VehicleFilterPanelProps {
  filters: VehicleFilterParams;
  sortBy: SortOption;
  onChange: (filters: VehicleFilterParams) => void;
  onSortChange: (sort: SortOption) => void;
  onReset: () => void;
  resultsCount: number;
  isLoading: boolean;
}

export const VehicleFilterPanel: React.FC<VehicleFilterPanelProps> = ({
  filters,
  sortBy,
  onChange,
  onSortChange,
  onReset,
  resultsCount,
  isLoading,
}) => {
  const fuelOptions = [
    { label: 'All Fuel Types', value: '' },
    { label: 'Petrol', value: 'PETROL' },
    { label: 'Diesel', value: 'DIESEL' },
    { label: 'Electric', value: 'ELECTRIC' },
    { label: 'Hybrid', value: 'HYBRID' },
  ];

  const transmissionOptions = [
    { label: 'All Transmissions', value: '' },
    { label: 'Manual', value: 'MANUAL' },
    { label: 'Automatic', value: 'AUTOMATIC' },
  ];

  const statusOptions = [
    { label: 'All Statuses', value: '' },
    { label: 'Available', value: 'AVAILABLE' },
    { label: 'Rented', value: 'RENTED' },
    { label: 'Maintenance', value: 'MAINTENANCE' },
  ];

  const sortOptions = [
    { label: 'Price: Low to High', value: 'price_asc' },
    { label: 'Price: High to Low', value: 'price_desc' },
    { label: 'Health Score', value: 'health_desc' },
    { label: 'Newest First', value: 'newest' },
  ];

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs mb-6 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
        <div className="lg:col-span-2">
          <Input
            placeholder="Search by brand, model, or registration..."
            leftIcon={<Search className="w-4 h-4" />}
            value={filters.search || ''}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
          />
        </div>
        <Select
          options={fuelOptions}
          value={filters.fuelType || ''}
          onChange={(e) => onChange({ ...filters, fuelType: e.target.value as VehicleFilterParams['fuelType'] })}
        />
        <Select
          options={transmissionOptions}
          value={filters.transmission || ''}
          onChange={(e) => onChange({ ...filters, transmission: e.target.value as VehicleFilterParams['transmission'] })}
        />
        <Select
          options={statusOptions}
          value={filters.status || ''}
          onChange={(e) => onChange({ ...filters, status: e.target.value as VehicleFilterParams['status'] })}
        />
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-slate-500">
            {isLoading ? 'Searching...' : `${resultsCount} vehicle${resultsCount !== 1 ? 's' : ''} found`}
          </span>
          <Button variant="ghost" size="sm" onClick={onReset} leftIcon={<RotateCcw className="w-3 h-3" />}>
            Reset
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">Sort by</span>
          <Select
            options={sortOptions}
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="w-48 py-1.5 text-xs"
          />
        </div>
      </div>
    </div>
  );
};
