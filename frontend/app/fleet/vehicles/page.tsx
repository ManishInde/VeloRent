'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { VehicleStatusBadge } from '@/components/ui/StatusBadge';
import { HealthScoreBadge } from '@/components/fleet/HealthScoreBadge';
import { AdminDataTable, Column } from '@/components/admin/AdminDataTable';
import { VehicleModal } from '@/components/admin/VehicleModal';
import { getVehicles } from '@/lib/api/vehicles';
import { Vehicle, VehicleStatus } from '@/types';
import { Car, Search, Edit, AlertCircle, Info, Plus } from 'lucide-react';

export default function FleetVehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<VehicleStatus | 'ALL'>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'CREATE' | 'EDIT_RATE' | 'CHANGE_STATUS'>('CREATE');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | undefined>(undefined);

  const fetchVehicleList = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getVehicles();
      setVehicles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load fleet vehicles inventory.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await getVehicles();
        if (mounted) setVehicles(data);
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : 'Failed to load fleet vehicles inventory.');
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleCreateNew = () => {
    setSelectedVehicle(undefined);
    setModalMode('CREATE');
    setIsModalOpen(true);
  };

  const handleEditRate = (v: Vehicle) => {
    setSelectedVehicle(v);
    setModalMode('EDIT_RATE');
    setIsModalOpen(true);
  };

  const handleChangeStatus = (v: Vehicle) => {
    setSelectedVehicle(v);
    setModalMode('CHANGE_STATUS');
    setIsModalOpen(true);
  };

  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch =
      v.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns: Column<Vehicle>[] = [
    {
      header: 'Vehicle ID',
      accessor: (v) => <span className="font-bold text-slate-900">#{v.id}</span>,
    },
    {
      header: 'Vehicle Details',
      accessor: (v) => (
        <div>
          <span className="font-bold text-slate-900 block">{v.brand} {v.model}</span>
          <span className="text-[11px] text-slate-500 font-mono">Reg: {v.registrationNumber} • {v.purchaseYear}</span>
        </div>
      ),
    },
    {
      header: 'Type & Specs',
      accessor: (v) => (
        <span className="text-slate-700 text-xs">
          {v.type} ({v.fuelType}, {v.transmission})
        </span>
      ),
    },
    {
      header: 'Base Rate',
      accessor: (v) => (
        <span className="font-bold text-slate-900 tabular-nums">
          ₹{v.baseRentalRate.toLocaleString()}/day
        </span>
      ),
    },
    {
      header: 'Odometer',
      accessor: (v) => (
        <span className="font-medium text-slate-800 tabular-nums">
          {v.odometerKm.toLocaleString()} km
        </span>
      ),
    },
    {
      header: 'Health Score',
      accessor: (v) => <HealthScoreBadge score={v.healthScore} showCategory={false} />,
    },
    {
      header: 'Status',
      accessor: (v) => <VehicleStatusBadge status={v.status} />,
    },
    {
      header: 'Operational Actions',
      accessor: (v) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleEditRate(v)}
            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
            title="Edit Base Rental Rate"
          >
            <Edit className="w-3.5 h-3.5" /> Rate
          </button>
          <button
            onClick={() => handleChangeStatus(v)}
            className="p-1.5 text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
            title="Transition Status"
          >
            <Car className="w-3.5 h-3.5" /> Status
          </button>
        </div>
      ),
    },
  ];

  return (
    <ProtectedRoute allowedRoles={['FLEET_MANAGER']}>
      <AppShell>
        <PageHeader
          title="Operational Fleet Vehicle Inventory"
          description="Manage vehicle daily rates, track odometers, inspect health scores, and perform status transitions."
          action={
            <Button size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={handleCreateNew}>
              Add Fleet Vehicle
            </Button>
          }
        />

        {/* Permission Note */}
        <div className="mb-6 p-4 bg-slate-100 border border-slate-200 rounded-xl flex items-start gap-3 text-xs text-slate-700">
          <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <strong className="block text-slate-900 font-bold mb-0.5">Fleet Manager Authorization Note:</strong>
            Fleet Managers are authorized to add vehicles (`POST /api/vehicles`), update base rental rates (`PUT /api/vehicles/:id`), and transition operational statuses (`PATCH /api/vehicles/:id/status`). Permanent vehicle deactivation (`DELETE`) is restricted to Platform Administrators.
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Filter Controls */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative max-w-md w-full">
            <Input
              placeholder="Search by brand, model, registration..."
              leftIcon={<Search className="w-4 h-4" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {(['ALL', 'AVAILABLE', 'RENTED', 'MAINTENANCE', 'RESERVED', 'OUT_OF_SERVICE'] as const).map(
              (st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    statusFilter === st
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {st === 'ALL' ? 'All Vehicles' : st}
                </button>
              )
            )}
          </div>
        </div>

        {/* Vehicle Table */}
        <AdminDataTable
          columns={columns}
          data={filteredVehicles}
          keyExtractor={(v) => v.id}
          isLoading={isLoading}
          emptyTitle="No vehicles found"
          emptyDescription="No fleet vehicles match the active search and status filters."
        />

        {/* Vehicle Form Modal */}
        <VehicleModal
          isOpen={isModalOpen}
          mode={modalMode}
          vehicle={selectedVehicle}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchVehicleList}
        />
      </AppShell>
    </ProtectedRoute>
  );
}
