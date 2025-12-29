import axios from "axios";
import { toast } from "sonner";
import Cookies from "js-cookie";

// Payment interface based on actual API response
export interface Payment {
  id: number
  transactionId: string
  bookingId: number | null
  amount: number
  refundAmount: number
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded'
  method: 'razorpay' | 'stripe' | 'paypal' | 'upi' | 'card' | 'netbanking' | 'wallet' | 'cash'
  gateway: string
  gatewayTransactionId: string | null
  gatewayResponse: string | null
  refundDate: string | null
  refundReason: string | null
  createdAt: string
  updatedAt: string
  
  // Customer information
  customerName: string | null
  customerEmail: string | null
  customerPhone: number | null
  customerAvatar: string | null
  
  // Booking information
  carName: string | null
  pickupLocation: string
  duration: number
  
  // Additional payment details
  currency: string
  fees: number
  netAmount: number
  description: string
  metadata: Record<string, any>
}

export interface PaymentStats {
  totalPayments: number
  totalRevenue: number
  completedPayments: number
  pendingPayments: number
  failedPayments: number
  refundedPayments: number
  averagePayment: number
  revenueByMethod: Record<string, number>
  revenueByStatus: Record<string, number>
  dailyRevenue: Array<{
    date: string
    revenue: number
    count: number
  }>
  monthlyRevenue: Array<{
    month: string
    revenue: number
    count: number
  }>
}

export interface PaymentFilters {
  status?: string
  method?: string
  startDate?: string
  endDate?: string
  minAmount?: number
  maxAmount?: number
  customerId?: number
  bookingId?: number
  gateway?: string
}

// Base URL for payments API
const PAYMENTS_BASE_URL = 'http://localhost:5500/api/v1/admin/payments'

export const getPayments = async (filters?: PaymentFilters): Promise<{ success: boolean; data?: Payment[]; message?: string }> => {
  try {
    const accessToken = Cookies.get('accessToken')
    if (!accessToken) {
      return {
        success: false,
        message: 'No access token found'
      }
    }

    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString())
        }
      })
    }

    const url = params.toString() ? `${PAYMENTS_BASE_URL}?${params}` : PAYMENTS_BASE_URL

    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Payments API Response:', response.data)

    if (response.status === 200 && response.data && response.data.success) {
      return {
        success: true,
        data: response.data.data.data || response.data.data, // Handle nested data structure
        message: response.data.message || 'Payments fetched successfully'
      }
    } else {
      return {
        success: false,
        message: response.data.message || 'Failed to fetch payments'
      }
    }
  } catch (error) {
    console.error('Error fetching payments:', error);
    return {
      success: false,
      message: 'An error occurred while fetching payments'
    }
  }
}

export const getPaymentById = async (id: number): Promise<{ success: boolean; data?: Payment; message?: string }> => {
  try {
    const accessToken = Cookies.get('accessToken')
    if (!accessToken) {
      return {
        success: false,
        message: 'No access token found'
      }
    }

    const response = await axios.get(`${PAYMENTS_BASE_URL}/${id}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 200 && response.data) {
      return {
        success: true,
        data: response.data.data || response.data,
        message: 'Payment fetched successfully'
      }
    } else {
      return {
        success: false,
        message: 'Failed to fetch payment'
      }
    }
  } catch (error) {
    console.error('Error fetching payment by id:', error);
    return {
      success: false,
      message: 'An error occurred while fetching payment'
    }
  }
}

export const getPaymentStats = async (): Promise<{ success: boolean; data?: PaymentStats; message?: string }> => {
  try {
    const accessToken = Cookies.get('accessToken')
    if (!accessToken) {
      return {
        success: false,
        message: 'No access token found'
      }
    }

    const response = await axios.get(`${PAYMENTS_BASE_URL}/stats`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 200 && response.data) {
      return {
        success: true,
        data: response.data.data || response.data,
        message: 'Payment stats fetched successfully'
      }
    } else {
      return {
        success: false,
        message: 'Failed to fetch payment stats'
      }
    }
  } catch (error) {
    console.error('Error fetching payment stats:', error);
    return {
      success: false,
      message: 'An error occurred while fetching payment stats'
    }
  }
}

export const refundPayment = async (paymentId: number, refundAmount: number, reason: string): Promise<{ success: boolean; data?: Payment; message?: string }> => {
  try {
    const accessToken = Cookies.get('accessToken')
    if (!accessToken) {
      return {
        success: false,
        message: 'No access token found'
      }
    }

    const response = await axios.post(`${PAYMENTS_BASE_URL}/${paymentId}/refund`, {
      refundAmount,
      reason
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 200 && response.data) {
      return {
        success: true,
        data: response.data.data || response.data,
        message: 'Payment refunded successfully'
      }
    } else {
      return {
        success: false,
        message: 'Failed to refund payment'
      }
    }
  } catch (error) {
    console.error('Error refunding payment:', error);
    return {
      success: false,
      message: 'An error occurred while refunding payment'
    }
  }
}

export const exportPayments = async (filters?: PaymentFilters, format: 'csv' | 'excel' = 'csv'): Promise<{ success: boolean; data?: string; message?: string }> => {
  try {
    const accessToken = Cookies.get('accessToken')
    if (!accessToken) {
      return {
        success: false,
        message: 'No access token found'
      }
    }

    const params = new URLSearchParams()
    params.append('format', format)
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString())
        }
      })
    }

    const response = await axios.get(`${PAYMENTS_BASE_URL}/export?${params}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 200 && response.data) {
      return {
        success: true,
        data: response.data.data || response.data,
        message: 'Payments exported successfully'
      }
    } else {
      return {
        success: false,
        message: 'Failed to export payments'
      }
    }
  } catch (error) {
    console.error('Error exporting payments:', error);
    return {
      success: false,
      message: 'An error occurred while exporting payments'
    }
  }
}
