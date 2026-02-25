import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const stories = [
    {
      id: 'era2_story_21',
      day: 21,
      title_vietnamese: 'Chiến Thắng Bạch Đằng (938)',
      title_english: 'The Battle of Bach Dang River (938)',
      content: 'Năm 938, quân Nam Hán mượn cớ sang đánh nước ta. Ngô Quyền đã cho người đem cọc gỗ vót nhọn, bịt sắt cắm xuống lòng sông Bạch Đằng. Khi thủy triều lên, cọc bị che lấp. Ngô Quyền cho quân ra khiêu chiến rồi vờ thua rút chạy, nhử thuyền địch vào bãi cọc. Khi thủy triều xuống, thuyền địch bị cọc đâm thủng, vỡ nát. Trận thắng vĩ đại này đã chấm dứt hơn 1.000 năm Bắc thuộc, mở ra kỷ nguyên độc lập lâu dài cho dân tộc.',
      category: 'BATTLE',
      era: 'Era 2',
      reading_time_minutes: 5,
      word_count: 500,
      base_gold_reward: 300,
      base_wood_reward: 300,
    },
    {
      id: 'era2_story_25',
      day: 25,
      title_vietnamese: 'Dẹp Loạn 12 Sứ Quân',
      title_english: 'Quelling the 12 Warlords',
      content: 'Sau khi nhà Ngô suy yếu, đất nước rơi vào tình cảnh loạn lạc, bị chia cắt bởi 12 sứ quân. Tại Hoa Lư, có một thủ lĩnh tài ba tên là Đinh Bộ Lĩnh. Bằng tài năng quân sự xuất chúng và chiến lược ngoại giao khôn khéo, ông đã lần lượt đánh dẹp và thu phục các sứ quân khác. Năm 968, Đinh Bộ Lĩnh lên ngôi hoàng đế, lấy niên hiệu là Đinh Tiên Hoàng, đặt tên nước là Đại Cồ Việt.',
      category: 'HISTORICAL',
      era: 'Era 2',
      reading_time_minutes: 6,
      word_count: 550,
      base_rice_reward: 400,
      base_stone_reward: 200,
    },
    {
      id: 'era2_story_30',
      day: 30,
      title_vietnamese: 'Phá Tống Bình Chiêm',
      title_english: 'Defeating the Song and Pacifying Champa',
      content: 'Năm 981, lợi dụng Đinh Tiên Hoàng bang hà, vua nhỏ tuổi nối ngôi, nhà Tống từ phương Bắc lăm le xâm lược, phía Nam thì quân Chiêm Thành quấy phá. Thái hậu Dương Vân Nga vì đại cục đã trao áo long cổn cho Thập đạo tướng quân Lê Hoàn. Lê Hoàn lên ngôi (Lê Đại Hành), trực tiếp cầm quân chỉ huy trận Bạch Đằng lần thứ 2 đánh bại nhà Tống, sau đó tiến thẳng vào Chiêm Thành dẹp yên bờ cõi phương Nam.',
      category: 'BATTLE',
      era: 'Era 2',
      reading_time_minutes: 7,
      word_count: 650,
      base_gold_reward: 400,
      base_wood_reward: 250,
      base_stone_reward: 200,
    }
  ];

  for (const story of stories) {
    await prisma.story.upsert({
      where: { id: story.id },
      update: story,
      create: story,
    });
  }

  console.log('✅ Era 2 Stories seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
