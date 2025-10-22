import { Pool, QueryResult } from 'pg'

/**
 * DatabaseService
 * Manages PostgreSQL connections and provides type-safe query methods
 * Handles connection pooling, error handling, and transaction management
 */

export class DatabaseService {
  private pool: Pool

  constructor(connectionString: string) {
    this.pool = new Pool({
      connectionString,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    })

    this.pool.on('error', (err: Error) => {
      console.error('Unexpected error on idle client', err)
    })
  }

  /**
   * Execute a query and return results
   */
  async query<T = any>(
    text: string,
    values?: any[]
  ): Promise<QueryResult<T>> {
    try {
      return await this.pool.query<T>(text, values)
    } catch (error) {
      console.error('Database query error:', {
        query: text,
        error: error instanceof Error ? error.message : String(error),
      })
      throw error
    }
  }

  /**
   * Get a single row by ID
   */
  async getById<T = any>(
    table: string,
    id: string
  ): Promise<T | null> {
    const result = await this.query<T>(
      `SELECT * FROM ${table} WHERE id = $1`,
      [id]
    )
    return result.rows[0] || null
  }

  /**
   * Get multiple rows
   */
  async getMany<T = any>(
    table: string,
    where?: Record<string, any>
  ): Promise<T[]> {
    let query = `SELECT * FROM ${table}`
    const values: any[] = []

    if (where && Object.keys(where).length > 0) {
      const conditions = Object.keys(where).map((key, idx) => {
        values.push(where[key])
        return `${key} = $${idx + 1}`
      })
      query += ` WHERE ${conditions.join(' AND ')}`
    }

    const result = await this.query<T>(query, values)
    return result.rows
  }

  /**
   * Insert a single row
   */
  async insert<T = any>(
    table: string,
    data: Record<string, any>
  ): Promise<T> {
    const keys = Object.keys(data)
    const values = Object.values(data)
    const placeholders = keys.map((_, idx) => `$${idx + 1}`).join(', ')

    const query = `
      INSERT INTO ${table} (${keys.join(', ')})
      VALUES (${placeholders})
      RETURNING *
    `

    const result = await this.query<T>(query, values)
    return result.rows[0]
  }

  /**
   * Update a row by ID
   */
  async update<T = any>(
    table: string,
    id: string,
    data: Record<string, any>
  ): Promise<T> {
    const keys = Object.keys(data)
    const values = Object.values(data)
    values.push(id)

    const updates = keys.map((key, idx) => `${key} = $${idx + 1}`).join(', ')

    const query = `
      UPDATE ${table}
      SET ${updates}, updated_at = NOW()
      WHERE id = $${keys.length + 1}
      RETURNING *
    `

    const result = await this.query<T>(query, values)
    return result.rows[0]
  }

  /**
   * Delete a row by ID
   */
  async delete(table: string, id: string): Promise<boolean> {
    const result = await this.query(
      `DELETE FROM ${table} WHERE id = $1`,
      [id]
    )
    return result.rowCount! > 0
  }

  /**
   * Execute a raw SQL query for complex operations
   */
  async raw<T = any>(sql: string, values?: any[]): Promise<T[]> {
    const result = await this.query<T>(sql, values)
    return result.rows
  }

  /**
   * Start a transaction
   */
  async transaction<T>(
    callback: (client: any) => Promise<T>
  ): Promise<T> {
    const client = await this.pool.connect()
    try {
      await client.query('BEGIN')
      const result = await callback(client)
      await client.query('COMMIT')
      return result
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  }

  /**
   * Close the connection pool
   */
  async close(): Promise<void> {
    await this.pool.end()
  }

  /**
   * Health check
   */
  async health(): Promise<boolean> {
    try {
      const result = await this.query('SELECT NOW()')
      return result.rows.length > 0
    } catch {
      return false
    }
  }
}

// Export singleton instance
let db: DatabaseService | null = null

export function initDatabase(connectionString: string): DatabaseService {
  if (!db) {
    db = new DatabaseService(connectionString)
  }
  return db
}

export function getDatabase(): DatabaseService {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase first.')
  }
  return db
}
