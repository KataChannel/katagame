import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Era 2 Relics...');

  const relics = [
    {
      name: 'Cọc Gỗ Bạch Đằng',
      era: 'Thăng Long Hồng Yên',
      rarity: 'legendary',
      description: 'Cọc gỗ vót nhọn và bọc sắt được sử dụng trong chống quân Nam Hán, tăng cực mạnh khả năng phòng thủ trên biển và sông.',
      aura_type: 'defense_bonus',
      aura_value: 0.40,
      aura_radius: 2,
      base_bronze_cost: 1500,
      base_bazan_cost: 80,
    },
    {
      name: 'Chiếu Dời Đô',
      era: 'Thăng Long Hồng Yên',
      rarity: 'mythic',
      description: 'Lệnh dời đô của vua Lý Thái Tổ từ Hoa Lư về Đại La. Thúc đẩy cực mạnh tốc độ phát triển và văn hóa.',
      aura_type: 'production_all',
      aura_value: 0.35,
      aura_radius: 3,
      base_bronze_cost: 3000,
      base_bazan_cost: 150,
    },
    {
      name: 'Tiền Đồng Đinh Tiên Hoàng',
      era: 'Thăng Long Hồng Yên',
      rarity: 'epic',
      description: 'Đồng tiền đúc đầu tiên của Đại Cồ Việt, tạo nên sự hưng thịnh về giao thương.',
      aura_type: 'gold_production',
      aura_value: 0.50,
      aura_radius: 1,
      base_bronze_cost: 1000,
      base_bazan_cost: 50,
    },
    {
      name: 'Gốm Hoa Nâu',
      era: 'Thăng Long Hồng Yên',
      rarity: 'rare',
      description: 'Loại gốm sứ tinh xảo, thể hiện nét văn hóa đặc trưng thời kỳ này.',
      aura_type: 'exp_bonus',
      aura_value: 0.15,
      aura_radius: 1,
      base_bronze_cost: 600,
      base_bazan_cost: 10,
    }
  ];

  for (const relic of relics) {
    await prisma.relic.upsert({
      where: { name: relic.name },
      update: relic,
      create: relic,
    });
  }

  console.log('✅ Era 2 Relics seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
