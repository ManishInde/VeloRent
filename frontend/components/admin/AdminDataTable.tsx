import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/Table';

export interface Column<T> {
  header: string;
  accessor: (item: T) => React.ReactNode;
  className?: string;
}

interface AdminDataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string | number;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  action?: React.ReactNode;
}

export function AdminDataTable<T>({
  columns,
  data,
  keyExtractor,
  isLoading,
  emptyTitle = 'No records found',
  emptyDescription = 'No entries match the selected filter criteria.',
  action,
}: AdminDataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="space-y-3 p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        action={action}
      />
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 border-b border-slate-200">
              {columns.map((col, idx) => (
                <TableHead
                  key={idx}
                  className={`text-xs font-bold uppercase tracking-wider text-slate-700 py-3.5 ${col.className || ''}`}
                >
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow
                key={keyExtractor(item)}
                className="hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-0"
              >
                {columns.map((col, idx) => (
                  <TableCell key={idx} className={`py-3 text-xs text-slate-800 ${col.className || ''}`}>
                    {col.accessor(item)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
