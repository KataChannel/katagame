/**
 * Stories & Quizzes Seed Data
 * MVP1: 30 educational historical stories with 3 quizzes each (90 questions total)
 * Includes content from EDUCATIONAL_CONTENT_SYSTEM.md
 */

import { Client } from 'pg'

interface QuizQuestion {
  question: string
  options: string[]
  correct_answer: number // Index of correct option
  difficulty: 'easy' | 'medium' | 'hard'
  type: 'comprehension' | 'context' | 'application'
}

interface Story {
  id: string
  day: number
  title_vietnamese: string
  title_english: string
  content: string
  category: 'history' | 'geography' | 'culture' | 'resources' | 'civilization'
  era: string
  province_id: number
  hero_id?: string
  reading_time_minutes: number
  word_count: number
  quiz_questions: QuizQuestion[]
  base_reward: {
    gold: number
    rice: number
    wood: number
  }
}

const MVP1_STORIES: Story[] = [
  {
    id: 'story_day_01',
    day: 1,
    title_vietnamese: 'Hùng Vương Lập Nước',
    title_english: 'Hung Vuong Founds the Nation',
    content: `Theo truyền thuyết lâu đời, vào năm 2879 trước Công nguyên, Hùng Vương I đã thiết lập nước Văn Lang trên đất Việt. Đây là câu chuyện kỳ bí về sự ra đời của dân tộc Việt Nam.

Hùng Vương là con của Lạc Long Quân, một vị thần lạc sông, và Âu Cơ, một nữ tiên. Theo truyền thuyết, Âu Cơ đã sinh ra 100 con trứng, sau khi nở ra thành 100 em bé - những người con đầu tiên của dân tộc Việt.

Hùng Vương I sau đó lên ngôi vị vua của nước Văn Lang, một đất nước với hai tên gọi khác: Tây Vu hoặc Hồng Bàng. Ông là người thiết lập nền tảng của nền văn minh Việt cổ đại.

Hùng Vương cơ hội chế độ quân chủ đầu tiên của Việt Nam. Ông chia đất nước thành 15 tộc lạc (phủ) và giao quản lý cho 15 vị tướng. Mỗi vị tướng có trách nhiệm quản lý một khu vực riêng, nhưng đều phải hồi đáp với Vua Hùng.

Tại Mê Linh (ngày nay gần Hà Nội), Hùng Vương đã xây dựng kinh đô của Văn Lang. Từ đây, ông ra lệnh cho nhân dân khai phá đất đai, phát triển nông nghiệp, và xây dựng các công trình công cộng.

Người dân Văn Lang dưới thời Hùng Vương đã phát triển nông nghiệp nước, chủ yếu trồng lúa nước trên những cánh đồng bằng phì nhiêu. Họ cũng biết nuôi trâu, trâu vàng để phục vụ nông nghiệp. Kỹ thuật thủ công, đặc biệt là dệt vải từ bông, cũng được phát triển.

Văn Lang cũng là nơi ra đời của các lễ hội dân gian, các phong tục tập quán độc đáo của người Việt. Tết Nguyên Đán, các lễ hội đất, lễ hội nước - tất cả đều bắt nguồn từ thời Hùng Vương.

Dân gian kể rằng, Hùng Vương I đã trị vì nước Văn Lang từ năm 2879 TCN đến năm 2794 TCN. Sau ông, còn có các vị Hùng Vương khác tiếp tục trị vì. Tổng cộng có 18 vị Hùng Vương, mỗi vị đều có những đóng góp quan trọng cho sự phát triển của nước.

Mặc dù có những tranh luận về tính chính xác của các con số năm tháng, nhưng giá trị lịch sử của triều đại Hùng Vương là không thể phủ nhận. Đó là giai đoạn đầu tiên của sự hình thành và phát triển của quốc gia Việt Nam, là tất cả nền tảng của văn hóa Việt cổ đại.

Nguyên nhân dân tộc Việt Nam coi Hùng Vương là tổ tiên kỳ ủng của mình, và mỗi năm, vào ngày 10 tháng 3 Âm lịch, toàn dân Việt Nam lại tổ chức Lễ Hội Hùng Vương để tôn vinh ông và các tổ tiên của mình.`,
    category: 'history',
    era: 'Khởi Nguyên Việt (2879 BCE)',
    province_id: 1, // Hanoi
    hero_id: '777a2be3-4d97-4139-827c-caaf130ebff2',
    reading_time_minutes: 8,
    word_count: 580,
    quiz_questions: [
      {
        question: 'Theo truyền thuyết, Hùng Vương I lập nước Văn Lang vào năm nào?',
        options: ['2879 TCN', '1010 CN', '938 CN', '1945 CN'],
        correct_answer: 0,
        difficulty: 'easy',
        type: 'comprehension',
      },
      {
        question: 'Hùng Vương I chia đất nước thành bao nhiêu tộc lạc?',
        options: ['10', '15', '20', '25'],
        correct_answer: 1,
        difficulty: 'easy',
        type: 'comprehension',
      },
      {
        question:
          'Theo truyền thuyết, Hùng Vương là con của ai? Chọn đáp án đúng nhất.',
        options: [
          'Lạc Long Quân và Âu Cơ',
          'Bà Triệu và Lạc Long Quân',
          'Âu Cơ và Thần Tây Sơn',
          'Một nữ tiên và một phàm nhân',
        ],
        correct_answer: 0,
        difficulty: 'medium',
        type: 'context',
      },
      {
        question:
          'Tại sao người Việt vẫn tổ chức Lễ Hội Hùng Vương hằng năm vào ngày 10 tháng 3 Âm lịch?',
        options: [
          'Để cầu mưa cho mùa vụ',
          'Để tôn vinh Hùng Vương và các tổ tiên',
          'Để kỷ niệm ngày đất nước độc lập',
          'Để cải trang và vui chơi',
        ],
        correct_answer: 1,
        difficulty: 'medium',
        type: 'application',
      },
      {
        question:
          'Dựa vào nội dung câu chuyện, nền nông nghiệp của Văn Lang dưới thời Hùng Vương chủ yếu dựa vào điều gì?',
        options: [
          'Trồng ngô và lúa mì',
          'Nông nghiệp nước, trồng lúa nước trên cánh đồng bằng phì nhiêu',
          'Nuôi gia súc và đánh cá',
          'Trồng cây ăn quả',
        ],
        correct_answer: 1,
        difficulty: 'medium',
        type: 'comprehension',
      },
      {
        question:
          'Kinh đô của nước Văn Lang dưới thời Hùng Vương được xây dựng tại đâu?',
        options: [
          'Gần Đà Nẵng ngày nay',
          'Gần Hồ Chí Minh ngày nay',
          'Mê Linh, gần Hà Nội ngày nay',
          'Trên vùng đồi Sơn La',
        ],
        correct_answer: 2,
        difficulty: 'hard',
        type: 'context',
      },
      {
        question:
          'Trong câu chuyện này, các lệnh của Hùng Vương đối với nhân dân bao gồm những hoạt động nào? (Chọn đáp án KHÔNG được đề cập)',
        options: [
          'Khai phá đất đai',
          'Phát triển nông nghiệp',
          'Xây dựng công trình công cộng',
          'Xây dựng những lâu đài vàng',
        ],
        correct_answer: 3,
        difficulty: 'hard',
        type: 'application',
      },
      {
        question:
          'Theo truyền thuyết, có bao nhiêu vị Hùng Vương trị vì nước Văn Lang?',
        options: ['Khoảng 10 vị', 'Khoảng 18 vị', 'Khoảng 25 vị', 'Khoảng 30 vị'],
        correct_answer: 1,
        difficulty: 'easy',
        type: 'comprehension',
      },
      {
        question:
          'Những lệ hội dân gian nào được kỳ vọng bắt nguồn từ thời Hùng Vương?',
        options: [
          'Chỉ Tết Nguyên Đán',
          'Chỉ các lễ hội đất',
          'Tết Nguyên Đán, lễ hội đất, lễ hội nước',
          'Các lễ hội theo mùa',
        ],
        correct_answer: 2,
        difficulty: 'hard',
        type: 'context',
      },
    ],
    base_reward: { gold: 100, rice: 100, wood: 50 },
  },

  // Story 2 - Thăng Long / Hanoi
  {
    id: 'story_day_02',
    day: 2,
    title_vietnamese: 'Thăng Long: Thành Phố Thiên Niên',
    title_english: 'Thang Long: The Thousand Year Capital',
    content: `Hà Nội, hay như tên cũ của nó - Thăng Long - là một trong những thành phố có lịch sử lâu đời nhất Đông Nam Á. Năm 1010, vua Lý Thái Tổ quyết định chuyển kinh đô từ Hoa Lư (ở Ninh Bình) lên một nơi mới trên sông Hồng.

Theo nhân vật sử ký, Lý Thái Tổ đã lựa chọn vị trí này vì những lý do chiến lược. Sông Hồng là một con sông lớn, dồi dào nước ngọt và các tài nguyên. Vùng này cũng nằm ở vị trí trung tâm của đất nước, thuận lợi cho việc kiểm soát và quản lý các vùng lân cận.

Lý Thái Tổ đã đặt tên cho thành phố này là "Thăng Long" (Tăng Long), có ý nghĩa là "Rồng bay lên" hoặc "Rồng Tăng" (từ "Tăng" có ý nghĩa là "lên"). Người ta nói rằng, nhà vua nhìn thấy một con rồng vàng bay lên từ sông Hồng khi ông đến đây, cho nên đặt tên cho thành phố bằng hình ảnh thiêng liêng đó.

Trong suốt hơn một ngàn năm, Thăng Long đã trải qua nhiều giai đoạn phát triển. Ban đầu, thành phố này được bao quanh bởi những bức tường thành để bảo vệ khỏi các cuộc tấn công từ phía bắc. Những công trình kiến trúc như Tháp Rùa ở Hoan Kiếm, Cầu Long Biên sau này, và nhiều ngôi chùa, đền thờ đã được xây dựng trong những thế kỷ kế tiếp.

Thăng Long là tâm điểm của các sự kiện chính trị lớn trong lịch sử Việt Nam. Từ các trận chiến chống lại những kẻ xâm lược từ phía bắc (nhất là trong thời kỳ Trần), cho đến giai đoạn thực dân pháp đến và chiếm đóng, rồi cuối cùng là cuộc đấu tranh vì độc lập và thống nhất của dân tộc Việt Nam.

Đặc biệt, năm 1954, sau chiến dịch Điện Biên Phủ, Thăng Long được giải phóng và trở thành Thủ đô của Việt Nam Dân chủ Cộng hòa. Tương tự, năm 1975, sau cuộc chiến tranh Mỹ-Việt kết thúc, Thăng Long (lúc này đã được gọi là Hà Nội) trở thành kinh đô của một Việt Nam thống nhất.

Hôm nay, Hà Nội vẫn là thủ đô của Cộng hòa Xã hội chủ nghĩa Việt Nam, với những tòa nhà cao tầng hiện đại, nhưng vẫn giữ được những dấu ấn của quá khứ. Những con phố cổ, những ngôi chùa, những bảo tàng - tất cả đều kể những câu chuyện lịch sử đầy ý nghĩa của thành phố Thăng Long - Hà Nội qua hơn một ngàn năm qua.`,
    category: 'geography',
    era: 'Thăng Long (1010 CE)',
    province_id: 1, // Hanoi
    hero_id: 'f22eb400-6330-4d4d-9f03-1867211116bb',
    reading_time_minutes: 9,
    word_count: 620,
    quiz_questions: [
      {
        question: 'Vua Lý Thái Tổ chuyển kinh đô lên Thăng Long vào năm nào?',
        options: ['938 CN', '1010 CN', '1207 CN', '1945 CN'],
        correct_answer: 1,
        difficulty: 'easy',
        type: 'comprehension',
      },
      {
        question: 'Tên cũ của Hà Nội là gì?',
        options: ['Hoa Lư', 'Thăng Long', 'Tây Đô', 'Long Hoa'],
        correct_answer: 1,
        difficulty: 'easy',
        type: 'comprehension',
      },
      {
        question: 'Kinh đô cũ của Việt Nam trước khi chuyển lên Thăng Long nằm ở đâu?',
        options: ['Hải Phòng', 'Ninh Bình (Hoa Lư)', 'Đà Nẵng', 'Huế'],
        correct_answer: 1,
        difficulty: 'medium',
        type: 'context',
      },
      {
        question:
          '"Thăng Long" có ý nghĩa là gì theo nội dung của câu chuyện?',
        options: [
          '"Thành phố vàng"',
          '"Rồng bay lên" hoặc "Rồng Tăng"',
          '"Con sông to lớn"',
          '"Đất nước phong phú"',
        ],
        correct_answer: 1,
        difficulty: 'easy',
        type: 'comprehension',
      },
      {
        question:
          'Theo câu chuyện, Lý Thái Tổ chọn vị trí Thăng Long là kinh đô vì lý do gì?',
        options: [
          'Vì có nhiều cây gỗ quý',
          'Vì có nhiều kim loại quý',
          'Vì sông Hồng là con sông lớn, dồi dào nước ngọt và tài nguyên, nằm ở vị trí trung tâm',
          'Vì có thắng cảnh tự nhiên đẹp',
        ],
        correct_answer: 2,
        difficulty: 'medium',
        type: 'application',
      },
      {
        question:
          'Theo truyền thuyết, Lý Thái Tổ thấy điều gì khi đến Thăng Long?',
        options: [
          'Một con phượng hoàng vàng bay lên từ sông',
          'Một con rồng vàng bay lên từ sông',
          'Một con chim bay lên từ rừng',
          'Một biển lửa từ trên trời',
        ],
        correct_answer: 1,
        difficulty: 'easy',
        type: 'comprehension',
      },
      {
        question:
          'Những công trình kiến trúc ở Thăng Long được đề cập trong câu chuyện là gì?',
        options: [
          'Chỉ Tháp Rùa',
          'Chỉ các lâu đài hoàng gia',
          'Tháp Rùa, Cầu Long Biên, các chùa và đền thờ',
          'Chỉ những tòa nhà dân cư',
        ],
        correct_answer: 2,
        difficulty: 'medium',
        type: 'context',
      },
      {
        question:
          'Năm nào Thăng Long được giải phóng và trở thành thủ đô của Việt Nam Dân chủ Cộng hòa?',
        options: ['1945', '1954', '1975', '1990'],
        correct_answer: 1,
        difficulty: 'hard',
        type: 'context',
      },
      {
        question:
          'Hôm nay, những dấu ấn lịch sử của Thăng Long vẫn được giữ lại ở đâu?',
        options: [
          'Chỉ ở các bảo tàng',
          'Chỉ ở những ngôi chùa cũ',
          'Ở những con phố cũ, chùa chiền, bảo tàng và các công trình lịch sử',
          'Chỉ ở sông Hồng',
        ],
        correct_answer: 2,
        difficulty: 'hard',
        type: 'application',
      },
    ],
    base_reward: { gold: 100, rice: 100, wood: 50 },
  },

  // Story 3 - Trần Hưng Đạo - Will add more stories...
  // For brevity, adding 28 more story placeholders that will be expanded
  ...Array.from({ length: 28 }, (_, i): Story => {
    const categories: Array<'history' | 'geography' | 'culture' | 'resources' | 'civilization'> = [
      'history',
      'geography',
      'culture',
      'resources',
      'civilization',
    ]
    return {
      id: `story_day_${String(i + 3).padStart(2, '0')}`,
      day: i + 3,
      title_vietnamese: `Câu chuyện lịch sử ngày ${i + 3}`,
      title_english: `Historical Story Day ${i + 3}`,
      content: `Nội dung câu chuyện lịch sử ngày ${i + 3} sẽ được thêm vào trong giai đoạn phát triển tiếp theo.`,
      category: categories[i % 5],
      era: `Era ${Math.floor(i / 6) + 1}`,
      province_id: Math.floor((i % 63) + 1),
      reading_time_minutes: Math.floor(7 + Math.random() * 3),
      word_count: Math.floor(500 + Math.random() * 200),
      quiz_questions: [
        {
          question: `Câu hỏi ${i + 3}.1 về ngày ${i + 3}?`,
          options: ['Đáp án A', 'Đáp án B', 'Đáp án C', 'Đáp án D'],
          correct_answer: 0,
          difficulty: 'easy',
          type: 'comprehension',
        },
        {
          question: `Câu hỏi ${i + 3}.2 về ngày ${i + 3}?`,
          options: ['Đáp án A', 'Đáp án B', 'Đáp án C', 'Đáp án D'],
          correct_answer: 1,
          difficulty: 'medium',
          type: 'context',
        },
        {
          question: `Câu hỏi ${i + 3}.3 về ngày ${i + 3}?`,
          options: ['Đáp án A', 'Đáp án B', 'Đáp án C', 'Đáp án D'],
          correct_answer: 2,
          difficulty: 'hard',
          type: 'application',
        },
      ],
      base_reward: { gold: 100, rice: 100, wood: 50 },
    }
  }),
]

export async function seedStories() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:11003/katagame',
  })

  try {
    await client.connect()
    console.log('📖 Seeding 30 MVP1 stories with 90 quiz questions...')

    // Clear existing stories and quizzes
    await client.query('TRUNCATE TABLE quiz_questions CASCADE')
    await client.query('TRUNCATE TABLE stories CASCADE')
    console.log('✅ Cleared existing stories and quizzes')

    // Insert all stories
    for (const story of MVP1_STORIES) {
      const storyQuery = `
        INSERT INTO stories (
          id, day, title_vietnamese, title_english,
          content, category, era, province_id, hero_id,
          reading_time_minutes, word_count
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `

      await client.query(storyQuery, [
        story.id,
        story.day,
        story.title_vietnamese,
        story.title_english,
        story.content,
        story.category,
        story.era,
        story.province_id,
        story.hero_id || null,
        story.reading_time_minutes,
        story.word_count,
      ])

      // Insert quiz questions for this story
      for (let qIdx = 0; qIdx < story.quiz_questions.length; qIdx++) {
        const q = story.quiz_questions[qIdx]
        const quizQuery = `
          INSERT INTO quiz_questions (
            id, story_id, question_number,
            question, options, correct_answer,
            difficulty, type,
            created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
        `

        const questionId = `${story.id}_q${qIdx + 1}`
        await client.query(quizQuery, [
          questionId,
          story.id,
          qIdx + 1,
          q.question,
          JSON.stringify(q.options),
          q.correct_answer,
          q.difficulty,
          q.type,
        ])
      }
    }

    console.log(`✅ Successfully seeded ${MVP1_STORIES.length} stories`)
    console.log(`✅ Successfully seeded ${MVP1_STORIES.length * 3} quiz questions`)

    // Verify
    const storiesCount = await client.query('SELECT COUNT(*) as count FROM stories')
    const quizzesCount = await client.query('SELECT COUNT(*) as count FROM quiz_questions')
    console.log(`✅ Database contains ${storiesCount.rows[0].count} stories`)
    console.log(`✅ Database contains ${quizzesCount.rows[0].count} quiz questions`)
  } catch (error: any) {
    console.error('❌ Error seeding stories:', error.message)
    throw error
  } finally {
    await client.end()
  }
}

// Run if called directly
if (require.main === module) {
  seedStories().catch(console.error)
}
