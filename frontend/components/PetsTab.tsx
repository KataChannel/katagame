'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePets } from '@/lib/useMVP1Data';
import { allPets, calculatePetBonus } from '@/lib/petsData';
import { Pet, ElementType } from '@/lib/types';
import { getElementData, getElementColor, getElementEmoji } from '@/lib/elementSystem';
import { ElementBadge } from './ElementBadge';
import { 
  Sparkles, 
  TrendingUp, 
  Shield, 
  Lock, 
  X,
  ChevronRight,
  Star,
  Crown,
  Package,
  Zap,
  Heart,
  MapPin,
  CheckCircle
} from 'lucide-react';

export default function PetsTab() {
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [filterElement, setFilterElement] = useState<ElementType | 'all'>('all');
  const [filterRarity, setFilterRarity] = useState<'all' | 'common' | 'rare' | 'epic' | 'legendary'>('all');
  const [showOnlyOwned, setShowOnlyOwned] = useState(false);
  
  // Use real API data
  const { pets: apiPets, isLoading, error, refreshPets } = usePets();
  
  // Merge API data with local pet definitions
  const petsData = allPets.map(pet => {
    const apiPet = apiPets?.find(p => p.name === pet.name || p.name === pet.displayName);
    return {
      ...pet,
      owned: !!apiPet,
      level: apiPet?.level || pet.level,
      experience: apiPet?.experience || pet.experience,
      id: apiPet?.id || pet.id,
    };
  });

  // Filter pets
  const filteredPets = petsData.filter((pet) => {
    const elementMatch = filterElement === 'all' || pet.element === filterElement;
    const rarityMatch = filterRarity === 'all' || pet.rarity === filterRarity;
    const ownedMatch = !showOnlyOwned || pet.owned;
    return elementMatch && rarityMatch && ownedMatch;
  });

  // Count owned pets
  const ownedCount = petsData.filter(p => p.owned).length;

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-24 md:pb-6">
        <div className="text-center">
          <Sparkles className="w-16 h-16 text-emerald-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Đang tải dữ liệu thú cưng...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-24 md:pb-6">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">Lỗi: {error}</p>
          <button
            onClick={refreshPets}
            className="bg-emerald-500 text-white px-6 py-2 rounded-lg hover:bg-emerald-600"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6 rounded-lg shadow-lg mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="w-8 h-8" />
          Linh Thú Việt Nam
        </h1>
        <p className="text-emerald-100 mt-1">
          Thu thập và trang bị linh thú huyền thoại
        </p>
        <div className="mt-4 flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-300" />
            <span>{ownedCount}/{allPets.length} Sở hữu</span>
          </div>
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-300" />
            <span>{allPets.filter(p => p.rarity === 'legendary').length} Huyền Thoại</span>
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

        {/* Rarity Filter */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Lọc theo độ hiếm:</h3>
          <div className="flex gap-2 overflow-x-auto pb-2">
            <FilterButton
              active={filterRarity === 'all'}
              onClick={() => setFilterRarity('all')}
            >
              Tất cả
            </FilterButton>
            <FilterButton
              active={filterRarity === 'legendary'}
              onClick={() => setFilterRarity('legendary')}
              color="linear-gradient(to right, #fbbf24, #f59e0b)"
            >
              ⭐ Huyền Thoại
            </FilterButton>
            <FilterButton
              active={filterRarity === 'epic'}
              onClick={() => setFilterRarity('epic')}
              color="linear-gradient(to right, #a855f7, #9333ea)"
            >
              💜 Sử Thi
            </FilterButton>
            <FilterButton
              active={filterRarity === 'rare'}
              onClick={() => setFilterRarity('rare')}
              color="linear-gradient(to right, #3b82f6, #2563eb)"
            >
              💙 Hiếm
            </FilterButton>
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
          <span className="text-sm text-gray-700">Chỉ hiện linh thú đã sở hữu</span>
        </label>
      </div>

      {/* Pets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPets.map((pet) => (
          <PetCard
            key={pet.id}
            pet={pet}
            onClick={() => setSelectedPet(pet)}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredPets.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Lock className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">Không tìm thấy linh thú</p>
          <p className="text-sm">Thử thay đổi bộ lọc</p>
        </div>
      )}

      {/* Pet Details Modal */}
      <AnimatePresence>
        {selectedPet && (
          <PetDetailsModal
            pet={selectedPet}
            onClose={() => setSelectedPet(null)}
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
          ? 'text-white shadow-md scale-105' 
          : 'bg-white text-gray-700 hover:bg-gray-50'
        }
      `}
      style={{
        background: active && color ? color : active ? '#10b981' : undefined,
      }}
    >
      {children}
    </button>
  );
}

// Pet Card Component
function PetCard({ pet, onClick }: { pet: Pet; onClick: () => void }) {
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
        ${pet.owned 
          ? 'border-transparent hover:shadow-xl' 
          : 'border-gray-200 opacity-75 hover:opacity-90'
        }
      `}
    >
      {/* Locked Overlay */}
      {!pet.owned && (
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center z-10">
          <div className="text-center text-white">
            <Lock className="w-12 h-12 mx-auto mb-2" />
            <p className="text-sm font-medium">Chưa mở khóa</p>
          </div>
        </div>
      )}

      {/* Rarity Gradient Header */}
      <div className={`h-2 bg-gradient-to-r ${rarityColors[pet.rarity]}`} />

      {/* Content */}
      <div className="p-4">
        {/* Pet Icon & Name */}
        <div className="flex items-start gap-3 mb-3">
          <div className="text-5xl">{pet.icon}</div>
          <div className="flex-1">
            <h3 className="font-bold text-lg text-gray-900">{pet.displayName}</h3>
            <div className="mt-1">
              <ElementBadge element={pet.element} size="sm" />
            </div>
          </div>
        </div>

        {/* Passive Bonus */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-3 mb-3 border border-emerald-200">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-semibold text-emerald-800">Hiệu Ứng Thụ Động</span>
          </div>
          <div className="text-sm font-medium text-gray-900">
            {getBonusText(pet)}
          </div>
        </div>

        {/* Active Skill Preview */}
        {pet.activeSkill && (
          <div className="text-xs text-gray-600 mb-3">
            <div className="flex items-center gap-1 mb-1">
              <Zap className="w-3 h-3 text-yellow-600" />
              <span className="font-semibold">{pet.activeSkill.name}</span>
            </div>
            <p className="line-clamp-2">{pet.activeSkill.description}</p>
          </div>
        )}

        {/* Level & Rarity */}
        <div className="flex items-center justify-between text-xs pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500" />
            <span className="font-semibold">Cấp {pet.level}</span>
          </div>
          <div className="text-gray-600">
            {getRarityEmoji(pet.rarity)}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Pet Details Modal
function PetDetailsModal({ pet, onClose }: { pet: Pet; onClose: () => void }) {
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  
  // Mock provinces for now - will be replaced with real data
  const availableProvinces: any[] = [];

  const handleEquipPet = () => {
    if (selectedProvince && pet.owned) {
      // TODO: Call API to equip pet
      alert(`${pet.displayName} đã được trang bị cho tỉnh!`);
    }
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
          ${pet.element === 'fire' ? 'from-red-500 to-orange-500' :
            pet.element === 'water' ? 'from-blue-500 to-cyan-500' :
            pet.element === 'wood' ? 'from-green-500 to-emerald-500' :
            pet.element === 'metal' ? 'from-gray-500 to-slate-600' :
            'from-yellow-700 to-amber-600'}
        `}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="flex items-start gap-4">
            <div className="text-6xl">{pet.icon}</div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold">{pet.displayName}</h2>
              <div className="flex items-center gap-3 mt-3">
                <ElementBadge element={pet.element} size="md" />
                <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                  {getRarityText(pet.rarity)}
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
              {pet.lore}
            </p>
          </div>

          {/* Passive Bonus */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              Hiệu Ứng Thụ Động
            </h3>
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-lg border-2 border-emerald-200">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center text-2xl">
                  {pet.passiveBonus.type === 'production' ? '📦' : '⚔️'}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-emerald-900">{getBonusText(pet)}</h4>
                  <p className="text-sm text-emerald-700 mt-1">
                    {pet.passiveBonus.type === 'production' 
                      ? `Tăng ${pet.passiveBonus.value}% sản lượng ${getResourceName(pet.passiveBonus.resource || '')} cho tỉnh được trang bị`
                      : `Tăng ${pet.passiveBonus.value}% sát thương trong chiến đấu`
                    }
                  </p>
                  <div className="mt-2 bg-white p-2 rounded text-xs text-gray-600">
                    Ví dụ: 1000 {getResourceName(pet.passiveBonus.resource || '')} → {calculatePetBonus(pet, 1000).toFixed(0)} {getResourceName(pet.passiveBonus.resource || '')}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Active Skill */}
          {pet.activeSkill && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-600" />
                Kỹ Năng Chủ Động
              </h3>
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border-2 border-yellow-200">
                <h4 className="font-bold text-yellow-900 mb-2">{pet.activeSkill.name}</h4>
                <p className="text-sm text-yellow-800 mb-3">{pet.activeSkill.description}</p>
                <div className="flex items-center gap-2 text-xs">
                  <span className="bg-white px-3 py-1 rounded-full text-yellow-700 font-medium">
                    ⏱️ Cooldown: {formatCooldown(pet.activeSkill.cooldown)}
                  </span>
                  <span className="bg-white px-3 py-1 rounded-full text-yellow-700 font-medium">
                    ⚡ {pet.activeSkill.effect}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Equip to Province */}
          {pet.owned && pet.passiveBonus.type === 'production' && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border-2 border-blue-200">
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                Trang Bị Cho Tỉnh
              </h3>
              <p className="text-sm text-gray-700 mb-4">
                Chọn tỉnh để trang bị {pet.displayName} và nhận hiệu ứng sản xuất:
              </p>
              
              <select
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                className="w-full p-3 border-2 border-blue-200 rounded-lg mb-4 focus:border-blue-400 focus:outline-none"
              >
                <option value="">-- Chọn tỉnh --</option>
                {availableProvinces.map((province) => (
                  <option key={province.id} value={province.id}>
                    {province.name} (Cấp {province.level})
                  </option>
                ))}
              </select>

              <button
                onClick={handleEquipPet}
                disabled={!selectedProvince}
                className={`
                  w-full py-3 rounded-lg font-bold transition-all duration-200
                  ${selectedProvince
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 shadow-lg hover:shadow-xl'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                <CheckCircle className="w-5 h-5 inline mr-2" />
                Trang Bị Linh Thú
              </button>
            </div>
          )}

          {/* Unlock Info */}
          {!pet.owned && (
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
              <Lock className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-700 font-medium mb-2">Chưa sở hữu</p>
              <p className="text-sm text-gray-600">
                {pet.rarity === 'legendary' 
                  ? 'Rút từ Gacha hoặc hoàn thành nhiệm vụ đặc biệt'
                  : pet.rarity === 'epic'
                  ? 'Rút từ Gacha hoặc đạt cấp Battle Pass'
                  : 'Rút từ Gacha hoặc mua tại cửa hàng'
                }
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
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

function getRarityEmoji(rarity: string): string {
  const emojiMap = {
    common: '🔵',
    rare: '💙',
    epic: '💜',
    legendary: '⭐',
  };
  return emojiMap[rarity as keyof typeof emojiMap] || '';
}

function getBonusText(pet: Pet): string {
  if (pet.passiveBonus.type === 'production' && pet.passiveBonus.resource) {
    return `+${pet.passiveBonus.value}% ${getResourceName(pet.passiveBonus.resource)}`;
  } else if (pet.passiveBonus.type === 'combat') {
    return `+${pet.passiveBonus.value}% Sát Thương`;
  }
  return `+${pet.passiveBonus.value}%`;
}

function getResourceName(resource: string): string {
  const resourceMap = {
    gold: 'Vàng',
    rice: 'Lúa',
    lumber: 'Gỗ',
    stone: 'Đá',
    culture: 'Văn Hóa',
  };
  return resourceMap[resource as keyof typeof resourceMap] || resource;
}

function formatCooldown(seconds: number): string {
  if (seconds >= 86400) {
    return `${Math.floor(seconds / 86400)} ngày`;
  } else if (seconds >= 3600) {
    return `${Math.floor(seconds / 3600)} giờ`;
  } else if (seconds >= 60) {
    return `${Math.floor(seconds / 60)} phút`;
  }
  return `${seconds} giây`;
}
