import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const items = [
    {
      id: 'banh_chung',
      name_vietnamese: 'Bánh Chưng',
      description: 'Vật phẩm tượng trưng cho Đất, giúp hồi phục 50 Thể lực.',
      item_type: 'FOOD',
      rarity: 'rare',
      stamina_restore: 50,
      base_rice_cost: 500,
      base_wood_cost: 100, // Leaf/Wood
      is_craftable: true,
    },
    {
      id: 'banh_giay',
      name_vietnamese: 'Bánh Giầy',
      description: 'Vật phẩm tượng trưng cho Trời, giúp hồi phục 30 Thể lực và tăng May mắn.',
      item_type: 'FOOD',
      rarity: 'rare',
      stamina_restore: 30,
      luck_bonus: 10,
      base_rice_cost: 300,
      is_craftable: true,
    },
  ];

  for (const item of items) {
    await prisma.item.upsert({
      where: { id: item.id },
      update: item,
      create: item,
    });
  }

  console.log('✅ Era 1 Items seeded!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
