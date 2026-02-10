import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Era 1 Relics...');

  const relics = [
    {
      name: 'Trống Đồng Ngọc Lũ',
      era: 'Khởi Nguyên Việt',
      rarity: 'legendary',
      description: 'Di vật tiêu biểu nhất của văn hóa Đông Sơn, biểu tượng cho quyền lực và tâm linh.',
      aura_type: 'production_all',
      aura_value: 0.20,
      aura_radius: 2,
      base_bronze_cost: 1000,
      base_bazan_cost: 50,
    },
    {
      name: 'Trống Đồng Hoàng Hạ',
      era: 'Khởi Nguyên Việt',
      rarity: 'epic',
      description: 'Trống đồng cổ với hoa văn tinh xảo, giúp thúc đẩy tinh thần lao động của cư dân.',
      aura_type: 'production_all',
      aura_value: 0.15,
      aura_radius: 1,
      base_bronze_cost: 500,
      base_bazan_cost: 20,
    },
    {
      name: 'Nỏ Liên Châu (Bản gốc)',
      era: 'Khởi Nguyên Việt',
      rarity: 'epic',
      description: 'Nguyên mẫu nỏ thần của Cao Lỗ, tăng khả năng phòng thủ cho lãnh thổ.',
      aura_type: 'defense_bonus',
      aura_value: 0.30,
      aura_radius: 1,
      base_bronze_cost: 800,
      base_bazan_cost: 30,
    }
  ];

  for (const relic of relics) {
    await prisma.relic.upsert({
      where: { name: relic.name },
      update: relic,
      create: relic,
    });
  }

  console.log('✅ Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
