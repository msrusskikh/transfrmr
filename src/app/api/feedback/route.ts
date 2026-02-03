import { NextRequest, NextResponse } from 'next/server'
import { writeFile, readFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { ADMIN_EMAIL } from '@/lib/admin'

interface FeedbackData {
  id: string
  message: string
  context: {
    url: string
    pathname: string
    timestamp: string
  }
  userEmail?: string
  timestamp: string
  status?: 'New' | 'Fixed'
}

const FEEDBACK_FILE = join(process.cwd(), 'data', 'feedback.json')

// Ensure data directory exists
async function ensureDataDirectory() {
  try {
    await mkdir(join(process.cwd(), 'data'), { recursive: true })
  } catch (error) {
    // Directory might already exist
  }
}

// Read existing feedback
async function getFeedback(): Promise<FeedbackData[]> {
  try {
    await ensureDataDirectory()
    const data = await readFile(FEEDBACK_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    return []
  }
}

// Write feedback to file
async function saveFeedback(feedback: FeedbackData[]) {
  await ensureDataDirectory()
  await writeFile(FEEDBACK_FILE, JSON.stringify(feedback, null, 2))
}

// Check if the current user is an admin
async function checkAdminAccess(): Promise<{ authorized: boolean; userEmail?: string }> {
  try {
    const user = await getCurrentUser()
    
    if (!user || !user.email) {
      return { authorized: false }
    }
    
    return {
      authorized: user.email === ADMIN_EMAIL,
      userEmail: user.email
    }
  } catch (error) {
    console.error('Error checking admin access:', error)
    return { authorized: false }
  }
}

export async function POST(request: NextRequest) {
  try {
    const feedbackData: Omit<FeedbackData, 'timestamp' | 'id'> = await request.json()
    
    // Validate required fields
    if (!feedbackData.message || !feedbackData.message.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    if (!feedbackData.context || !feedbackData.context.url || !feedbackData.context.pathname) {
      return NextResponse.json(
        { error: 'Context with URL and pathname is required' },
        { status: 400 }
      )
    }

    // Create feedback object
    const feedback: FeedbackData = {
      ...feedbackData,
      timestamp: new Date().toISOString(),
      id: crypto.randomUUID(),
      status: 'New' // Default status for new feedback
    }

    // Get existing feedback and add new one
    const allFeedback = await getFeedback()
    allFeedback.push(feedback)
    
    // Save to file
    await saveFeedback(allFeedback)

    return NextResponse.json({ success: true, id: feedback.id })
  } catch (error) {
    console.error('Error saving feedback:', error)
    return NextResponse.json(
      { error: 'Failed to save feedback' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Check admin access
    const { authorized } = await checkAdminAccess()
    if (!authorized) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const feedback = await getFeedback()
    return NextResponse.json(feedback)
  } catch (error) {
    console.error('Error fetching feedback:', error)
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Check admin access
    const { authorized } = await checkAdminAccess()
    if (!authorized) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const { id, status } = await request.json()
    
    if (!id) {
      return NextResponse.json(
        { error: 'Feedback ID is required' },
        { status: 400 }
      )
    }

    if (status && status !== 'New' && status !== 'Fixed') {
      return NextResponse.json(
        { error: 'Status must be either "New" or "Fixed"' },
        { status: 400 }
      )
    }

    // Get existing feedback
    const allFeedback = await getFeedback()
    const feedbackIndex = allFeedback.findIndex(f => f.id === id)
    
    if (feedbackIndex === -1) {
      return NextResponse.json(
        { error: 'Feedback not found' },
        { status: 404 }
      )
    }

    // Update the status
    if (status) {
      allFeedback[feedbackIndex].status = status
    }
    
    // Save updated feedback
    await saveFeedback(allFeedback)

    return NextResponse.json({ success: true, feedback: allFeedback[feedbackIndex] })
  } catch (error) {
    console.error('Error updating feedback:', error)
    return NextResponse.json(
      { error: 'Failed to update feedback' },
      { status: 500 }
    )
  }
}
