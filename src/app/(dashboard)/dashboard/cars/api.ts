import axios from 'axios'
import Cookies from 'js-cookie'
import { CAR_URLS, ADMIN_CAR_URLS } from '@/lib/urls'

export interface Vendor {
  id: number
  name: string
  avatar: string | null
  email: string
  number: number
}

export interface Parking {
  id: number
  name: string
  mainimg: string | null
  locality: string
  city: string
  capacity: number
}

export interface Car {
  id: number
  name: string
  maker: string
  year: number
  carnumber: string
  price: number
  insurancePrice: number
  discountedprice: number
  color: string
  transmission: string
  fuel: string
  type: string
  seats: number
  rcnumber: string
  rcimg: string
  pollutionimg: string
  insuranceimg: string
  inmaintainance: boolean
  isavailable: boolean
  images: string[] | null
  mainimg: string
  vendorid: number
  parkingid: number | null
  vendor: Vendor
  parking: Parking | null
  isapproved: boolean
  ispopular: boolean
  createdAt: string
  updatedAt: string
}

interface CarsResponse {
  statusCode: number
  data: Car[]
  message: string
  success: boolean
}

interface CarStatsResponse {
  statusCode: number
  data: {
    total: number
    available: number
    rented: number
    maintenance: number
    outOfService: number
  }
  message: string
  success: boolean
}

interface SingleCarResponse {
  statusCode: number
  data: Car
  message: string
  success: boolean
}

interface CarStatusUpdateResponse {
  statusCode: number
  data: {
    id: number
    name: string
    inmaintainance: boolean
    isavailable: boolean
    updatedAt: string
  }
  message: string
  success: boolean
}

interface FetchCarsParams {
  search?: string
  status?: string
  popularOnly?: boolean
  startDate?: string
  endDate?: string
  limit?: number
  offset?: number
  // Advanced filters
  maker?: string
  type?: string
  fuel?: string
  transmission?: string
  seats?: number
  color?: string
  minPrice?: number
  maxPrice?: number
  minYear?: number
  maxYear?: number
  vendorId?: number
  parkingId?: number
}

export async function fetchCars(params: FetchCarsParams = {}): Promise<{ success: boolean; data?: Car[]; message?: string }> {
  try {
    const accessToken = Cookies.get('accessToken')

    if (!accessToken) {
      return {
        success: false,
        message: 'No access token found'
      }
    }

    // Build query parameters
    const queryParams = new URLSearchParams()
    
    if (params.search) queryParams.append('search', params.search)
    if (params.status && params.status !== 'all') queryParams.append('status', params.status)
    if (params.popularOnly) queryParams.append('popularOnly', 'true')
    if (params.startDate) queryParams.append('startDate', params.startDate)
    if (params.endDate) queryParams.append('endDate', params.endDate)
    if (params.limit) queryParams.append('limit', params.limit.toString())
    if (params.offset) queryParams.append('offset', params.offset.toString())

    const url = `${ADMIN_CAR_URLS.GET_CARS}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`

    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    const data: CarsResponse = response.data

    if (data.success && data.statusCode === 200) {

      console.log('Cars data:', data.data)
      return {
        success: true,
        data: data.data,
        message: data.message
      }
    } else {
      return {
        success: false,
        message: data.message || 'Failed to fetch cars'
      }
    }
  } catch (error) {
    console.error('Fetch cars error:', error)
    return {
      success: false,
      message: 'An error occurred while fetching cars'
    }
  }
}

export function getAccessToken(): string | undefined {
  return Cookies.get('accessToken')
}

export function deleteAccessToken(): void {
  Cookies.remove('accessToken')
}

export function updateAccessToken(token: string): void {
  Cookies.set('accessToken', token, {
    expires: 7, // 7 days
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  })
}


// Get car statistics for dashboard
export async function fetchCarStats(): Promise<{ success: boolean; data?: any; message?: string }> {
  try {
    const accessToken = Cookies.get('accessToken')

    if (!accessToken) {
      return {
        success: false,
        message: 'No access token found'
      }
    }

    const response = await axios.get(ADMIN_CAR_URLS.GET_CAR_STATS, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    const data: CarStatsResponse = response.data

    if (data.success && data.statusCode === 200) {
      return {
        success: true,
        data: data.data,
        message: data.message
      }
    } else {
      return {
        success: false,
        message: data.message || 'Failed to fetch car statistics'
      }
    }
  } catch (error) {
    console.error('Fetch car stats error:', error)
    return {
      success: false,
      message: 'An error occurred while fetching car statistics'
    }
  }
}

// Get single car details
export async function fetchCarById(id: number): Promise<{ success: boolean; data?: Car; message?: string }> {
  try {
    const accessToken = Cookies.get('accessToken')

    if (!accessToken) {
      return {
        success: false,
        message: 'No access token found'
      }
    }

    const response = await axios.get(ADMIN_CAR_URLS.GET_CAR_BY_ID(id), {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    const data: SingleCarResponse = response.data

    if (data.success && data.statusCode === 200) {
      return {
        success: true,
        data: data.data,
        message: data.message
      }
    } else {
      return {
        success: false,
        message: data.message || 'Failed to fetch car details'
      }
    }
  } catch (error) {
    console.error('Fetch car by ID error:', error)
    return {
      success: false,
      message: 'An error occurred while fetching car details'
    }
  }
}

// Update car status
export async function updateCarStatus(id: number, status: 'available' | 'rented' | 'maintenance' | 'out_of_service'): Promise<{ success: boolean; data?: any; message?: string }> {
  try {
    const accessToken = Cookies.get('accessToken')

    if (!accessToken) {
      return {
        success: false,
        message: 'No access token found'
      }
    }

    const response = await axios.put(ADMIN_CAR_URLS.UPDATE_CAR_STATUS(id), {
      status
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    const data: CarStatusUpdateResponse = response.data

    if (data.success && data.statusCode === 200) {
      return {
        success: true,
        data: data.data,
        message: data.message
      }
    } else {
      return {
        success: false,
        message: data.message || 'Failed to update car status'
      }
    }
  } catch (error) {
    console.error('Update car status error:', error)
    return {
      success: false,
      message: 'An error occurred while updating car status'
    }
  }
}

// Filter cars by booking date range
export async function filterCarsByBookings(startDate: string, endDate: string): Promise<{ success: boolean; data?: Car[]; message?: string }> {
  try {
    const accessToken = Cookies.get('accessToken')

    if (!accessToken) {
      return {
        success: false,
        message: 'No access token found'
      }
    }

    const response = await axios.post(ADMIN_CAR_URLS.FILTER_BY_BOOKINGS, {
      startDate,
      endDate
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    const data: CarsResponse = response.data

    if (data.success && data.statusCode === 200) {
      return {
        success: true,
        data: data.data,
        message: data.message
      }
    } else {
      return {
        success: false,
        message: data.message || 'Failed to filter cars by bookings'
      }
    }
  } catch (error) {
    console.error('Filter cars by bookings error:', error)
    return {
      success: false,
      message: 'An error occurred while filtering cars by bookings'
    }
  }
}

export async function deleteCar(id: number): Promise<{ success: boolean; message?: string }> {
  try {
    const accessToken = Cookies.get('accessToken')

    if (!accessToken) {
      return {
        success: false,
        message: 'No access token found'
      }
    }

    const response = await axios.delete(ADMIN_CAR_URLS.DELETE_CAR(id), {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    return {
      success: true,
      message: 'Car deleted successfully'
    }
  } catch (error) {
    console.error('Delete car error:', error)
    return {
      success: false,
      message: 'An error occurred while deleting the car'
    }
  }
}