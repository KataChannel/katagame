import { initDatabase } from './src/services/database.service'

const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:11003/katagame'

async function initPlayerProvinces() {
  const db = initDatabase(databaseUrl)
  
  try {
    console.log('🏛️ Initializing player provinces...')
    
    // Get all players without provinces
    const playersWithoutProvinces = await db.query(`
      SELECT p.id, p.username
      FROM players p
      LEFT JOIN player_provinces pp ON p.id = pp.player_id
      WHERE pp.player_id IS NULL
    `)
    
    console.log(`Found ${playersWithoutProvinces.rows.length} players without provinces`)
    
    if (playersWithoutProvinces.rows.length === 0) {
      console.log('✅ All players already have provinces')
      process.exit(0)
    }
    
    // Get Hà Nội (first province, unlock_order = 1)
    const hanoiProvince = await db.query(`
      SELECT id, name
      FROM provinces
      WHERE unlock_order = 1
      LIMIT 1
    `)
    
    if (hanoiProvince.rows.length === 0) {
      console.error('❌ No province with unlock_order = 1 found!')
      process.exit(1)
    }
    
    const provinceId = hanoiProvince.rows[0].id
    const provinceName = hanoiProvince.rows[0].name
    
    console.log(`\nAssigning province "${provinceName}" (ID: ${provinceId}) to players...`)
    
    // Assign Hà Nội to all players without provinces
    for (const player of playersWithoutProvinces.rows) {
      try {
        await db.query(`
          INSERT INTO player_provinces (player_id, province_id, development_level, resource_level, farmer_level)
          VALUES ($1, $2, 1, 1, 1)
          ON CONFLICT (player_id, province_id) DO NOTHING
        `, [player.id, provinceId])
        
        console.log(`  ✅ ${player.username} → ${provinceName}`)
      } catch (err) {
        console.error(`  ❌ Failed for ${player.username}:`, err)
      }
    }
    
    // Verify
    const verification = await db.query(`
      SELECT p.username, COUNT(pp.province_id) as province_count
      FROM players p
      LEFT JOIN player_provinces pp ON p.id = pp.player_id
      GROUP BY p.id, p.username
    `)
    
    console.log('\n📊 Verification:')
    console.table(verification.rows)
    
    console.log('\n🎉 Province initialization complete!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

initPlayerProvinces()
