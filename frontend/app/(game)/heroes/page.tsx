'use client';

import { useQuery, useMutation } from '@apollo/client/react';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Search,
  Filter,
  Star,
  Swords,
  Shield,
  Heart,
  Zap,
  ChevronDown,
  Crown,
  Lock,
  CheckCircle2,
  TrendingUp,
  Users,
} from 'lucide-react';
import {
  GET_HEROES,
  GET_MY_HEROES,
  MY_HEROES_WITH_STATS,
  RECRUIT_HERO,
} from '@/lib/graphql/queries';

// Types
interface Hero {
  id: string;
  nameVietnamese: string;
  nameEnglish?: string;
  era?: string;
  rarity: string;
  role?: string;
  baseHp?: number;
  baseAttack?: number;
  baseDefense?: number;
  baseSpeed?: number;
  bonusType?: string;
  bonusValue?: number;
  petName?: string;
  petEmoji?: string;
  storyDay?: number;
  isAvailable?: boolean;
  isPremium?: boolean;
}

interface PlayerHero {
  id: string;
  heroId: string;
  level: number;
  experience: number;
  deployedTo?: number;
  stats?: {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
  };
  expForNextLevel?: number;
  expProgress?: number;
  hero: Hero;
}

type FilterRarity = 'all' | 'common' | 'rare' | 'epic' | 'legendary';
type FilterEra = 'all' | string;
type ViewMode = 'grid' | 'list';

export default function HeroesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRarity, setFilterRarity] = useState<FilterRarity>('all');
  const [filterEra, setFilterEra] = useState<FilterEra>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [activeTab, setActiveTab] = useState<'owned' | 'all'>('owned');

  // Queries
  const { data: allHeroesData, loading: loadingAll } = useQuery<{ heroes: Hero[] }>(GET_HEROES);
  const { data: myHeroesData, loading: loadingMy, refetch: refetchMyHeroes } = useQuery<{ myHeroesWithStats: PlayerHero[] }>(MY_HEROES_WITH_STATS);
  const [recruitHero, { loading: recruiting }] = useMutation(RECRUIT_HERO);

  const allHeroes: Hero[] = allHeroesData?.heroes || [];
  const myHeroes: PlayerHero[] = myHeroesData?.myHeroesWithStats || [];
  const myHeroIds = myHeroes.map(ph => ph.hero?.id || ph.heroId);

  // Extract unique eras
  const eras = useMemo(() => {
    const eraSet = new Set<string>();
    allHeroes.forEach(h => h.era && eraSet.add(h.era));
    return Array.from(eraSet);
  }, [allHeroes]);

  // Filter heroes
  const filteredHeroes = useMemo(() => {
    const source = activeTab === 'owned' ? myHeroes.map(ph => ({ ...ph.hero, playerData: ph })) : allHeroes;
    
    return source.filter((hero: any) => {
      const matchesSearch =
        hero.nameVietnamese?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hero.nameEnglish?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRarity = filterRarity === 'all' || hero.rarity === filterRarity;
      const matchesEra = filterEra === 'all' || hero.era === filterEra;

      return matchesSearch && matchesRarity && matchesEra;
    });
  }, [activeTab, myHeroes, allHeroes, searchTerm, filterRarity, filterEra]);

  // Rarity config
  const rarityConfig: Record<string, { color: string; bgColor: string; stars: number }> = {
    common: { color: 'text-gray-600', bgColor: 'bg-gray-100', stars: 1 },
    rare: { color: 'text-blue-600', bgColor: 'bg-blue-100', stars: 2 },
    epic: { color: 'text-purple-600', bgColor: 'bg-purple-100', stars: 3 },
    legendary: { color: 'text-yellow-600', bgColor: 'bg-yellow-100', stars: 4 },
  };

  // Handle recruit
  const handleRecruit = async (heroId: string) => {
    try {
      await recruitHero({ variables: { input: { heroId } } });
      refetchMyHeroes();
    } catch (error) {
      console.error('Recruit failed:', error);
    }
  };

  const isLoading = loadingAll || loadingMy;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-900 via-red-900 to-orange-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-red-900 to-orange-900 py-4 px-3 md:py-8 md:px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-6"
        >
          <div className="flex justify-center items-center gap-3 mb-3">
            <Swords className="w-10 h-10 md:w-12 md:h-12 text-yellow-400" />
            <h1 className="text-2xl md:text-4xl font-bold text-white">
              Anh Hùng Dân Tộc
            </h1>
          </div>
          <p className="text-base md:text-xl text-amber-200">
            Thu thập và phát triển các anh hùng lịch sử Việt Nam
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
              <Users className="w-6 h-6 text-blue-400" />
              <div>
                <p className="text-xs text-amber-200">Sở hữu</p>
                <p className="text-lg font-bold text-white">{myHeroes.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Crown className="w-6 h-6 text-yellow-400" />
              <div>
                <p className="text-xs text-amber-200">Legendary</p>
                <p className="text-lg font-bold text-white">
                  {myHeroes.filter(h => h.hero?.rarity === 'legendary').length}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-green-400" />
              <div>
                <p className="text-xs text-amber-200">Tổng Level</p>
                <p className="text-lg font-bold text-white">
                  {myHeroes.reduce((sum, h) => sum + (h.level || 1), 0)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Swords className="w-6 h-6 text-red-400" />
              <div>
                <p className="text-xs text-amber-200">Đã triển khai</p>
                <p className="text-lg font-bold text-white">
                  {myHeroes.filter(h => h.deployedTo).length}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('owned')}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'owned'
                ? 'bg-yellow-500 text-black'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            🏆 Sở Hữu ({myHeroes.length})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'all'
                ? 'bg-yellow-500 text-black'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            📚 Tất Cả ({allHeroes.length})
          </button>
        </div>

        {/* Search & Filter */}
        <div className="space-y-3 mb-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-300" />
            <input
              type="text"
              placeholder="Tìm anh hùng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-amber-300/50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl text-amber-200"
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
                  <label className="text-xs text-amber-300 mb-1 block">Độ hiếm</label>
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

                {/* Era Filter */}
                <div>
                  <label className="text-xs text-amber-300 mb-1 block">Thời kỳ</label>
                  <select
                    value={filterEra}
                    onChange={(e) => setFilterEra(e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
                  >
                    <option value="all" className="text-black">Tất cả</option>
                    {eras.map(era => (
                      <option key={era} value={era} className="text-black">{era}</option>
                    ))}
                  </select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Heroes Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          <AnimatePresence mode="popLayout">
            {filteredHeroes.map((hero: any, index) => {
              const isOwned = myHeroIds.includes(hero.id);
              const playerData = hero.playerData;
              const rarity = rarityConfig[hero.rarity || 'common'];

              return (
                <motion.div
                  key={hero.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative"
                >
                  <Link href={`/heroes/${hero.id}`}>
                    <div
                      className={`bg-white/10 backdrop-blur-md rounded-xl border overflow-hidden hover:scale-105 transition-all cursor-pointer ${
                        isOwned ? 'border-yellow-400/50' : 'border-white/20'
                      }`}
                    >
                      {/* Header */}
                      <div className={`${rarity.bgColor} p-3 relative`}>
                        {/* Stars */}
                        <div className="flex gap-0.5 mb-1">
                          {Array.from({ length: rarity.stars }).map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${rarity.color} fill-current`} />
                          ))}
                        </div>
                        
                        {/* Avatar Placeholder */}
                        <div className="w-16 h-16 mx-auto bg-white/30 rounded-full flex items-center justify-center text-3xl">
                          {hero.petEmoji || '🦸'}
                        </div>

                        {/* Premium Badge */}
                        {hero.isPremium && (
                          <div className="absolute top-2 right-2 bg-yellow-500 text-xs px-2 py-0.5 rounded-full text-black font-bold">
                            VIP
                          </div>
                        )}

                        {/* Owned Badge */}
                        {isOwned && (
                          <div className="absolute top-2 left-2">
                            <CheckCircle2 className="w-5 h-5 text-green-500 fill-green-100" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-3">
                        <h3 className="font-bold text-white text-sm truncate">
                          {hero.nameVietnamese}
                        </h3>
                        <p className="text-xs text-amber-200 truncate">{hero.era || 'Không rõ'}</p>

                        {/* Level (if owned) */}
                        {playerData && (
                          <div className="mt-2 flex items-center gap-1">
                            <span className="text-xs text-amber-300">Lv.</span>
                            <span className="font-bold text-yellow-400">{playerData.level || 1}</span>
                          </div>
                        )}

                        {/* Stats Preview */}
                        <div className="mt-2 grid grid-cols-2 gap-1 text-xs">
                          <div className="flex items-center gap-1 text-red-300">
                            <Heart className="w-3 h-3" />
                            {playerData?.stats?.hp || hero.baseHp || '?'}
                          </div>
                          <div className="flex items-center gap-1 text-orange-300">
                            <Swords className="w-3 h-3" />
                            {playerData?.stats?.attack || hero.baseAttack || '?'}
                          </div>
                          <div className="flex items-center gap-1 text-blue-300">
                            <Shield className="w-3 h-3" />
                            {playerData?.stats?.defense || hero.baseDefense || '?'}
                          </div>
                          <div className="flex items-center gap-1 text-green-300">
                            <Zap className="w-3 h-3" />
                            {playerData?.stats?.speed || hero.baseSpeed || '?'}
                          </div>
                        </div>

                        {/* Recruit Button (if not owned) */}
                        {!isOwned && activeTab === 'all' && hero.isAvailable && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleRecruit(hero.id);
                            }}
                            disabled={recruiting}
                            className="mt-3 w-full py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg text-xs transition-all disabled:opacity-50"
                          >
                            {recruiting ? '...' : '🎖️ Chiêu mộ'}
                          </button>
                        )}

                        {/* Locked */}
                        {!isOwned && !hero.isAvailable && (
                          <div className="mt-3 flex items-center justify-center gap-1 text-gray-400 text-xs">
                            <Lock className="w-3 h-3" />
                            Ngày {hero.storyDay || '?'}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredHeroes.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Swords className="w-16 h-16 mx-auto text-amber-300/50 mb-4" />
            <p className="text-xl text-amber-200">Không tìm thấy anh hùng</p>
            <p className="text-sm text-amber-300/70 mt-2">Thử điều chỉnh bộ lọc</p>
          </motion.div>
        )}

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
