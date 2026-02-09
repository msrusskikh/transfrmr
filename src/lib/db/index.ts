import { Pool, QueryResult, QueryResultRow } from 'pg'

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
  fetch('http://127.0.0.1:7244/ingest/f97c7060-b0a2-4dc0-8148-1507187c7f07',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'db/index.ts:37',message:'query: entry',data:{hasDatabaseUrl:!!process.env.DATABASE_URL,queryType:text.substring(0,20)},timestamp:Date.now(),runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  try {
    const result = await getPool().query<T>(text, params)
    const duration = Date.now() - start
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/f97c7060-b0a2-4dc0-8148-1507187c7f07',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'db/index.ts:44',message:'query: success',data:{duration,rowCount:result.rowCount},timestamp:Date.now(),runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    console.log('Executed query', { text, duration, rows: result.rowCount })
    return result
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/f97c7060-b0a2-4dc0-8148-1507187c7f07',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'db/index.ts:48',message:'query: error',data:{errorType:error?.constructor?.name,errorCode:error?.code,errorMessage:error instanceof Error?error.message:String(error),errorName:error?.name},timestamp:Date.now(),runId:'run1',hypothesisId:'A'})}).catch(()=>{});
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
