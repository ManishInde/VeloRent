// ============================================================
// VeloRent Frontend TypeScript Definitions
// Field names match backend JsonUtils.cpp serialization exactly
// ============================================================

export type UserRole = 'CUSTOMER' | 'ADMIN' | 'FLEET_MANAGER' | 'MAINTENANCE_STAFF';
export type AccountStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  status: AccountStatus;
  phone?: string;
  createdAt?: string;
}

// ---- Customer Profile ----

/** Matches JsonUtils::toJson(const Customer&) exactly */
export interface Customer {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  drivingLicenseNumber: string;
  licenseExpiry: string;
  totalRentals: number;
  riskScore: number;
  accountStatus: AccountStatus;
  role: string;
}

// ---- Vehicle ----

export type VehicleStatus = 'AVAILABLE' | 'RENTED' | 'MAINTENANCE' | 'RESERVED' | 'OUT_OF_SERVICE';
export type FuelType = 'PETROL' | 'DIESEL' | 'ELECTRIC' | 'HYBRID' | 'CNG';
export type TransmissionType = 'MANUAL' | 'AUTOMATIC';

/** Matches JsonUtils::toJson(const Vehicle&) exactly */
export interface Vehicle {
  id: number;
  registrationNumber: string;
  brand: string;
  model: string;
  categoryId: number;
  type: string;               // "CAR" | "BIKE"
  fuelType: FuelType;
  transmission: TransmissionType;
  seats: number;
  baseRentalRate: number;
  odometerKm: number;
  healthScore: number;
  status: VehicleStatus;
  purchaseYear: number;
}

// ---- Vehicle Health ----

export interface VehicleHealth {
  vehicleId: number;
  score: number;
  category: string;           // "EXCELLENT" | "GOOD" | "FAIR" | "POOR" | "CRITICAL"
  factors: string[];
  warnings: string[];
  recommendedAction: string;
}

// ---- Booking ----

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'ACTIVE';

/** Matches JsonUtils::toJson(const Booking&) exactly */
export interface Booking {
  id: number;
  customerId: number;
  vehicleId: number;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: BookingStatus;
  createdAt: string;
}

export interface BookingCreateRequest {
  vehicleId: number;
  startDate: string;          // YYYY-MM-DD
  endDate: string;            // YYYY-MM-DD
}

// ---- Rental ----

export type RentalStatus = 'ACTIVE' | 'COMPLETED' | 'OVERDUE' | 'CANCELLED';

/** Matches JsonUtils::toJson(const Rental&) exactly */
export interface Rental {
  id: number;
  bookingId: number;
  startOdometerKm: number;
  endOdometerKm: number;
  startDateTime: string;
  endDateTime: string;
  status: RentalStatus;
  distanceDrivenKm: number;
}

export interface RentalStartRequest {
  startOdometerKm?: number;
}

export interface RentalReturnRequest {
  returnOdometerKm: number;
}

// ---- Payment ----

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
export type PaymentMethod = 'CARD' | 'UPI' | 'NET_BANKING' | 'CASH' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'LOYALTY_POINTS';
export type PaymentType = 'RENTAL_FEE' | 'BASE_RENT' | 'DAMAGE_CHARGE' | 'LATE_FEE' | 'DEPOSIT' | 'REFUND' | 'ADJUSTMENT';

/** Matches JsonUtils::toJson(const Payment&) exactly */
export interface Payment {
  id: number;
  rentalId: number;
  amount: number;
  method: string;
  type: string;
  status: PaymentStatus;
  transactionId: string;
  createdAt: string;
}

export interface PaymentProcessRequest {
  rentalId: number;
  amount: number;
  method?: string;
  type?: string;
}

// ---- Review ----

/** Matches JsonUtils::toJson(const Review&) exactly */
export interface Review {
  id: number;
  rentalId: number;
  customerId: number;
  vehicleId: number;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ReviewCreateRequest {
  rentalId: number;
  rating: number;
  comment?: string;
}

// ---- Loyalty ----

export type LoyaltyTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';

/** Matches JsonUtils::toJson(const LoyaltyAccount&) exactly */
export interface LoyaltyAccount {
  id: number;
  customerId: number;
  currentPoints: number;
  totalPointsEarned: number;
  tier: LoyaltyTier;
  lastUpdated: string;
}

export interface LoyaltyRedeemRequest {
  points: number;
  rentalSubtotal: number;
}

export interface LoyaltyRedeemResponse extends LoyaltyAccount {
  pointsRedeemed: number;
  discountINR: number;
}

// ---- Notification ----

export type NotificationType =
  | 'BOOKING_CONFIRMED'
  | 'BOOKING_CANCELLED'
  | 'RENTAL_STARTED'
  | 'RENTAL_COMPLETED'
  | 'PAYMENT_RECEIVED'
  | 'DAMAGE_REPORTED'
  | 'MAINTENANCE_ALERT'
  | 'WAITLIST_NOTIFIED'
  | 'LOYALTY_TIER_UPGRADE'
  | 'SYSTEM';

/** Matches JsonUtils::toJson(const Notification&) exactly */
export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

// ---- Pricing ----

/** Matches JsonUtils::toJson(const PricingBreakdown&) exactly */
export interface PricingQuote {
  baseRatePerDay: number;
  durationDays: number;
  subtotal: number;
  demandAdjustment: number;
  categorySurchargeAmount: number;
  durationDiscount: number;
  loyaltyDiscount: number;
  finalPrice: number;
  explanation: string;
}

export interface PricingQuoteRequest {
  vehicleId: number;
  startDate: string;
  endDate: string;
  demandFactor?: number;
  loyaltyTier?: LoyaltyTier;
  categorySurchargePct?: number;
}

// ---- Recommendations ----

export interface Recommendation {
  vehicle: Vehicle;
  finalScore: number;
  explanation: string;
}

export interface RecommendationRequest {
  maxBudget?: number;
  categoryId?: number;
  fuelType?: string;
  transmission?: string;
  seating?: number;
}

// ---- API Response Wrappers ----

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface ApiCollectionResponse<T = unknown> {
  success: boolean;
  data?: T[];
  count?: number;
  error?: {
    code: string;
    message: string;
  };
}

// ---- Auth ----

export interface AuthResponse {
  token: string;
  expiresIn?: number;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// ---- Vehicle Filter ----

export interface VehicleFilterParams {
  search?: string;
  status?: VehicleStatus | '';
  fuelType?: FuelType | '';
  transmission?: TransmissionType | '';
  minPrice?: number;
  maxPrice?: number;
  categoryId?: number;
}

export type SortOption = 'price_asc' | 'price_desc' | 'health_desc' | 'newest';

// ---- Admin & Fleet Intelligence ----

export interface FleetInsight {
  metricName: string;
  metricValue: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'INFO';
  explanation: string;
  suggestedAction: string;
}

export interface FleetAnalyticsReport {
  totalVehicles: number;
  availableVehicles: number;
  reservedVehicles: number;
  rentedVehicles: number;
  maintenanceVehicles: number;
  fleetUtilizationPct: number;
  totalRevenueINR: number;
  totalMaintenanceCostINR: number;
  netEstimatedProfitINR: number;
  averageHealthScore: number;
  insights: FleetInsight[];
}

export interface CustomerRiskResult {
  riskScore: number;
  riskLevel: string;          // "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  contributingFactors: string[];
  recommendedAction: string;
  customerId?: number;
}

export interface VehicleCreateRequest {
  registrationNumber: string;
  brand: string;
  model: string;
  categoryId: number;
  vehicleType: string;         // "CAR" | "BIKE"
  fuelType: FuelType;
  transmission: TransmissionType;
  seats: number;
  baseRentalRate: number;
  purchaseYear: number;
}

export interface VehicleUpdateRequest {
  baseRentalRate: number;
  brand?: string;
  model?: string;
}

export interface NotificationCreateRequest {
  userId: number;
  title: string;
  message: string;
  type?: NotificationType | string;
  referenceId?: number;
}

// ---- Vehicle Allocation Engine ----

export interface VehicleAllocationResult {
  selectedVehicle: Vehicle;
  allocationScore: number;
  explanation: string;
}

export interface VehicleAllocationRequest {
  categoryId?: number;
  maxBudget?: number;
}

// ---- Maintenance Oversight ----

export type MaintenanceStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type MaintenanceType = 'ROUTINE' | 'REPAIR' | 'INSPECTION' | 'EMERGENCY';
export type MaintenancePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface MaintenanceTask {
  id: number;
  vehicleId: number;
  damageReportId: number;
  type: string;
  priority: string;
  status: MaintenanceStatus;
  description: string;
  scheduledDate: string;
  completionDate?: string;
  totalCost: number;
  assignedTo: number;
}

export interface MaintenanceScheduleRequest {
  vehicleId: number;
  type?: string;
  priority?: string;
  description?: string;
  scheduledDate?: string;
  assignedTo?: number;
  damageReportId?: number;
}

export interface MaintenanceCompleteRequest {
  totalCost: number;
  notes?: string;
}



