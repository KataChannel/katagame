import { useState } from 'react';
import { Book, Star, Trophy, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

const CultureCenter = () => {
  const [selectedTopic, setSelectedTopic] = useState<'history' | 'places' | 'people' | 'traditions'>('history');

  const cultureContent = {
    history: {
      title: '🏛️ Lịch Sử Việt Nam',
      items: [
        {
          title: 'Hà Nội - Thăng Long Kinh Thành',
          content: 'Thủ đô của Việt Nam từ thời Lý (1010). Vua Lý Thái Tổ dời đô về đây và đặt tên là Thăng Long, có nghĩa là "rồng bay lên". Đây là trung tâm chính trị, văn hóa của cả nước.',
          reward: { culture: 50, gold: 20 },
          image: '🏛️'
        },
        {
          title: 'Nghệ An - Quê Hương Bác Hồ',
          content: 'Tỉnh Nghệ An là quê hương của Chủ tịch Hồ Chí Minh. Đây cũng là vùng đất có truyền thống cách mạng lâu đời với nhiều phong trào đấu tranh.',
          reward: { culture: 60, gold: 25 },
          image: '⭐'
        },
        {
          title: 'Quảng Ninh - Vịnh Hạ Long',
          content: 'Vịnh Hạ Long được UNESCO công nhận là di sản thiên nhiên thế giới. Truyền thuyết kể rằng rồng mẹ và rồng con xuống biển tạo ra hàng nghìn hòn đảo đẹp.',
          reward: { culture: 70, gold: 30 },
          image: '🐉'
        }
      ]
    },
    places: {
      title: '🗺️ Danh Thắng Nổi Tiếng',
      items: [
        {
          title: 'Hồ Gương - Hà Nội',
          content: 'Hồ Hoàn Kiếm hay Hồ Gương là biểu tượng của Hà Nội. Truyền thuyết kể về thanh gươm thiêng và rùa thần Kim Quy.',
          reward: { culture: 40, rice: 50 },
          image: '🏮'
        },
        {
          title: 'Cửa Lò - Nghệ An',
          content: 'Bãi biển Cửa Lò với cát trắng, nước xanh là điểm du lịch nổi tiếng. Đây cũng là nơi Bác Hồ thường về thăm quê hương.',
          reward: { culture: 45, lumber: 30 },
          image: '🏖️'
        },
        {
          title: 'Động Thiên Cung - Quảng Ninh',
          content: 'Động Thiên Cung trong vịnh Hạ Long với những khối thạch nhũ kỳ thú, được ví như cung điện của các vị thần.',
          reward: { culture: 55, stone: 40 },
          image: '✨'
        }
      ]
    },
    people: {
      title: '👑 Danh Nhân Lịch Sử',
      items: [
        {
          title: 'Lý Thái Tổ (974-1028)',
          content: 'Vua sáng lập nhà Lý, dời đô về Thăng Long. Ông là vị vua anh minh, tạo nền tảng cho thời kỳ hưng thịnh của Việt Nam.',
          reward: { culture: 80, gold: 50 },
          image: '👑'
        },
        {
          title: 'Chủ tịch Hồ Chí Minh (1890-1969)',
          content: 'Lãnh tụ kính yêu của dân tộc Việt Nam, người đã dành cả cuộc đời cho sự nghiệp giải phóng dân tộc và thống nhất đất nước.',
          reward: { culture: 100, gold: 100 },
          image: '⭐'
        },
        {
          title: 'Trần Hưng Đạo (1228-1300)',
          content: 'Danh tướng nhà Trần, ba lần đánh bại quân Mông Cổ xâm lược. Ông để lại nhiều chiến thuật quân sự xuất sắc.',
          reward: { culture: 90, stone: 60 },
          image: '⚔️'
        }
      ]
    },
    traditions: {
      title: '🎭 Truyền Thống Văn Hóa',
      items: [
        {
          title: 'Tết Nguyên Đán',
          content: 'Tết là dịp lễ quan trọng nhất trong năm của người Việt. Đây là thời gian sum họp gia đình, thờ cúng tổ tiên và cầu chúc năm mới an khang.',
          reward: { culture: 60, rice: 100 },
          image: '🧧'
        },
        {
          title: 'Áo Dài Việt Nam',
          content: 'Áo dài là trang phục truyền thống của phụ nữ Việt Nam, thể hiện sự duyên dáng và thanh lịch của người phụ nữ Á Đông.',
          reward: { culture: 50, gold: 40 },
          image: '👘'
        },
        {
          title: 'Nghệ thuật Chèo',
          content: 'Chèo là loại hình nghệ thuật sân khấu dân gian của miền Bắc, kết hợp giữa hát, múa và diễn xuất.',
          reward: { culture: 70, lumber: 50 },
          image: '🎭'
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
    // In real game, this would add resources to player
    alert(`Bạn đã học về "${item.title}"!\nNhận được: ${Object.entries(item.reward).map(([key, value]) => `${value} ${key}`).join(', ')}`);
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
                className="w-full bg-gradient-to-r from-red-500 to-yellow-500 text-white py-2 rounded-lg font-semibold hover:from-red-600 hover:to-yellow-600 transition-colors"
              >
                📖 Học Ngay
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