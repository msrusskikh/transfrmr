import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const TOKEN_COOKIE_NAME = 'payment_access_token'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(TOKEN_COOKIE_NAME)

    if (token && token.value) {
      return NextResponse.json(
        { valid: true },
        { status: 200 }
      )
    } else {
      return NextResponse.json(
        { valid: false },
        { status: 200 }
      )
    }
  } catch (error) {
    console.error('Error checking access token:', error)
    return NextResponse.json(
      { valid: false },
      { status: 500 }
    )
  }
}
