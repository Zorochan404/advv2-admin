import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('accessToken')

    if (accessToken) {
      return NextResponse.json({
        accessToken: accessToken.value,
        message: 'Token retrieved successfully',
      })
    } else {
      return NextResponse.json({
        accessToken: null,
        message: 'No access token found',
      }, { status: 401 })
    }
  } catch (error) {
    console.error('Token retrieval error:', error)
    return NextResponse.json({
      accessToken: null,
      message: 'Error retrieving token',
    }, { status: 500 })
  }
} 