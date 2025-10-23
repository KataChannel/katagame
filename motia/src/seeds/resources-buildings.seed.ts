/**
 * Resources & Buildings Seed Data
 * MVP1: 5 elemental resources + 6 building types
 */

import { Client } from 'pg'

interface Resource {
  id: string
  name_vietnamese: string
  name_english: string
  emoji: string
  element_type: 'gold' | 'rice' | 'wood' | 'stone' | 'bazan'
  description: string
  uses: string[]
  base_generation_rate: number // Per 30 seconds
  base_storage_capacity: number
  value_points: number
}

interface Building {
  id: string
  name_vietnamese: string
  name_english: string
  description: string
  building_type:
    | 'farm'
    | 'mine'
    | 'storage'
    | 'market'
    | 'temple'
    | 'barracks'
  produces_resource?: string // Resource ID it produces
  base_cost: {
    gold: number
    rice: number
    wood: number
    stone: number
    bazan: number
  }
  construction_time_seconds: number
  max_level: number
  level_1_production?: number
  level_1_bonus?: number
}

// 5 Elemental Resources (MVP1)
const RESOURCES: Resource[] = [
  {
    id: 'resource_gold',
    name_vietnamese: 'Vàng',
    name_english: 'Gold',
    emoji: '🟡',
    element_type: 'gold',
    description: 'Tài nguyên quý giá dùng cho kinh tế và thương mại',
    uses: [
      'Xây dựng',
      'Nâng cấp',
      'Giao dịch thương mại',
      'Quân sự',
      'Trang phục',
      'Công trình công cộng',
    ],
    base_generation_rate: 1,
    base_storage_capacity: 500,
    value_points: 10,
  },
  {
    id: 'resource_rice',
    name_vietnamese: 'Lúa',
    name_english: 'Rice',
    emoji: '🟢',
    element_type: 'rice',
    description: 'Tài nguyên sinh mệnh của nông thôn Việt, nguồn thức ăn',
    uses: [
      'Nuôi dân số',
      'Ăn uống',
      'Nông nghiệp',
      'Thương mại',
      'Lễ tế',
      'Dự trữ thực phẩm',
    ],
    base_generation_rate: 1.2,
    base_storage_capacity: 600,
    value_points: 8,
  },
  {
    id: 'resource_wood',
    name_vietnamese: 'Gỗ',
    name_english: 'Wood',
    emoji: '🟫',
    element_type: 'wood',
    description: 'Tài nguyên xây dựng từ rừng, dùng cho công trình kiến trúc',
    uses: [
      'Xây dựng nhà cửa',
      'Đóng tàu',
      'Làm công cụ',
      'Nhiên liệu',
      'Đủ đồ nội thất',
      'Công trình công cộng',
    ],
    base_generation_rate: 0.8,
    base_storage_capacity: 400,
    value_points: 7,
  },
  {
    id: 'resource_stone',
    name_vietnamese: 'Đá',
    name_english: 'Stone',
    emoji: '🪨',
    element_type: 'stone',
    description: 'Tài nguyên vững chắc dùng cho phòng thủ và kiến trúc',
    uses: [
      'Xây dựng thành lũy',
      'Xây dựng pháo đài',
      'Đường giao thông',
      'Cầu cống',
      'Trang trí',
      'Công trình quân sự',
    ],
    base_generation_rate: 0.7,
    base_storage_capacity: 350,
    value_points: 9,
  },
  {
    id: 'resource_bazan',
    name_vietnamese: 'Đất Đỏ (Bazan)',
    name_english: 'Bazan',
    emoji: '🔴',
    element_type: 'bazan',
    description: 'Tài nguyên đặc biệt với đất đỏ bì, dùng cho công nghệ cao',
    uses: [
      'Pha chế đặc biệt',
      'Công nghệ cao',
      'Gốm sứ',
      'Thuốc',
      'Nhuộm',
      'Phép thuật cổ đại',
    ],
    base_generation_rate: 0.3,
    base_storage_capacity: 150,
    value_points: 15,
  },
]

// 6 Building Types (MVP1)
const BUILDINGS: Building[] = [
  {
    id: 'building_farm',
    name_vietnamese: 'Nông Trại',
    name_english: 'Farm',
    description: 'Nhà cửa nông nghiệp sản xuất Lúa chính',
    building_type: 'farm',
    produces_resource: 'resource_rice',
    base_cost: {
      gold: 50,
      rice: 50,
      wood: 50,
      stone: 0,
      bazan: 0,
    },
    construction_time_seconds: 60,
    max_level: 10,
    level_1_production: 1,
    level_1_bonus: 1,
  },
  {
    id: 'building_mine',
    name_vietnamese: 'Mỏ Vàng',
    name_english: 'Gold Mine',
    description: 'Mỏ khai thác Vàng, nguồn tài chính chính',
    building_type: 'mine',
    produces_resource: 'resource_gold',
    base_cost: {
      gold: 100,
      rice: 0,
      wood: 50,
      stone: 50,
      bazan: 0,
    },
    construction_time_seconds: 120,
    max_level: 10,
    level_1_production: 1,
    level_1_bonus: 1,
  },
  {
    id: 'building_storage',
    name_vietnamese: 'Kho Chứa',
    name_english: 'Storage',
    description: 'Kho lưu trữ tài nguyên, tăng dung lượng chứa',
    building_type: 'storage',
    base_cost: {
      gold: 30,
      rice: 30,
      wood: 30,
      stone: 0,
      bazan: 0,
    },
    construction_time_seconds: 60,
    max_level: 20,
    level_1_bonus: 100, // +100 storage per level
  },
  {
    id: 'building_market',
    name_vietnamese: 'Chợ Thị',
    name_english: 'Market',
    description: 'Trung tâm giao dịch thương mại, tăng hiệu suất đổi chác',
    building_type: 'market',
    base_cost: {
      gold: 60,
      rice: 60,
      wood: 60,
      stone: 0,
      bazan: 0,
    },
    construction_time_seconds: 120,
    max_level: 10,
    level_1_bonus: 5, // +5% trading efficiency
  },
  {
    id: 'building_temple',
    name_vietnamese: 'Đền Thờ',
    name_english: 'Temple',
    description: 'Công trình văn hóa tôn giáo, tăng bonus văn hóa toàn bộ',
    building_type: 'temple',
    base_cost: {
      gold: 40,
      rice: 40,
      wood: 40,
      stone: 20,
      bazan: 0,
    },
    construction_time_seconds: 180,
    max_level: 5,
    level_1_bonus: 5, // +5% all resources (culture bonus)
  },
  {
    id: 'building_barracks',
    name_vietnamese: 'Doanh Trại',
    name_english: 'Barracks',
    description: 'Căn cứ quân sự, tăng sức mạnh chiến đấu',
    building_type: 'barracks',
    base_cost: {
      gold: 50,
      rice: 0,
      wood: 50,
      stone: 50,
      bazan: 0,
    },
    construction_time_seconds: 180,
    max_level: 10,
    level_1_bonus: 10, // +10% combat power
  },
]

export async function seedResourcesAndBuildings() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:11003/katagame',
  })

  try {
    await client.connect()
    console.log('💎 Seeding 5 resources and 6 building types...')

    // Clear existing data
    await client.query('TRUNCATE TABLE buildings CASCADE')
    await client.query('TRUNCATE TABLE resources CASCADE')
    console.log('✅ Cleared existing resources and buildings')

    // Seed Resources
    for (const resource of RESOURCES) {
      const query = `
        INSERT INTO resources (
          id, name_vietnamese, name_english, emoji,
          element_type, description, uses,
          base_generation_rate, base_storage_capacity,
          value_points, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
      `

      await client.query(query, [
        resource.id,
        resource.name_vietnamese,
        resource.name_english,
        resource.emoji,
        resource.element_type,
        resource.description,
        JSON.stringify(resource.uses),
        resource.base_generation_rate,
        resource.base_storage_capacity,
        resource.value_points,
      ])
    }

    console.log(`✅ Successfully seeded ${RESOURCES.length} resources`)

    // Seed Buildings
    for (const building of BUILDINGS) {
      const query = `
        INSERT INTO buildings (
          id, name_vietnamese, name_english, description,
          building_type, produces_resource_id,
          base_gold_cost, base_rice_cost, base_wood_cost,
          base_stone_cost, base_bazan_cost,
          construction_time_seconds,
          max_level, level_1_production, level_1_bonus,
          created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW())
      `

      await client.query(query, [
        building.id,
        building.name_vietnamese,
        building.name_english,
        building.description,
        building.building_type,
        building.produces_resource || null,
        building.base_cost.gold,
        building.base_cost.rice,
        building.base_cost.wood,
        building.base_cost.stone,
        building.base_cost.bazan,
        building.construction_time_seconds,
        building.max_level,
        building.level_1_production || 0,
        building.level_1_bonus || 0,
      ])
    }

    console.log(`✅ Successfully seeded ${BUILDINGS.length} building types`)

    // Verify
    const resourcesCount = await client.query('SELECT COUNT(*) as count FROM resources')
    const buildingsCount = await client.query('SELECT COUNT(*) as count FROM buildings')
    console.log(`✅ Database contains ${resourcesCount.rows[0].count} resources`)
    console.log(`✅ Database contains ${buildingsCount.rows[0].count} building types`)
  } catch (error: any) {
    console.error('❌ Error seeding resources and buildings:', error.message)
    throw error
  } finally {
    await client.end()
  }
}

// Run if called directly
if (require.main === module) {
  seedResourcesAndBuildings().catch(console.error)
}
