import axios from "axios";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { Timestamp } from "next/dist/server/lib/cache-handlers/types";
import { PARKING_URLS, USER_URLS, ADMIN_PARKING_URLS, ADMIN_USER_URLS } from '@/lib/urls';

export interface ParkingSpot {
  id?: number;
  name: string;
  locality: string;
  city: string | null;
  state: string | null;
  country: string | null;
  pincode: number | null;
  capacity: number;
  mainimg: string;
  images: string[];
  lat: number;
  lng: number;
  updatedAt?: Timestamp;
  createdAt?: Timestamp;
}


export interface ParkingManager {

  updatedAt?: Timestamp;
  createdAt?: Timestamp;
  id?: number;
  name: string;
  avatar: string;
  age: number | "";
  number: number | "";
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
  pincode: number | "";
  isverified: boolean;
  role: string;
  parkingid: number;
}

export const getParkingSpots = async (): Promise<ParkingSpot[] | null> => {
  try {
    const accessToken = Cookies.get('accessToken')
    if (!accessToken) {
      console.error('No access token found')
      return null
    }

    const response = await axios.get(ADMIN_PARKING_URLS.GET_ALL, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 200 && response.data && response.data.success) {
      // Handle the correct response structure: data.parkings
      if (response.data.data && response.data.data.parkings && Array.isArray(response.data.data.parkings)) {
        return response.data.data.parkings as ParkingSpot[];
      }
      // Fallback for old structure: data is direct array
      else if (Array.isArray(response.data.data)) {
        return response.data.data as ParkingSpot[];
      }
    }
    return null;
  } catch (error) {
    console.error('Error fetching parking spots:', error);
    throw error;
  }
}


export const getParkingSpotById = async (id: number): Promise<any> => {
  try {
    const accessToken = Cookies.get('accessToken')

    if (!accessToken) {
      toast.error('No access token found')
      return
    }
    const response = await axios.get(PARKING_URLS.GET_PARKING_SPOT_BY_ID(id), {
      headers: {
        'Authorization': `${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    if (response.status === 200 && response.data && response.data.data) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error('Error fetching parking spot by id:', error);
    throw error;
  }
}


export const addParkingSpot = async (parkingSpot: ParkingSpot): Promise<any> => {
  try {
    const accessToken = Cookies.get('accessToken')
    if (!accessToken) {
      toast.error('No access token found')
      return
    }
    const response = await axios.post(PARKING_URLS.ADD_PARKING_SPOT, parkingSpot, {
      headers: {
        'Authorization': `${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    if (response.data.statusCode === 201 && response.data && response.data.data) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error('Error adding parking spot:', error);
    throw error;
  }
}

export const updateParkingSpot = async (id: number, parkingSpot: Partial<ParkingSpot>): Promise<any> => {
  try {
    const accessToken = Cookies.get('accessToken')
    if (!accessToken) {
      toast.error('No access token found')
      return
    }
    const response = await axios.put(PARKING_URLS.UPDATE_PARKING_SPOT(id), parkingSpot, {
      headers: {
        'Authorization': `${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    if (response.status === 200 && response.data && response.data.data) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error('Error updating parking spot:', error);
    throw error;
  }
}
export const deleteParkingSpot = async (id: number): Promise<any> => {
  try {
    const accessToken = Cookies.get('accessToken')
    if (!accessToken) {
      toast.error('No access token found')
      return
    }
    const response = await axios.delete(PARKING_URLS.DELETE_PARKING_SPOT(id), {
      headers: {
        'Authorization': `${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    if (response.data.statusCode === 200) {
      return response.data;
    }
    return null;
  } catch (error) {
    console.error('Error deleting parking spot:', error);
    throw error;
  }
}

export const addParkingManager = async (parkingManager: ParkingManager): Promise<any> => {
  try {
    const accessToken = Cookies.get('accessToken')
    if (!accessToken) {
      toast.error('No access token found')
      return
    }
    const response = await axios.post(USER_URLS.ADD_PARKING_INCHARGE, parkingManager, {
      headers: {
        'Authorization': `${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    if (response.status === 200 && response.data && response.data.data) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error('Error adding parking manager:', error);
    throw error;
  }
}

export const searchParkingInchargeByPhone = async (number: { number: string; }): Promise<any> => {
  try {
    const accessToken = Cookies.get('accessToken')
    if (!accessToken) {
      toast.error('No access token found')
      return
    }
    console.log(number)
    const response = await axios.post(USER_URLS.GET_PARKING_INCHARGE_BY_NUMBER,
      number, {
      headers: {
        'Authorization': `${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    if (response.status === 200 && response.data) {
      return response.data;
    }
    return null;
  } catch (error) {
    console.error('Error searching parking incharge by phone:', error);
    throw error;
  }
}

export const assignInchargeToParking = async (parkingid: number, id: number): Promise<any> => {
  try {
    const accessToken = Cookies.get('accessToken')
    if (!accessToken) {
      toast.error('No access token found')
      return
    }
    const response = await axios.post(USER_URLS.ASSIGN_PARKING_INCHARGE, {
      parkingid,
      id
    }, {
      headers: {
        'Authorization': `${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    if (response.status === 200 && response.data && response.data.data) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error('Error assigning incharge to parking:', error);
    throw error;
  }
}


export const getParkingInchargeByParkingId = async (parkingid: number): Promise<any> => {
  try {
    const accessToken = Cookies.get('accessToken')
    if (!accessToken) {
      toast.error('No access token found')
      return
    }
    const response = await axios.get(USER_URLS.GET_PARKING_INCHARGE_BY_PARKING_ID(parkingid), {
      headers: {
        'Authorization': `${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    if (response.status === 200 && response.data && response.data.data) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error('Error getting parking incharge by parking id:', error);
    throw error;
  }
}

export const getParkingInchargeById = async (id: number): Promise<any> => {
  try {
    const accessToken = Cookies.get('accessToken')
    if (!accessToken) {
      toast.error('No access token found')
      return
    }
    const response = await axios.get(USER_URLS.GET_USER_BY_ID(id), {
      headers: {
        'Authorization': `${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    if (response.status === 200 && response.data && response.data.data) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error('Error getting parking incharge by id:', error);
    throw error;
  }
}

export const updateParkingIncharge = async (id: number, parkingIncharge: Partial<ParkingManager>): Promise<any> => {
  try {
    const accessToken = Cookies.get('accessToken')
    if (!accessToken) {
      toast.error('No access token found')
      return
    }
    const response = await axios.put(USER_URLS.UPDATE_USER(id), parkingIncharge, {
      headers: {
        'Authorization': `${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    if (response.status === 200 && response.data && response.data.data) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error('Error updating parking incharge:', error);
    throw error;
  }
}

export const deleteParkingIncharge = async (id: number): Promise<any> => {
  try {
    const accessToken = Cookies.get('accessToken')
    if (!accessToken) {
      toast.error('No access token found')
      return
    }
    const response = await axios.put(USER_URLS.UPDATE_USER(id), { parkingid: null }, {
      headers: {
        'Authorization': `${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    if (response.status === 200 && response.data && response.data.data) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error('Error deleting parking incharge:', error);
    throw error;
  }
}

// New API functions for enhanced parking management

export interface ParkingStats {
  totalSpots: number;
  totalCapacity: number;
  totalCars: number;
  availableCars: number;
  bookedCars: number;
  maintenanceCars: number;
  utilizationRate: number;
  spotsWithManagers: number;
  spotsWithoutManagers: number;
}

export interface SearchParams {
  search?: string;
  city?: string;
  capacity?: number;
  hasManager?: boolean;
  page?: number;
  limit?: number;
}

export interface SearchResult {
  parkingSpots: ParkingSpot[];
  total: number;
  page: number;
  limit: number;
}

export interface UtilizationData {
  date: string;
  utilization: number;
  totalCars: number;
  availableCars: number;
}

export interface AnalyticsData {
  spotId: number;
  spotName: string;
  utilizationHistory: UtilizationData[];
  averageUtilization: number;
  peakUtilization: number;
}

export interface ManagerPerformance {
  id: number;
  name: string;
  parkingSpot: string | {
    id: number;
    name: string;
    locality: string;
    city: string;
    capacity: number;
  };
  carsManaged: number;
  utilizationRate: number;
  lastActivity: string;
}

export const getParkingStats = async (): Promise<ParkingStats | null> => {
  try {
    const accessToken = Cookies.get('accessToken')
    if (!accessToken) {
      toast.error('No access token found')
      return null
    }
    const response = await axios.get(ADMIN_PARKING_URLS.GET_STATS, {
      headers: {
        'Authorization': `${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    if (response.status === 200 && response.data && response.data.success) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error('Error fetching parking stats:', error);
    throw error;
  }
}

export const searchParkingSpots = async (params: SearchParams): Promise<SearchResult | null> => {
  try {
    const accessToken = Cookies.get('accessToken')
    if (!accessToken) {
      toast.error('No access token found')
      return null
    }

    const queryParams = new URLSearchParams();
    if (params.search) queryParams.append('search', params.search);
    if (params.city) queryParams.append('city', params.city);
    if (params.capacity) queryParams.append('capacity', params.capacity.toString());
    if (params.hasManager !== undefined) queryParams.append('hasManager', params.hasManager.toString());
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const url = `${ADMIN_PARKING_URLS.SEARCH}?${queryParams.toString()}`;

    const response = await axios.get(url, {
      headers: {
        'Authorization': `${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    if (response.status === 200 && response.data && response.data.success) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error('Error searching parking spots:', error);
    throw error;
  }
}

export const getParkingAnalytics = async (period: string = 'monthly', spotId?: number): Promise<AnalyticsData | null> => {
  try {
    const accessToken = Cookies.get('accessToken')
    if (!accessToken) {
      toast.error('No access token found')
      return null
    }

    const queryParams = new URLSearchParams();
    queryParams.append('period', period);
    if (spotId) queryParams.append('spotId', spotId.toString());

    const url = `${ADMIN_PARKING_URLS.GET_ANALYTICS}?${queryParams.toString()}`;

    const response = await axios.get(url, {
      headers: {
        'Authorization': `${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    if (response.status === 200 && response.data && response.data.success) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error('Error fetching parking analytics:', error);
    throw error;
  }
}

export const getManagerPerformance = async (): Promise<ManagerPerformance[] | null> => {
  try {
    const accessToken = Cookies.get('accessToken')
    if (!accessToken) {
      toast.error('No access token found')
      return null
    }

    const response = await axios.get(ADMIN_PARKING_URLS.GET_MANAGER_PERFORMANCE, {
      headers: {
        'Authorization': `${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    if (response.status === 200 && response.data && response.data.success) {
      return response.data.data.managers;
    }
    return null;
  } catch (error) {
    console.error('Error fetching manager performance:', error);
    throw error;
  }
}

// New interfaces and functions for user management
export interface User {
  id: number;
  name: string;
  email: string;
  number: string;
  role: string;
  isverified: boolean;
  createdAt: string;
  updatedAt: string;
  // Role-specific fields
  carCount?: number;
  bookingCount?: number;
  parkingInfo?: {
    id: number;
    name: string;
    locality: string;
  };
  carsManaged?: number;
}

export interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  statistics: {
    totalUsers: number;
    userCount: number;
    vendorCount: number;
    adminCount: number;
    parkingInchargeCount: number;
  };
}

export interface AssignRolesRequest {
  userIds: number[];
  role: string;
}

export const getAdminUsers = async (params?: {
  search?: string;
  role?: string;
  limit?: number;
  offset?: number;
}): Promise<UsersResponse | null> => {
  try {
    const accessToken = Cookies.get('accessToken')
    if (!accessToken) {
      toast.error('No access token found')
      return null
    }

    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.role) queryParams.append('role', params.role);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const url = `${ADMIN_USER_URLS.GET_USERS}?${queryParams.toString()}`;

    const response = await axios.get(url, {
      headers: {
        'Authorization': `${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    if (response.status === 200 && response.data && response.data.success) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error('Error fetching admin users:', error);
    throw error;
  }
}

export const assignUserRoles = async (request: AssignRolesRequest): Promise<any> => {
  try {
    const accessToken = Cookies.get('accessToken')
    if (!accessToken) {
      toast.error('No access token found')
      return null
    }

    const response = await axios.post(ADMIN_USER_URLS.ASSIGN_ROLES, request, {
      headers: {
        'Authorization': `${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    if (response.status === 200 && response.data && response.data.success) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error('Error assigning user roles:', error);
    throw error;
  }
}