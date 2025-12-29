/**
 * Centralized URL constants for all API endpoints
 * This file contains all the API endpoints used throughout the application
 * to make URL management easier and more maintainable
 */

// Base URL from environment variable
const BASE_URL = process.env.NEXT_PUBLIC_base_url || 'http://localhost:5500/api/v1'

// Cloudinary API URL
const CLOUDINARY_BASE_URL = 'https://api.cloudinary.com/v1_1'



// Authentication endpoints
export const AUTH_URLS = {
  LOGIN_ADMIN: `${BASE_URL}/auth/loginAdmin`,
} as const

// Dashboard endpoints
export const DASHBOARD_URLS = {
  GET_DASHBOARD: `${BASE_URL}/admin/dashboard`,
  GET_METRICS: `${BASE_URL}/admin/dashboard/metrics`,
  GET_RECENT_BOOKINGS: `${BASE_URL}/admin/dashboard/recent-bookings`,
  GET_REVENUE_TRENDS: `${BASE_URL}/admin/dashboard/revenue-trends`,
  GET_CAR_AVAILABILITY: `${BASE_URL}/admin/dashboard/car-availability`,
  GET_PARKING_UTILIZATION: `${BASE_URL}/admin/dashboard/parking-utilization`,
} as const

// User management endpoints
export const USER_URLS = {
  GET_ALL_USERS: `${BASE_URL}/user/getallusers`,
  GET_USER_BY_ID: (id: number) => `${BASE_URL}/user/getuser/${id}`,
  UPDATE_USER: (id: number) => `${BASE_URL}/user/updateuser/${id}`,
  DELETE_USER: (id: number) => `${BASE_URL}/user/deleteuser/${id}`,
  ADD_VENDOR: `${BASE_URL}/auth/v2/staff/register`,
  GET_USERS_BY_VENDOR: `${BASE_URL}/user/getusersbyvendor`,
  ADD_PARKING_INCHARGE: `${BASE_URL}/user/addparkingincharge `,
  GET_PARKING_INCHARGE_BY_NUMBER: `${BASE_URL}/user/getparkinginchargebynumber`,
  ASSIGN_PARKING_INCHARGE: `${BASE_URL}/user/assignparkingincharge`,
  GET_PARKING_INCHARGE_BY_PARKING_ID: (parkingid: number) => `${BASE_URL}/user/getparkinginchargebyparkingid/${parkingid}`,
} as const

// Admin User management endpoints
export const ADMIN_USER_URLS = {
  GET_USERS: `${BASE_URL}/admin/users`,
  ASSIGN_ROLES: `${BASE_URL}/admin/users/assign-roles`,
} as const

// Car management endpoints
export const CAR_URLS = {
  GET_CARS: `${BASE_URL}/cars/getcar`,
  DELETE_CAR: (id: number) => `${BASE_URL}/cars/delete/${id}`,
} as const

// Admin car management endpoints
export const ADMIN_CAR_URLS = {
  GET_CARS: `${BASE_URL}/admin/cars`,
  GET_CAR_STATS: `${BASE_URL}/admin/cars/stats`,
  GET_CAR_BY_ID: (id: number) => `${BASE_URL}/admin/cars/${id}`,
  UPDATE_CAR_STATUS: (id: number) => `${BASE_URL}/admin/cars/${id}/status`,
  DELETE_CAR: (id: number) => `${BASE_URL}/admin/cars/${id}`,
  FILTER_BY_BOOKINGS: `${BASE_URL}/admin/cars/filter-by-bookings`,
} as const

// Car catalog management endpoints
export const CAR_CATALOG_URLS = {
  GET_ALL: `${BASE_URL}/car-catalog/admin/all`,
  GET_BY_ID: (id: number) => `${BASE_URL}/car-catalog/${id}`,
  CREATE: `${BASE_URL}/car-catalog/create`,
  UPDATE: (id: number) => `${BASE_URL}/car-catalog/${id}`,
  DELETE: (id: number) => `${BASE_URL}/car-catalog/${id}`,
  GET_ACTIVE: `${BASE_URL}/car-catalog/active`,
  GET_CATEGORIES: `${BASE_URL}/car-catalog/categories`,
  SEARCH: `${BASE_URL}/car-catalog/admin/search`,
  GET_USAGE_STATS: (id: number) => `${BASE_URL}/car-catalog/${id}/usage-stats`,
  GET_CATEGORIES_WITH_COUNTS: `${BASE_URL}/car-catalog/categories/with-counts`,
} as const

// Vendor management endpoints
export const VENDOR_URLS = {
  GET_ALL: `${BASE_URL}/admin/vendors`,
  GET_BY_ID: (id: number) => `${BASE_URL}/admin/vendors/${id}`,
  CREATE: `${BASE_URL}/admin/vendors`,
  UPDATE: (id: number) => `${BASE_URL}/admin/vendors/${id}`,
  DELETE: (id: number) => `${BASE_URL}/admin/vendors/${id}`,
  GET_CARS_BY_VENDOR: (id: number) => `${BASE_URL}/admin/vendors/${id}/cars`,
  GET_VENDOR_STATS: `${BASE_URL}/admin/vendors/stats`,
} as const

// Parking management endpoints (admin)
export const ADMIN_PARKING_URLS = {
  GET_ALL: `${BASE_URL}/admin/parkings`,
  GET_STATS: `${BASE_URL}/admin/parking/stats`,
  SEARCH: `${BASE_URL}/admin/parking/search`,
  GET_ANALYTICS: `${BASE_URL}/admin/parking/analytics`,
  GET_MANAGER_PERFORMANCE: `${BASE_URL}/admin/parking/managers/performance`,
} as const

// Parking management endpoints
export const PARKING_URLS = {
  GET_PARKING_SPOTS: `${BASE_URL}/parking/get`,
  GET_PARKING_SPOT_BY_ID: (id: number) => `${BASE_URL}/parking/getbyidadmin/${id}`,
  ADD_PARKING_SPOT: `${BASE_URL}/parking/add`,
  UPDATE_PARKING_SPOT: (id: number) => `${BASE_URL}/parking/update/${id}`,
  DELETE_PARKING_SPOT: (id: number) => `${BASE_URL}/parking/delete/${id}`,
} as const


// Booking management endpoints
export const BOOKING_URLS = {
  GET_BOOKINGS: `${BASE_URL}/booking/get`,
  GET_BOOKING_BY_ID: (id: number) => `${BASE_URL}/booking/b/${id}`,
  UPDATE_BOOKING_STATUS: (id: number) => `${BASE_URL}/booking/updatebooking/${id}`,
  UPDATE_BOOKING: (id: number) => `${BASE_URL}/booking/b/${id}`,
  DELETE_BOOKING: (id: number) => `${BASE_URL}/booking/b/${id}`,
  GET_BOOKING_DETAILS: `${BASE_URL}/booking/bd`,
} as const

// Payment management endpoints
export const PAYMENT_URLS = {
  GET_PAYMENTS: `${BASE_URL}/admin/payments`,
  GET_PAYMENT_BY_ID: (id: number) => `${BASE_URL}/admin/payments/${id}`,
  GET_PAYMENT_STATS: `${BASE_URL}/admin/payments/stats`,
  REFUND_PAYMENT: (id: number) => `${BASE_URL}/admin/payments/${id}/refund`,
  EXPORT_PAYMENTS: `${BASE_URL}/admin/payments/export`,
  GET_PAYMENT_ANALYTICS: `${BASE_URL}/admin/payments/analytics`,
} as const

// Cloudinary endpoints
export const CLOUDINARY_URLS = {
  UPLOAD_IMAGE: (cloudName: string) => `${CLOUDINARY_BASE_URL}/${cloudName}/image/upload`,
} as const

// Internal API endpoints (Next.js API routes)
export const INTERNAL_API_URLS = {
  AUTH_CHECK: '/api/auth/check',
  AUTH_LOGOUT: '/api/auth/logout',
  AUTH_TOKEN: '/api/auth/token',
} as const

// Helper function to get base URL
export const getBaseUrl = (): string => BASE_URL

// Helper function to get Cloudinary URL
export const getCloudinaryUrl = (cloudName: string): string =>
  CLOUDINARY_URLS.UPLOAD_IMAGE(cloudName)
