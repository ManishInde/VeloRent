'use client';

import React from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { UserRole } from '@/types';
import { Construction, ArrowLeft } from 'lucide-react';

export interface PlaceholderPageProps {
  title: string;
  description: string;
  category: string;
  allowedRoles: UserRole[];
  backHref?: string;
  phaseTarget?: string;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({
  title,
  description,
  category,
  allowedRoles,
  backHref = '/customer',
  phaseTarget = 'Phase 8B / 8C',
}) => {
  return (
    <ProtectedRoute allowedRoles={allowedRoles}>
      <AppShell>
        <PageHeader
          title={title}
          description={description}
          breadcrumbs={[
            { label: category, href: backHref },
            { label: title },
          ]}
        />

        <Card className="border-dashed border-slate-300 bg-slate-50/50">
          <CardContent className="p-12 flex flex-col items-center justify-center text-center">
            <div className="p-4 bg-blue-50 text-blue-600 rounded-full mb-4 border border-blue-100 shadow-xs">
              <Construction className="w-10 h-10" />
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-200 text-slate-700 mb-3">
              Foundation Scaffolded ({phaseTarget})
            </span>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">{title} Module</h3>
            <p className="mt-2 max-w-md text-xs text-slate-500 leading-relaxed">
              The routing structure, design tokens, authorization guards, and API client hooks for this view are fully configured. Full interactive UI forms and data workflows will be implemented in {phaseTarget}.
            </p>

            <div className="mt-6 flex items-center gap-3">
              <Link href={backHref}>
                <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </AppShell>
    </ProtectedRoute>
  );
};
