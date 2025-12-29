import axios from 'axios'
import Cookies from 'js-cookie'
import { AUTH_URLS } from '@/lib/urls'

interface LoginRequest {
  number: string
  password: string
}

interface User {
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
  createdAt: string
  updatedAt: string
}

interface LoginResponse {
  statusCode: number
  data: {
    user: User
    accessToken: string
  }
  message: string
  success: boolean
}

export default async function LoginAdmin(number: string, password: string): Promise<Response> {
  try {
    const response = await axios.post(AUTH_URLS.LOGIN_ADMIN, {
      number,
      password,
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data: LoginResponse = response.data

    if (data.success && data.statusCode === 200) {
      // Store the access token in cookies using js-cookie
      Cookies.set('accessToken', data.data.accessToken, {
        expires: 7, // 7 days
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      })

      return new Response(JSON.stringify({
        success: true,
        message: data.message,
        user: data.data.user,
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      })
    } else {
      return new Response(JSON.stringify({
        success: false,
        message: data.message || 'Login failed',
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      })
    }
  } catch (error) {
    let errorMessage = 'An error occurred during login';
    if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response && error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data) {
      // @ts-ignore
      errorMessage = error.response.data.message || errorMessage;
    }

    return new Response(JSON.stringify({
      success: false,
      message: errorMessage,
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }
}

export function getAccessToken(): string | undefined {
  return Cookies.get('accessToken')
}

export function deleteAccessToken(): void {
  Cookies.remove('accessToken')
}

export function updateAccessToken(token: string): void {
  Cookies.set('accessToken', token, {
    expires: 7, // 7 days
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  })
} 