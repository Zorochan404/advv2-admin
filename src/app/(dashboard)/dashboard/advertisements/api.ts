import axios from "axios";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { ADVERTISEMENT_URLS } from '@/lib/urls';

export type AdType = 'banner' | 'video' | 'popup';

export interface Advertisement {
    id: number;
    title: string;
    description: string;
    imageUrl: string;
    videoUrl: string | null;
    linkUrl: string;
    adType: AdType;
    status: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
    priority: number;
    viewCount: number;
    clickCount: number;
    targetAudience: string;
    location: string;
    createdBy: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateAdvertisementPayload {
    title: string;
    description: string;
    imageUrl: string;
    linkUrl: string;
    adType: AdType;
    startDate: string;
    endDate: string;
    isActive: boolean;
}

export interface UpdateAdvertisementPayload extends Partial<CreateAdvertisementPayload> { }

export const getAdvertisements = async (page: number = 1, limit: number = 10) => {
    try {
        const accessToken = Cookies.get('accessToken');
        if (!accessToken) throw new Error('No access token found');

        const response = await axios.get(ADVERTISEMENT_URLS.GET_ALL, {
            params: { page, limit },
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        if (response.data.success) {
            // The API returns data wrapped in a data object which contains advertisements and pagination
            const { advertisements, pagination } = response.data.data;
            return {
                success: true,
                data: advertisements,
                pagination: pagination,
                message: response.data.message
            };
        }
        return { success: false, message: response.data.message || 'Failed to fetch advertisements' };
    } catch (error: any) {
        console.error('Error fetching advertisements:', error);
        return { success: false, message: error.response?.data?.message || 'An error occurred' };
    }
};

export const getAdvertisementById = async (id: number) => {
    try {
        const accessToken = Cookies.get('accessToken');
        if (!accessToken) throw new Error('No access token found');

        const response = await axios.get(ADVERTISEMENT_URLS.GET_BY_ID(id), {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        if (response.data.success) {
            return { success: true, data: response.data.data };
        }
        return { success: false, message: response.data.message };
    } catch (error: any) {
        console.error('Error fetching advertisement:', error);
        return { success: false, message: error.response?.data?.message || 'An error occurred' };
    }
};

export const createAdvertisement = async (payload: CreateAdvertisementPayload) => {
    try {
        const accessToken = Cookies.get('accessToken');
        if (!accessToken) throw new Error('No access token found');

        const response = await axios.post(ADVERTISEMENT_URLS.CREATE, payload, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (response.data.success) {
            return { success: true, data: response.data.data, message: "Advertisement created successfully" };
        }
        return { success: false, message: response.data.message };
    } catch (error: any) {
        console.error('Error creating advertisement:', error);
        return { success: false, message: error.response?.data?.message || 'An error occurred' };
    }
};

export const updateAdvertisement = async (id: number, payload: UpdateAdvertisementPayload) => {
    try {
        const accessToken = Cookies.get('accessToken');
        if (!accessToken) throw new Error('No access token found');

        const response = await axios.put(ADVERTISEMENT_URLS.UPDATE(id), payload, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (response.data.success) {
            return { success: true, data: response.data.data, message: "Advertisement updated successfully" };
        }
        return { success: false, message: response.data.message };
    } catch (error: any) {
        console.error('Error updating advertisement:', error);
        return { success: false, message: error.response?.data?.message || 'An error occurred' };
    }
};

export const deleteAdvertisement = async (id: number) => {
    try {
        const accessToken = Cookies.get('accessToken');
        if (!accessToken) throw new Error('No access token found');

        const response = await axios.delete(ADVERTISEMENT_URLS.DELETE(id), {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        if (response.data.success) {
            return { success: true, message: "Advertisement deleted successfully" };
        }
        return { success: false, message: response.data.message };
    } catch (error: any) {
        console.error('Error deleting advertisement:', error);
        return { success: false, message: error.response?.data?.message || 'An error occurred' };
    }
};
