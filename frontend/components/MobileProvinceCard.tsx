import { Province, Resource } from '@/lib/types';
import { useGameStore } from '@/lib/gameStore';
import { MapPin, Star, TrendingUp, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import MVP1ApiClient from '@/lib/mvp1ApiClient';
import { useState } from 'react';

interface MobileProvinceCardProps {
  province: any; // Using any for MVP1 API data
  className?: string;
}

export default function MobileProvinceCard({ province, className = '' }: MobileProvinceCardProps) {
  const { player } = useGameStore();
  const [isUpgrading, setIsUpgrading] = useState(false);

  // Safety check - province must exist and have required data
  if (!province || Object.keys(province).length === 0) {
    return null; // Don't render if no data
  }

  // MVP1 API structure
  const provinceName = province.name || province.displayName || 'Unknown Province';
  // IMPORTANT: API returns camelCase (provinceId), not snake_case (province_id)
  const provinceId = province.provinceId || province.province_id;
  const farmerLevel = province.farmerLevel || province.farmer_level || 1;
  const resourceLevel = province.resourceLevel || province.resource_level || 1;
  const developmentLevel = province.developmentLevel || province.development_level || 1;

  // Safety check - must have province_id to make API calls
  if (!provinceId) {
    console.warn('Province missing provinceId, skipping render:', province);
    return null;
  }

  const handleUpgradeFarmer = async () => {
    if (isUpgrading) return;
    
    try {
      setIsUpgrading(true);
      const response = await MVP1ApiClient.upgradeFarmer(provinceId.toString());
      
      if (response?.success) {
        // Refresh provinces data
        const provincesData = await MVP1ApiClient.getPlayerProvinces();
        if (provincesData?.success) {
          const provinces = (provincesData.data as any)?.provinces || [];
          useGameStore.setState({ provinces });
        }
      }
    } catch (error) {
      console.error('Failed to upgrade farmer:', error);
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleUpgradeResource = async () => {
    if (isUpgrading) return;
    
    try {
      setIsUpgrading(true);
      const response = await MVP1ApiClient.upgradeResource(provinceId.toString());
      
      if (response?.success) {
        // Refresh provinces data
        const provincesData = await MVP1ApiClient.getPlayerProvinces();
        if (provincesData?.success) {
          const provinces = (provincesData.data as any)?.provinces || [];
          useGameStore.setState({ provinces });
        }
      }
    } catch (error) {
      console.error('Failed to upgrade resource:', error);
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleUpgradeDevelopment = async () => {
    if (isUpgrading) return;
    
    try {
      setIsUpgrading(true);
      const response = await MVP1ApiClient.upgradeDevelopment(provinceId.toString());
      
      if (response?.success) {
        // Refresh provinces data
        const provincesData = await MVP1ApiClient.getPlayerProvinces();
        if (provincesData?.success) {
          const provinces = (provincesData.data as any)?.provinces || [];
          useGameStore.setState({ provinces });
        }
      }
    } catch (error) {
      console.error('Failed to upgrade development:', error);
    } finally {
      setIsUpgrading(false);
    }
  };

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
            {provinceName}
          </h3>
          {province.region && (
            <p className="text-red-600 text-xs sm:text-sm">Khu vực: {province.region}</p>
          )}
        </div>
      </div>

      {/* Levels Display */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-green-100 rounded-lg p-3 text-center border-2 border-green-200">
          <div className="flex items-center justify-center gap-1 mb-1">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="text-xs font-semibold text-green-800">Nông Dân</span>
          </div>
          <div className="text-xl font-bold text-green-900">Cấp {farmerLevel}</div>
        </div>

        <div className="bg-blue-100 rounded-lg p-3 text-center border-2 border-blue-200">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span className="text-xs font-semibold text-blue-800">Tài Nguyên</span>
          </div>
          <div className="text-xl font-bold text-blue-900">Cấp {resourceLevel}</div>
        </div>

        <div className="bg-purple-100 rounded-lg p-3 text-center border-2 border-purple-200">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Star className="h-4 w-4 text-purple-600" />
            <span className="text-xs font-semibold text-purple-800">Phát Triển</span>
          </div>
          <div className="text-xl font-bold text-purple-900">Cấp {developmentLevel}</div>
        </div>
      </div>

      {/* Upgrade Buttons */}
      <div className="space-y-2">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleUpgradeFarmer}
          disabled={isUpgrading}
          className={`w-full px-4 py-3 rounded-lg font-semibold text-white transition-all ${
            isUpgrading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
          }`}
        >
          {isUpgrading ? 'Đang nâng cấp...' : `Nâng Cấp Nông Dân → Cấp ${farmerLevel + 1}`}
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleUpgradeResource}
          disabled={isUpgrading}
          className={`w-full px-4 py-3 rounded-lg font-semibold text-white transition-all ${
            isUpgrading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
          }`}
        >
          {isUpgrading ? 'Đang nâng cấp...' : `Nâng Cấp Tài Nguyên → Cấp ${resourceLevel + 1}`}
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleUpgradeDevelopment}
          disabled={isUpgrading}
          className={`w-full px-4 py-3 rounded-lg font-semibold text-white transition-all ${
            isUpgrading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700'
          }`}
        >
          {isUpgrading ? 'Đang nâng cấp...' : `Nâng Cấp Phát Triển → Cấp ${developmentLevel + 1}`}
        </motion.button>
      </div>

      {/* Hero Info (if assigned) */}
      {province.hero_name && (
        <div className="mt-4 p-3 bg-yellow-100 rounded-lg border border-yellow-200">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-semibold text-yellow-800">
              Anh hùng: {province.hero_name}
            </span>
            {province.hero_rarity && (
              <span className="text-xs text-yellow-600">({province.hero_rarity})</span>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}