import { Client } from 'pg'

async function resetDatabase() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:11003/katagame'
  })

  try {
    console.log('📌 Connecting to database...')
    await client.connect()
    console.log('✅ Connected!')

    console.log('🗑️  Dropping all tables...')
    await client.query(`
      DROP TABLE IF EXISTS daily_quest_progress CASCADE;
      DROP TABLE IF EXISTS player_stats CASCADE;
      DROP TABLE IF EXISTS quiz_questions CASCADE;
      DROP TABLE IF EXISTS stories CASCADE;
      DROP TABLE IF EXISTS resources CASCADE;
      DROP TABLE IF EXISTS buildings CASCADE;
      DROP TABLE IF EXISTS player_provinces CASCADE;
      DROP TABLE IF EXISTS provinces CASCADE;
      DROP TABLE IF EXISTS heroes CASCADE;
      DROP TABLE IF EXISTS players CASCADE;
    `)
    console.log('✅ Database reset!')

  } catch (error) {
    console.error('❌ Reset failed:', error)
    process.exit(1)
  } finally {
    await client.end()
  }
}

resetDatabase()
