import axios from "axios";
import { toast } from "sonner";
import Cookies from "js-cookie";
import router from "next/router";
import { Timestamp } from "next/dist/server/lib/cache-handlers/types";
import { USER_URLS, VENDOR_URLS } from '@/lib/urls';


export interface Car {
    id: number;
    name: string;
    number: string;
    price: number;
    isavailable: boolean;
    inmaintainance: boolean;
    status: string;
    images: string[];
    createdAt: string;
    updatedAt: string;
}

export interface VendorFormData {
    updatedAt?: string;
    createdAt?: string;
    id?: number;
    name: string;
    avatar: string;
    age: number | "";
    number: string | "";
    email: string;
    password: string;
    aadharNumber: string;
    aadharimg: string;
    dlNumber: string;
    dlimg: string;
    passportNumber: string;
    passportimg: string;
    locality: string;
    city: string;
    state: string;
    country: string;
    pincode: string | "";
    isverified: boolean;
    role: string;
    // New fields from the actual API response
    carCount: number;
    cars: Car[];
    // Additional fields that might be returned from the new API
    totalCars?: number;
    activeCars?: number;
    totalBookings?: number;
    totalRevenue?: number;
    averageRating?: number;
    joinDate?: string;
    lastActive?: string;
    status?: string;
    verificationStatus?: string;
    documentsVerified?: boolean;
    bankDetails?: {
        accountNumber?: string;
        ifscCode?: string;
        bankName?: string;
    };
    businessDetails?: {
        businessName?: string;
        businessType?: string;
        gstNumber?: string;
        panNumber?: string;
    };
}

export const addVendor = async (vendor: VendorFormData) => {

    try {
        const accessToken = Cookies.get('accessToken')

        if (!accessToken) {
            toast.error('No access token found')
            return
        }

        const response = await axios.post(USER_URLS.ADD_VENDOR, vendor, {
            headers: {
                'Authorization': `${accessToken}`,
                'Content-Type': 'application/json',
            },
        });
        if (response.data.success) {
            return response.data.data;

        } else {
            console.error(response.data.message || 'Failed to add vendor')
            return null;
        }
    } catch (error) {
        console.error('Error adding vendor:', error);
        toast.error('Failed to add vendor');
        return null;
    }
};

export const getVendors = async () => {
    try {
        const accessToken = Cookies.get('accessToken')
        if (!accessToken) {
            toast.error('No access token found')
            return []
        }
        const response = await axios.get(USER_URLS.GET_USERS_BY_VENDOR, {
            headers: {
                'Authorization': `${accessToken}`,
            },
        });
        console.log('Full API response:', response.data);
        console.log('Vendors data:', response.data.data);

        // The API returns {data: {data: Array, total: number}}
        // So we need to access response.data.data.data to get the actual array
        if (response.data.data && Array.isArray(response.data.data.data)) {
            return response.data.data.data;
        } else if (Array.isArray(response.data.data)) {
            // Fallback if structure is different
            return response.data.data;
        }

        return [];
    } catch (error) {
        console.error('Error getting vendors:', error);
        toast.error('Failed to get vendors');
        return [];
    }
}


export const deleteVendor = async (id: number) => {
    try {
        const accessToken = Cookies.get('accessToken')
        if (!accessToken) {
            toast.error('No access token found')
            return false
        }
        const response = await axios.delete(USER_URLS.DELETE_USER(id), {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });
        if (response.data.success) {
            console.log('Vendor deleted successfully!')
            return true;
        } else {
            console.error(response.data.message || 'Failed to delete vendor')
            return false;
        }
    } catch (error) {
        console.error('Error deleting vendor:', error);
        toast.error('Failed to delete vendor');
        return false;
    }
}

export const getVendorById = async (id: number) => {
    try {
        const accessToken = Cookies.get('accessToken')
        if (!accessToken) {
            toast.error('No access token found')
            return
        }
        const response = await axios.get(USER_URLS.GET_USER_BY_ID(id), {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (response.data.success) {
            return response.data.data;
        } else {
            console.error(response.data.message || 'Failed to get vendor by id')
            return null;
        }
    } catch (error) {
        console.error('Error getting vendor by id:', error);
        toast.error('Failed to get vendor by id');
        return null;
    }
}

export const updateVendor = async (id: number, vendor: VendorFormData) => {
    try {
        const accessToken = Cookies.get('accessToken')
        if (!accessToken) {
            toast.error('No access token found')
            return
        }
        const response = await axios.put(USER_URLS.UPDATE_USER(id), vendor, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });
        if (response.data.success) {
            return response.data.data;
        } else {
            console.error(response.data.message || 'Failed to update vendor')
            return null;
        }
    } catch (error) {
        console.error('Error updating vendor:', error);
        toast.error('Failed to update vendor');
        return null;
    }
}

// New vendor management functions using admin endpoints
export const getVendorsAdmin = async (params?: { search?: string; limit?: number; offset?: number }): Promise<VendorFormData[] | null> => {
    try {
        const accessToken = Cookies.get('accessToken')
        if (!accessToken) {
            toast.error('No access token found')
            return null
        }

        const queryParams = new URLSearchParams()
        if (params?.search) queryParams.append('search', params.search)
        if (params?.limit) queryParams.append('limit', params.limit.toString())
        if (params?.offset) queryParams.append('offset', params.offset.toString())

        const url = queryParams.toString() ? `${VENDOR_URLS.GET_ALL}?${queryParams}` : VENDOR_URLS.GET_ALL

        const response = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (response.data.success) {
            // Handle the nested data structure: response.data.data.vendors
            const vendors = response.data.data.vendors || response.data.data;
            console.log('getVendorsAdmin - Raw response:', response.data);
            console.log('getVendorsAdmin - Extracted vendors:', vendors);
            return vendors;
        } else {
            console.error(response.data.message || 'Failed to get vendors')
            return null;
        }
    } catch (error) {
        console.error('Error getting vendors:', error);
        toast.error('Failed to get vendors');
        return null;
    }
}

export const getVendorByIdAdmin = async (id: number): Promise<VendorFormData | null> => {
    try {
        const accessToken = Cookies.get('accessToken')
        if (!accessToken) {
            toast.error('No access token found')
            return null
        }
        const response = await axios.get(VENDOR_URLS.GET_BY_ID(id), {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (response.data.success) {
            return response.data.data;
        } else {
            console.error(response.data.message || 'Failed to get vendor')
            return null;
        }
    } catch (error) {
        console.error('Error getting vendor:', error);
        toast.error('Failed to get vendor');
        return null;
    }
}

export const createVendorAdmin = async (vendor: VendorFormData): Promise<VendorFormData | null> => {
    try {
        const accessToken = Cookies.get('accessToken')
        if (!accessToken) {
            toast.error('No access token found')
            return null
        }
        const response = await axios.post(VENDOR_URLS.CREATE, vendor, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (response.data.success) {
            return response.data.data;
        } else {
            console.error(response.data.message || 'Failed to create vendor')
            return null;
        }
    } catch (error) {
        console.error('Error creating vendor:', error);
        toast.error('Failed to create vendor');
        return null;
    }
}

export const updateVendorAdmin = async (id: number, vendor: VendorFormData): Promise<VendorFormData | null> => {
    try {
        const accessToken = Cookies.get('accessToken')
        if (!accessToken) {
            toast.error('No access token found')
            return null
        }
        const response = await axios.put(USER_URLS.UPDATE_USER(id), vendor, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (response.data.success) {
            return response.data.data;
        } else {
            console.error(response.data.message || 'Failed to update vendor')
            return null;
        }
    } catch (error) {
        console.error('Error updating vendor:', error);
        toast.error('Failed to update vendor');
        return null;
    }
}

export const deleteVendorAdmin = async (id: number): Promise<boolean> => {
    try {
        const accessToken = Cookies.get('accessToken')
        if (!accessToken) {
            toast.error('No access token found')
            return false
        }
        const response = await axios.delete(VENDOR_URLS.DELETE(id), {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (response.data.success) {
            return true;
        } else {
            console.error(response.data.message || 'Failed to delete vendor')
            return false;
        }
    } catch (error) {
        console.error('Error deleting vendor:', error);
        toast.error('Failed to delete vendor');
        return false;
    }
}

export const getCarsByVendorId = async (vendorId: number): Promise<any[] | null> => {
    try {
        const accessToken = Cookies.get('accessToken')
        if (!accessToken) {
            toast.error('No access token found')
            return null
        }
        const response = await axios.get(VENDOR_URLS.GET_CARS_BY_VENDOR(vendorId), {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (response.data.success) {
            return response.data.data;
        } else {
            console.error(response.data.message || 'Failed to get vendor cars')
            return null;
        }
    } catch (error) {
        console.error('Error getting vendor cars:', error);
        toast.error('Failed to get vendor cars');
        return null;
    }
}

export const getVendorStats = async (): Promise<any | null> => {
    try {
        const accessToken = Cookies.get('accessToken')
        if (!accessToken) {
            toast.error('No access token found')
            return null
        }
        const response = await axios.get(VENDOR_URLS.GET_VENDOR_STATS, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (response.data.success) {
            return response.data.data;
        } else {
            console.error(response.data.message || 'Failed to get vendor stats')
            return null;
        }
    } catch (error) {
        console.error('Error getting vendor stats:', error);
        toast.error('Failed to get vendor stats');
        return null;
    }
}

// Cars API functions
export const getCarsByVendor = async (vendorId: number, params?: {
    search?: string;
    status?: string;
    limit?: number;
    offset?: number;
}): Promise<any[] | null> => {
    try {
        const accessToken = Cookies.get('accessToken')
        if (!accessToken) {
            toast.error('No access token found')
            return null
        }

        const queryParams = new URLSearchParams()
        queryParams.append('vendorId', vendorId.toString())
        if (params?.search) queryParams.append('search', params.search)
        if (params?.status && params.status !== 'all') queryParams.append('status', params.status)
        if (params?.limit) queryParams.append('limit', params.limit.toString())
        if (params?.offset) queryParams.append('offset', params.offset.toString())

        const url = `http://localhost:5500/api/v1/admin/cars?${queryParams}`

        const response = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (response.data.success) {
            return response.data.data;
        } else {
            console.error(response.data.message || 'Failed to get vendor cars')
            return null;
        }
    } catch (error) {
        console.error('Error getting vendor cars:', error);
        toast.error('Failed to get vendor cars');
        return null;
    }
}