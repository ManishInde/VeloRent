'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { AdminStatGrid } from '@/components/admin/AdminStatGrid';
import { SendNotificationModal } from '@/components/admin/SendNotificationModal';
import { getFleetAnalytics, getFleetInsights } from '@/lib/api/admin';
import { FleetAnalyticsReport, FleetInsight, Notification } from '@/types';
import {
  Car,
  Users,
  Calendar,
  KeyRound,
  CreditCard,
  Star,
  Bell,
  Sparkles,
  AlertCircle,
  Plus,
  ShieldCheck,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [report, setReport] = useState<FleetAnalyticsReport | null>(null);
  const [insights, setInsights] = useState<FleetInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [notifSuccessMessage, setNotifSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [rep, ins] = await Promise.all([
          getFleetAnalytics().catch(() => null),
          getFleetInsights().catch(() => []),
        ]);
        if (mounted) {
          setReport(rep);
          setInsights(ins);
        }
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : 'Failed to load fleet analytics.');
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchDashboardData();
    return () => {
      mounted = false;
    };
  }, []);

  const handleNotificationSent = (notif: Notification) => {
    setNotifSuccessMessage(`Notification #${notif.id} dispatched successfully to User #${notif.userId}.`);
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
      case 'HIGH':
        return <Badge variant="rose">{severity}</Badge>;
      case 'MEDIUM':
        return <Badge variant="amber">{severity}</Badge>;
      case 'LOW':
        return <Badge variant="blue">{severity}</Badge>;
      default:
        return <Badge variant="slate">{severity}</Badge>;
    }
  };

  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <AppShell>
        <PageHeader
          title="Admin Operational Dashboard"
          description="Global fleet administration, real-time analytics, intelligence insights, and system controls."
          action={
            <div className="flex items-center gap-2">
              <Link href="/admin/vehicles">
                <Button size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                  Add Vehicle
                </Button>
              </Link>
              <Button
                size="sm"
                variant="outline"
                leftIcon={<Bell className="w-4 h-4" />}
                onClick={() => setIsNotifModalOpen(true)}
              >
                Send Alert
              </Button>
            </div>
          }
        />

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {notifSuccessMessage && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs rounded-xl flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{notifSuccessMessage}</span>
          </div>
        )}

        {/* Real Fleet Analytics Grid */}
        <AdminStatGrid report={report} isLoading={isLoading} />

        {/* Quick Management Navigation Grid */}
        <div className="mb-8">
          <h3 className="text-sm font-bold text-slate-900 mb-3 tracking-tight">Quick Operations</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'Manage Vehicles', href: '/admin/vehicles', icon: <Car className="w-5 h-5 text-blue-600" /> },
              { label: 'Lookup Users', href: '/admin/users', icon: <Users className="w-5 h-5 text-indigo-600" /> },
              { label: 'View Bookings', href: '/admin/bookings', icon: <Calendar className="w-5 h-5 text-emerald-600" /> },
              { label: 'View Rentals', href: '/admin/rentals', icon: <KeyRound className="w-5 h-5 text-amber-600" /> },
              { label: 'View Payments', href: '/admin/payments', icon: <CreditCard className="w-5 h-5 text-purple-600" /> },
              { label: 'Review Control', href: '/admin/reviews', icon: <Star className="w-5 h-5 text-rose-600" /> },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-300 hover:shadow-xs transition-all flex flex-col items-center text-center gap-2 group"
              >
                <div className="p-2.5 bg-slate-50 group-hover:bg-slate-100 rounded-lg transition-colors">
                  {item.icon}
                </div>
                <span className="text-xs font-bold text-slate-800">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Fleet Intelligence Engine Insights */}
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" /> Fleet Intelligence Insights
            </CardTitle>
            <span className="text-xs text-slate-400">Generated by C++ FleetIntelligenceEngine</span>
          </CardHeader>
          <CardContent className="px-5 pb-5 pt-0">
            {isLoading ? (
              <div className="p-4 text-xs text-slate-500">Loading intelligence analysis...</div>
            ) : insights.length > 0 ? (
              <div className="space-y-3">
                {insights.map((ins, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{ins.metricName}</span>
                        {getSeverityBadge(ins.severity)}
                      </div>
                      <p className="text-slate-600">{ins.explanation}</p>
                    </div>
                    <div className="shrink-0 text-left sm:text-right">
                      <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100 block">
                        Action: {ins.suggestedAction}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">No operational alerts raised by FleetIntelligenceEngine.</p>
            )}
          </CardContent>
        </Card>

        {/* Send Notification Modal */}
        <SendNotificationModal
          isOpen={isNotifModalOpen}
          onClose={() => setIsNotifModalOpen(false)}
          onSuccess={handleNotificationSent}
        />
      </AppShell>
    </ProtectedRoute>
  );
}
