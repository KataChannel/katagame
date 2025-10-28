import { Province, Resource } from '@/lib/types';
import { useGameStore } from '@/lib/gameStore';
import { MapPin, Star, Users, Hammer, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProvinceCardProps {
  province: Province;
}

const ProvinceCard = ({ province }: ProvinceCardProps) => {
  const { clickFarm, unlockProvince, upgradeProvince, buyFarmer, player } = useGameStore();

  const canAffordUnlock = player.totalResources.gold >= 200;
  const canAffordUpgrade = province.unlocked && 
    player.totalResources.gold >= (province.level * 100);

  const handleResourceClick = (resourceType: keyof Resource) => {
    if (province.unlocked) {
      clickFarm(province.id, resourceType);
    }
  };

  const handleUnlock = () => {
    if (canAffordUnlock) {
      unlockProvince(province.id);
    }
  };

  const handleUpgrade = () => {
    if (canAffordUpgrade) {
      upgradeProvince(province.id);
    }
  };

  const handleBuyFarmer = (type: 'manual' | 'auto') => {
    buyFarmer(province.id, type);
  };

  if (!province.unlocked) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0.5 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gray-800 rounded-lg p-6 border-2 border-gray-600"
      >
        <div className="text-center">
          <Lock className="h-12 w-12 mx-auto text-gray-500 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">{province.displayName}</h3>
          <p className="text-gray-400 mb-4">{province.description}</p>
          <button
            onClick={handleUnlock}
            disabled={!canAffordUnlock}
            className={`px-6 py-3 rounded-lg font-semibold ${
              canAffordUnlock
                ? 'bg-gradient-to-r from-red-500 to-yellow-500 text-white hover:from-red-600 hover:to-yellow-600'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            Mở khóa (200 vàng)
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-gradient-to-br from-amber-50 to-red-50 rounded-lg p-6 border-2 border-red-200 shadow-lg"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-2">
        <div className="flex-1">
          <h3 className="text-lg sm:text-2xl font-bold text-red-800 flex items-center gap-2">
            <MapPin className="h-5 w-5 sm:h-6 sm:w-6" />
            {province.displayName}
          </h3>
          <p className="text-red-600 text-xs sm:text-sm">{province.description}</p>
        </div>
        <div className="flex items-center gap-2 bg-yellow-100 px-3 py-1 rounded-full">
          <Star className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
          <span className="font-bold text-red-800 text-sm sm:text-base">Cấp {province.level}</span>
        </div>
      </div>

      {/* Resources */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
        {Object.entries(province.resources).map(([key, value]) => (
          <motion.button
            key={key}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleResourceClick(key as keyof Resource)}
            className="bg-white/70 rounded-lg p-2 sm:p-3 text-center border-2 border-red-200 hover:border-red-400 transition-colors min-h-[60px] sm:min-h-[80px] flex flex-col justify-center active:scale-95 select-none"
          >
            <div className="font-semibold text-red-800 capitalize text-xs sm:text-sm">{key}</div>
            <div className="text-sm sm:text-lg font-bold text-red-900">{Math.floor(value)}</div>
            <div className="text-xs text-red-600">+{province.resourcesPerSecond?.[key as keyof Resource]?.toFixed(1) || 0}/s</div>
          </motion.button>
        ))}
      </div>

      {/* Specialties */}
      <div className="mb-4">
        <h4 className="font-semibold text-red-800 mb-2">Đặc Sản:</h4>
        <div className="flex flex-wrap gap-1">
          {province.specialties.map((specialty, index) => (
            <span
              key={index}
              className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs border border-red-200"
            >
              {specialty}
            </span>
          ))}
        </div>
      </div>

      {/* Cultural Bonus */}
      <div className="mb-4 p-3 bg-purple-100 rounded-lg border border-purple-200">
        <div className="text-purple-800 font-semibold text-sm">{province.culturalBonus}</div>
      </div>

      {/* Farmers */}
      <div className="mb-4">
        <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
          <Users className="h-4 w-4" />
          Nông Dân ({province.farmers.length})
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            onClick={() => handleBuyFarmer('manual')}
            className="bg-green-500 text-white px-3 py-3 rounded-lg text-xs sm:text-sm font-semibold hover:bg-green-600 transition-colors active:scale-95 select-none"
          >
            Thuê Thủ Công (10 vàng)
          </button>
          <button
            onClick={() => handleBuyFarmer('auto')}
            className="bg-blue-500 text-white px-3 py-3 rounded-lg text-xs sm:text-sm font-semibold hover:bg-blue-600 transition-colors active:scale-95 select-none"
          >
            Thuê Tự Động (30 vàng)
          </button>
        </div>
      </div>

      {/* Upgrade */}
      <button
        onClick={handleUpgrade}
        disabled={!canAffordUpgrade || province.level >= province.maxLevel}
        className={`w-full flex items-center justify-center gap-2 px-4 py-3 sm:py-4 rounded-lg font-semibold text-sm sm:text-base active:scale-95 select-none transition-transform ${
          canAffordUpgrade && province.level < province.maxLevel
            ? 'bg-gradient-to-r from-red-500 to-yellow-500 text-white hover:from-red-600 hover:to-yellow-600'
            : 'bg-gray-300 text-gray-600 cursor-not-allowed'
        }`}
      >
        <Hammer className="h-4 w-4" />
        {province.level >= province.maxLevel 
          ? 'Đã Tối Đa' 
          : `Nâng Cấp (${province.level * 100} vàng)`
        }
      </button>
    </motion.div>
  );
};

export default ProvinceCard;