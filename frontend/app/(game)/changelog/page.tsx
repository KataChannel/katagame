'use client';

import { FileText, Sparkles, Sword, Users, Crown, Map, Gift, Trophy, Coins, Gamepad2, ShoppingCart, Palette, BarChart3, Globe, UserPlus, Store, Zap } from 'lucide-react';

interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  description: string;
  sections: {
    title: string;
    icon: React.ReactNode;
    items: string[];
  }[];
}

const changelogs: ChangelogEntry[] = [
  {
    version: '0.1.1',
    date: '2024-11-30',
    title: 'MVP1.1 - Hoàn Thiện Trải Nghiệm Game',
    description: 'Bản cập nhật lớn với hơn 22+ tính năng mới, bao gồm hệ thống Gacha, Arena PvP, Guild, Marketplace và nhiều cải tiến UX!',
    sections: [
      {
        title: 'Trang Chủ & Click Farming',
        icon: <Gamepad2 className="w-5 h-5 text-green-500" />,
        items: [
          'Click Farming: Click vào tài nguyên để thu thập (1-3 tài nguyên/click)',
          'Quản lý Tỉnh Thành: Xem, mở khóa (200 vàng), nâng cấp các tỉnh Việt Nam',
          'Thuê Nông Dân: Tự động thu thập tài nguyên',
          'Điều chỉnh tốc độ game: 0.5x, 1x, 2x, 5x',
        ],
      },
      {
        title: 'Hệ Thống Chiến Đấu',
        icon: <Sword className="w-5 h-5 text-red-500" />,
        items: [
          'Combat Tab: Tham gia các trận chiến PvE',
          'Arena PvP: Đấu trường với người chơi khác, xếp hạng',
          'Sử dụng tướng và pet trong combat',
          'Hệ thống tính toán sát thương dựa trên chỉ số',
        ],
      },
      {
        title: 'Hệ Thống Tướng & Pet',
        icon: <Crown className="w-5 h-5 text-purple-500" />,
        items: [
          'Heroes Tab: Danh sách tướng với trang chi tiết riêng (/heroes/[id])',
          'Pets Tab: Quản lý linh thú đồng hành',
          'Gacha System: Quay gacha để nhận tướng/pet ngẫu nhiên',
          'Synergy System: Hệ thống tương hỗ giữa các tướng',
        ],
      },
      {
        title: 'Guild & Social',
        icon: <Users className="w-5 h-5 text-teal-500" />,
        items: [
          'Guild Tab: Tham gia hoặc tạo bang hội',
          'Friends Tab: Kết bạn với người chơi khác',
          'Gửi/Nhận quà từ bạn bè (reset hàng ngày)',
          'Multiplayer: Chế độ chơi nhiều người',
        ],
      },
      {
        title: 'World Map & Provinces',
        icon: <Globe className="w-5 h-5 text-blue-500" />,
        items: [
          'World Map Tab: Khám phá bản đồ thế giới game',
          'Provinces Page: Danh sách và chi tiết từng tỉnh (/provinces/[id])',
          'Era Page: Thông tin các thời kỳ lịch sử Việt Nam',
          'Stories Page: Câu chuyện lịch sử với trang chi tiết (/stories/[id])',
        ],
      },
      {
        title: 'Nhiệm Vụ & Battle Pass',
        icon: <Gift className="w-5 h-5 text-indigo-500" />,
        items: [
          'Daily Missions: Nhiệm vụ hàng ngày với phần thưởng, reset tự động',
          'Battle Pass Tab: 50 cấp độ phần thưởng Free và Premium',
          'Achievements: 15+ thành tựu với cấp Bronze, Silver, Gold, Platinum',
          'Tích lũy EXP qua mọi hoạt động chơi game',
        ],
      },
      {
        title: 'Shop & Marketplace',
        icon: <Store className="w-5 h-5 text-yellow-500" />,
        items: [
          'Shop: Cửa hàng vật phẩm cơ bản',
          'Enhanced Shop: Cửa hàng nâng cao với refresh shop',
          'Marketplace: Mua bán vật phẩm P2P với người chơi khác',
          'Premium Pass: Đặc quyền VIP tăng tốc phát triển',
        ],
      },
      {
        title: 'Customization & Analytics',
        icon: <Palette className="w-5 h-5 text-pink-500" />,
        items: [
          'Customization Tab: Tùy chỉnh giao diện nhân vật',
          'Analytics Tab: Thống kê tiến độ và phân tích dữ liệu chơi',
          'Settings Panel: Cài đặt âm thanh, thông báo',
          'Changelog: Xem lịch sử cập nhật game',
        ],
      },
      {
        title: 'Văn Hóa & Giáo Dục',
        icon: <FileText className="w-5 h-5 text-orange-500" />,
        items: [
          'Culture Center: Trung tâm văn hóa Việt Nam',
          'Quiz kiến thức với 3 cấp độ: Dễ, Trung Bình, Khó',
          'Nội dung giáo dục về lịch sử Việt Nam',
          'Tutorial hướng dẫn cho người chơi mới',
        ],
      },
      {
        title: 'Hệ Thống Tài Khoản & UX',
        icon: <Zap className="w-5 h-5 text-cyan-500" />,
        items: [
          'Đăng ký/Đăng nhập với Email + Google Sign-In',
          'Lưu tiến độ tự động (Sync với Backend)',
          'Responsive Design: Mobile Bottom Nav + Desktop Top Nav',
          'Mobile: Swipeable Cards, Desktop: Grid Layout',
        ],
      },
    ],
  },
  {
    version: '0.1.0',
    date: '2024-01-15',
    title: 'MVP1 - Ra Mắt Phiên Bản Đầu Tiên',
    description: 'Phiên bản MVP1 đầu tiên của Kata Game với đầy đủ tính năng cốt lõi: quản lý tỉnh thành, hệ thống anh hùng, chiến đấu, và nhiều hơn nữa!',
    sections: [
      {
        title: 'Hệ Thống Tỉnh Thành',
        icon: <Map className="w-5 h-5 text-green-500" />,
        items: [
          '63 tỉnh thành Việt Nam với 3 khu vực: Bắc - Trung - Nam',
          '3 cấp độ nâng cấp cho mỗi tỉnh: Nông nghiệp, Tài nguyên, Phát triển',
          'Hệ thống sản xuất tài nguyên tự động theo thời gian thực',
          'Khả năng triển khai anh hùng để tăng tốc độ sản xuất',
        ],
      },
      {
        title: 'Tài Nguyên & Kinh Tế',
        icon: <Coins className="w-5 h-5 text-yellow-500" />,
        items: [
          '5 loại tài nguyên chính: Lúa Gạo, Vàng, Đá Quý, Gỗ, Sắt',
          'Tài nguyên ban đầu: 1000 Lúa, 500 Vàng, 100 Đá Quý, 200 Gỗ, 200 Sắt',
          'Hệ thống chi phí nâng cấp cân bằng theo cấp độ',
          'Thu hoạch tài nguyên từ các tỉnh đã chiếm',
        ],
      },
      {
        title: 'Hệ Thống Anh Hùng',
        icon: <Crown className="w-5 h-5 text-purple-500" />,
        items: [
          '5 anh hùng lịch sử Việt Nam: Lý Thường Kiệt, Trần Hưng Đạo, Lê Lợi, Nguyễn Huệ, Hoàng Hoa Thám',
          'Phân loại độ hiếm: Common, Rare, Epic, Legendary',
          'Chỉ số chiến đấu: HP, Attack, Defense, Speed',
          'Mỗi anh hùng có thú cưng đồng hành riêng',
        ],
      },
      {
        title: 'Hệ Thống Thú Cưng',
        icon: <Sparkles className="w-5 h-5 text-pink-500" />,
        items: [
          '5 thú cưng đặc biệt tương ứng anh hùng',
          'Bonus khác nhau: Tăng Attack, Defense, HP, Speed',
          'Cấp độ thú cưng ảnh hưởng đến hiệu quả chiến đấu',
          'Hệ thống nâng cấp và tiến hóa thú cưng',
        ],
      },
      {
        title: 'Hệ Thống Chiến Đấu',
        icon: <Sword className="w-5 h-5 text-red-500" />,
        items: [
          'Chiến đấu PvE để chinh phục tỉnh thành',
          'Tính toán sát thương dựa trên chỉ số anh hùng',
          'Hệ thống speed xác định thứ tự đánh',
          'Phần thưởng sau chiến thắng: tài nguyên và kinh nghiệm',
        ],
      },
      {
        title: 'Văn Hóa & Tri Thức',
        icon: <FileText className="w-5 h-5 text-blue-500" />,
        items: [
          'Câu chuyện lịch sử cho từng tỉnh thành',
          'Hệ thống quiz kiến thức Việt Nam',
          '3 cấp độ câu hỏi: Dễ, Trung Bình, Khó',
          'Phần thưởng dựa trên độ khó câu hỏi',
        ],
      },
      {
        title: 'Thành Tựu',
        icon: <Trophy className="w-5 h-5 text-amber-500" />,
        items: [
          '15+ thành tựu khác nhau theo nhiều danh mục',
          'Loại: Tỉnh thành, Chiến đấu, Kinh tế, Văn hóa, Bộ sưu tập',
          'Phần thưởng hấp dẫn khi hoàn thành',
          'Hệ thống cấp độ Bronze, Silver, Gold, Platinum',
        ],
      },
      {
        title: 'Premium Pass',
        icon: <Gift className="w-5 h-5 text-indigo-500" />,
        items: [
          'Battle Pass với 50 cấp độ phần thưởng',
          'Nhiệm vụ hàng ngày tự động',
          '2 loại phần thưởng: Free và Premium',
          'Tích lũy EXP qua hoạt động chơi game',
        ],
      },
      {
        title: 'Hệ Thống Guild',
        icon: <Users className="w-5 h-5 text-teal-500" />,
        items: [
          'Tạo và quản lý guild với bạn bè',
          'Hệ thống cấp bậc: Guild Master, Officer, Member',
          'Kho guild chia sẻ tài nguyên',
          'Hoạt động guild và sự kiện đặc biệt',
        ],
      },
    ],
  },
];

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <FileText className="w-12 h-12 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Changelog</h1>
          <p className="text-lg text-gray-600">Lịch sử cập nhật và tính năng mới của Kata Game</p>
        </div>

        {/* Changelog Entries */}
        <div className="space-y-8">
          {changelogs.map((changelog, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow duration-300"
            >
              {/* Version Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl font-bold">Version {changelog.version}</span>
                      {index === 0 && (
                        <span className="bg-yellow-400 text-yellow-900 text-xs font-semibold px-2 py-1 rounded-full">
                          Mới nhất
                        </span>
                      )}
                    </div>
                    <p className="text-blue-100 text-sm">{changelog.date}</p>
                  </div>
                  <Sparkles className="w-8 h-8 text-yellow-300" />
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">{changelog.title}</h2>
                <p className="text-gray-600 mb-6">{changelog.description}</p>

                {/* Sections */}
                <div className="space-y-6">
                  {changelog.sections.map((section, sectionIndex) => (
                    <div key={sectionIndex} className="border-l-4 border-blue-500 pl-4">
                      <div className="flex items-center gap-2 mb-3">
                        {section.icon}
                        <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                      </div>
                      <ul className="space-y-2">
                        {section.items.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-start gap-2 text-gray-700">
                            <span className="text-blue-500 mt-1">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer Stats */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>{changelog.sections.length} hệ thống chính</span>
                  <span>
                    {changelog.sections.reduce((acc, section) => acc + section.items.length, 0)} tính năng mới
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Coming Soon Section */}
        <div className="mt-12 text-center bg-gradient-to-r from-purple-100 to-blue-100 rounded-2xl p-8">
          <Sparkles className="w-12 h-12 text-purple-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Sắp Có Mới</h3>
          <p className="text-gray-600 mb-4">
            Chúng tôi đang phát triển nhiều tính năng thú vị cho các phiên bản tiếp theo!
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <span className="bg-white px-4 py-2 rounded-full text-sm font-medium text-gray-700 shadow-sm">
              PvP Arena
            </span>
            <span className="bg-white px-4 py-2 rounded-full text-sm font-medium text-gray-700 shadow-sm">
              Guild Wars
            </span>
            <span className="bg-white px-4 py-2 rounded-full text-sm font-medium text-gray-700 shadow-sm">
              World Boss
            </span>
            <span className="bg-white px-4 py-2 rounded-full text-sm font-medium text-gray-700 shadow-sm">
              Trading System
            </span>
            <span className="bg-white px-4 py-2 rounded-full text-sm font-medium text-gray-700 shadow-sm">
              More Heroes
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
