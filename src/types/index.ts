// User types
export interface User {
  id: string
  email: string
  name: string
  phone: string
  role: 'admin' | 'user'
  createdAt: Date
  isActive: boolean
  avatar?: string
  location?: {
    lat: number
    lng: number
    address: string
  }
}

// Car types
export interface Car {
  id: string
  uniqueId: string // Unique identifier for easy searching (ADV-001 format)
  make: string
  model: string
  year: number
  licensePlate: string // Indian format (e.g., MH 01 AB 1234)
  registrationCertificate: string
  pollutionCertificate: string
  insuranceDetails: {
    provider: string
    policyNumber: string
    expiryDate: Date
  }
  maintenanceDate: Date
  ownerName: string // Personal owner name
  type: 'sedan' | 'suv' | 'hatchback' | 'convertible' | 'truck'
  status: 'available' | 'rented' | 'maintenance' | 'out_of_service'
  pricePerDay: number // Price in INR
  features: string[]
  images: string[]
  location?: {
    lat: number
    lng: number
    address: string
  }
  parkingSpotId?: string
  createdAt: Date
  updatedAt: Date
}



// Booking types
export interface Booking {
  id: string
  userId: string
  user: User
  carId: string
  car: Car
  parkingSpotId: string
  // parkingSpot: ParkingSpot
  startDate: Date
  endDate: Date
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled'
  totalAmount: number
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  pickupLocation: {
    lat: number
    lng: number
    address: string
  }
  dropoffLocation: {
    lat: number
    lng: number
    address: string
  }
  notes?: string
  createdAt: Date
  updatedAt: Date
}

// Analytics types
export interface SalesData {
  period: 'day' | 'week' | 'month'
  data: {
    date: string
    revenue: number
    bookings: number
  }[]
  total: {
    revenue: number
    bookings: number
  }
}

export interface DashboardStats {
  totalCars: number
  totalUsers: number
  activeBookings: number
  totalRevenue: number
  todayRevenue: number
  weeklyRevenue: number
  monthlyRevenue: number
  availableCars: number
  carsInMaintenance: number
  pendingBookings: number
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// Filter types
export interface CarFilters {
  status?: Car['status']
  type?: Car['type']
  parkingSpotId?: string
  search?: string
}

export interface BookingFilters {
  status?: Booking['status']
  userId?: string
  carId?: string
  parkingSpotId?: string
  dateRange?: {
    start: Date
    end: Date
  }
}

export interface UserFilters {
  role?: User['role']
  isActive?: boolean
  search?: string
}

// Form types
export interface LoginForm {
  email: string
  password: string
}

export interface CarForm {
  make: string
  model: string
  year: number
  licensePlate: string
  registrationCertificate: string
  pollutionCertificate: string
  insuranceProvider: string
  insurancePolicyNumber: string
  insuranceExpiryDate: Date
  maintenanceDate: Date
  ownerName: string
  type: Car['type']
  pricePerDay: number
  features: string[]
  parkingSpotId?: string
}

export interface ParkingSpotForm {
  name: string
  address: string
  location: {
    lat: number
    lng: number
  }
  capacity: number
  hourlyRate: number
  dailyRate: number
  amenities: string[]
  operatingHours: {
    open: string
    close: string
  }
}

// Navigation types
export interface NavItem {
  title: string
  href: string
  icon: string
  badge?: number
  children?: NavItem[]
}
