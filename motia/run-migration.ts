import { initDatabase } from './src/services/database.service'

const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:11003/katagame'

async function runMigration() {
  const db = initDatabase(databaseUrl)
  
  try {
    console.log('🔄 Adding tutorial columns to player_stats...')
    
    // Add columns
    await db.query(`
      ALTER TABLE player_stats 
      ADD COLUMN IF NOT EXISTS tutorial_completed BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS tutorial_step INTEGER DEFAULT 1
    `)
    console.log('✅ Columns added successfully')
    
    // Create index
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_player_stats_tutorial 
      ON player_stats(player_id, tutorial_completed)
    `)
    console.log('✅ Index created successfully')
    
    // Update existing players
    const result = await db.query(`
      UPDATE player_stats 
      SET tutorial_completed = TRUE, 
          tutorial_step = 10
      WHERE player_id IN (
        SELECT id FROM players WHERE level >= 5
      )
    `)
    console.log(`✅ Updated ${result.rowCount} existing player records`)
    
    console.log('🎉 Migration completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

runMigration()
