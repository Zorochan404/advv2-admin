 import axios from 'axios'
import Cookies from 'js-cookie'
import { DASHBOARD_URLS } from '@/lib/urls'

export interface DashboardData {
  totalRevenue: number
  activeBookingsCount: number
  totalUsersCount: number
  carAvailability: {
    total: number
    available: number
    rented: number
    maintenance: number
    outOfService: number
    availabilityRate: string
  }
  parkingUtilization: Array<{
    name: string
    cars: number
    capacity: number
    utilization: number
    available: number
  }>
  revenueByCarType: Array<{
    type: string
    revenue: number
    bookings: number
  }>
  chartData: Array<{
    date: string
    revenue: number
    bookings: number
  }>
  recentBookings: Array<{
    id: number
    status: string
    totalPrice: number
    createdAt: string
    car: {
      name: string
      number: string
      id: number
    }
    user: {
      name: string | null
    }
  }>
}

export interface DashboardResponse {
  statusCode: number
  data: DashboardData
  message: string
  success: boolean
}

export async function getDashboardData(): Promise<{ success: boolean; data?: DashboardData; message?: string }> {
  try {
    const accessToken = Cookies.get('accessToken')

    if (!accessToken) {
      return {
        success: false,
        message: 'No access token found'
      }
    }

    const response = await axios.get(DASHBOARD_URLS.GET_DASHBOARD, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    const data: DashboardResponse = response.data

    if (data.success && data.statusCode === 200) {
      return {
        success: true,
        data: data.data,
        message: data.message
      }
    } else {
      return {
        success: false,
        message: data.message || 'Failed to fetch dashboard data'
      }
    }
  } catch (error) {
    console.error('Fetch dashboard data error:', error)
    return {
      success: false,
      message: 'An error occurred while fetching dashboard data'
    }
  }
}
