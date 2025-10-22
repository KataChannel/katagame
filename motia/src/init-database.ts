/**
 * Global Database Initialization
 * This module ensures the database is initialized once when the Motia server starts
 */

import { initDatabase } from './services/database.service'

const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:11003/katagame'

// Initialize database on module load
try {
  console.log('Initializing database...')
  initDatabase(databaseUrl)
  console.log('✅ Database initialized successfully')
} catch (error: any) {
  console.error('❌ Failed to initialize database:', error.message)
  process.exit(1)
}

export {}
