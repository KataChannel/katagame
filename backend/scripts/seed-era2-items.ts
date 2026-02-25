import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const items = [
    {
      id: 'com_nam',
      name_vietnamese: 'Cơm Nắm',
      description: 'Lương khô mang theo trong các cuộc chiến bảo vệ đất nước. Hồi phục 40 Thể lực.',
      item_type: 'FOOD',
      rarity: 'common',
      stamina_restore: 40,
      base_rice_cost: 400,
      base_wood_cost: 0,
      is_craftable: true,
    },
    {
      id: 'ruou_nep',
      name_vietnamese: 'Rượu Nếp Hoa Vàng',
      description: 'Đặc sản thời bình, tăng nhuệ khí chiến đấu. Tăng Tấn Công 10 trong 2 lượt.',
      item_type: 'POTION',
      rarity: 'rare',
      stamina_restore: 20,
      luck_bonus: 5,
      base_rice_cost: 600,
      base_wood_cost: 50,
      is_craftable: true,
    },
    {
      id: 'la_co_lau',
      name_vietnamese: 'Cờ Lau Tập Trận',
      description: 'Đồ chơi thuở bé của Đinh Tiên Hoàng. Vật phẩm lưu niệm, tăng một lượng nhỏ EXP.',
      item_type: 'MATERIAL',
      rarity: 'epic',
      stamina_restore: 0,
      luck_bonus: 20,
      base_wood_cost: 200,
      base_gold_cost: 100,
      is_craftable: false,
    },
  ];

  for (const item of items) {
    await prisma.item.upsert({
      where: { id: item.id },
      update: item,
      create: item,
    });
  }

  console.log('✅ Era 2 Items seeded!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
