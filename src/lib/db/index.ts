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
    // #region agent log
    logDebug({location:'db/index.ts:19',message:'pool: initializing',data:{hasDatabaseUrl:!!process.env.DATABASE_URL},runId:'run1',hypothesisId:'A'}).catch(()=>{});
    // #endregion
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
    pool.on('error', async (err) => {
      // #region agent log
      await logDebug({location:'db/index.ts:34',message:'pool: error event',data:{errorType:err?.constructor?.name,errorCode:(err as any)?.code,errorMessage:err instanceof Error?err.message:String(err),errorName:(err as any)?.name,poolTotalCount:pool?.totalCount,poolIdleCount:pool?.idleCount,poolWaitingCount:pool?.waitingCount},runId:'run1',hypothesisId:'A'});
      // #endregion
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

    // Monitor pool connection events
    pool.on('connect', async (client) => {
      // #region agent log
      await logDebug({location:'db/index.ts:50',message:'pool: client connected',data:{poolTotalCount:pool?.totalCount,poolIdleCount:pool?.idleCount},runId:'run1',hypothesisId:'B'});
      // #endregion
    })

    pool.on('remove', async () => {
      // #region agent log
      await logDebug({location:'db/index.ts:55',message:'pool: client removed',data:{poolTotalCount:pool?.totalCount,poolIdleCount:pool?.idleCount},runId:'run1',hypothesisId:'B'});
      // #endregion
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
  // #region agent log
  await logDebug({location:'db/index.ts:74',message:'getClient: entry',data:{poolTotalCount:getPool().totalCount,poolIdleCount:getPool().idleCount,poolWaitingCount:getPool().waitingCount},runId:'run1',hypothesisId:'B'});
  // #endregion
  try {
    const client = await getPool().connect()
    // #region agent log
    await logDebug({location:'db/index.ts:77',message:'getClient: success',data:{poolTotalCount:getPool().totalCount,poolIdleCount:getPool().idleCount},runId:'run1',hypothesisId:'B'});
    // #endregion
    return client
  } catch (error: any) {
    // #region agent log
    await logDebug({location:'db/index.ts:81',message:'getClient: error',data:{errorType:error?.constructor?.name,errorCode:error?.code,errorMessage:error instanceof Error?error.message:String(error),poolTotalCount:getPool().totalCount,poolIdleCount:getPool().idleCount,poolWaitingCount:getPool().waitingCount},runId:'run1',hypothesisId:'B'});
    // #endregion
    throw error
  }
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
