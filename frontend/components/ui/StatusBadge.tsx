import React from 'react';
import { Badge } from './Badge';
import { VehicleStatus, BookingStatus, RentalStatus, PaymentStatus, UserRole } from '@/types';

interface VehicleStatusBadgeProps {
  status: VehicleStatus;
}

export const VehicleStatusBadge: React.FC<VehicleStatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'AVAILABLE':
      return <Badge variant="emerald">Available</Badge>;
    case 'RENTED':
      return <Badge variant="blue">Rented</Badge>;
    case 'MAINTENANCE':
      return <Badge variant="amber">Maintenance</Badge>;
    case 'RESERVED':
      return <Badge variant="purple">Reserved</Badge>;
    case 'OUT_OF_SERVICE':
      return <Badge variant="rose">Out of Service</Badge>;
    default:
      return <Badge variant="slate">{status}</Badge>;
  }
};

interface BookingStatusBadgeProps {
  status: BookingStatus;
}

export const BookingStatusBadge: React.FC<BookingStatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'CONFIRMED':
      return <Badge variant="emerald">Confirmed</Badge>;
    case 'PENDING':
      return <Badge variant="amber">Pending</Badge>;
    case 'COMPLETED':
      return <Badge variant="blue">Completed</Badge>;
    case 'ACTIVE':
      return <Badge variant="emerald">Active</Badge>;
    case 'CANCELLED':
      return <Badge variant="rose">Cancelled</Badge>;
    default:
      return <Badge variant="slate">{status}</Badge>;
  }
};

interface RentalStatusBadgeProps {
  status: RentalStatus;
}

export const RentalStatusBadge: React.FC<RentalStatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'ACTIVE':
      return <Badge variant="emerald">Active</Badge>;
    case 'COMPLETED':
      return <Badge variant="blue">Completed</Badge>;
    case 'OVERDUE':
      return <Badge variant="rose">Overdue</Badge>;
    case 'CANCELLED':
      return <Badge variant="slate">Cancelled</Badge>;
    default:
      return <Badge variant="slate">{status}</Badge>;
  }
};

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
}

export const PaymentStatusBadge: React.FC<PaymentStatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'COMPLETED':
      return <Badge variant="emerald">Paid</Badge>;
    case 'PENDING':
      return <Badge variant="amber">Pending</Badge>;
    case 'FAILED':
      return <Badge variant="rose">Failed</Badge>;
    case 'REFUNDED':
      return <Badge variant="purple">Refunded</Badge>;
    default:
      return <Badge variant="slate">{status}</Badge>;
  }
};

interface RoleBadgeProps {
  role: UserRole;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role }) => {
  switch (role) {
    case 'ADMIN':
      return <Badge variant="rose">Admin</Badge>;
    case 'FLEET_MANAGER':
      return <Badge variant="purple">Fleet Manager</Badge>;
    case 'MAINTENANCE_STAFF':
      return <Badge variant="amber">Maintenance Staff</Badge>;
    case 'CUSTOMER':
      return <Badge variant="blue">Customer</Badge>;
    default:
      return <Badge variant="slate">{role}</Badge>;
  }
};

interface MaintenanceStatusBadgeProps {
  status: string;
}

export const MaintenanceStatusBadge: React.FC<MaintenanceStatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'SCHEDULED':
      return <Badge variant="blue">Scheduled</Badge>;
    case 'IN_PROGRESS':
      return <Badge variant="amber">In Progress</Badge>;
    case 'COMPLETED':
      return <Badge variant="emerald">Completed</Badge>;
    case 'CANCELLED':
      return <Badge variant="slate">Cancelled</Badge>;
    default:
      return <Badge variant="slate">{status}</Badge>;
  }
};


