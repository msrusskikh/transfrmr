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

    // Handle pool errors - DO NOT exit process, just log and handle gracefully
    pool.on('error', (err) => {
      console.error('[DB Pool] Unexpected error on idle client', {
        error: err,
        message: err instanceof Error ? err.message : String(err),
        code: (err as any)?.code,
        poolStats: {
          total: pool?.totalCount,
          idle: pool?.idleCount,
          waiting: pool?.waitingCount,
        }
      })
      // Do NOT call process.exit() - let PM2 handle restarts if needed
      // The pool will automatically retry connections on next query
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
  try {
    const result = await getPool().query<T>(text, params)
    const duration = Date.now() - start
    console.log('Executed query', { text, duration, rows: result.rowCount })
    return result
  } catch (error: any) {
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
