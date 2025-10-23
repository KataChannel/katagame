'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/lib/gameStore';
import { heroes, calculateHeroPower } from '@/lib/heroesData';
import { Hero, ElementType } from '@/lib/types';
import { getElementData, getElementColor, getElementEmoji } from '@/lib/elementSystem';
import { ElementBadge } from './ElementBadge';
import { 
  Swords, 
  Shield, 
  Zap, 
  Heart, 
  Star, 
  TrendingUp, 
  Lock, 
  Crown,
  X,
  ChevronRight,
  Target,
  Activity
} from 'lucide-react';

export default function HeroesTab() {
  const [selectedHero, setSelectedHero] = useState<Hero | null>(null);
  const [filterElement, setFilterElement] = useState<ElementType | 'all'>('all');
  const [showOnlyOwned, setShowOnlyOwned] = useState(false);
  const { heroes: gameHeroes, addHero, upgradeHero } = useGameStore();

  // Filter heroes
  const filteredHeroes = heroes.filter((hero) => {
    const elementMatch = filterElement === 'all' || hero.element === filterElement;
    const ownedMatch = !showOnlyOwned || hero.owned;
    return elementMatch && ownedMatch;
  });

  return (
    <div className="min-h-screen pb-24 md:pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-lg shadow-lg mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Crown className="w-8 h-8" />
          Anh Hùng Việt Nam
        </h1>
        <p className="text-purple-100 mt-1">
          Thu thập và nâng cấp các anh hùng huyền thoại
        </p>
        <div className="mt-4 flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-300" />
            <span>{heroes.filter(h => h.owned).length}/{heroes.length} Sở hữu</span>
          </div>
          <div className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-red-300" />
            <span>{heroes.filter(h => h.rarity === 'legendary').length} Huyền Thoại</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        {/* Element Filter */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Lọc theo ngũ hành:</h3>
          <div className="flex gap-2 overflow-x-auto pb-2">
            <FilterButton
              active={filterElement === 'all'}
              onClick={() => setFilterElement('all')}
            >
              Tất cả
            </FilterButton>
            {(['fire', 'water', 'wood', 'metal', 'earth'] as ElementType[]).map((element) => {
              const elementData = getElementData(element);
              return (
                <FilterButton
                  key={element}
                  active={filterElement === element}
                  onClick={() => setFilterElement(element)}
                  color={getElementColor(element)}
                >
                  {getElementEmoji(element)} {elementData.name}
                </FilterButton>
              );
            })}
          </div>
        </div>

        {/* Owned Filter */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showOnlyOwned}
            onChange={(e) => setShowOnlyOwned(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300"
          />
          <span className="text-sm text-gray-700">Chỉ hiện anh hùng đã sở hữu</span>
        </label>
      </div>

      {/* Heroes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredHeroes.map((hero) => (
          <HeroCard
            key={hero.id}
            hero={hero}
            onClick={() => setSelectedHero(hero)}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredHeroes.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Lock className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">Không tìm thấy anh hùng</p>
          <p className="text-sm">Thử thay đổi bộ lọc</p>
        </div>
      )}

      {/* Hero Details Modal */}
      <AnimatePresence>
        {selectedHero && (
          <HeroDetailsModal
            hero={selectedHero}
            onClose={() => setSelectedHero(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Filter Button Component
function FilterButton({
  active,
  onClick,
  children,
  color,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap
        transition-all duration-200
        ${active 
          ? 'bg-gradient-to-r text-white shadow-md scale-105' 
          : 'bg-white text-gray-700 hover:bg-gray-50'
        }
      `}
      style={{
        background: active && color ? color : undefined,
      }}
    >
      {children}
    </button>
  );
}

// Hero Card Component
function HeroCard({ hero, onClick }: { hero: Hero; onClick: () => void }) {
  const power = calculateHeroPower(hero);
  const rarityColors = {
    common: 'from-gray-400 to-gray-500',
    rare: 'from-blue-400 to-blue-600',
    epic: 'from-purple-400 to-purple-600',
    legendary: 'from-yellow-400 to-orange-500',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        relative bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer
        border-2 transition-all duration-200
        ${hero.owned 
          ? 'border-transparent hover:shadow-xl' 
          : 'border-gray-200 opacity-75 hover:opacity-90'
        }
      `}
    >
      {/* Locked Overlay */}
      {!hero.owned && (
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center z-10">
          <div className="text-center text-white">
            <Lock className="w-12 h-12 mx-auto mb-2" />
            <p className="text-sm font-medium">Chưa mở khóa</p>
            <p className="text-xs opacity-80">{getUnlockMethodText(hero.unlockMethod)}</p>
          </div>
        </div>
      )}

      {/* Rarity Gradient Header */}
      <div className={`h-2 bg-gradient-to-r ${rarityColors[hero.rarity]}`} />

      {/* Content */}
      <div className="p-4">
        {/* Hero Icon & Name */}
        <div className="flex items-start gap-3 mb-3">
          <div className="text-5xl">{hero.icon}</div>
          <div className="flex-1">
            <h3 className="font-bold text-lg text-gray-900">{hero.displayName}</h3>
            <p className="text-xs text-gray-600">{hero.title}</p>
            <div className="mt-1">
              <ElementBadge element={hero.element} size="sm" />
            </div>
          </div>
        </div>

        {/* Stats Preview */}
        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
          <StatBadge icon={Heart} label="HP" value={hero.stats.maxHp} color="text-red-600" />
          <StatBadge icon={Swords} label="ATK" value={hero.stats.attack} color="text-orange-600" />
          <StatBadge icon={Shield} label="DEF" value={hero.stats.defense} color="text-blue-600" />
          <StatBadge icon={Zap} label="SPD" value={hero.stats.speed} color="text-yellow-600" />
        </div>

        {/* Level & Power */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500" />
            <span className="font-semibold">Cấp {hero.level}</span>
          </div>
          <div className="flex items-center gap-1 text-purple-600">
            <Activity className="w-4 h-4" />
            <span className="font-semibold">{Math.round(power)}</span>
          </div>
        </div>

        {/* Skills Count */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>{hero.skills.length} Kỹ năng</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Stat Badge Component
function StatBadge({ 
  icon: Icon, 
  label, 
  value, 
  color 
}: { 
  icon: any; 
  label: string; 
  value: number; 
  color: string;
}) {
  return (
    <div className="flex items-center gap-1 bg-gray-50 rounded px-2 py-1">
      <Icon className={`w-3 h-3 ${color}`} />
      <span className="text-gray-600">{label}:</span>
      <span className="font-semibold text-gray-900">{value}</span>
    </div>
  );
}

// Hero Details Modal
function HeroDetailsModal({ hero, onClose }: { hero: Hero; onClose: () => void }) {
  const { upgradeHero } = useGameStore();
  const power = calculateHeroPower(hero);

  const handleLevelUp = () => {
    upgradeHero(hero.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className={`
          bg-gradient-to-r p-6 text-white relative
          ${hero.element === 'fire' ? 'from-red-500 to-orange-500' :
            hero.element === 'water' ? 'from-blue-500 to-cyan-500' :
            hero.element === 'wood' ? 'from-green-500 to-emerald-500' :
            hero.element === 'metal' ? 'from-gray-500 to-slate-600' :
            'from-yellow-700 to-amber-600'}
        `}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="flex items-start gap-4">
            <div className="text-6xl">{hero.icon}</div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold">{hero.displayName}</h2>
              <p className="text-white/90 text-sm mt-1">{hero.title}</p>
              <div className="flex items-center gap-3 mt-3">
                <ElementBadge element={hero.element} size="md" />
                <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                  {getRarityText(hero.rarity)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Lore */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Crown className="w-5 h-5 text-purple-600" />
              Truyền Thuyết
            </h3>
            <p className="text-gray-700 text-sm leading-relaxed bg-purple-50 p-4 rounded-lg">
              {hero.lore}
            </p>
          </div>

          {/* Stats */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Chỉ Số
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <StatCard icon={Heart} label="Máu" value={hero.stats.maxHp} color="bg-red-50 text-red-600" />
              <StatCard icon={Swords} label="Tấn Công" value={hero.stats.attack} color="bg-orange-50 text-orange-600" />
              <StatCard icon={Shield} label="Phòng Thủ" value={hero.stats.defense} color="bg-blue-50 text-blue-600" />
              <StatCard icon={Zap} label="Tốc Độ" value={hero.stats.speed} color="bg-yellow-50 text-yellow-600" />
              <StatCard icon={Target} label="Chí Mạng" value={`${hero.stats.critRate}%`} color="bg-purple-50 text-purple-600" />
              <StatCard icon={TrendingUp} label="ST Chí Mạng" value={`${hero.stats.critDamage}%`} color="bg-pink-50 text-pink-600" />
            </div>
            <div className="mt-4 bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Sức Mạnh Tổng:</span>
                <span className="text-2xl font-bold text-purple-600">{Math.round(power)}</span>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Swords className="w-5 h-5 text-red-600" />
              Kỹ Năng
            </h3>
            <div className="space-y-3">
              {hero.skills.map((skill, index) => (
                <div key={skill.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-start gap-3">
                    <div className={`
                      w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold
                      ${hero.element === 'fire' ? 'bg-red-500' :
                        hero.element === 'water' ? 'bg-blue-500' :
                        hero.element === 'wood' ? 'bg-green-500' :
                        hero.element === 'metal' ? 'bg-gray-500' :
                        'bg-yellow-700'}
                    `}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900">{skill.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{skill.description}</p>
                      <div className="flex gap-3 mt-2 text-xs">
                        <span className="bg-red-100 text-red-700 px-2 py-1 rounded">
                          💥 {skill.damage}% ST
                        </span>
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          ⏱️ CD: {skill.cooldown} lượt
                        </span>
                        <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">
                          🎯 {skill.targetType === 'single' ? 'Đơn' : 'Tất cả'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Level Up Section */}
          {hero.owned && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-lg border-2 border-yellow-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Nâng Cấp Anh Hùng
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Cấp hiện tại: <span className="font-bold">{hero.level}</span>
                  </p>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg mb-4">
                <p className="text-sm text-gray-700 font-medium mb-2">Khi nâng cấp sẽ nhận:</p>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-red-50 p-2 rounded text-center">
                    <div className="text-red-600 font-bold">+100</div>
                    <div className="text-gray-600">HP</div>
                  </div>
                  <div className="bg-orange-50 p-2 rounded text-center">
                    <div className="text-orange-600 font-bold">+10</div>
                    <div className="text-gray-600">ATK</div>
                  </div>
                  <div className="bg-blue-50 p-2 rounded text-center">
                    <div className="text-blue-600 font-bold">+5</div>
                    <div className="text-gray-600">DEF</div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleLevelUp}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold py-3 rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                ⬆️ Nâng Cấp Lên Cấp {hero.level + 1}
              </button>
            </div>
          )}

          {/* Unlock Info */}
          {!hero.owned && (
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
              <Lock className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-700 font-medium mb-2">Cách mở khóa:</p>
              <p className="text-sm text-gray-600">{getUnlockMethodText(hero.unlockMethod)}</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// Stat Card Component
function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  color 
}: { 
  icon: any; 
  label: string; 
  value: number | string; 
  color: string;
}) {
  return (
    <div className={`${color} rounded-lg p-3`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4" />
        <span className="text-xs font-medium opacity-80">{label}</span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

// Helper functions
function getRarityText(rarity: string): string {
  const rarityMap = {
    common: '🔵 Thông Thường',
    rare: '💙 Hiếm',
    epic: '💜 Sử Thi',
    legendary: '⭐ Huyền Thoại',
  };
  return rarityMap[rarity as keyof typeof rarityMap] || rarity;
}

function getUnlockMethodText(method: string): string {
  const methodMap = {
    default: 'Anh hùng khởi đầu',
    quest: 'Hoàn thành nhiệm vụ đặc biệt',
    battlepass: 'Đạt cấp 30 trong Battle Pass',
    gacha: 'Rút từ hệ thống Gacha',
    shop: 'Mua tại cửa hàng',
  };
  return methodMap[method as keyof typeof methodMap] || method;
}
