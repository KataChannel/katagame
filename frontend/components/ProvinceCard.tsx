import { Province, Resource } from '@/lib/types';
import { useGameStore } from '@/lib/gameStore';
import { MapPin, Star, TrendingUp, Sparkles, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import MVP1ApiClient from '@/lib/graphqlApiClient';
import { useState, useEffect } from 'react';
import { syncProvincesFromApi, syncPlayerFromApi } from '@/lib/hooks/useApiDataSync';
import { 
  checkResourceAvailability, 
  calculateUpgradeCosts, 
  formatResourceWithIcon,
  getResourceNameVN 
} from '@/lib/resourceChecker';

interface ProvinceCardProps {
  province: any; // Using any for MVP1 API data
}

const ProvinceCard = ({ province: initialProvince }: ProvinceCardProps) => {
  const { player } = useGameStore();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [province, setProvince] = useState(initialProvince);

  // Update local state when prop changes
  useEffect(() => {
    setProvince(initialProvince);
  }, [initialProvince]);

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

  // Calculate upgrade costs
  const farmerCost = calculateUpgradeCosts(farmerLevel, 'farmer');
  const resourceCost = calculateUpgradeCosts(resourceLevel, 'resource');
  const developmentCost = calculateUpgradeCosts(developmentLevel, 'development');

  // Check if player can afford upgrades
  const canAffordFarmer = player?.resources 
    ? checkResourceAvailability(player.resources, farmerCost)
    : { canAfford: false, missingResources: [] };
  
  const canAffordResource = player?.resources 
    ? checkResourceAvailability(player.resources, resourceCost)
    : { canAfford: false, missingResources: [] };
  
  const canAffordDevelopment = player?.resources 
    ? checkResourceAvailability(player.resources, developmentCost)
    : { canAfford: false, missingResources: [] };

  const handleUpgradeFarmer = async () => {
    if (isUpgrading) return;
    
    try {
      setIsUpgrading(true);
      
      // Optimistically deduct resources from UI
      const { player: currentPlayer } = useGameStore.getState();
      if (currentPlayer?.resources) {
        const newResources = { ...currentPlayer.resources };
        newResources.gold = (newResources.gold || 0) - (farmerCost.gold || 0);
        newResources.rice = (newResources.rice || 0) - (farmerCost.rice || 0);
        
        useGameStore.setState({
          player: {
            ...currentPlayer,
            resources: newResources,
            totalResources: newResources,
          }
        });
        console.log('💸 Optimistically deducted resources (Farmer):', farmerCost);
      }
      
      const response = await MVP1ApiClient.upgradeFarmer(provinceId.toString());
      
      if (response?.success && response.data) {
        console.log('✅ Farmer upgraded successfully', response.data);
        // Merge response data with current province data for instant UI update
        setProvince({
          ...province,
          ...response.data,
          name: response.data.province?.name || province.name,
          displayName: response.data.province?.name || province.displayName,
          region: response.data.province?.region || province.region,
        });
        // Sync player resources and provinces from API to get accurate data
        await Promise.all([syncPlayerFromApi(), syncProvincesFromApi()]);
      } else {
        console.error('❌ Farmer upgrade failed:', response?.message);
        // Revert optimistic update on failure
        await syncPlayerFromApi();
      }
    } catch (error) {
      console.error('Failed to upgrade farmer:', error);
      // Revert optimistic update on error
      await syncPlayerFromApi();
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleUpgradeResource = async () => {
    if (isUpgrading) return;
    
    try {
      setIsUpgrading(true);
      
      // Optimistically deduct resources from UI
      const { player: currentPlayer } = useGameStore.getState();
      if (currentPlayer?.resources) {
        const newResources = { ...currentPlayer.resources };
        newResources.gold = (newResources.gold || 0) - (resourceCost.gold || 0);
        newResources.lumber = (newResources.lumber || 0) - (resourceCost.lumber || 0);
        
        useGameStore.setState({
          player: {
            ...currentPlayer,
            resources: newResources,
            totalResources: newResources,
          }
        });
        console.log('💸 Optimistically deducted resources (Resource):', resourceCost);
      }
      
      const response = await MVP1ApiClient.upgradeResource(provinceId.toString());
      
      if (response?.success && response.data) {
        console.log('✅ Resource upgraded successfully', response.data);
        // Merge response data with current province data for instant UI update
        setProvince({
          ...province,
          ...response.data,
          name: response.data.province?.name || province.name,
          displayName: response.data.province?.name || province.displayName,
          region: response.data.province?.region || province.region,
        });
        // Sync player resources and provinces from API to get accurate data
        await Promise.all([syncPlayerFromApi(), syncProvincesFromApi()]);
      } else {
        console.error('❌ Resource upgrade failed:', response?.message);
        // Revert optimistic update on failure
        await syncPlayerFromApi();
      }
    } catch (error) {
      console.error('Failed to upgrade resource:', error);
      // Revert optimistic update on error
      await syncPlayerFromApi();
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleUpgradeDevelopment = async () => {
    if (isUpgrading) return;
    
    try {
      setIsUpgrading(true);
      
      // Optimistically deduct resources from UI
      const { player: currentPlayer } = useGameStore.getState();
      if (currentPlayer?.resources) {
        const newResources = { ...currentPlayer.resources };
        newResources.gold = (newResources.gold || 0) - (developmentCost.gold || 0);
        newResources.rice = (newResources.rice || 0) - (developmentCost.rice || 0);
        newResources.lumber = (newResources.lumber || 0) - (developmentCost.lumber || 0);
        newResources.stone = (newResources.stone || 0) - (developmentCost.stone || 0);
        
        useGameStore.setState({
          player: {
            ...currentPlayer,
            resources: newResources,
            totalResources: newResources,
          }
        });
        console.log('💸 Optimistically deducted resources (Development):', developmentCost);
      }
      
      const response = await MVP1ApiClient.upgradeDevelopment(provinceId.toString());
      
      if (response?.success && response.data) {
        console.log('✅ Development upgraded successfully', response.data);
        // Merge response data with current province data for instant UI update
        setProvince({
          ...province,
          ...response.data,
          name: response.data.province?.name || province.name,
          displayName: response.data.province?.name || province.displayName,
          region: response.data.province?.region || province.region,
        });
        // Sync player resources and provinces from API to get accurate data
        await Promise.all([syncPlayerFromApi(), syncProvincesFromApi()]);
      } else {
        console.error('❌ Development upgrade failed:', response?.message);
        // Revert optimistic update on failure
        await syncPlayerFromApi();
      }
    } catch (error) {
      console.error('Failed to upgrade development:', error);
      // Revert optimistic update on error
      await syncPlayerFromApi();
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

      {/* Player Resources Display */}
      {player?.resources && (
        <div className="mb-4 p-3 bg-white/80 rounded-lg border border-amber-200">
          <div className="text-xs font-semibold text-gray-600 mb-2">Tài nguyên hiện có:</div>
          <div className="grid grid-cols-4 gap-2 text-xs">
            <div className="text-center">
              <div className="font-bold text-yellow-600">💰 {player.resources.gold || 0}</div>
              <div className="text-gray-500">Vàng</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-amber-600">🌾 {player.resources.rice || 0}</div>
              <div className="text-gray-500">Gạo</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-orange-600">🪵 {player.resources.lumber || 0}</div>
              <div className="text-gray-500">Gỗ</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-gray-600">🪨 {player.resources.stone || 0}</div>
              <div className="text-gray-500">Đá</div>
            </div>
          </div>
        </div>
      )}

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
        {/* Farmer Upgrade */}
        <motion.button
          whileTap={canAffordFarmer.canAfford && !isUpgrading ? { scale: 0.95 } : {}}
          onClick={handleUpgradeFarmer}
          disabled={isUpgrading || !canAffordFarmer.canAfford}
          className={`w-full px-4 py-3 rounded-lg font-semibold text-white transition-all ${
            isUpgrading || !canAffordFarmer.canAfford
              ? 'bg-gray-400 cursor-not-allowed opacity-60'
              : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
          }`}
        >
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2">
              {!canAffordFarmer.canAfford && <Lock className="h-4 w-4" />}
              <span>{isUpgrading ? 'Đang nâng cấp...' : `Nâng Cấp Nông Dân → Cấp ${farmerLevel + 1}`}</span>
            </div>
            <span className="text-xs opacity-90">
              {formatResourceWithIcon('gold', farmerCost.gold || 0)} | {formatResourceWithIcon('rice', farmerCost.rice || 0)}
            </span>
            {!canAffordFarmer.canAfford && (
              <span className="text-xs text-red-200 font-bold">
                ⚠️ Thiếu: {canAffordFarmer.missingResources.map(r => 
                  `${getResourceNameVN(r.resource)} (-${r.deficit})`
                ).join(', ')}
              </span>
            )}
          </div>
        </motion.button>

        {/* Resource Upgrade */}
        <motion.button
          whileTap={canAffordResource.canAfford && !isUpgrading ? { scale: 0.95 } : {}}
          onClick={handleUpgradeResource}
          disabled={isUpgrading || !canAffordResource.canAfford}
          className={`w-full px-4 py-3 rounded-lg font-semibold text-white transition-all ${
            isUpgrading || !canAffordResource.canAfford
              ? 'bg-gray-400 cursor-not-allowed opacity-60'
              : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
          }`}
        >
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2">
              {!canAffordResource.canAfford && <Lock className="h-4 w-4" />}
              <span>{isUpgrading ? 'Đang nâng cấp...' : `Nâng Cấp Tài Nguyên → Cấp ${resourceLevel + 1}`}</span>
            </div>
            <span className="text-xs opacity-90">
              {formatResourceWithIcon('gold', resourceCost.gold || 0)} | {formatResourceWithIcon('lumber', resourceCost.lumber || 0)}
            </span>
            {!canAffordResource.canAfford && (
              <span className="text-xs text-red-200 font-bold">
                ⚠️ Thiếu: {canAffordResource.missingResources.map(r => 
                  `${getResourceNameVN(r.resource)} (-${r.deficit})`
                ).join(', ')}
              </span>
            )}
          </div>
        </motion.button>

        {/* Development Upgrade */}
        <motion.button
          whileTap={canAffordDevelopment.canAfford && !isUpgrading ? { scale: 0.95 } : {}}
          onClick={handleUpgradeDevelopment}
          disabled={isUpgrading || !canAffordDevelopment.canAfford}
          className={`w-full px-4 py-3 rounded-lg font-semibold text-white transition-all ${
            isUpgrading || !canAffordDevelopment.canAfford
              ? 'bg-gray-400 cursor-not-allowed opacity-60'
              : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700'
          }`}
        >
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2">
              {!canAffordDevelopment.canAfford && <Lock className="h-4 w-4" />}
              <span>{isUpgrading ? 'Đang nâng cấp...' : `Nâng Cấp Phát Triển → Cấp ${developmentLevel + 1}`}</span>
            </div>
            <span className="text-xs opacity-90">
              {formatResourceWithIcon('gold', developmentCost.gold || 0)} | {formatResourceWithIcon('rice', developmentCost.rice || 0)} | {formatResourceWithIcon('lumber', developmentCost.lumber || 0)} | {formatResourceWithIcon('stone', developmentCost.stone || 0)}
            </span>
            {!canAffordDevelopment.canAfford && (
              <span className="text-xs text-red-200 font-bold">
                ⚠️ Thiếu: {canAffordDevelopment.missingResources.map(r => 
                  `${getResourceNameVN(r.resource)} (-${r.deficit})`
                ).join(', ')}
              </span>
            )}
          </div>
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
};

export default ProvinceCard;