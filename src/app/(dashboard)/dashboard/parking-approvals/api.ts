import { apiRequest } from '@/lib/api'
import { PARKING_APPROVAL_URLS } from '@/lib/urls'

export interface ParkingRequest {
    id: number
    parkingName: string
    address: string
    city: string
    state: string
    country: string
    pincode: string
    lat: number
    lng: number
    capacity: number
    status: 'pending' | 'approved' | 'rejected'
    createdAt: string
    updated_at: string
    mainimg: string
    images: string[]
    userId: number
    vendor_name: string
    map_location?: string
}

export async function getParkingRequests(): Promise<ParkingRequest[]> {
    try {
        const response = await apiRequest(PARKING_APPROVAL_URLS.GET_ALL, {
            method: 'GET',
        })

        if (Array.isArray(response.data)) return response.data;
        if (Array.isArray(response.data?.data)) return response.data.data;
        if (Array.isArray(response.data?.data?.data)) return response.data.data.data;

        return []
    } catch (error) {
        console.error('Error fetching parking requests:', error)
        return []
    }
}

export async function getParkingRequestDetails(id: number): Promise<ParkingRequest | null> {
    try {
        const response = await apiRequest(PARKING_APPROVAL_URLS.GET_BY_ID(id), {
            method: 'GET',
        })
        console.log(response.data.data)
        return response.data?.data || null
    } catch (error) {
        console.error(`Error fetching details for request ${id}:`, error)
        return null
    }
}

export async function updateRequestStatus(id: number, status: 'approved' | 'rejected'): Promise<boolean> {
    try {
        await apiRequest(PARKING_APPROVAL_URLS.ACTION(id), {
            method: 'PUT',
            data: { status },
        })
        return true
    } catch (error) {
        console.error(`Error updating status for request ${id}:`, error)
        return false
    }
}
