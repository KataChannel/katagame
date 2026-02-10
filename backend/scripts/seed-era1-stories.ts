import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const stories = [
    {
      id: 'era1_story_1',
      day: 1,
      title_vietnamese: 'Nguồn Gốc Con Rồng Cháu Tiên',
      title_english: 'The Origin of Dragon and Fairy',
      content: 'Ngày xửa ngày xưa, ở vùng đất Lĩnh Nam, có vị thần tên là Lạc Long Quân, vốn là con rồng từ dưới biển sâu. Thần đã kết duyên cùng nàng Âu Cơ, vốn là tiên nữ từ vùng núi cao. Họ đã sinh ra bọc trăm trứng, nở ra một trăm người con trai khỏe mạnh, tuấn tú. Đây chính là tổ tiên của người Việt, những người con luôn tự hào về dòng máu Con Rồng Cháu Tiên của mình...',
      category: 'LEGENDRY',
      era: 'Era 1',
      reading_time_minutes: 5,
      word_count: 500,
      base_gold_reward: 200,
      base_rice_reward: 200,
    },
    {
      id: 'era1_story_2',
      day: 2,
      title_vietnamese: 'Sự Tích Bánh Chưng Bánh Giầy',
      title_english: 'The Legend of Banh Chung and Banh Giay',
      content: 'Đời Hùng Vương thứ 6, nhà vua muốn tìm người kế vị. Lang Liêu, người con thứ 18, vốn hiền lành và hiếu thảo, đã được thần linh báo mộng về cách làm hai loại bánh từ lúa gạo - hạt ngọc của trời đất. Bánh Giầy hình tròn tượng trưng cho Trời, Bánh Chưng hình vuông tượng trưng cho Đất. Những món ăn này không chỉ thơm ngon mà còn chứa đựng triết lý sâu sắc về lòng hiếu thảo và sự trân trọng nguồn cội.',
      category: 'CULTURE',
      era: 'Era 1',
      reading_time_minutes: 5,
      word_count: 450,
      base_gold_reward: 250,
      base_rice_reward: 300,
    },
    {
      id: 'era1_story_3',
      day: 3,
      title_vietnamese: 'Truyền Thuyết Thánh Gióng',
      title_english: 'The Legend of Saint Giong',
      content: 'Dưới thời Hùng Vương thứ 6, giặc Ân sang xâm lược bờ cõi. Tại làng Gióng có một cậu bé ba tuổi vẫn chưa biết nói cười. Thế nhưng khi nghe tiếng loa của sứ giả tìm người tài cứu nước, cậu bé bỗng ngồi dậy và xin đi đánh giặc. Gióng lớn nhanh như thổi, cưỡi ngựa sắt, mặc giáp sắt và cầm roi sắt xông ra trận. Khi roi sắt gãy, Gióng đã nhổ cả những cụm tre ngà để quật vào quân thù...',
      category: 'HEROIC',
      era: 'Era 1',
      reading_time_minutes: 6,
      word_count: 600,
      base_gold_reward: 300,
      base_wood_reward: 200,
    }
  ];

  for (const story of stories) {
    await prisma.story.upsert({
      where: { id: story.id },
      update: story,
      create: story,
    });
  }

  console.log('✅ Era 1 Stories seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
