'use client';

import { useQuery, useMutation } from '@apollo/client/react';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Search,
  Filter,
  Star,
  Heart,
  Sparkles,
  TrendingUp,
  ChevronDown,
  Zap,
  Crown,
  Gift,
} from 'lucide-react';
import {
  MY_PETS,
  MY_PET_WITH_BONUSES,
  LEVEL_UP_PET,
  GRANT_EXP_TO_PET,
} from '@/lib/graphql/queries';

// Types
interface Pet {
  id: string;
  playerId: string;
  name: string;
  petType: string;
  rarity: string;
  level: number;
  experience: number;
  acquiredAt: string;
}

interface PetBonuses {
  attack?: number;
  defense?: number;
  hp?: number;
  goldBonus?: number;
  riceBonus?: number;
  expBonus?: number;
  speed?: number;
  allStats?: number;
  icon: string;
  description: string;
}

interface PetWithBonuses extends Pet {
  bonuses: PetBonuses;
  expForNextLevel?: number;
  expProgress?: number;
}

type FilterRarity = 'all' | 'common' | 'rare' | 'epic' | 'legendary';
type FilterType = 'all' | string;

export default function PetsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRarity, setFilterRarity] = useState<FilterRarity>('all');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPet, setSelectedPet] = useState<string | null>(null);

  // Queries
  const { data: petsData, loading, refetch } = useQuery<{ myPets: Pet[] }>(MY_PETS);
  const { data: petDetailData, loading: loadingDetail } = useQuery<{ myPetWithBonuses: PetWithBonuses }>(MY_PET_WITH_BONUSES, {
    variables: { petId: selectedPet },
    skip: !selectedPet,
  });

  // Mutations
  const [levelUpPet, { loading: leveling }] = useMutation(LEVEL_UP_PET);
  const [grantExpToPet, { loading: granting }] = useMutation(GRANT_EXP_TO_PET);

  const pets: Pet[] = petsData?.myPets || [];
  const selectedPetDetail: PetWithBonuses | null = petDetailData?.myPetWithBonuses || null;

  // Extract unique types
  const petTypes = useMemo(() => {
    const typeSet = new Set<string>();
    pets.forEach(p => p.petType && typeSet.add(p.petType));
    return Array.from(typeSet);
  }, [pets]);

  // Filter pets
  const filteredPets = useMemo(() => {
    return pets.filter((pet) => {
      const matchesSearch = pet.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRarity = filterRarity === 'all' || pet.rarity === filterRarity;
      const matchesType = filterType === 'all' || pet.petType === filterType;
      return matchesSearch && matchesRarity && matchesType;
    });
  }, [pets, searchTerm, filterRarity, filterType]);

  // Pet type config
  const petTypeConfig: Record<string, { emoji: string; color: string }> = {
    dragon: { emoji: '🐉', color: 'from-red-500 to-orange-500' },
    phoenix: { emoji: '🦅', color: 'from-orange-500 to-yellow-500' },
    turtle: { emoji: '🐢', color: 'from-green-500 to-teal-500' },
    tiger: { emoji: '🐯', color: 'from-yellow-500 to-amber-500' },
    unicorn: { emoji: '🦄', color: 'from-purple-500 to-pink-500' },
    default: { emoji: '🐾', color: 'from-gray-500 to-gray-600' },
  };

  // Rarity config
  const rarityConfig: Record<string, { color: string; bgColor: string; stars: number }> = {
    common: { color: 'text-gray-400', bgColor: 'bg-gray-500/20', stars: 1 },
    rare: { color: 'text-blue-400', bgColor: 'bg-blue-500/20', stars: 2 },
    epic: { color: 'text-purple-400', bgColor: 'bg-purple-500/20', stars: 3 },
    legendary: { color: 'text-yellow-400', bgColor: 'bg-yellow-500/20', stars: 4 },
  };

  const getPetConfig = (type: string) => petTypeConfig[type?.toLowerCase()] || petTypeConfig.default;
  const getRarityConfig = (rarity: string) => rarityConfig[rarity?.toLowerCase()] || rarityConfig.common;

  // Handle Level Up
  const handleLevelUp = async (petId: string) => {
    try {
      await levelUpPet({ variables: { petId } });
      refetch();
    } catch (error) {
      console.error('Level up failed:', error);
    }
  };

  // Handle Grant EXP
  const handleGrantExp = async (petId: string, amount: number) => {
    try {
      await grantExpToPet({ variables: { petId, expAmount: amount } });
      refetch();
    } catch (error) {
      console.error('Grant exp failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 py-4 px-3 md:py-8 md:px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-6"
        >
          <div className="flex justify-center items-center gap-3 mb-3">
            <span className="text-4xl md:text-5xl">🐾</span>
            <h1 className="text-2xl md:text-4xl font-bold text-white">
              Linh Thú
            </h1>
          </div>
          <p className="text-base md:text-xl text-purple-200">
            Thu thập và huấn luyện các linh thú huyền bí
          </p>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/10 backdrop-blur-md rounded-xl p-4 mb-6 border border-white/20"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-pink-400" />
              <div>
                <p className="text-xs text-purple-200">Tổng linh thú</p>
                <p className="text-lg font-bold text-white">{pets.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Crown className="w-6 h-6 text-yellow-400" />
              <div>
                <p className="text-xs text-purple-200">Legendary</p>
                <p className="text-lg font-bold text-white">
                  {pets.filter(p => p.rarity === 'legendary').length}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-green-400" />
              <div>
                <p className="text-xs text-purple-200">Tổng Level</p>
                <p className="text-lg font-bold text-white">
                  {pets.reduce((sum, p) => sum + (p.level || 1), 0)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-400" />
              <div>
                <p className="text-xs text-purple-200">Loại</p>
                <p className="text-lg font-bold text-white">{petTypes.length}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Search & Filter */}
        <div className="space-y-3 mb-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300" />
            <input
              type="text"
              placeholder="Tìm linh thú..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl text-purple-200"
          >
            <Filter className="w-4 h-4" />
            Bộ lọc
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>

          {/* Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="grid grid-cols-2 gap-3 overflow-hidden"
              >
                {/* Rarity Filter */}
                <div>
                  <label className="text-xs text-purple-300 mb-1 block">Độ hiếm</label>
                  <select
                    value={filterRarity}
                    onChange={(e) => setFilterRarity(e.target.value as FilterRarity)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
                  >
                    <option value="all" className="text-black">Tất cả</option>
                    <option value="common" className="text-black">Thường</option>
                    <option value="rare" className="text-black">Hiếm</option>
                    <option value="epic" className="text-black">Sử thi</option>
                    <option value="legendary" className="text-black">Huyền thoại</option>
                  </select>
                </div>

                {/* Type Filter */}
                <div>
                  <label className="text-xs text-purple-300 mb-1 block">Loại</label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
                  >
                    <option value="all" className="text-black">Tất cả</option>
                    {petTypes.map(type => (
                      <option key={type} value={type} className="text-black">{type}</option>
                    ))}
                  </select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Pets Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          <AnimatePresence mode="popLayout">
            {filteredPets.map((pet, index) => {
              const typeConfig = getPetConfig(pet.petType);
              const rarity = getRarityConfig(pet.rarity);

              return (
                <motion.div
                  key={pet.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedPet(pet.id)}
                  className="cursor-pointer"
                >
                  <div
                    className={`bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden hover:scale-105 transition-all ${
                      selectedPet === pet.id ? 'ring-2 ring-purple-400' : ''
                    }`}
                  >
                    {/* Header */}
                    <div className={`bg-gradient-to-r ${typeConfig.color} p-3 relative`}>
                      {/* Stars */}
                      <div className="flex gap-0.5 mb-1">
                        {Array.from({ length: rarity.stars }).map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${rarity.color} fill-current`} />
                        ))}
                      </div>
                      
                      {/* Avatar */}
                      <div className="w-16 h-16 mx-auto bg-white/30 rounded-full flex items-center justify-center text-3xl">
                        {typeConfig.emoji}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-3">
                      <h3 className="font-bold text-white text-sm truncate">{pet.name}</h3>
                      <p className="text-xs text-purple-300">{pet.petType || 'Linh thú'}</p>

                      {/* Level */}
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-purple-300">Lv.</span>
                          <span className="font-bold text-yellow-400">{pet.level || 1}</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLevelUp(pet.id);
                          }}
                          disabled={leveling}
                          className="px-2 py-1 bg-purple-500/30 hover:bg-purple-500/50 rounded text-white text-xs"
                        >
                          ⬆️
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredPets.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <span className="text-6xl mb-4 block">🐾</span>
            <p className="text-xl text-purple-200">Chưa có linh thú</p>
            <p className="text-sm text-purple-300/70 mt-2">Hoàn thành story để nhận linh thú!</p>
          </motion.div>
        )}

        {/* Pet Detail Modal */}
        <AnimatePresence>
          {selectedPet && selectedPetDetail && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 flex items-end md:items-center justify-center z-50 p-4"
              onClick={() => setSelectedPet(null)}
            >
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-2xl w-full max-w-md max-h-[85vh] overflow-hidden"
              >
                {/* Header */}
                <div className={`bg-gradient-to-r ${getPetConfig(selectedPetDetail.petType).color} p-6 text-center`}>
                  <div className="w-24 h-24 mx-auto bg-white/30 rounded-full flex items-center justify-center text-5xl mb-3">
                    {getPetConfig(selectedPetDetail.petType).emoji}
                  </div>
                  <h2 className="text-2xl font-bold text-white">{selectedPetDetail.name}</h2>
                  <div className="flex justify-center gap-1 mt-2">
                    {Array.from({ length: getRarityConfig(selectedPetDetail.rarity).stars }).map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-300 fill-yellow-300" />
                    ))}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 overflow-y-auto max-h-[50vh]">
                  {/* Level & EXP */}
                  <div className="bg-white/10 rounded-xl p-4 mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-purple-200">Level</span>
                      <span className="text-2xl font-bold text-yellow-400">{selectedPetDetail.level || 1}</span>
                    </div>
                    <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-400 to-pink-400"
                        style={{
                          width: `${((selectedPetDetail.expProgress || 0) / (selectedPetDetail.expForNextLevel || 100)) * 100}%`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-purple-300 mt-1">
                      <span>{selectedPetDetail.expProgress || 0} EXP</span>
                      <span>{selectedPetDetail.expForNextLevel || 100} EXP</span>
                    </div>
                  </div>

                  {/* Bonuses */}
                  {selectedPetDetail.bonuses && (
                    <div className="bg-white/10 rounded-xl p-4">
                      <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-400" />
                        Bonus
                      </h3>
                      <p className="text-purple-200 text-sm mb-3">{selectedPetDetail.bonuses.description}</p>
                      
                      <div className="grid grid-cols-2 gap-2">
                        {selectedPetDetail.bonuses.attack && (
                          <div className="bg-red-500/20 rounded-lg p-2 text-center">
                            <p className="text-xs text-red-300">Tấn công</p>
                            <p className="font-bold text-white">+{selectedPetDetail.bonuses.attack}</p>
                          </div>
                        )}
                        {selectedPetDetail.bonuses.defense && (
                          <div className="bg-blue-500/20 rounded-lg p-2 text-center">
                            <p className="text-xs text-blue-300">Phòng thủ</p>
                            <p className="font-bold text-white">+{selectedPetDetail.bonuses.defense}</p>
                          </div>
                        )}
                        {selectedPetDetail.bonuses.goldBonus && (
                          <div className="bg-yellow-500/20 rounded-lg p-2 text-center">
                            <p className="text-xs text-yellow-300">Vàng</p>
                            <p className="font-bold text-white">+{selectedPetDetail.bonuses.goldBonus}%</p>
                          </div>
                        )}
                        {selectedPetDetail.bonuses.expBonus && (
                          <div className="bg-green-500/20 rounded-lg p-2 text-center">
                            <p className="text-xs text-green-300">EXP</p>
                            <p className="font-bold text-white">+{selectedPetDetail.bonuses.expBonus}%</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/20 flex gap-3">
                  <button
                    onClick={() => handleGrantExp(selectedPetDetail.id, 50)}
                    disabled={granting}
                    className="flex-1 py-3 bg-purple-500/30 hover:bg-purple-500/50 rounded-xl text-white font-medium"
                  >
                    +50 EXP
                  </button>
                  <button
                    onClick={() => handleLevelUp(selectedPetDetail.id)}
                    disabled={leveling}
                    className="flex-1 py-3 bg-yellow-500 hover:bg-yellow-400 rounded-xl text-black font-bold"
                  >
                    ⬆️ Lên cấp
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Back Link */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all"
          >
            ← Quay lại trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
