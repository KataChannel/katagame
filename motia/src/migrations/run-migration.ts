import { Client } from 'pg'
import * as fs from 'fs'
import * as path from 'path'

async function runMigration() {
  const __dirname = path.dirname(__filename || '')
  const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:11003/katagame'
  })

  try {
    console.log('📌 Connecting to database...')
    await client.connect()
    console.log('✅ Connected!')

    // Read complete MVP1 schema
    const schemaPath = path.join(__dirname, '../../..', 'migrations', 'complete-schema.sql')
    console.log(`📄 Reading MVP1 schema file: ${schemaPath}`)
    
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found: ${schemaPath}`)
    }

    let sql = fs.readFileSync(schemaPath, 'utf-8')

    console.log('🚀 Running MVP1 schema and migrations...')
    await client.query(sql)
    console.log('✅ MVP1 schema completed successfully!')

  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await client.end()
  }
}

runMigration()
