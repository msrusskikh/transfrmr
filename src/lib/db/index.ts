import { Pool, QueryResult, QueryResultRow } from 'pg'
import { appendFile } from 'fs/promises'
import { join } from 'path'

const LOG_FILE = join(process.cwd(), '.cursor', 'debug.log')
async function logDebug(data: any) {
  try {
    await appendFile(LOG_FILE, JSON.stringify({...data, timestamp: Date.now()}) + '\n')
  } catch {}
}

// Lazy initialization: pool is created only when needed
let pool: Pool | null = null

/**
 * Get or create the database connection pool
 * This is called lazily to avoid errors during build time
 */
function getPool(): Pool {
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set')
    }

    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      // Connection pool settings
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
    })

    // Handle pool errors
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err)
      process.exit(-1)
    })
  }

  return pool
}

/**
 * Execute a query with parameters
 */
export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const start = Date.now()
  // #region agent log
  logDebug({location:'db/index.ts:37',message:'query: entry',data:{hasDatabaseUrl:!!process.env.DATABASE_URL,queryType:text.substring(0,20)},runId:'run1',hypothesisId:'A'});
  // #endregion
  try {
    const result = await getPool().query<T>(text, params)
    const duration = Date.now() - start
    // #region agent log
    logDebug({location:'db/index.ts:44',message:'query: success',data:{duration,rowCount:result.rowCount},runId:'run1',hypothesisId:'A'});
    // #endregion
    console.log('Executed query', { text, duration, rows: result.rowCount })
    return result
  } catch (error: any) {
    // #region agent log
    logDebug({location:'db/index.ts:48',message:'query: error',data:{errorType:error?.constructor?.name,errorCode:error?.code,errorMessage:error instanceof Error?error.message:String(error),errorName:error?.name},runId:'run1',hypothesisId:'A'});
    // #endregion
    console.error('Database query error', { text, error })
    throw error
  }
}

/**
 * Get a client from the pool for transactions
 */
export async function getClient() {
  return getPool().connect()
}

/**
 * Close the connection pool (useful for graceful shutdown)
 */
export async function closePool() {
  if (pool) {
    await pool.end()
    pool = null
  }
}
