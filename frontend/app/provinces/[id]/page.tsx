'use client';

import { useQuery } from '@apollo/client/react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  MapPin,
  TrendingUp,
  Users,
  Building2,
  Zap,
  Star,
  BookOpen,
  Crown,
  Shield,
  Swords,
} from 'lucide-react';
import { PROVINCE_DETAIL } from '@/lib/graphql/queries';
import type { ProvinceDetails } from '@/lib/types/mvp1.types';

export default function ProvinceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const provinceId = parseInt(params.id as string);

  const { data, loading, error } = useQuery<{ provinceDetail: ProvinceDetails }>(PROVINCE_DETAIL, {
    variables: { provinceId },
  });

  const province = data?.provinceDetail;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin tỉnh thành...</p>
        </div>
      </div>
    );
  }

  if (error || !province) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">Không tìm thấy tỉnh thành</h3>
          <button
            onClick={() => router.push('/provinces')}
            className="mt-4 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  const getRegionEmoji = (region: string) => {
    if (region === 'Miền Bắc') return '🏔️';
    if (region === 'Miền Trung') return '⛰️';
    if (region === 'Miền Nam') return '🌾';
    return '📍';
  };

  const getStatusColor = (status: string) => {
    if (status === 'owned') return 'bg-green-500';
    if (status === 'available') return 'bg-blue-500';
    return 'bg-gray-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 pb-20">
      {/* Header */}
      <div className={`bg-gradient-to-r ${
        province.ownershipStatus === 'owned'
          ? 'from-green-600 to-emerald-600'
          : province.ownershipStatus === 'available'
          ? 'from-blue-600 to-purple-600'
          : 'from-gray-600 to-gray-700'
      } text-white p-6 shadow-lg`}>
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Quay lại
          </button>

          <div className="flex items-start gap-4">
            <div className="text-6xl">{getRegionEmoji(province.region)}</div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">{province.name}</h1>
              <p className="text-white/80 text-lg mb-3">{province.nameEnglish}</p>
              
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1">
                  <MapPin className="w-4 h-4" />
                  {province.region}
                </div>
                
                {province.isCapital && (
                  <div className="flex items-center gap-2 bg-yellow-500/30 backdrop-blur-sm rounded-lg px-3 py-1">
                    <Star className="w-4 h-4" />
                    Thủ đô/TP Trung ương
                  </div>
                )}
                
                <div className={`flex items-center gap-2 ${getStatusColor(province.ownershipStatus)} rounded-lg px-3 py-1`}>
                  {province.ownershipStatus === 'owned' && '✅ Đã sở hữu'}
                  {province.ownershipStatus === 'available' && '🔓 Khả dụng'}
                  {province.ownershipStatus === 'locked' && '🔒 Bị khóa'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6 mt-6">
        {/* Description */}
        {province.description && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <h2 className="text-2xl font-bold mb-3 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-purple-600" />
              Giới thiệu
            </h2>
            <p className="text-gray-700 leading-relaxed">{province.description}</p>
          </motion.div>
        )}

        {/* Production Rates */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-green-600" />
            Tỷ lệ sản xuất
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-lg p-4 text-center">
              <div className="text-3xl mb-2">💰</div>
              <div className="text-2xl font-bold text-yellow-700">{province.productionRates.gold}</div>
              <div className="text-xs text-yellow-600">Vàng/giờ</div>
            </div>
            
            <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-lg p-4 text-center">
              <div className="text-3xl mb-2">🌾</div>
              <div className="text-2xl font-bold text-green-700">{province.productionRates.rice}</div>
              <div className="text-xs text-green-600">Lúa/giờ</div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg p-4 text-center">
              <div className="text-3xl mb-2">🪵</div>
              <div className="text-2xl font-bold text-orange-700">{province.productionRates.wood}</div>
              <div className="text-xs text-orange-600">Gỗ/giờ</div>
            </div>
            
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg p-4 text-center">
              <div className="text-3xl mb-2">🪨</div>
              <div className="text-2xl font-bold text-gray-700">{province.productionRates.stone}</div>
              <div className="text-xs text-gray-600">Đá/giờ</div>
            </div>
            
            <div className="bg-gradient-to-br from-red-100 to-red-200 rounded-lg p-4 text-center">
              <div className="text-3xl mb-2">🔥</div>
              <div className="text-2xl font-bold text-red-700">{province.productionRates.bazan}</div>
              <div className="text-xs text-red-600">Ba Zan/giờ</div>
            </div>
          </div>
        </motion.div>

        {/* Player Data (if owned) */}
        {province.playerData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Building2 className="w-6 h-6 text-blue-600" />
              Thông tin phát triển
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Cấp Nông dân</div>
                <div className="text-2xl font-bold text-blue-600">Lv. {province.playerData.farmerLevel}</div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Cấp Tài nguyên</div>
                <div className="text-2xl font-bold text-green-600">Lv. {province.playerData.resourceLevel}</div>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Cấp Phát triển</div>
                <div className="text-2xl font-bold text-purple-600">Lv. {province.playerData.developmentLevel}</div>
              </div>
              
              <div className="bg-orange-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Số công trình</div>
                <div className="text-2xl font-bold text-orange-600">{province.playerData.buildingsCount}</div>
              </div>
            </div>

            {/* Deployed Hero */}
            {province.playerData.deployedHeroId && (
              <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg p-4 border-2 border-purple-300">
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <Crown className="w-5 h-5 text-purple-600" />
                  Anh hùng trấn giữ
                </h3>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center text-3xl">
                    👑
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-xl">{province.playerData.deployedHeroName}</div>
                    <div className="text-sm text-gray-600 mb-2">
                      {province.playerData.deployedHeroEra} · {province.playerData.deployedHeroRarity}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Passive Buffs */}
            {province.playerData.passiveBuffs.length > 0 && (
              <div className="mt-4">
                <h3 className="font-bold mb-2 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-600" />
                  Buff thụ động
                </h3>
                <div className="flex flex-wrap gap-2">
                  {province.playerData.passiveBuffs.map((buff, idx) => (
                    <div key={idx} className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm">
                      {buff}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Active Skill */}
            {province.playerData.activeSkillLevel > 0 && (
              <div className="mt-4 bg-red-50 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Swords className="w-5 h-5 text-red-600" />
                  <span className="font-medium">Kỹ năng chủ động</span>
                  <span className="ml-auto text-red-600 font-bold">Lv. {province.playerData.activeSkillLevel}</span>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Historical Eras */}
        {province.historicalEras && province.historicalEras.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-orange-600" />
              Các thời kỳ lịch sử
            </h2>
            <div className="flex flex-wrap gap-2">
              {province.historicalEras.map((era, idx) => (
                <div key={idx} className="bg-orange-100 text-orange-700 px-4 py-2 rounded-lg text-sm font-medium">
                  {era}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Stories */}
        {province.stories && province.stories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-indigo-600" />
              Câu chuyện liên quan ({province.stories.length})
            </h2>
            <div className="space-y-3">
              {province.stories.map((story) => (
                <div
                  key={story.id}
                  className={`p-4 rounded-lg border-2 ${
                    story.isAvailable
                      ? 'bg-white border-gray-200 hover:border-indigo-400 cursor-pointer'
                      : 'bg-gray-50 border-gray-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center font-bold text-indigo-600">
                      {story.day}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{story.titleVietnamese}</div>
                      <div className="text-sm text-gray-500">
                        {story.isAvailable ? '✅ Khả dụng' : '🔒 Chưa mở khóa'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Action Buttons (if owned) */}
        {province.ownershipStatus === 'owned' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-2 gap-4"
          >
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-shadow">
              <Shield className="w-6 h-6 inline-block mr-2" />
              Nâng cấp
            </button>
            <button className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-shadow">
              <Users className="w-6 h-6 inline-block mr-2" />
              Triển khai Hero
            </button>
          </motion.div>
        )}

        {/* Unlock Button (if available) */}
        {province.ownershipStatus === 'available' && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-6 rounded-xl font-bold text-xl hover:shadow-xl transition-shadow"
          >
            🔓 Mở khóa tỉnh thành này
          </motion.button>
        )}

        {/* Locked Message */}
        {province.ownershipStatus === 'locked' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gray-100 rounded-xl p-6 text-center"
          >
            <div className="text-6xl mb-4">🔒</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">Tỉnh thành bị khóa</h3>
            <p className="text-gray-600">
              Hoàn thành các nhiệm vụ và câu chuyện trước đó để mở khóa
            </p>
            {province.unlockStoryDay && (
              <p className="text-sm text-gray-500 mt-2">
                Yêu cầu: Hoàn thành câu chuyện ngày {province.unlockStoryDay}
              </p>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
