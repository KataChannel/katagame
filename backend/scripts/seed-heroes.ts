import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Era 1 Heroes...');

  // Era 1 Heroes Data
  const heroes = [
    {
      name_vietnamese: 'Thánh Gióng',
      name_english: 'Saint Giong',
      era: 'Khởi Nguyên Việt',
      rarity: 'legendary',
      role: 'Warrior',
      base_hp: 1000,
      base_attack: 150,
      base_defense: 80,
      base_speed: 120,
      story_day: 3,
      unlock_requirement: 'Complete Story Day 3',
      is_available: true,
      pet_name: 'Ngựa Sắt', // Iron Horse
      pet_emoji: '🐎',
    },
    {
      name_vietnamese: 'Lạc Long Quân',
      name_english: 'Dragon Lord Lac',
      era: 'Khởi Nguyên Việt',
      rarity: 'legendary',
      role: 'Tank',
      base_hp: 1500,
      base_attack: 100,
      base_defense: 140,
      base_speed: 80,
      story_day: 1,
      unlock_requirement: 'Complete Story Day 1',
      is_available: true,
      pet_name: 'Rồng Thần', // Divine Dragon
      pet_emoji: '🐉',
    },
    {
      name_vietnamese: 'An Dương Vương',
      name_english: 'King An Duong',
      era: 'Khởi Nguyên Việt',
      rarity: 'legendary',
      role: 'Marksman', // Archer
      base_hp: 1100,
      base_attack: 160,
      base_defense: 100,
      base_speed: 110,
      story_day: 5,
      unlock_requirement: 'Gacha',
      is_available: true,
      pet_name: 'Thần Kim Quy', // Golden Turtle
      pet_emoji: '🐢',
    },
    {
      name_vietnamese: 'Sơn Tinh',
      name_english: 'Mountain God',
      era: 'Khởi Nguyên Việt',
      rarity: 'legendary',
      role: 'Tank',
      base_hp: 1600,
      base_attack: 90,
      base_defense: 150,
      base_speed: 70,
      story_day: 2,
      unlock_requirement: 'Complete Story Day 2',
      is_available: true,
      pet_name: 'Voi Chín Ngà', // Nine-tusked Elephant
      pet_emoji: '🐘',
    },
    {
      name_vietnamese: 'Hai Bà Trưng',
      name_english: 'Trung Sisters',
      era: 'Khởi Nguyên Việt', // Moved to Khởi Nguyên Việt to match era system
      rarity: 'legendary',
      role: 'Support',
      base_hp: 1200,
      base_attack: 120,
      base_defense: 100,
      base_speed: 110,
      story_day: 10,
      unlock_requirement: 'Battle Pass',
      is_available: true,
      pet_name: 'Voi Chiến', // War Elephant
      pet_emoji: '🐘',
    },
    // ERA 2: Thăng Long Hồng Yên
    {
      name_vietnamese: 'Ngô Quyền',
      name_english: 'King Ngo Quyen',
      era: 'Thăng Long Hồng Yên',
      rarity: 'legendary',
      role: 'Warrior',
      base_hp: 1300,
      base_attack: 180,
      base_defense: 110,
      base_speed: 100,
      story_day: 21,
      unlock_requirement: 'Complete Story Day 21',
      is_available: true,
      pet_name: 'Giao Long',
      pet_emoji: '🌊',
    },
    {
      name_vietnamese: 'Đinh Bộ Lĩnh',
      name_english: 'Emperor Dinh Tien',
      era: 'Thăng Long Hồng Yên',
      rarity: 'legendary',
      role: 'Warrior',
      base_hp: 1400,
      base_attack: 150,
      base_defense: 130,
      base_speed: 90,
      story_day: 25,
      unlock_requirement: 'Complete Story Day 25',
      is_available: true,
      pet_name: 'Trâu Vàng',
      pet_emoji: '🐃',
    },
    {
      name_vietnamese: 'Lê Hoàn',
      name_english: 'Emperor Le Dai Hanh',
      era: 'Thăng Long Hồng Yên',
      rarity: 'epic',
      role: 'Tank',
      base_hp: 1600,
      base_attack: 130,
      base_defense: 150,
      base_speed: 80,
      story_day: 30,
      unlock_requirement: 'Gacha',
      is_available: true,
      pet_name: 'Hổ Tướng',
      pet_emoji: '🐯',
    },
  ];

  for (const hero of heroes) {
    const existing = await prisma.hero.findFirst({
        where: { name_vietnamese: hero.name_vietnamese }
    });

    if (existing) {
        console.log(`Updating ${hero.name_vietnamese}...`);
        await prisma.hero.update({
            where: { id: existing.id },
            data: hero
        });
    } else {
        console.log(`Creating ${hero.name_vietnamese}...`);
        await prisma.hero.create({
            data: hero
        });
    }
  }

  console.log('✅ Era 1 Heroes seeded!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
