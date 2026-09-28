'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { VehicleStatusBadge } from '@/components/ui/StatusBadge';
import { AdminDataTable, Column } from '@/components/admin/AdminDataTable';
import { VehicleModal } from '@/components/admin/VehicleModal';
import { getVehicles } from '@/lib/api/vehicles';
import { deleteVehicle } from '@/lib/api/admin';
import { Vehicle, VehicleStatus } from '@/types';
import { Car, Plus, Search, Edit, Activity, Trash2, AlertCircle } from 'lucide-react';

export default function AdminVehiclesPage() {
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
      setError(err instanceof Error ? err.message : 'Failed to load fleet vehicles.');
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
        if (mounted) setError(err instanceof Error ? err.message : 'Failed to load fleet vehicles.');
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

  const handleDelete = async (v: Vehicle) => {
    if (!window.confirm(`Deactivate vehicle ${v.brand} ${v.model} (${v.registrationNumber})?`)) {
      return;
    }
    try {
      await deleteVehicle(v.id);
      fetchVehicleList();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Deactivation failed.');
    }
  };

  const handleModalSuccess = () => {
    fetchVehicleList();
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
      header: 'Type & Fuel',
      accessor: (v) => (
        <span className="text-slate-700">
          {v.type} ({v.fuelType}, {v.transmission})
        </span>
      ),
    },
    {
      header: 'Daily Rate',
      accessor: (v) => (
        <span className="font-bold text-slate-900 tabular-nums">
          ₹{v.baseRentalRate.toLocaleString()}/day
        </span>
      ),
    },
    {
      header: 'Health',
      accessor: (v) => (
        <div className="flex items-center gap-1 text-slate-700 font-bold tabular-nums">
          <Activity className="w-3.5 h-3.5 text-emerald-600" />
          <span>{v.healthScore}/100</span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (v) => <VehicleStatusBadge status={v.status} />,
    },
    {
      header: 'Actions',
      accessor: (v) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleEditRate(v)}
            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit Rate & Details"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleChangeStatus(v)}
            className="p-1.5 text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            title="Update Status"
          >
            <Car className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleDelete(v)}
            className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Deactivate Vehicle"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <AppShell>
        <PageHeader
          title="Fleet Vehicle Management"
          description="Manage vehicle inventory, daily rental rates, health scores, and operational statuses."
          action={
            <Button size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={handleCreateNew}>
              Add Fleet Vehicle
            </Button>
          }
        />

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Filter & Search Controls */}
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
          emptyTitle="No fleet vehicles found"
          emptyDescription="No vehicles match the active search and status filters."
          action={
            <Button size="sm" variant="outline" onClick={handleCreateNew}>
              Add New Vehicle
            </Button>
          }
        />

        {/* Vehicle Form Modal */}
        <VehicleModal
          isOpen={isModalOpen}
          mode={modalMode}
          vehicle={selectedVehicle}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleModalSuccess}
        />
      </AppShell>
    </ProtectedRoute>
  );
}
