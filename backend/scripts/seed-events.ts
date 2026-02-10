import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(startDate.getDate() + 7); // 1 week duration

  const eventData = {
    name: 'Đại Chiến Sơn Tinh - Thủy Tinh',
    description: 'Mùa lũ đang dâng cao! Hãy chọn phe Sơn Tinh để đắp đê ngăn lũ hoặc phe Thủy Tinh để điều phối lương thực cứu trợ dân lành.',
    event_type: 'MYTHICAL',
    era: 'Thời Hùng Vương',
    start_date: startDate,
    end_date: endDate,
    is_active: true,
    metadata: {
      choices: [
        { key: 'SON_TINH', label: 'Phe Sơn Tinh', resource: 'stone', description: 'Góp đá đắp đê' },
        { key: 'THUY_TINH', label: 'Phe Thủy Tinh', resource: 'rice', description: 'Góp lúa cứu trợ' },
      ],
      global_target: 1000000,
    },
  };

  await (prisma as any).gameEvent.upsert({
    where: { id: '00000000-0000-4000-a000-000000000001' }, // Fixed ID for seeding
    update: eventData,
    create: {
      id: '00000000-0000-4000-a000-000000000001',
      ...eventData,
    },
  });

  console.log('✅ Sơn Tinh - Thủy Tinh Event seeded!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
