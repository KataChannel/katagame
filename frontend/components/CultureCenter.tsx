import { useState } from 'react';
import { Book, Star, Trophy, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/lib/gameStore';
import { toast } from 'sonner';

const CultureCenter = () => {
  const [selectedTopic, setSelectedTopic] = useState<'history' | 'places' | 'people' | 'traditions'>('history');
  const { learnTopic, learnedCultureTopics } = useGameStore();

  const cultureContent = {
    history: {
      title: '📜 Truyền Thuyết & Lịch Sử',
      items: [
        {
          title: 'Con Rồng Cháu Tiên',
          content: 'Truyền thuyết về Lạc Long Quân và Âu Cơ, cội nguồn của dân tộc Việt. 100 trứng nở trăm con, 50 xuống biển, 50 lên non, khai phá đất đai.',
          reward: { culture: 50, gold: 20 },
          image: '🐉'
        },
        {
          title: 'Nhà Nước Văn Lang',
          content: 'Nhà nước đầu tiên của người Việt, do các Vua Hùng cai trị, đóng đô tại Phong Châu. Nổi tiếng với nền văn minh lúa nước và trống đồng.',
          reward: { culture: 60, rice: 50 },
          image: '🌾'
        },
        {
          title: 'Thánh Gióng',
          content: 'Người anh hùng làng Gióng, 3 tuổi vươn vai thành tráng sĩ, cưỡi ngựa sắt, nhổ tre ngà đánh tan giặc Ân, bay về trời.',
          reward: { culture: 70, bronze: 40 },
          image: '🐎'
        }
      ]
    },
    places: {
      title: '🏔️ Danh Thắng Cổ Đại',
      items: [
        {
          title: 'Núi Nghĩa Lĩnh',
          content: 'Nơi ngự trị của các Vua Hùng, nay là khu di tích Đền Hùng (Phú Thọ). Nơi thực hiện các nghi lễ tế trời đất.',
          reward: { culture: 40, stone: 30 },
          image: '⛰️'
        },
        {
          title: 'Kinh Đô Phong Châu',
          content: 'Trung tâm chính trị, văn hóa của nước Văn Lang. Nằm ở ngã ba sông (Việt Trì), thuận lợi cho giao thương và phòng thủ.',
          reward: { culture: 45, rice: 40 },
          image: '🏰'
        },
        {
          title: 'Núi Tản Viên',
          content: 'Ngọn núi thiêng (Ba Vì), nơi ngự của Sơn Tinh - vị thần cai quản núi rừng, người đã đánh bại Thủy Tinh.',
          reward: { culture: 55, wood: 40 },
          image: '🗻'
        }
      ]
    },
    people: {
      title: '👑 Nhân Vật Huyền Thoại',
      items: [
        {
          title: 'Hùng Vương',
          content: 'Vị vua đứng đầu nhà nước Văn Lang. Có 18 đời vua Hùng, người có công dựng nước và dạy dân trồng lúa nước.',
          reward: { culture: 80, bronze: 50 },
          image: '👑'
        },
        {
          title: 'Sơn Tinh',
          content: 'Vị thần núi Tản Viên, biểu tượng cho sức mạnh chinh phục thiên nhiên, trị thủy và bảo vệ mùa màng của người Việt cổ.',
          reward: { culture: 100, stone: 60 },
          image: '🏔️'
        },
        {
          title: 'Lang Liêu',
          content: 'Vị hoàng tử nghèo khó nhưng hiếu thảo, người đã sáng tạo ra Bánh Chưng (Đất) và Bánh Giày (Trời) dâng lên vua cha.',
          reward: { culture: 90, rice: 80 },
          image: '🍱'
        }
      ]
    },
    traditions: {
      title: '🥁 Văn Hóa & Phong Tục',
      items: [
        {
          title: 'Bánh Chưng Bánh Giày',
          content: 'Biểu tượng của Trời Tròn Đất Vuông. Món ăn không thể thiếu trong dịp Tết để thờ cúng tổ tiên, nhắc nhở về cội nguồn.',
          reward: { culture: 60, rice: 100 },
          image: '🥮'
        },
        {
          title: 'Sự Tích Trầu Cau',
          content: 'Câu chuyện cảm động về tình anh em, nghĩa vợ chồng. Tục ăn trầu là nét văn hóa đặc sắc, "miếng trầu là đầu câu chuyện".',
          reward: { culture: 50, wood: 40 },
          image: '🍃'
        },
        {
          title: 'Trống Đồng Đông Sơn',
          content: 'Đỉnh cao của nghệ thuật đúc đồng thời kỳ Hùng Vương. Hoa văn trên trống phản ánh đời sống, tín ngưỡng của người Việt cổ.',
          reward: { culture: 70, bronze: 80 },
          image: '🥁'
        }
      ]
    }
  };

  const topics = [
    { key: 'history', label: 'Lịch Sử', icon: Book },
    { key: 'places', label: 'Danh Thắng', icon: Star },
    { key: 'people', label: 'Danh Nhân', icon: Trophy },
    { key: 'traditions', label: 'Truyền Thống', icon: Calendar },
  ];

  const handleLearnTopic = (item: any) => {
    if (learnedCultureTopics.includes(item.title)) {
      toast.info(`Bạn đã học về "${item.title}" rồi!`);
      return;
    }
    learnTopic(item.title, item.reward);
    toast.success(`Bạn đã học về "${item.title}"!`, {
      description: `Nhận được: ${Object.entries(item.reward).map(([key, value]) => `+${value} ${key}`).join(', ')}`,
      duration: 3000,
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-red-800 mb-2">🏛️ Trung Tâm Văn Hóa</h2>
        <p className="text-gray-600">Khám phá văn hóa Việt Nam và nhận phần thưởng</p>
      </div>

      {/* Topic Navigation */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {topics.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setSelectedTopic(key as any)}
            className={`p-4 rounded-lg border-2 transition-colors ${
              selectedTopic === key
                ? 'border-red-500 bg-red-50 text-red-700'
                : 'border-gray-200 bg-white hover:border-red-300'
            }`}
          >
            <Icon className="h-6 w-6 mx-auto mb-2" />
            <div className="font-semibold">{label}</div>
          </button>
        ))}
      </div>

      {/* Content */}
      <div>
        <h3 className="text-2xl font-bold text-red-800 mb-4">
          {cultureContent[selectedTopic].title}
        </h3>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cultureContent[selectedTopic].items.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg p-6 shadow-lg border-2 border-gray-200 hover:border-red-300 transition-colors"
            >
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">{item.image}</div>
                <h4 className="text-lg font-bold text-red-800">{item.title}</h4>
              </div>

              <p className="text-gray-700 text-sm mb-4 leading-relaxed">
                {item.content}
              </p>

              <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <h5 className="font-semibold text-yellow-800 mb-1">Phần thưởng:</h5>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(item.reward).map(([key, value]) => (
                    <span
                      key={key}
                      className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full text-xs"
                    >
                      +{value} {key}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleLearnTopic(item)}
                disabled={learnedCultureTopics.includes(item.title)}
                className={`w-full py-2 rounded-lg font-semibold transition-colors ${
                  learnedCultureTopics.includes(item.title)
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-red-500 to-yellow-500 text-white hover:from-red-600 hover:to-yellow-600'
                }`}
              >
                {learnedCultureTopics.includes(item.title) ? '✅ Đã Học' : '📖 Học Ngay'}
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Daily Culture Quest */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-purple-800 mb-3 flex items-center gap-2">
          🌟 Nhiệm Vụ Văn Hóa Hàng Ngày
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 border border-purple-300">
            <h4 className="font-semibold text-purple-800">📚 Học 3 bài văn hóa</h4>
            <p className="text-purple-700 text-sm">Phần thưởng: +500 Culture, +100 Gold</p>
            <div className="mt-2">
              <div className="bg-purple-200 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '66%' }}></div>
              </div>
              <p className="text-xs text-purple-600 mt-1">2/3 hoàn thành</p>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-purple-300">
            <h4 className="font-semibold text-purple-800">🏆 Streak 7 ngày</h4>
            <p className="text-purple-700 text-sm">Học liên tục 7 ngày = Bonus x2 Culture</p>
            <div className="mt-2">
              <div className="bg-purple-200 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '71%' }}></div>
              </div>
              <p className="text-xs text-purple-600 mt-1">5/7 ngày</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CultureCenter;