import { initDatabase } from './src/services/database.service'

const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:11003/katagame'

async function checkProvinces() {
  const db = initDatabase(databaseUrl)
  
  try {
    console.log('🔍 Checking provinces table...')
    
    // Check if table exists
    const tableCheck = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'provinces'
      );
    `)
    console.log('Table exists:', tableCheck.rows[0].exists)
    
    // Count provinces
    const count = await db.query('SELECT COUNT(*) FROM provinces')
    console.log('Total provinces:', count.rows[0].count)
    
    // Get columns first
    const columns = await db.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'provinces'
      ORDER BY ordinal_position
    `)
    console.log('\nColumns in provinces table:')
    columns.rows.forEach(r => console.log(' -', r.column_name))
    
    // Get sample provinces
    const provinces = await db.query('SELECT * FROM provinces LIMIT 5')
    console.log('\nSample provinces:')
    console.table(provinces.rows)
    
    // Check player_provinces for a sample player
    const playerProvinces = await db.query(`
      SELECT p.id as player_id, p.username, 
             COUNT(pp.province_id) as provinces_count
      FROM players p
      LEFT JOIN player_provinces pp ON p.id = pp.player_id
      GROUP BY p.id, p.username
      LIMIT 5
    `)
    console.log('\nPlayer provinces:')
    console.table(playerProvinces.rows)
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

checkProvinces()
