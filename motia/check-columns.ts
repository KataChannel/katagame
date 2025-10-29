import { initDatabase } from './src/services/database.service'

const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:11003/katagame'

async function checkColumns() {
  const db = initDatabase(databaseUrl)
  
  try {
    const result = await db.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'player_stats'
      ORDER BY ordinal_position
    `)
    
    console.log('📋 Columns in player_stats table:')
    console.table(result.rows)
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

checkColumns()
