'use client'

import axios from 'axios'
import { INTERNAL_API_URLS } from './urls'

export async function checkAuth(): Promise<boolean> {
  try {
    const response = await axios.get(INTERNAL_API_URLS.AUTH_CHECK, {
      withCredentials: true,
    })
    
    return response.data.authenticated
  } catch (error) {
    console.error('Auth check error:', error)
    return false
  }
}

export async function logout(): Promise<void> {
  try {
    await axios.post(INTERNAL_API_URLS.AUTH_LOGOUT, {}, {
      withCredentials: true,
    })
  } catch (error) {
    console.error('Logout error:', error)
  }
} 