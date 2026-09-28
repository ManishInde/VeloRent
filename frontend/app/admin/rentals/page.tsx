'use client';

import React, { useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { RentalStatusBadge } from '@/components/ui/StatusBadge';
import { getRentalById, startRental, returnRental } from '@/lib/api/rentals';
import { Rental } from '@/types';
import { KeyRound, Search, Calendar, AlertCircle, CheckCircle2, Play } from 'lucide-react';

export default function AdminRentalsPage() {
  const [searchId, setSearchId] = useState<string>('1');
  const [rental, setRental] = useState<Rental | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Return / Start input
  const [odometerInput, setOdometerInput] = useState<string>('');
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  const handleLookup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const id = parseInt(searchId, 10);
    if (isNaN(id) || id <= 0) {
      setError('Please enter a valid numeric Rental ID.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setActionSuccessMsg(null);
    setRental(null);

    try {
      const r = await getRentalById(id);
      setRental(r);
      setOdometerInput((r.startOdometerKm + 50).toString());
    } catch (err) {
      setError(err instanceof Error ? err.message : `Rental with ID #${id} not found.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReturnVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rental) return;

    const odo = parseInt(odometerInput, 10);
    if (isNaN(odo) || odo < rental.startOdometerKm) {
      setError(`Return odometer must be \u2265 start odometer (${rental.startOdometerKm} km).`);
      return;
    }

    setIsProcessingAction(true);
    setError(null);
    setActionSuccessMsg(null);

    try {
      const updated = await returnRental(rental.id, odo);
      setRental(updated);
      setActionSuccessMsg(`Rental #${rental.id} returned successfully with ending odometer ${odo} km.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Return failed.');
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleStartRentalFromBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    const bookingId = parseInt(searchId, 10);
    if (isNaN(bookingId) || bookingId <= 0) {
      setError('Please enter a valid Booking ID to start rental.');
      return;
    }

    const odo = parseInt(odometerInput, 10);
    const startOdo = isNaN(odo) || odo < 0 ? 1000 : odo;

    setIsProcessingAction(true);
    setError(null);
    setActionSuccessMsg(null);

    try {
      const newRental = await startRental(bookingId, startOdo);
      setRental(newRental);
      setActionSuccessMsg(`Converted Booking #${bookingId} into active Rental #${newRental.id}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start rental check-out.');
    } finally {
      setIsProcessingAction(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <AppShell>
        <PageHeader
          title="Rental Check-Out & Return Oversight"
          description="Inspect active check-outs, start rentals from confirmed bookings, and record vehicle return odometers."
        />

        {/* Search / Lookup Form */}
        <Card className="mb-8 max-w-xl">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Search className="w-4 h-4 text-blue-600" /> Lookup Rental or Start Check-Out
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6 pt-0 space-y-4">
            <form onSubmit={handleLookup} className="flex gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Enter Rental or Booking ID (e.g. 1)"
                  type="number"
                  min={1}
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" size="sm" isLoading={isLoading} leftIcon={<Search className="w-4 h-4" />}>
                Inspect Rental
              </Button>
            </form>
          </CardContent>
        </Card>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2 max-w-xl">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {actionSuccessMsg && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs rounded-xl flex items-center gap-2 max-w-xl">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
        )}

        {/* Rental Details & Admin Action Form */}
        {rental ? (
          <div className="max-w-3xl space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-blue-600" /> Rental Record #{rental.id}
                </CardTitle>
                <RentalStatusBadge status={rental.status} />
              </CardHeader>
              <CardContent className="px-6 pb-6 pt-0 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400">Booking ID</span>
                    <p className="font-bold text-slate-900">#{rental.bookingId}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Start Odometer</span>
                    <p className="font-bold text-slate-900 tabular-nums">{rental.startOdometerKm.toLocaleString()} km</p>
                  </div>
                  <div>
                    <span className="text-slate-400">End Odometer</span>
                    <p className="font-bold text-slate-900 tabular-nums">
                      {rental.endOdometerKm > 0 ? `${rental.endOdometerKm.toLocaleString()} km` : 'Pending'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">Distance Travelled</span>
                    <p className="font-bold text-emerald-600 tabular-nums">{rental.distanceDrivenKm.toLocaleString()} km</p>
                  </div>
                  <div>
                    <span className="text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> Start Time
                    </span>
                    <p className="font-semibold text-slate-800">{rental.startDateTime || '—'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> Return Time
                    </span>
                    <p className="font-semibold text-slate-800">{rental.endDateTime || 'In Progress'}</p>
                  </div>
                </div>

                {rental.status === 'ACTIVE' && (
                  <form onSubmit={handleReturnVehicle} className="mt-4 pt-4 border-t border-slate-100 flex items-end gap-3 max-w-md">
                    <div className="flex-1">
                      <Input
                        label="Return Odometer Reading (km)"
                        type="number"
                        min={rental.startOdometerKm}
                        value={odometerInput}
                        onChange={(e) => setOdometerInput(e.target.value)}
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      size="sm"
                      isLoading={isProcessingAction}
                      leftIcon={<CheckCircle2 className="w-4 h-4" />}
                    >
                      Process Return
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Option to start rental for a confirmed booking */
          <Card className="max-w-xl">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Play className="w-4 h-4 text-emerald-600" /> Start Rental Check-Out from Booking
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6 pt-0 space-y-4">
              <p className="text-xs text-slate-600">
                Convert a confirmed booking reservation (using Booking ID #{searchId}) into an active physical rental.
              </p>
              <form onSubmit={handleStartRentalFromBooking} className="space-y-3">
                <Input
                  label="Starting Odometer Reading (km)"
                  type="number"
                  min={0}
                  value={odometerInput}
                  onChange={(e) => setOdometerInput(e.target.value)}
                  placeholder="e.g. 15000"
                  required
                />
                <Button
                  type="submit"
                  size="sm"
                  isLoading={isProcessingAction}
                  leftIcon={<Play className="w-4 h-4" />}
                >
                  Start Rental Check-Out
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </AppShell>
    </ProtectedRoute>
  );
}
