import React, { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Search, RotateCcw, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import { VehicleFilterParams, SortOption } from '@/types';
import { clsx } from 'clsx';

export interface VehicleFilterPanelProps {
  filters: VehicleFilterParams;
  sortBy: SortOption;
  onChange: (filters: VehicleFilterParams) => void;
  onSortChange: (sort: SortOption) => void;
  onReset: () => void;
  resultsCount: number;
  isLoading: boolean;
}

const CATEGORY_TABS = [
  { label: 'All Fleet', categoryId: undefined },
  { label: 'SUV', categoryId: 3 },
  { label: 'Sedan', categoryId: 2 },
  { label: 'Hatchback', categoryId: 1 },
  { label: 'Luxury', categoryId: 4 },
  { label: 'Electric', categoryId: 5 },
  { label: 'Motorcycle', categoryId: 6 },
];

export const VehicleFilterPanel: React.FC<VehicleFilterPanelProps> = ({
  filters,
  sortBy,
  onChange,
  onSortChange,
  onReset,
  resultsCount,
  isLoading,
}) => {
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

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
    { label: 'Available Only', value: 'AVAILABLE' },
    { label: 'Rented', value: 'RENTED' },
    { label: 'Maintenance', value: 'MAINTENANCE' },
  ];

  const sortOptions = [
    { label: 'Price: Low to High', value: 'price_asc' },
    { label: 'Price: High to Low', value: 'price_desc' },
    { label: 'Health Score', value: 'health_desc' },
    { label: 'Newest Model Year', value: 'newest' },
  ];

  const hasActiveFilters = Boolean(
    filters.search ||
    filters.fuelType ||
    filters.transmission ||
    filters.status ||
    filters.categoryId !== undefined
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs mb-8 overflow-hidden transition-all">
      {/* Category Quick Selector Pills */}
      <div className="px-4 py-3 bg-slate-50/70 border-b border-slate-200/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1.5 hidden sm:inline">
          Category:
        </span>
        {CATEGORY_TABS.map((cat) => {
          const isSelected = filters.categoryId === cat.categoryId;
          return (
            <button
              key={cat.label}
              onClick={() => onChange({ ...filters, categoryId: cat.categoryId })}
              className={clsx(
                'px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150',
                isSelected
                  ? 'bg-slate-900 text-white shadow-xs font-bold ring-1 ring-slate-900'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
              )}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      <div className="p-4 sm:p-5 space-y-3.5">
        {/* Main Search & Quick Controls Row */}
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
          <div className="flex-1">
            <Input
              placeholder="Search by brand, model (e.g. Creta, Nexon, BMW, Swift)..."
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
              value={filters.search || ''}
              onChange={(e) => onChange({ ...filters, search: e.target.value })}
            />
          </div>

          <div className="flex items-center gap-2 justify-between lg:justify-end">
            {/* Mobile Filter Toggle */}
            <Button
              variant="outline"
              size="sm"
              className="lg:hidden flex items-center gap-1.5 text-xs font-semibold text-slate-700"
              onClick={() => setIsMobileExpanded(!isMobileExpanded)}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
              <span>Filters {hasActiveFilters && '• Active'}</span>
              {isMobileExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </Button>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider shrink-0 hidden sm:inline">
                Sort:
              </span>
              <Select
                options={sortOptions}
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value as SortOption)}
                className="w-44 text-xs font-medium"
              />
            </div>
          </div>
        </div>

        {/* Detailed Filters (Always visible on desktop, collapsible on mobile) */}
        <div
          className={clsx(
            'grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100',
            !isMobileExpanded && 'hidden lg:grid'
          )}
        >
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Fuel Type
            </label>
            <Select
              options={fuelOptions}
              value={filters.fuelType || ''}
              onChange={(e) => onChange({ ...filters, fuelType: e.target.value as VehicleFilterParams['fuelType'] })}
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Transmission
            </label>
            <Select
              options={transmissionOptions}
              value={filters.transmission || ''}
              onChange={(e) => onChange({ ...filters, transmission: e.target.value as VehicleFilterParams['transmission'] })}
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Fleet Status
            </label>
            <Select
              options={statusOptions}
              value={filters.status || ''}
              onChange={(e) => onChange({ ...filters, status: e.target.value as VehicleFilterParams['status'] })}
            />
          </div>
        </div>

        {/* Bottom Toolbar: Count & Reset */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">
              {isLoading ? (
                'Filtering vehicles...'
              ) : (
                <>
                  <span className="text-blue-600 font-extrabold">{resultsCount}</span> {resultsCount === 1 ? 'vehicle' : 'vehicles'} available
                </>
              )}
            </span>
          </div>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="text-xs text-slate-600 hover:text-rose-600 hover:bg-rose-50"
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Reset Filters
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
