import axios from "axios";
import { toast } from "sonner";
import Cookies from "js-cookie";
export type Timestamp = string;
import { BOOKING_URLS } from '@/lib/urls';

export interface Booking {
  id: number
  userId: number
  carId: number
  startDate: Timestamp
  endDate: Timestamp
  price: number
  insurancePrice: number
  totalPrice: number
  extensionPrice: number | null
  extentiontill: Timestamp | null
  extentiontime: number | null
  status: 'pending' | 'advance_paid' | 'confirmed' | 'active' | 'completed' | 'cancelled'
  tool: Array<{ name: string; imageUrl: string }>
  tripStartingCarImages: string[]
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  paymentReferenceId: string | null
  pickupParkingId: number
  dropoffParkingId: number
  createdAt?: Timestamp
  updatedAt?: Timestamp

  // Car object
  car: {
    id: number
    name: string
    maker: string
    year: number
    carnumber: string
    price: number
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
    images: string[]
    mainimg: string[]
    vendorid: number
    parkingid: number | null
    isapproved: boolean
    ispopular: boolean
    insurancePrice: number
    createdAt?: Timestamp
    updatedAt?: Timestamp
  }

  // User object
  user: {
    id: number
    name: string | null
    avatar: string | null
    age: number | null
    number: number
    email: string | null
    aadharNumber: string | null
    aadharimg: string | null
    dlNumber: string | null
    dlimg: string | null
    passportNumber: string | null
    passportimg: string | null
    lat: number | null
    lng: number | null
    locality: string | null
    city: string | null
    state: string | null
    country: string | null
    pincode: string | null
    role: string
    isverified: boolean
    parkingid: number | null
    createdAt?: Timestamp
    updatedAt?: Timestamp
  }

  // Parking details
  pickupParking: {
    id: number
    name: string
    locality: string
    city: string
    state: string
    country: string
    pincode: number
    capacity: number
    mainimg: string
    images: string[]
    lat: number
    lng: number
    createdAt?: Timestamp
    updatedAt?: Timestamp
  }
  dropoffParking: {
    id: number
    name: string
    locality: string
    city: string
    state: string
    country: string
    pincode: number
    capacity: number
    mainimg: string
    images: string[]
    lat: number
    lng: number
    createdAt?: Timestamp
    updatedAt?: Timestamp
  }
}

export const getBookings = async (): Promise<{ success: boolean; data?: Booking[]; message?: string }> => {
  try {
    const accessToken = Cookies.get('accessToken')
    if (!accessToken) {
      return {
        success: false,
        message: 'No access token found'
      }
    }

    console.log("accessToken", accessToken)

    const response = await axios.get(BOOKING_URLS.GET_BOOKINGS, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Bookings API Response:', response.data)

    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      }
    } else {
      return {
        success: false,
        message: response.data.message || 'Failed to fetch bookings'
      }
    }
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return {
      success: false,
      message: 'An error occurred while fetching bookings'
    }
  }
}

export const getBookingById = async (id: number): Promise<{ success: boolean; data?: Booking; message?: string }> => {
  try {
    const accessToken = Cookies.get('accessToken')
    if (!accessToken) {
      return {
        success: false,
        message: 'No access token found'
      }
    }

    const response = await axios.get(`http://localhost:5500/api/v1/admin/bookings/${id}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Get Booking By ID API Response:', response.data)

    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      }
    } else {
      return {
        success: false,
        message: response.data.message || 'Failed to fetch booking'
      }
    }
  } catch (error) {
    console.error('Error fetching booking by id:', error);
    return {
      success: false,
      message: 'An error occurred while fetching booking'
    }
  }
}

export const updateBookingStatus = async (id: number, status: Booking['status']): Promise<{ success: boolean; data?: Booking; message?: string }> => {
  try {
    const accessToken = Cookies.get('accessToken')
    if (!accessToken) {
      return {
        success: false,
        message: 'No access token found'
      }
    }

    const response = await axios.put(BOOKING_URLS.UPDATE_BOOKING_STATUS(id), { status }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      }
    } else {
      return {
        success: false,
        message: response.data.message || 'Failed to update booking'
      }
    }
  } catch (error) {
    console.error('Error updating booking:', error);
    return {
      success: false,
      message: 'An error occurred while updating booking'
    }
  }
}

export const deleteBooking = async (id: number): Promise<{ success: boolean; message?: string }> => {
  try {
    const accessToken = Cookies.get('accessToken')
    if (!accessToken) {
      return {
        success: false,
        message: 'No access token found'
      }
    }

    const response = await axios.delete(BOOKING_URLS.DELETE_BOOKING(id), {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.data.success) {
      return {
        success: true,
        message: response.data.message
      }
    } else {
      return {
        success: false,
        message: response.data.message || 'Failed to delete booking'
      }
    }
  } catch (error) {
    console.error('Error deleting booking:', error);
    return {
      success: false,
      message: 'An error occurred while deleting booking'
    }
  }
}

export const updateBooking = async (booking: Booking): Promise<{ success: boolean; data?: Booking; message?: string }> => {
  try {
    const accessToken = Cookies.get('accessToken')
    if (!accessToken) {
      return {
        success: false,
        message: 'No access token found'
      }
    }

    const response = await axios.put(BOOKING_URLS.UPDATE_BOOKING(booking.id), booking, {
      headers: {
        'Authorization': `${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      }
    } else {
      return {
        success: false,
        message: response.data.message || 'Failed to update booking'
      }
    }
  } catch (error) {
    console.error('Error updating booking:', error);
    return {
      success: false,
      message: 'An error occurred while updating booking'
    }
  }
}