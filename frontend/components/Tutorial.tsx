import { useState } from 'react';
import { useGameStore } from '@/lib/gameStore';
import { ArrowRight, Play, Star, Gift } from 'lucide-react';
import { motion } from 'framer-motion';

interface TutorialProps {
  onComplete: () => void;
}

const Tutorial = ({ onComplete }: TutorialProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const { player, clickFarm } = useGameStore();

  const tutorialSteps = [
    {
      title: 'Chào mừng đến với Đất Việt Truyền Thuyết! 🇻🇳',
      content: 'Bạn sẽ quản lý và phát triển các tỉnh thành Việt Nam, khám phá văn hóa dân tộc và xây dựng đế chế thịnh vượng!',
      image: '🏛️',
      action: null,
    },
    {
      title: 'Thu Thập Tài Nguyên 💰',
      content: 'Click vào các ô tài nguyên trong thẻ tỉnh để thu thập. Mỗi lần click bạn sẽ nhận được 1-3 tài nguyên!',
      image: '🖱️',
      action: 'click-resource',
    },
    {
      title: 'Thuê Nông Dân 👥',
      content: 'Thuê nông dân để tự động thu thập tài nguyên. Nông dân tự động hiệu quả hơn nhưng đắt hơn!',
      image: '👨‍🌾',
      action: 'hire-farmer',
    },
    {
      title: 'Mở Khóa Tỉnh Mới 🗺️',
      content: 'Khi có đủ 200 vàng, bạn có thể mở khóa tỉnh mới. Mỗi tỉnh có đặc sản và bonus riêng!',
      image: '🔓',
      action: null,
    },
    {
      title: 'Học Văn Hóa Việt Nam 📚',
      content: 'Vào tab Văn Hóa để học về lịch sử, danh thắng và nhận điểm culture. Culture giúp mở khóa nhiều tính năng!',
      image: '🎭',
      action: null,
    },
    {
      title: 'Premium Pass 👑',
      content: 'Nâng cấp Premium Pass để nhận bonus tài nguyên, phần thưởng đặc biệt và hỗ trợ phát triển game Việt Nam!',
      image: '💎',
      action: null,
    }
  ];

  const currentStepData = tutorialSteps[currentStep];

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-lg p-8 max-w-md w-full shadow-2xl"
      >
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Hướng Dẫn</span>
            <span className="text-sm font-semibold text-red-600">
              {currentStep + 1}/{tutorialSteps.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-red-500 to-yellow-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">{currentStepData.image}</div>
          <h3 className="text-xl font-bold text-red-800 mb-3">
            {currentStepData.title}
          </h3>
          <p className="text-gray-700 leading-relaxed">
            {currentStepData.content}
          </p>
        </div>

        {/* Special Actions */}
        {currentStepData.action === 'click-resource' && (
          <div className="mb-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800 mb-2">Thử click vào nút này:</p>
            <button
              onClick={() => clickFarm('hanoi', 'gold')}
              className="w-full bg-yellow-500 text-white py-2 rounded font-semibold hover:bg-yellow-600"
            >
              Click để thu thập Vàng! 💰
            </button>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={handleSkip}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-semibold"
          >
            Bỏ qua
          </button>
          
          <button
            onClick={handleNext}
            className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-yellow-500 text-white px-6 py-2 rounded-lg font-semibold hover:from-red-600 hover:to-yellow-600"
          >
            {currentStep < tutorialSteps.length - 1 ? (
              <>
                Tiếp theo <ArrowRight className="h-4 w-4" />
              </>
            ) : (
              <>
                Bắt đầu chơi! <Play className="h-4 w-4" />
              </>
            )}
          </button>
        </div>

        {/* Bonus for completion */}
        {currentStep === tutorialSteps.length - 1 && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 text-green-800 font-semibold">
              <Gift className="h-4 w-4" />
              Phần thưởng hoàn thành: +500 Vàng, +300 Lúa!
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Tutorial;