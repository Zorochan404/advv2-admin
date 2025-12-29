import { apiRequest } from '@/lib/api'
import { CAR_CATALOG_URLS } from '@/lib/urls'

export interface CarCatalogItem {
  id: number
  carName: string
  carMaker: string
  carModelYear: number
  carVendorPrice: string
  carPlatformPrice: string
  transmission: 'manual' | 'automatic'
  fuelType: 'petrol' | 'diesel' | 'electric' | 'hybrid'
  seats: number
  engineCapacity?: string
  mileage?: string
  features?: string
  imageUrl?: string
  isActive: boolean
  category: string
  createdBy?: number
  createdAt: string
  updatedAt: string
}

export interface CarCatalogCreateData {
  carName: string
  carMaker: string
  carModelYear: number
  carVendorPrice: number
  carPlatformPrice: number
  transmission: 'manual' | 'automatic'
  fuelType: 'petrol' | 'diesel' | 'electric' | 'hybrid'
  seats: number
  engineCapacity?: string
  mileage?: string
  features?: string
  imageUrl?: string
  category: string
}

export interface CarCatalogUpdateData extends Partial<CarCatalogCreateData> {
  isActive?: boolean
}

export interface CarCatalogFilters {
  page?: number
  limit?: number
  category?: string
  fuelType?: string
  transmission?: string
  isActive?: boolean
  q?: string // Search query
  seats?: number
}

export interface CarCatalogSearchFilters extends CarCatalogFilters {
  q?: string // Search query for name, maker, model year
}

export interface CarCatalogResponse {
  success: boolean
  data: {
    data: CarCatalogItem[]
    pagination: {
      currentPage: number
      totalPages: number
      totalItems: string
      itemsPerPage: number
      hasNext: boolean
      hasPrev: boolean
      nextPage: number | null
      prevPage: number | null
    }
  }
  message: string
  statusCode: number
}

export interface CarCatalogSingleResponse {
  success: boolean
  data: CarCatalogItem
  message: string
}

export interface CarCategoriesResponse {
  success: boolean
  data: { categories: string[] }
  message: string
}

export interface CarCatalogUsageStats {
  catalog: CarCatalogItem
  usage: {
    totalCars?: number
    availableCars?: number
    bookedCars?: number
    maintenanceCars?: number
    unavailableCars?: number
    totalBookings?: number
    activeBookings?: number
    completedBookings?: number
  }
  recentBookings: Array<{
    id: number
    status: string
    totalPrice: number
    startDate: string
    endDate: string
    user: {
      name: string | null
      number: string
    }
    car: {
      name: string
      number: string
    }
  }>
}

export interface CarCatalogUsageStatsResponse {
  success: boolean
  data: CarCatalogUsageStats
  message: string
}

export interface CategoryWithCounts {
  category: string
  totalTemplates: number
  activeTemplates: number
  inactiveTemplates: number
}

export interface CategoriesWithCountsResponse {
  success: boolean
  data: {
    categories: CategoryWithCounts[]
    summary: {
      totalTemplates: number
      activeTemplates: number
      totalCategories: number
    }
  }
  message: string
}

// Get all car catalog entries with pagination and filtering
export const getAllCarCatalog = async (filters: CarCatalogFilters = {}): Promise<CarCatalogResponse> => {
  const params = new URLSearchParams()
  
  if (filters.page) params.append('page', filters.page.toString())
  if (filters.limit) params.append('limit', filters.limit.toString())
  if (filters.category) params.append('category', filters.category)
  if (filters.fuelType) params.append('fuelType', filters.fuelType)
  if (filters.transmission) params.append('transmission', filters.transmission)
  if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString())

  const url = `${CAR_CATALOG_URLS.GET_ALL}?${params.toString()}`
  const response = await apiRequest(url, { method: 'GET' })
  return response.data
}

// Get car catalog entry by ID
export const getCarCatalogById = async (id: number): Promise<CarCatalogSingleResponse> => {
  const response = await apiRequest(CAR_CATALOG_URLS.GET_BY_ID(id), { method: 'GET' })
  return response.data
}

// Create new car catalog entry
export const createCarCatalog = async (data: CarCatalogCreateData): Promise<CarCatalogSingleResponse> => {
  const response = await apiRequest(CAR_CATALOG_URLS.CREATE, {
    method: 'POST',
    data
  })
  return response.data
}

// Update car catalog entry
export const updateCarCatalog = async (id: number, data: CarCatalogUpdateData): Promise<CarCatalogSingleResponse> => {
  const response = await apiRequest(CAR_CATALOG_URLS.UPDATE(id), {
    method: 'PUT',
    data
  })
  return response.data
}

// Delete car catalog entry
export const deleteCarCatalog = async (id: number): Promise<{ success: boolean; message: string }> => {
  const response = await apiRequest(CAR_CATALOG_URLS.DELETE(id), { method: 'DELETE' })
  return response.data
}

// Get active car catalog entries
export const getActiveCarCatalog = async (): Promise<{ success: boolean; data: CarCatalogItem[]; message: string }> => {
  const response = await apiRequest(CAR_CATALOG_URLS.GET_ACTIVE, { method: 'GET' })
  return response.data
}

// Get all car categories
export const getCarCategories = async (): Promise<CarCategoriesResponse> => {
  const response = await apiRequest(CAR_CATALOG_URLS.GET_CATEGORIES, { method: 'GET' })
  return response.data
}

// Search car catalog with advanced filters
export const searchCarCatalog = async (filters: CarCatalogSearchFilters = {}): Promise<CarCatalogResponse> => {
  const params = new URLSearchParams()
  
  if (filters.page) params.append('page', filters.page.toString())
  if (filters.limit) params.append('limit', filters.limit.toString())
  if (filters.q) params.append('q', filters.q)
  if (filters.category) params.append('category', filters.category)
  if (filters.fuelType) params.append('fuelType', filters.fuelType)
  if (filters.transmission) params.append('transmission', filters.transmission)
  if (filters.seats) params.append('seats', filters.seats.toString())
  if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString())

  const url = `${CAR_CATALOG_URLS.SEARCH}?${params.toString()}`
  const response = await apiRequest(url, { method: 'GET' })
  return response.data
}

// Get car catalog usage statistics
export const getCarCatalogUsageStats = async (id: number): Promise<CarCatalogUsageStatsResponse> => {
  const response = await apiRequest(CAR_CATALOG_URLS.GET_USAGE_STATS(id), { method: 'GET' })
  return response.data
}

// Get categories with template counts
export const getCategoriesWithCounts = async (): Promise<CategoriesWithCountsResponse> => {
  const response = await apiRequest(CAR_CATALOG_URLS.GET_CATEGORIES_WITH_COUNTS, { method: 'GET' })
  return response.data
}
