import { NextRequest, NextResponse } from 'next/server'
import { debugLogServer } from '@/lib/debug-log'

export async function POST(request: NextRequest) {
  try {
    const entry = await request.json()
    
    // Write log entry to file
    await debugLogServer(entry)
    
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    // Silently fail - don't break the app if logging fails
    return NextResponse.json({ success: false }, { status: 200 })
  }
}
