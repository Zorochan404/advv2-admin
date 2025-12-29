import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('accessToken')

    if (accessToken) {
      return NextResponse.json({
        authenticated: true,
        message: 'User is authenticated',
      })
    } else {
      return NextResponse.json({
        authenticated: false,
        message: 'No access token found',
      })
    }
  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json({
      authenticated: false,
      message: 'Error checking authentication',
    }, { status: 500 })
  }
} 