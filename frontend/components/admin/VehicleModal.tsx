import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Vehicle, VehicleCreateRequest, VehicleStatus, FuelType, TransmissionType } from '@/types';
import { createVehicle, updateVehicle, updateVehicleStatus } from '@/lib/api/admin';
import { Car, CheckCircle2, AlertCircle, X } from 'lucide-react';

interface VehicleModalProps {
  isOpen: boolean;
  mode: 'CREATE' | 'EDIT_RATE' | 'CHANGE_STATUS';
  vehicle?: Vehicle;
  onClose: () => void;
  onSuccess: (vehicle: Vehicle) => void;
}

export const VehicleModal: React.FC<VehicleModalProps> = ({
  isOpen,
  mode,
  vehicle,
  onClose,
  onSuccess,
}) => {
  // Create mode fields
  const [regNo, setRegNo] = useState(vehicle?.registrationNumber || 'KA01AB1234');
  const [brand, setBrand] = useState(vehicle?.brand || 'Toyota');
  const [model, setModel] = useState(vehicle?.model || 'Camry');
  const [categoryId, setCategoryId] = useState<number>(vehicle?.categoryId || 1);
  const [vehicleType, setVehicleType] = useState<string>(vehicle?.type || 'CAR');
  const [fuelType, setFuelType] = useState<FuelType>(vehicle?.fuelType || 'PETROL');
  const [transmission, setTransmission] = useState<TransmissionType>(vehicle?.transmission || 'AUTOMATIC');
  const [seats, setSeats] = useState<number>(vehicle?.seats || 5);
  const [rate, setRate] = useState<number>(vehicle?.baseRentalRate || 2500);
  const [purchaseYear, setPurchaseYear] = useState<number>(vehicle?.purchaseYear || 2024);

  // Status mode fields
  const [status, setStatus] = useState<VehicleStatus>(vehicle?.status || 'AVAILABLE');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (mode === 'CREATE') {
        const payload: VehicleCreateRequest = {
          registrationNumber: regNo,
          brand,
          model,
          categoryId,
          vehicleType,
          fuelType,
          transmission,
          seats,
          baseRentalRate: rate,
          purchaseYear,
        };
        const newVehicle = await createVehicle(payload);
        onSuccess(newVehicle);
      } else if (mode === 'EDIT_RATE' && vehicle) {
        const updated = await updateVehicle(vehicle.id, { baseRentalRate: rate, brand, model });
        onSuccess(updated);
      } else if (mode === 'CHANGE_STATUS' && vehicle) {
        const updated = await updateVehicleStatus(vehicle.id, status);
        onSuccess(updated);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg focus:outline-none"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Car className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {mode === 'CREATE'
                ? 'Add Fleet Vehicle'
                : mode === 'EDIT_RATE'
                ? `Edit Vehicle #${vehicle?.id}`
                : `Update Status for Vehicle #${vehicle?.id}`}
            </h3>
            <p className="text-xs text-slate-500">Real C++ REST API Management</p>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {mode === 'CREATE' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Registration Number"
                  value={regNo}
                  onChange={(e) => setRegNo(e.target.value)}
                  placeholder="e.g. KA01AB1234"
                  required
                />
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Vehicle Type</label>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none"
                  >
                    <option value="CAR">Car</option>
                    <option value="BIKE">Bike / Motorcycle</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Brand"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g. Toyota"
                  required
                />
                <Input
                  label="Model"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="e.g. Camry"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Fuel Type</label>
                  <select
                    value={fuelType}
                    onChange={(e) => setFuelType(e.target.value as FuelType)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none"
                  >
                    <option value="PETROL">Petrol</option>
                    <option value="DIESEL">Diesel</option>
                    <option value="ELECTRIC">Electric</option>
                    <option value="HYBRID">Hybrid</option>
                    <option value="CNG">CNG</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Transmission</label>
                  <select
                    value={transmission}
                    onChange={(e) => setTransmission(e.target.value as TransmissionType)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none"
                  >
                    <option value="AUTOMATIC">Automatic</option>
                    <option value="MANUAL">Manual</option>
                  </select>
                </div>

                <Input
                  label="Seats"
                  type="number"
                  min={1}
                  max={20}
                  value={seats}
                  onChange={(e) => setSeats(Number(e.target.value))}
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Input
                  label="Category ID"
                  type="number"
                  min={1}
                  value={categoryId}
                  onChange={(e) => setCategoryId(Number(e.target.value))}
                  required
                />
                <Input
                  label="Base Daily Rate (₹)"
                  type="number"
                  min={100}
                  value={rate}
                  onChange={(e) => setRate(Number(e.target.value))}
                  required
                />
                <Input
                  label="Purchase Year"
                  type="number"
                  min={2000}
                  max={2026}
                  value={purchaseYear}
                  onChange={(e) => setPurchaseYear(Number(e.target.value))}
                  required
                />
              </div>
            </>
          )}

          {mode === 'EDIT_RATE' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Brand"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                />
                <Input
                  label="Model"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                />
              </div>

              <Input
                label="Daily Rental Rate (₹)"
                type="number"
                min={100}
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                helperText="Updates base rate used by PricingEngine."
                required
              />
            </div>
          )}

          {mode === 'CHANGE_STATUS' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Operational Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as VehicleStatus)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none"
              >
                <option value="AVAILABLE">AVAILABLE — Ready for rentals</option>
                <option value="RENTED">RENTED — Active check-out</option>
                <option value="MAINTENANCE">MAINTENANCE — Service bay</option>
                <option value="RESERVED">RESERVED — Booking hold</option>
                <option value="OUT_OF_SERVICE">OUT OF SERVICE — Soft deactivation</option>
              </select>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={isSubmitting}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              {mode === 'CREATE' ? 'Create Vehicle' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
