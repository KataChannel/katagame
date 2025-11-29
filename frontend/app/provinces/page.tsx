'use client';

import { useQuery } from '@apollo/client';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  MapPin,
  TrendingUp,
  Lock,
  CheckCircle2,
  Clock,
  ChevronDown,
  Grid3x3,
  List,
} from 'lucide-react';
import {
  ALL_PROVINCES,
  REGION_STATISTICS,
} from '@/lib/graphql/queries';
import type { ProvinceData, RegionStatistics as RegionStats } from '@/lib/types/mvp1.types';

type ViewMode = 'grid' | 'list';
type FilterRegion = 'all' | 'north' | 'central' | 'south';
type FilterOwnership = 'all' | 'owned' | 'available' | 'locked';

export default function ProvincesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRegion, setFilterRegion] = useState<FilterRegion>('all');
  const [filterOwnership, setFilterOwnership] = useState<FilterOwnership>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // GraphQL Queries
  const { data: provincesData, loading: provincesLoading } = useQuery(ALL_PROVINCES);
  const { data: statsData } = useQuery<{ regionStatistics: RegionStats }>(REGION_STATISTICS);

  const provinces: ProvinceData[] = provincesData?.allProvinces || [];
  const stats = statsData?.regionStatistics;

  // Filter provinces
  const filteredProvinces = useMemo(() => {
    return provinces.filter((province) => {
      // Search filter
      const matchesSearch =
        province.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        province.nameEnglish?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        province.description?.toLowerCase().includes(searchTerm.toLowerCase());

      // Region filter
      const matchesRegion =
        filterRegion === 'all' ||
        (filterRegion === 'north' && province.region === 'Miền Bắc') ||
        (filterRegion === 'central' && province.region === 'Miền Trung') ||
        (filterRegion === 'south' && province.region === 'Miền Nam');

      // Ownership filter
      const matchesOwnership =
        filterOwnership === 'all' ||
        province.ownershipStatus === filterOwnership;

      return matchesSearch && matchesRegion && matchesOwnership;
    });
  }, [provinces, searchTerm, filterRegion, filterOwnership]);

  // Region emoji mapping
  const getRegionEmoji = (region: string) => {
    if (region === 'Miền Bắc') return '🏔️';
    if (region === 'Miền Trung') return '⛰️';
    if (region === 'Miền Nam') return '🌾';
    return '📍';
  };

  // Ownership status badge
  const getStatusBadge = (status: string) => {
    if (status === 'owned') {
      return (
        <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
          <CheckCircle2 className="w-3 h-3" />
          Sở hữu
        </div>
      );
    }
    if (status === 'available') {
      return (
        <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
          <Clock className="w-3 h-3" />
          Khả dụng
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-medium">
        <Lock className="w-3 h-3" />
        Khóa
      </div>
    );
  };

  if (provincesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải 63 tỉnh thành...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white p-6 shadow-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">63 Tỉnh Thành Việt Nam</h1>
              <p className="text-blue-100">Khám phá và chinh phục toàn bộ đất nước</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold">{stats?.overall.owned || 0}/63</div>
              <div className="text-blue-100 text-sm">Tỉnh đã sở hữu</div>
            </div>
          </div>

          {/* Quick Stats */}
          {stats && (
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <div className="text-2xl font-bold">🏔️ {stats.north.owned}/{stats.north.total}</div>
                <div className="text-blue-100 text-sm">Miền Bắc</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <div className="text-2xl font-bold">⛰️ {stats.central.owned}/{stats.central.total}</div>
                <div className="text-blue-100 text-sm">Miền Trung</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <div className="text-2xl font-bold">🌾 {stats.south.owned}/{stats.south.total}</div>
                <div className="text-blue-100 text-sm">Miền Nam</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Search & Filters */}
      <div className="max-w-7xl mx-auto p-4 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm kiếm tỉnh thành (Hà Nội, Sài Gòn, Đà Nẵng...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none"
          />
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border-2 border-gray-200 hover:border-purple-400 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Bộ lọc
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>

          <div className="flex-1"></div>

          {/* View Mode Toggle */}
          <div className="flex gap-2 bg-white rounded-lg p-1 border-2 border-gray-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-purple-100 text-purple-700' : 'text-gray-500'}`}
            >
              <Grid3x3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-purple-100 text-purple-700' : 'text-gray-500'}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Options */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-white rounded-xl p-4 border-2 border-gray-200 space-y-4"
            >
              {/* Region Filter */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Vùng miền</label>
                <div className="flex gap-2 flex-wrap">
                  {(['all', 'north', 'central', 'south'] as FilterRegion[]).map((region) => (
                    <button
                      key={region}
                      onClick={() => setFilterRegion(region)}
                      className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                        filterRegion === region
                          ? 'bg-purple-100 border-purple-400 text-purple-700'
                          : 'border-gray-200 hover:border-purple-200'
                      }`}
                    >
                      {region === 'all' && 'Tất cả'}
                      {region === 'north' && '🏔️ Miền Bắc'}
                      {region === 'central' && '⛰️ Miền Trung'}
                      {region === 'south' && '🌾 Miền Nam'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ownership Filter */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Trạng thái</label>
                <div className="flex gap-2 flex-wrap">
                  {(['all', 'owned', 'available', 'locked'] as FilterOwnership[]).map((ownership) => (
                    <button
                      key={ownership}
                      onClick={() => setFilterOwnership(ownership)}
                      className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                        filterOwnership === ownership
                          ? 'bg-purple-100 border-purple-400 text-purple-700'
                          : 'border-gray-200 hover:border-purple-200'
                      }`}
                    >
                      {ownership === 'all' && 'Tất cả'}
                      {ownership === 'owned' && '✅ Đã sở hữu'}
                      {ownership === 'available' && '🔓 Khả dụng'}
                      {ownership === 'locked' && '🔒 Khóa'}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Count */}
        <div className="text-sm text-gray-600">
          Hiển thị {filteredProvinces.length} / {provinces.length} tỉnh thành
        </div>

        {/* Province Grid/List */}
        <motion.div
          layout
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
              : 'space-y-3'
          }
        >
          <AnimatePresence mode="popLayout">
            {filteredProvinces.map((province) => (
              <motion.div
                key={province.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ scale: 1.02 }}
                className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow cursor-pointer border-2 ${
                  province.ownershipStatus === 'owned'
                    ? 'border-green-200'
                    : province.ownershipStatus === 'available'
                    ? 'border-blue-200'
                    : 'border-gray-200'
                }`}
              >
                <div className="p-4">
                  {/* Province Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="text-3xl">{getRegionEmoji(province.region)}</div>
                      <div>
                        <h3 className="font-bold text-lg">{province.name}</h3>
                        <p className="text-xs text-gray-500">{province.nameEnglish}</p>
                      </div>
                    </div>
                    {getStatusBadge(province.ownershipStatus)}
                  </div>

                  {/* Province Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      {province.region}
                    </div>

                    {province.isCapital && (
                      <div className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                        ⭐ Thủ đô/Thành phố trung ương
                      </div>
                    )}

                    {/* Production Rates */}
                    {province.ownershipStatus === 'owned' && (
                      <div className="flex items-center gap-3 flex-wrap pt-2 border-t">
                        <div className="flex items-center gap-1 text-xs">
                          <span>💰</span>
                          <span className="font-medium">{province.baseGoldRate}/h</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <span>🌾</span>
                          <span className="font-medium">{province.baseRiceRate}/h</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <span>🪵</span>
                          <span className="font-medium">{province.baseWoodRate}/h</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        {filteredProvinces.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">Không tìm thấy tỉnh thành nào</h3>
            <p className="text-gray-500">Thử thay đổi từ khóa hoặc bộ lọc</p>
          </div>
        )}
      </div>
    </div>
  );
}
