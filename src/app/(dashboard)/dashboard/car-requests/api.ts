import { apiRequest } from '@/lib/api'
import { CAR_REQUEST_URLS, USER_URLS, PARKING_URLS } from '@/lib/urls'
import { toast } from 'sonner'

export interface CarRequest {
    id: number
    status: 'PENDING_ADMIN_ASSIGNMENT' | 'PARKING_ASSIGNED' | 'APPROVED' | 'DENIED'
    vendorId: number
    vendorName: string
    carCatalogId: number
    carName: string
    createdAt: string
    parkingId: number | null
    parkingName: string | null
}

export interface User {
    id: number
    name: string
    email: string
    phoneNumber: string
    role: string
    isVerified: boolean
    address: string | null
    avatar: string | null
    documents: {
        name: string
        url: string
    }[]
}

export async function getCarRequests(): Promise<CarRequest[]> {
    try {
        const response = await apiRequest(CAR_REQUEST_URLS.GET_ALL, {
            method: 'GET',
        })
        // matches structure: { data: { data: [...] } }
        return response.data?.data?.data || []
    } catch (error) {
        console.error('Error fetching car requests:', error)
        return []
    }
}

export async function assignParking(requestId: number, parkingId: number): Promise<boolean> {
    try {
        await apiRequest(CAR_REQUEST_URLS.ASSIGN_PARKING(requestId), {
            method: 'PUT',
            data: { parkingid: parkingId },
        })
        return true
    } catch (error) {
        console.error('Error assigning parking:', error)
        return false
    }
}

export async function getUserDetails(userId: number): Promise<User | null> {
    try {
        const response = await apiRequest(USER_URLS.GET_USER_BY_ID(userId), {
            method: 'GET'
        })

        const rawData = response.data?.data
        if (!rawData) return null

        const documents = []
        if (rawData.aadharimg) documents.push({ name: 'Aadhar Card', url: rawData.aadharimg })
        if (rawData.dlimg) documents.push({ name: 'Driving License', url: rawData.dlimg })
        if (rawData.passportimg) documents.push({ name: 'Passport', url: rawData.passportimg })

        const addressParts = [
            rawData.locality,
            rawData.city,
            rawData.state,
            rawData.country,
            rawData.pincode
        ].filter(Boolean)

        return {
            id: rawData.id,
            name: rawData.name,
            email: rawData.email,
            phoneNumber: rawData.number?.toString() || '',
            role: rawData.role,
            isVerified: rawData.isverified,
            address: addressParts.length > 0 ? addressParts.join(', ') : null,
            avatar: rawData.avatar,
            documents: documents
        }
    } catch (error) {
        console.error("Error fetching user details", error)
        return null
    }
}

export async function getParkingSpots(): Promise<any[]> {
    try {
        const response = await apiRequest(PARKING_URLS.GET_PARKING_SPOTS, { method: 'GET' })
        console.log(response.data.data)
        // Assuming response.data is the array or response.data.data
        const spots = Array.isArray(response.data.data) ? response.data.data : response.data.data.data || []
        return spots.filter((p: any) => p.isAvailable !== false)
    } catch (error) {
        toast.error("Failed to load parking spots")
        console.error('Error fetching parking spots:', error)
        return []
    }
}
