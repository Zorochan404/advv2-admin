import axios from 'axios'
import Cookies from 'js-cookie'
import { COUPON_URLS } from '@/lib/urls'

export interface Coupon {
    id: number
    code: string
    name: string
    description: string
    discountType: 'fixed' | 'percentage'
    discountAmount: number
    minBookingAmount: number
    startDate: string
    endDate: string
    usageLimit: number
    perUserLimit: number
    isActive: boolean
    count: number
    createdAt: string
    updatedAt: string
}

export interface CouponPayload {
    code: string
    name: string
    description: string
    discountType: 'fixed' | 'percentage'
    discountAmount: number
    minBookingAmount: number
    startDate: string
    endDate: string
    usageLimit: number
    perUserLimit: number
}

interface CouponResponse {
    statusCode: number
    data: Coupon
    message: string
    success: boolean
}

interface PaginatedCouponsData {
    data: Coupon[]
    total: number
}

interface CouponsResponse {
    statusCode: number
    data: PaginatedCouponsData
    message: string
    success: boolean
}

export async function getAllCoupons(): Promise<{ success: boolean; data?: Coupon[]; message?: string }> {
    try {
        const accessToken = Cookies.get('accessToken')

        if (!accessToken) {
            return {
                success: false,
                message: 'No access token found'
            }
        }

        const response = await axios.get(COUPON_URLS.GET_ALL_ADMIN, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        })

        const responseData = response.data

        if (responseData.success) {
            return {
                success: true,
                data: responseData.data.data,
                message: responseData.message
            }
        } else {
            return {
                success: false,
                message: responseData.message || 'Failed to fetch coupons'
            }
        }
    } catch (error) {
        console.error('Fetch coupons error:', error)
        return {
            success: false,
            message: 'An error occurred while fetching coupons'
        }
    }
}

export async function getCouponById(id: number): Promise<{ success: boolean; data?: Coupon; message?: string }> {
    try {
        const accessToken = Cookies.get('accessToken')

        if (!accessToken) {
            return {
                success: false,
                message: 'No access token found'
            }
        }

        const response = await axios.get(COUPON_URLS.GET_BY_ID(id), {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        })

        const data: CouponResponse = response.data

        if (data.success) {
            return {
                success: true,
                data: data.data,
                message: data.message
            }
        } else {
            return {
                success: false,
                message: data.message || 'Failed to fetch coupon details'
            }
        }
    } catch (error) {
        console.error('Fetch coupon details error:', error)
        return {
            success: false,
            message: 'An error occurred while fetching coupon details'
        }
    }
}

export async function createCoupon(payload: CouponPayload): Promise<{ success: boolean; data?: Coupon; message?: string }> {
    try {
        const accessToken = Cookies.get('accessToken')

        if (!accessToken) {
            return {
                success: false,
                message: 'No access token found'
            }
        }

        const response = await axios.post(COUPON_URLS.CREATE, payload, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        })

        const data: CouponResponse = response.data

        if (data.success) {
            return {
                success: true,
                data: data.data,
                message: data.message
            }
        } else {
            return {
                success: false,
                message: data.message || 'Failed to create coupon'
            }
        }
    } catch (error) {
        console.error('Create coupon error:', error)
        return {
            success: false,
            message: 'An error occurred while creating coupon'
        }
    }
}

export async function updateCoupon(id: number, payload: Partial<CouponPayload>): Promise<{ success: boolean; data?: Coupon; message?: string }> {
    try {
        const accessToken = Cookies.get('accessToken')

        if (!accessToken) {
            return {
                success: false,
                message: 'No access token found'
            }
        }

        const response = await axios.put(COUPON_URLS.UPDATE(id), payload, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        })

        const data: CouponResponse = response.data

        if (data.success) {
            return {
                success: true,
                data: data.data,
                message: data.message
            }
        } else {
            return {
                success: false,
                message: data.message || 'Failed to update coupon'
            }
        }
    } catch (error) {
        console.error('Update coupon error:', error)
        return {
            success: false,
            message: 'An error occurred while updating coupon'
        }
    }
}

export async function deleteCoupon(id: number): Promise<{ success: boolean; message?: string }> {
    try {
        const accessToken = Cookies.get('accessToken')

        if (!accessToken) {
            return {
                success: false,
                message: 'No access token found'
            }
        }

        const response = await axios.delete(COUPON_URLS.DELETE(id), {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        })

        // Delete usually might not return a body wrapper like "success: boolean" top level if it's 204, but assuming standard here
        // If backend returns standard wrapper:
        if (response.data && response.data.success) {
            return {
                success: true,
                message: 'Coupon deleted successfully'
            }
        }

        // If backend returns generic success or 200 without success wrapper for delete?
        // Assuming standard response wrapper based on create/get
        return {
            success: true,
            message: 'Coupon deleted successfully'
        }
    } catch (error) {
        console.error('Delete coupon error:', error)
        return {
            success: false,
            message: 'An error occurred while deleting coupon'
        }
    }
}
