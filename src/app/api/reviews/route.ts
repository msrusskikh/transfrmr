import { NextRequest, NextResponse } from 'next/server'
import { writeFile, readFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { createClient } from '@/lib/supabase/server'
import { ADMIN_EMAIL } from '@/lib/admin'

interface ReviewData {
  rating: number
  review: string
  timestamp: string
  id: string
}

const REVIEWS_FILE = join(process.cwd(), 'data', 'reviews.json')

// Ensure data directory exists
async function ensureDataDirectory() {
  try {
    await mkdir(join(process.cwd(), 'data'), { recursive: true })
  } catch (error) {
    // Directory might already exist
  }
}

// Read existing reviews
async function getReviews(): Promise<ReviewData[]> {
  try {
    await ensureDataDirectory()
    const data = await readFile(REVIEWS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    return []
  }
}

// Write reviews to file
async function saveReviews(reviews: ReviewData[]) {
  await ensureDataDirectory()
  await writeFile(REVIEWS_FILE, JSON.stringify(reviews, null, 2))
}

// Check if the current user is an admin
async function checkAdminAccess(): Promise<{ authorized: boolean; userEmail?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user || !user.email) {
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
    const reviewData: Omit<ReviewData, 'timestamp' | 'id'> = await request.json()
    
    // Validate required fields
    if (!reviewData.rating || !reviewData.review) {
      return NextResponse.json(
        { error: 'Rating and review are required' },
        { status: 400 }
      )
    }

    // Create review object
    const review: ReviewData = {
      ...reviewData,
      timestamp: new Date().toISOString(),
      id: crypto.randomUUID()
    }

    // Get existing reviews and add new one
    const reviews = await getReviews()
    reviews.push(review)
    
    // Save to file
    await saveReviews(reviews)

    return NextResponse.json({ success: true, id: review.id })
  } catch (error) {
    console.error('Error saving review:', error)
    return NextResponse.json(
      { error: 'Failed to save review' },
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

    const reviews = await getReviews()
    return NextResponse.json(reviews)
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}
