'use client';

import React, { useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { RoleBadge } from '@/components/ui/StatusBadge';
import { getCustomerById } from '@/lib/api/customers';
import { getCustomerRiskScore } from '@/lib/api/admin';
import { Customer, CustomerRiskResult } from '@/types';
import { Users, Search, ShieldCheck, Mail, Phone, KeyRound, AlertCircle, Info, Activity } from 'lucide-react';

export default function AdminUsersPage() {
  const [searchId, setSearchId] = useState<string>('1');
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [riskResult, setRiskResult] = useState<CustomerRiskResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLookup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const id = parseInt(searchId, 10);
    if (isNaN(id) || id <= 0) {
      setError('Please enter a valid numeric Customer ID.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setCustomer(null);
    setRiskResult(null);

    try {
      const [cust, risk] = await Promise.all([
        getCustomerById(id),
        getCustomerRiskScore(id).catch(() => null),
      ]);
      setCustomer(cust);
      setRiskResult(risk);
    } catch (err) {
      setError(err instanceof Error ? err.message : `Customer with ID #${id} not found.`);
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'CRITICAL':
      case 'HIGH':
        return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-rose-100 text-rose-800">{level} RISK</span>;
      case 'MEDIUM':
        return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-800">{level} RISK</span>;
      case 'LOW':
        return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800">{level} RISK</span>;
      default:
        return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-800">{level}</span>;
    }
  };

  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <AppShell>
        <PageHeader
          title="User & Customer Identity Management"
          description="Inspect verified customer profiles, credentials, driving licenses, and operational risk indicators."
        />

        {/* Backend Limitation Notice */}
        <div className="mb-6 p-4 bg-slate-100 border border-slate-200 rounded-xl flex items-start gap-3 text-xs text-slate-700">
          <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <strong className="block text-slate-900 font-bold mb-0.5">API Specification Note:</strong>
            The C++ REST API provides single-customer lookup (`GET /api/customers/:id`) and risk indicator evaluation (`GET /api/customers/:id/risk`). Bulk user iteration and role mutation endpoints are restricted in backend authorization.
          </div>
        </div>

        {/* Customer Lookup Form */}
        <Card className="mb-8 max-w-xl">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Search className="w-4 h-4 text-blue-600" /> Customer Lookup
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6 pt-0">
            <form onSubmit={handleLookup} className="flex gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Enter Customer ID (e.g. 1)"
                  type="number"
                  min={1}
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" size="sm" isLoading={isLoading} leftIcon={<Search className="w-4 h-4" />}>
                Inspect User
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

        {/* Inspected Customer Details */}
        {customer && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl">
            {/* Identity Card */}
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" /> Verified Customer Profile
                </CardTitle>
                <RoleBadge role={customer.role === 'ADMIN' ? 'ADMIN' : 'CUSTOMER'} />
              </CardHeader>
              <CardContent className="px-6 pb-6 pt-0 space-y-4">
                <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                  <div className="w-12 h-12 rounded-full bg-slate-900 text-white font-extrabold text-base flex items-center justify-center border-2 border-blue-500/30">
                    {customer.fullName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{customer.fullName}</h3>
                    <p className="text-xs text-slate-500">Customer ID #{customer.id}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 flex items-center gap-1 mb-0.5">
                      <Mail className="w-3.5 h-3.5" /> Email Address
                    </span>
                    <p className="font-semibold text-slate-900">{customer.email}</p>
                  </div>

                  <div>
                    <span className="text-slate-400 flex items-center gap-1 mb-0.5">
                      <Phone className="w-3.5 h-3.5" /> Phone Number
                    </span>
                    <p className="font-semibold text-slate-900">{customer.phone || 'Not provided'}</p>
                  </div>

                  <div>
                    <span className="text-slate-400 flex items-center gap-1 mb-0.5">
                      <ShieldCheck className="w-3.5 h-3.5" /> Driving License
                    </span>
                    <p className="font-semibold text-slate-900 font-mono">{customer.drivingLicenseNumber}</p>
                    <span className="text-[10px] text-slate-400 font-mono">Expiry: {customer.licenseExpiry}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 flex items-center gap-1 mb-0.5">
                      <KeyRound className="w-3.5 h-3.5" /> Completed Rentals
                    </span>
                    <p className="font-bold text-slate-900 tabular-nums">{customer.totalRentals} check-outs</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Risk Score Indicator Card */}
            {riskResult && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Activity className="w-4 h-4 text-rose-600" /> Operational Risk Evaluation
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-6 pt-0 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <span className="text-[11px] text-slate-400 block uppercase tracking-wide">Risk Score</span>
                      <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
                        {riskResult.riskScore}/100
                      </span>
                    </div>
                    {getRiskBadge(riskResult.riskLevel)}
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-slate-700 block mb-1">Contributing Risk Factors</span>
                    {riskResult.contributingFactors && riskResult.contributingFactors.length > 0 ? (
                      <ul className="space-y-1 text-xs text-slate-600">
                        {riskResult.contributingFactors.map((fact, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                            <span>{fact}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-slate-500">No elevated risk factors recorded.</p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[11px] text-slate-400 block">System Recommendation</span>
                    <p className="text-xs font-semibold text-slate-800">{riskResult.recommendedAction}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </AppShell>
    </ProtectedRoute>
  );
}
