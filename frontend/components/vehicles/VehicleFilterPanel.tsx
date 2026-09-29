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
  { label: 'ALL LOT', categoryId: undefined },
  { label: 'SUV', categoryId: 3 },
  { label: 'SEDAN', categoryId: 2 },
  { label: 'HATCHBACK', categoryId: 1 },
  { label: 'LUXURY', categoryId: 4 },
  { label: 'ELECTRIC', categoryId: 5 },
  { label: 'MOTORCYCLE', categoryId: 6 },
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
    { label: 'ALL FUEL TYPES', value: '' },
    { label: 'PETROL', value: 'PETROL' },
    { label: 'DIESEL', value: 'DIESEL' },
    { label: 'ELECTRIC', value: 'ELECTRIC' },
    { label: 'HYBRID', value: 'HYBRID' },
  ];

  const transmissionOptions = [
    { label: 'ALL TRANSMISSIONS', value: '' },
    { label: 'MANUAL', value: 'MANUAL' },
    { label: 'AUTOMATIC', value: 'AUTOMATIC' },
  ];

  const statusOptions = [
    { label: 'ALL FLEET STATUS', value: '' },
    { label: 'AVAILABLE ONLY', value: 'AVAILABLE' },
    { label: 'RENTED', value: 'RENTED' },
    { label: 'MAINTENANCE', value: 'MAINTENANCE' },
  ];

  const sortOptions = [
    { label: 'PRICE: LOW TO HIGH', value: 'price_asc' },
    { label: 'PRICE: HIGH TO LOW', value: 'price_desc' },
    { label: 'HEALTH SCORE', value: 'health_desc' },
    { label: 'NEWEST MODEL YEAR', value: 'newest' },
  ];

  const hasActiveFilters = Boolean(
    filters.search ||
    filters.fuelType ||
    filters.transmission ||
    filters.status ||
    filters.categoryId !== undefined
  );

  return (
    <div className="bg-[#FFFFFF] border border-[#111111]/25 mb-8 shadow-[2px_2px_0px_rgba(17,17,17,0.06)]">
      {/* Category Navigation Strip */}
      <div className="px-4 py-2.5 bg-[#FAF8F5] border-b border-[#111111]/15 flex items-center gap-1 overflow-x-auto scrollbar-none">
        <span className="micro-tag text-[#777770] shrink-0 mr-3 hidden sm:inline">
          CATEGORY /
        </span>
        {CATEGORY_TABS.map((cat) => {
          const isSelected = filters.categoryId === cat.categoryId;
          return (
            <button
              key={cat.label}
              onClick={() => onChange({ ...filters, categoryId: cat.categoryId })}
              className={clsx(
                'px-3 py-1 font-display text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-150 cursor-pointer',
                isSelected
                  ? 'bg-[#111111] text-[#C7F000] shadow-[2px_2px_0px_#C7F000]'
                  : 'text-[#666660] hover:text-[#111111] hover:bg-[#ECE8E0]'
              )}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        {/* Main Search & Sort Bar */}
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
          <div className="flex-1">
            <Input
              placeholder="SEARCH LOT BY BRAND, MODEL (E.G. CRETA, BMW, NEXON, SWIFT)..."
              leftIcon={<Search className="w-4 h-4 text-[#777770]" />}
              value={filters.search || ''}
              onChange={(e) => onChange({ ...filters, search: e.target.value })}
              className="font-mono text-xs uppercase"
            />
          </div>

          <div className="flex items-center gap-2 justify-between lg:justify-end">
            {/* Mobile Filter Toggle */}
            <Button
              variant="outline"
              size="sm"
              className="lg:hidden flex items-center gap-1.5"
              onClick={() => setIsMobileExpanded(!isMobileExpanded)}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>FILTERS {hasActiveFilters && '• ACTIVE'}</span>
              {isMobileExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </Button>

            <div className="flex items-center gap-2">
              <span className="micro-tag text-[#777770] shrink-0 hidden sm:inline">
                SORT /
              </span>
              <Select
                options={sortOptions}
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value as SortOption)}
                className="w-48 text-[11px] font-mono uppercase"
              />
            </div>
          </div>
        </div>

        {/* Detailed Secondary Filters */}
        <div
          className={clsx(
            'grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-[#111111]/10',
            !isMobileExpanded && 'hidden lg:grid'
          )}
        >
          <div>
            <label className="block micro-tag text-[#777770] mb-1.5">
              01 / FUEL TYPE
            </label>
            <Select
              options={fuelOptions}
              value={filters.fuelType || ''}
              onChange={(e) => onChange({ ...filters, fuelType: e.target.value as VehicleFilterParams['fuelType'] })}
              className="text-[11px] font-mono"
            />
          </div>

          <div>
            <label className="block micro-tag text-[#777770] mb-1.5">
              02 / TRANSMISSION
            </label>
            <Select
              options={transmissionOptions}
              value={filters.transmission || ''}
              onChange={(e) => onChange({ ...filters, transmission: e.target.value as VehicleFilterParams['transmission'] })}
              className="text-[11px] font-mono"
            />
          </div>

          <div>
            <label className="block micro-tag text-[#777770] mb-1.5">
              03 / FLEET STATUS
            </label>
            <Select
              options={statusOptions}
              value={filters.status || ''}
              onChange={(e) => onChange({ ...filters, status: e.target.value as VehicleFilterParams['status'] })}
              className="text-[11px] font-mono"
            />
          </div>
        </div>

        {/* Status Toolbar */}
        <div className="flex items-center justify-between pt-2 border-t border-[#111111]/10 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-[#111111] font-bold">
              {isLoading ? (
                'UPDATING FLEET LOT...'
              ) : (
                <>
                  <span className="text-[#111111] bg-[#C7F000] px-1.5 py-0.5 border border-[#111111] font-black mr-1">
                    {resultsCount}
                  </span>{' '}
                  {resultsCount === 1 ? 'VEHICLE ON THE LOT' : 'VEHICLES ON THE LOT'}
                </>
              )}
            </span>
          </div>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="text-[#FF654A] hover:bg-[#FFF0ED]"
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              RESET FILTERS
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
