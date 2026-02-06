/**
 * Debug logging utility for payment flow debugging
 * Writes NDJSON logs to .cursor/debug.log
 */

const LOG_FILE_PATH = '.cursor/debug.log'

interface DebugLogEntry {
  sessionId: string
  runId: string
  hypothesisId: string
  location: string
  message: string
  data?: Record<string, any>
  timestamp: number
}

/**
 * Client-side: Send log entry via API endpoint
 */
export async function debugLogClient(entry: DebugLogEntry): Promise<void> {
  try {
    await fetch('/api/debug-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    }).catch(() => {
      // Silently fail - don't break the app if logging fails
    })
  } catch {
    // Silently fail
  }
}

/**
 * Server-side: Write log entry directly to file
 */
export async function debugLogServer(entry: DebugLogEntry): Promise<void> {
  try {
    const fs = await import('fs/promises')
    const path = await import('path')
    
    const logDir = path.join(process.cwd(), '.cursor')
    const logFile = path.join(logDir, 'debug.log')
    
    // Ensure .cursor directory exists
    await fs.mkdir(logDir, { recursive: true }).catch(() => {})
    
    // Append NDJSON line to file
    const logLine = JSON.stringify(entry) + '\n'
    await fs.appendFile(logFile, logLine, 'utf-8').catch(() => {})
  } catch {
    // Silently fail - don't break the app if logging fails
  }
}
