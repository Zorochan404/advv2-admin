import axios, { AxiosRequestConfig } from 'axios'
import { INTERNAL_API_URLS } from './urls'

export async function getAuthHeaders(): Promise<Record<string, string>> {
  try {
    const response = await axios.get(INTERNAL_API_URLS.AUTH_TOKEN, {
      withCredentials: true,
    })
    
    if (response.data.accessToken) {
      return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${response.data.accessToken}`,
      }
    }
    
    return {
      'Content-Type': 'application/json',
    }
  } catch (error) {
    console.error('Error getting auth headers:', error)
    return {
      'Content-Type': 'application/json',
    }
  }
}

export async function apiRequest(
  url: string, 
  options: AxiosRequestConfig = {}
): Promise<any> {
  const headers = await getAuthHeaders()
  
  return axios({
    url,
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
    withCredentials: true,
  })
} 