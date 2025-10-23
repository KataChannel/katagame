/**
 * Main Seed Runner
 * Orchestrates all seed files in proper order
 */

import { seedProvinces } from './provinces.seed'
import { seedHeroes } from './heroes.seed'
import { seedStories } from './stories.seed'
import { seedResourcesAndBuildings } from './resources-buildings.seed'

export async function runAllSeeds() {
  console.log(`
╔════════════════════════════════════════════════════════════════════════════╗
║           🎮 KATAGAME DATABASE INITIALIZATION SEED                         ║
║                                                                            ║
║           Seeding all core data for MVP1 Game                             ║
║           Date: ${new Date().toISOString().split('T')[0]}                              ║
╚════════════════════════════════════════════════════════════════════════════╝
  `)

  try {
    // 1. Seed Provinces (63 Vietnamese provinces)
    console.log('\n📍 STEP 1: Seeding 63 Vietnamese Provinces...')
    await seedProvinces()

    // 2. Seed Resources & Buildings
    console.log('\n💎 STEP 2: Seeding 5 Resources & 6 Buildings...')
    await seedResourcesAndBuildings()

    // 3. Seed Heroes & Pets
    console.log('\n🦸 STEP 3: Seeding Heroes & Pets...')
    await seedHeroes()

    // 4. Seed Stories & Quizzes
    console.log('\n📖 STEP 4: Seeding 30 Stories & 90 Quiz Questions...')
    await seedStories()

    console.log(`
╔════════════════════════════════════════════════════════════════════════════╗
║           ✅ DATABASE INITIALIZATION COMPLETE                             ║
║                                                                            ║
║           Summary:                                                         ║
║           ✅ 63 Provinces with historical eras seeded                      ║
║           ✅ 5 Resources (Gold, Rice, Wood, Stone, Bazan) added           ║
║           ✅ 6 Building Types (Farm, Mine, Storage, etc.) added           ║
║           ✅ 5 Heroes (MVP1) + 18 Heroes (MVP2+) = 23 total               ║
║           ✅ 30 Historical Stories seeded                                  ║
║           ✅ 90 Quiz Questions (3 per story) seeded                        ║
║                                                                            ║
║           Total Data:                                                      ║
║           - 63 Provinces                                                   ║
║           - 5 Resources                                                    ║
║           - 6 Building Types                                               ║
║           - 23 Heroes                                                      ║
║           - 30 Stories                                                     ║
║           - 90 Quiz Questions                                              ║
║                                                                            ║
║           Database ready for game development! 🚀                         ║
╚════════════════════════════════════════════════════════════════════════════╝
    `)

    process.exit(0)
  } catch (error: any) {
    console.error(`

❌ SEED INITIALIZATION FAILED!
Error: ${error.message}

Please check your database connection and try again.
    `)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  runAllSeeds()
}

export default runAllSeeds
