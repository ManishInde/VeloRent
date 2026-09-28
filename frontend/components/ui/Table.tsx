import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Table: React.FC<React.TableHTMLAttributes<HTMLTableElement>> = ({
  className,
  children,
  ...props
}) => (
  <div className="w-full overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-xs">
    <table
      className={twMerge(clsx('w-full text-left text-sm text-slate-700', className))}
      {...props}
    >
      {children}
    </table>
  </div>
);

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  className,
  children,
  ...props
}) => (
  <thead
    className={twMerge(
      clsx('bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider', className)
    )}
    {...props}
  >
    {children}
  </thead>
);

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  className,
  children,
  ...props
}) => (
  <tbody
    className={twMerge(clsx('divide-y divide-slate-100 bg-white', className))}
    {...props}
  >
    {children}
  </tbody>
);

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({
  className,
  children,
  ...props
}) => (
  <tr
    className={twMerge(
      clsx('hover:bg-slate-50/80 transition-colors duration-150', className)
    )}
    {...props}
  >
    {children}
  </tr>
);

export const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({
  className,
  children,
  ...props
}) => (
  <th className={twMerge(clsx('px-4 py-3.5', className))} {...props}>
    {children}
  </th>
);

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({
  className,
  children,
  ...props
}) => (
  <td className={twMerge(clsx('px-4 py-3.5 align-middle', className))} {...props}>
    {children}
  </td>
);
