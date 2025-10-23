/**
 * Heroes & Pets Seed Data
 * Populates heroes from Vietnamese history with historical eras
 * MVP1: 5 heroes, MVP2-5: expanded to 50+ total
 */

import { Client } from 'pg'

interface HeroData {
  id: string
  name_vietnamese: string
  name_english: string
  era: string
  rarity: 'common' | 'uncommon' | 'epic' | 'legendary'
  role: string
  base_hp: number
  base_attack: number
  base_defense: number
  base_speed: number
  bonus_type: string
  bonus_value: number // percentage
  pet_name: string
  pet_emoji: string
  pet_bonus: number // percentage
  story_day: number
  unlock_requirement: string
  is_premium: boolean
}

// MVP1 - 5 Historical Heroes
const MVP1_HEROES: HeroData[] = [
  {
    id: '777a2be3-4d97-4139-827c-caaf130ebff2',
    name_vietnamese: 'Hùng Vương I',
    name_english: 'Hung Vuong I',
    era: 'Khởi Nguyên Việt (2879 BCE)',
    rarity: 'common',
    role: 'Farmer/Founder',
    base_hp: 100,
    base_attack: 80,
    base_defense: 70,
    base_speed: 60,
    bonus_type: 'Rice Production',
    bonus_value: 15, // +15% Rice production
    pet_name: 'Ancient Phoenix',
    pet_emoji: '🔥',
    pet_bonus: 5,
    story_day: 1,
    unlock_requirement: 'Tutorial Completion',
    is_premium: false,
  },
  {
    id: 'f22eb400-6330-4d4d-9f03-1867211116bb',
    name_vietnamese: 'Lý Thái Tổ',
    name_english: 'Ly Thai To',
    era: 'Thăng Long (1010 CE)',
    rarity: 'common',
    role: 'Strategist/Diplomat',
    base_hp: 110,
    base_attack: 90,
    base_defense: 80,
    base_speed: 70,
    bonus_type: 'Economy',
    bonus_value: 20, // +20% Gold + Rice
    pet_name: 'Palace Dragon',
    pet_emoji: '🐉',
    pet_bonus: 8,
    story_day: 2,
    unlock_requirement: 'Farmer Upgrade Level 5',
    is_premium: false,
  },
  {
    id: 'cfaeff6f-77aa-42e5-8ce3-4b692a186b1f',
    name_vietnamese: 'Lý Thánh Tông',
    name_english: 'Ly Thanh Tong',
    era: 'Medieval Dynasty (1300s CE)',
    rarity: 'uncommon',
    role: 'Scholar/Builder',
    base_hp: 100,
    base_attack: 85,
    base_defense: 85,
    base_speed: 75,
    bonus_type: 'Culture & Construction',
    bonus_value: 15, // +15% Culture, +20% building speed
    pet_name: 'Celestial Crane',
    pet_emoji: '🦢',
    pet_bonus: 10,
    story_day: 5,
    unlock_requirement: 'Development Upgrade Level 5',
    is_premium: false,
  },
  {
    id: 'ee43fc8c-69d5-4beb-98d6-872bbf143328',
    name_vietnamese: 'Trần Hưng Đạo',
    name_english: 'Tran Hung Dao',
    era: 'War & Defense Era (1200s CE)',
    rarity: 'epic',
    role: 'Commander/Warrior',
    base_hp: 150,
    base_attack: 150,
    base_defense: 100,
    base_speed: 80,
    bonus_type: 'Combat & Alliance',
    bonus_value: 30, // +30% Combat Power, +20% Alliance bonuses
    pet_name: 'War Phoenix',
    pet_emoji: '🦅',
    pet_bonus: 15,
    story_day: 3,
    unlock_requirement: 'Resource Upgrade Level 8 OR Premium Pass',
    is_premium: true,
  },
  {
    id: '3262d8f0-5fdb-495c-a73a-19da0a010d19',
    name_vietnamese: 'Lãnh Đạo Hiện Đại',
    name_english: 'Modern Leader',
    era: 'Contemporary Era (1950+)',
    rarity: 'legendary',
    role: 'Developer/Innovator',
    base_hp: 130,
    base_attack: 110,
    base_defense: 90,
    base_speed: 100,
    bonus_type: 'Technology & Efficiency',
    bonus_value: 25, // +25% Tech unlock, +15% Resource efficiency
    pet_name: 'Digital Dragon',
    pet_emoji: '💻',
    pet_bonus: 18,
    story_day: 30,
    unlock_requirement: 'Complete All 30 MVP1 Stories',
    is_premium: false,
  },
]

// MVP2-5 - Additional Heroes (18 more for total 50+)
const MVP2_PLUS_HEROES: HeroData[] = [
  {
    id: '84f5928a-55d1-4b3e-8a5d-6bb0dc3adc26',
    name_vietnamese: 'Hồ Chí Minh',
    name_english: 'Ho Chi Minh',
    era: 'Independence Era (1945 CE)',
    rarity: 'legendary',
    role: 'Leader/Revolutionary',
    base_hp: 140,
    base_attack: 120,
    base_defense: 95,
    base_speed: 85,
    bonus_type: 'National Unity & Resources',
    bonus_value: 35,
    pet_name: 'National Flag Dragon',
    pet_emoji: '🚩',
    pet_bonus: 20,
    story_day: 35,
    unlock_requirement: 'MVP2 Unlock',
    is_premium: false,
  },
  {
    id: 'bb20c809-007e-4abf-b4ef-7b4b4cc38d1f',
    name_vietnamese: 'Trần Khánh Dư',
    name_english: 'Tran Khanh Du',
    era: 'Nguyễn Dynasty (1800s CE)',
    rarity: 'uncommon',
    role: 'Administrator',
    base_hp: 105,
    base_attack: 80,
    base_defense: 95,
    base_speed: 65,
    bonus_type: 'Province Management',
    bonus_value: 18,
    pet_name: 'Royal Tiger',
    pet_emoji: '🐯',
    pet_bonus: 10,
    story_day: 38,
    unlock_requirement: 'MVP2 - 3 Provinces Controlled',
    is_premium: false,
  },
  {
    id: '81fa3bae-1a6e-4ed7-8881-724a5ef5e1be',
    name_vietnamese: 'Nguyễn Du',
    name_english: 'Nguyen Du',
    era: 'Nguyễn Dynasty (1800s CE)',
    rarity: 'uncommon',
    role: 'Poet/Scholar',
    base_hp: 90,
    base_attack: 70,
    base_defense: 75,
    base_speed: 90,
    bonus_type: 'Culture & Story',
    bonus_value: 20,
    pet_name: 'Literary Phoenix',
    pet_emoji: '✍️',
    pet_bonus: 12,
    story_day: 40,
    unlock_requirement: 'MVP2 - 50 Stories Read',
    is_premium: false,
  },
  {
    id: '926345f4-e394-429f-aead-66e3b8940773',
    name_vietnamese: 'Mạc Đăng Dung',
    name_english: 'Mac Dang Dung',
    era: 'Mac Dynasty (1500s CE)',
    rarity: 'epic',
    role: 'Ruler/Strategist',
    base_hp: 130,
    base_attack: 130,
    base_defense: 110,
    base_speed: 70,
    bonus_type: 'Territory Control',
    bonus_value: 28,
    pet_name: 'Royal Dragon',
    pet_emoji: '🐲',
    pet_bonus: 14,
    story_day: 42,
    unlock_requirement: 'MVP2 - Control 3 Provinces',
    is_premium: true,
  },
  {
    id: '63cdc459-c9f7-4ab4-a3fd-46a20b314adb',
    name_vietnamese: 'Võ Nguyên Giáp',
    name_english: 'Vo Nguyen Giap',
    era: 'Modern War Era (1940s-70s)',
    rarity: 'legendary',
    role: 'General/Strategist',
    base_hp: 135,
    base_attack: 140,
    base_defense: 100,
    base_speed: 80,
    bonus_type: 'Military Strategy & War',
    bonus_value: 40,
    pet_name: 'Military Eagle',
    pet_emoji: '🦅',
    pet_bonus: 22,
    story_day: 45,
    unlock_requirement: 'MVP3 Unlock',
    is_premium: false,
  },
  {
    id: '39db2830-8e0e-4f46-ad22-eee9fd2dc2e4',
    name_vietnamese: 'Lưu Công Nhật',
    name_english: 'Luu Cong Nhat',
    era: 'Tây Sơn Era (1700s CE)',
    rarity: 'uncommon',
    role: 'Rebel/Hero',
    base_hp: 115,
    base_attack: 115,
    base_defense: 85,
    base_speed: 85,
    bonus_type: 'Rebellion & Freedom',
    bonus_value: 22,
    pet_name: 'Freedom Phoenix',
    pet_emoji: '🔥',
    pet_bonus: 11,
    story_day: 48,
    unlock_requirement: 'MVP3 - 5 Provinces',
    is_premium: false,
  },
  {
    id: 'c39bb67e-5812-4a75-b538-3beaebb22d3e',
    name_vietnamese: 'Ngô Quyền',
    name_english: 'Ngo Quyen',
    era: 'Independence Era (938 CE)',
    rarity: 'epic',
    role: 'Liberator/King',
    base_hp: 125,
    base_attack: 120,
    base_defense: 105,
    base_speed: 75,
    bonus_type: 'Independence & Freedom',
    bonus_value: 32,
    pet_name: 'Liberation Dragon',
    pet_emoji: '🐉',
    pet_bonus: 16,
    story_day: 50,
    unlock_requirement: 'MVP3 - Freedom Quest',
    is_premium: false,
  },
  {
    id: 'a2144af5-bd08-456e-9593-b4899007dcc2',
    name_vietnamese: 'Trần Nhân Tông',
    name_english: 'Tran Nhan Tong',
    era: 'Trần Dynasty (1300s CE)',
    rarity: 'epic',
    role: 'Emperor/Warrior',
    base_hp: 140,
    base_attack: 135,
    base_defense: 115,
    base_speed: 75,
    bonus_type: 'Imperial Power & Dominion',
    bonus_value: 35,
    pet_name: 'Imperial Phoenix',
    pet_emoji: '🦚',
    pet_bonus: 18,
    story_day: 52,
    unlock_requirement: 'MVP3 - Complete War Quests',
    is_premium: true,
  },
  {
    id: '920c74ff-839e-4dc3-a870-e2f2273148d2',
    name_vietnamese: 'Mông Cao',
    name_english: 'Mong Cao',
    era: 'Ancient Legends (2000 BCE)',
    rarity: 'common',
    role: 'Warrior/Sage',
    base_hp: 100,
    base_attack: 100,
    base_defense: 80,
    base_speed: 70,
    bonus_type: 'Ancient Wisdom',
    bonus_value: 12,
    pet_name: 'Ancient Guardian',
    pet_emoji: '🗿',
    pet_bonus: 6,
    story_day: 55,
    unlock_requirement: 'MVP4 Unlock',
    is_premium: false,
  },
  {
    id: '2ee6a983-ca42-44ae-83e5-662186ee31d9',
    name_vietnamese: 'Lê Thánh Tông',
    name_english: 'Le Thanh Tong',
    era: 'Lê Dynasty (1400s CE)',
    rarity: 'epic',
    role: 'Emperor/Scholar',
    base_hp: 120,
    base_attack: 110,
    base_defense: 120,
    base_speed: 75,
    bonus_type: 'Governance & Culture',
    bonus_value: 30,
    pet_name: 'Scholar Dragon',
    pet_emoji: '📚',
    pet_bonus: 14,
    story_day: 58,
    unlock_requirement: 'MVP4 - Scholar Quest',
    is_premium: false,
  },
]

// Combine all heroes
const ALL_HEROES = [...MVP1_HEROES, ...MVP2_PLUS_HEROES]

export async function seedHeroes() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:11003/katagame',
  })

  try {
    await client.connect()
    console.log('🦸 Seeding heroes and pets data...')

    // Clear existing heroes
    await client.query('TRUNCATE TABLE heroes CASCADE')
    console.log('✅ Cleared existing heroes')

    // Insert all heroes
    for (const hero of ALL_HEROES) {
      const query = `
        INSERT INTO heroes (
          id, name_vietnamese, name_english, era, rarity, role,
          base_hp, base_attack, base_defense, base_speed,
          bonus_type, bonus_value,
          pet_name, pet_emoji, pet_bonus,
          story_day, unlock_requirement, is_premium, is_available
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15, $16, $17, $18, $19
        )
      `

      const is_available = MVP1_HEROES.some((h) => h.id === hero.id) // MVP1 heroes available at start

      await client.query(query, [
        hero.id,
        hero.name_vietnamese,
        hero.name_english,
        hero.era,
        hero.rarity,
        hero.role,
        hero.base_hp,
        hero.base_attack,
        hero.base_defense,
        hero.base_speed,
        hero.bonus_type,
        hero.bonus_value,
        hero.pet_name,
        hero.pet_emoji,
        hero.pet_bonus,
        hero.story_day,
        hero.unlock_requirement,
        hero.is_premium,
        is_available,
      ])
    }

    console.log(`✅ Successfully seeded ${ALL_HEROES.length} heroes`)

    // Verify
    const result = await client.query('SELECT COUNT(*) as count FROM heroes')
    console.log(`✅ Database contains ${result.rows[0].count} heroes`)

    // Show MVP1 heroes
    const mvp1Result = await client.query(
      `SELECT COUNT(*) as count FROM heroes WHERE is_available = true`,
    )
    console.log(`✅ ${mvp1Result.rows[0].count} heroes available in MVP1`)
  } catch (error: any) {
    console.error('❌ Error seeding heroes:', error.message)
    throw error
  } finally {
    await client.end()
  }
}

// Run if called directly
if (require.main === module) {
  seedHeroes().catch(console.error)
}
