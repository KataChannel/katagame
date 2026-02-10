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
import { toast } from 'sonner';
import { formatNumber } from '@/lib/utils'; // Use standard formatter

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
      }
      
      const response = await MVP1ApiClient.upgradeFarmer(provinceId.toString());
      
      if (response?.success && response.data) {
        toast.success(`Nâng cấp Nông Dân lên Level ${farmerLevel + 1} thành công!`);
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
        toast.error('Nâng cấp thất bại', { description: response?.message });
        // Revert optimistic update on failure
        await syncPlayerFromApi();
      }
    } catch (error) {
      toast.error('Lỗi kết nối khi nâng cấp');
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
      }
      
      const response = await MVP1ApiClient.upgradeResource(provinceId.toString());
      
      if (response?.success && response.data) {
        toast.success(`Nâng cấp Tài Nguyên lên Level ${resourceLevel + 1} thành công!`);
        setProvince({
          ...province,
          ...response.data,
          name: response.data.province?.name || province.name,
          displayName: response.data.province?.name || province.displayName,
          region: response.data.province?.region || province.region,
        });
        await Promise.all([syncPlayerFromApi(), syncProvincesFromApi()]);
      } else {
        toast.error('Nâng cấp thất bại', { description: response?.message });
        await syncPlayerFromApi();
      }
    } catch (error) {
      toast.error('Lỗi kết nối khi nâng cấp');
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
      }
      
      const response = await MVP1ApiClient.upgradeDevelopment(provinceId.toString());
      
      if (response?.success && response.data) {
        toast.success(`Nâng cấp Phát Triển lên Level ${developmentLevel + 1} thành công!`);
        setProvince({
          ...province,
          ...response.data,
          name: response.data.province?.name || province.name,
          displayName: response.data.province?.name || province.displayName,
          region: response.data.province?.region || province.region,
        });
        await Promise.all([syncPlayerFromApi(), syncProvincesFromApi()]);
      } else {
        toast.error('Nâng cấp thất bại', { description: response?.message });
        await syncPlayerFromApi();
      }
    } catch (error) {
      toast.error('Lỗi kết nối khi nâng cấp');
      await syncPlayerFromApi();
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-gray-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
    >
      {/* Decorative gradient background (subtle) */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-red-50/50 to-transparent dark:from-red-900/10 pointer-events-none rounded-bl-full" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-2 relative z-10">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="p-1.5 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400">
               <MapPin className="h-5 w-5" />
            </span>
            {provinceName}
          </h3>
          {province.region && (
            <p className="text-gray-500 dark:text-zinc-400 text-sm mt-1 ml-9">
              Khu vực: {province.region}
            </p>
          )}
        </div>
      </div>

      {/* Levels Grid - Redesigned */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-green-50 dark:bg-green-950/20 rounded-xl p-3 text-center border border-green-100 dark:border-green-900/30">
          <div className="flex items-center justify-center gap-1.5 mb-2">
            <TrendingUp className="h-3.5 w-3.5 text-green-600 dark:text-green-500" />
            <span className="text-xs font-bold text-green-700 dark:text-green-400 uppercase tracking-tight">Nông Dân</span>
          </div>
          <div className="text-2xl font-black text-green-800 dark:text-green-300">{farmerLevel}</div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950/20 rounded-xl p-3 text-center border border-blue-100 dark:border-blue-900/30">
          <div className="flex items-center justify-center gap-1.5 mb-2">
            <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-500" />
            <span className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-tight">Tài Nguyên</span>
          </div>
          <div className="text-2xl font-black text-blue-800 dark:text-blue-300">{resourceLevel}</div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-950/20 rounded-xl p-3 text-center border border-purple-100 dark:border-purple-900/30">
          <div className="flex items-center justify-center gap-1.5 mb-2">
            <Star className="h-3.5 w-3.5 text-purple-600 dark:text-purple-500" />
            <span className="text-xs font-bold text-purple-700 dark:text-purple-400 uppercase tracking-tight">Phát Triển</span>
          </div>
          <div className="text-2xl font-black text-purple-800 dark:text-purple-300">{developmentLevel}</div>
        </div>
      </div>

      {/* Player Resources (Mini View) for Context */}
      {player?.resources && (
        <div className="mb-6 py-2 px-3 bg-gray-50 dark:bg-zinc-900/50 rounded-lg flex items-center justify-between text-xs text-gray-500 dark:text-zinc-400">
           <span>Tài sản hiện có:</span>
           <div className="flex gap-3">
             <span className="flex items-center gap-1"><span className="text-yellow-500">💰</span> <b>{formatNumber(player.resources.gold || 0)}</b></span>
             <span className="flex items-center gap-1"><span className="text-amber-500">🌾</span> <b>{formatNumber(player.resources.rice || 0)}</b></span>
           </div>
        </div>
      )}

      {/* Upgrade Actions */}
      <div className="space-y-3">
        {/* Farmer Upgrade */}
        <UpgradeButton
          label="Nâng cấp Nông Dân"
          level={farmerLevel}
          cost={farmerCost}
          canAfford={canAffordFarmer}
          isUpgrading={isUpgrading}
          onClick={handleUpgradeFarmer}
          colorClass="bg-green-600 hover:bg-green-700"
        />

        {/* Resource Upgrade */}
        <UpgradeButton
          label="Nâng cấp Tài Nguyên"
          level={resourceLevel}
          cost={resourceCost}
          canAfford={canAffordResource}
          isUpgrading={isUpgrading}
          onClick={handleUpgradeResource}
          colorClass="bg-blue-600 hover:bg-blue-700"
        />

        {/* Development Upgrade */}
        <UpgradeButton
          label="Nâng cấp Phát Triển"
          level={developmentLevel}
          cost={developmentCost}
          canAfford={canAffordDevelopment}
          isUpgrading={isUpgrading}
          onClick={handleUpgradeDevelopment}
          colorClass="bg-purple-600 hover:bg-purple-700"
        />
      </div>

      {/* Hero Info (if assigned) */}
      {province.hero_name && (
        <div className="mt-4 pt-4 border-t border-dashed border-gray-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
               <Star className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase">Trấn thủ</p>
              <div className="text-sm font-bold text-gray-900 dark:text-white">
                {province.hero_name}
                {province.hero_rarity && (
                  <span className="ml-2 text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-zinc-800 rounded text-gray-600 dark:text-zinc-400">
                    {province.hero_rarity}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

// Extracted Button Component for cleanliness
const UpgradeButton = ({ 
  label, 
  level, 
  cost, 
  canAfford, 
  isUpgrading, 
  onClick,
  colorClass
}: any) => {
  return (
    <button
      onClick={onClick}
      disabled={isUpgrading || !canAfford.canAfford}
      className={`w-full group relative overflow-hidden rounded-xl p-3 text-left transition-all ${
        isUpgrading || !canAfford.canAfford
          ? 'bg-gray-100 dark:bg-zinc-800 text-gray-400 cursor-not-allowed border border-transparent'
          : `text-white shadow-sm hover:shadow-md active:scale-[0.99] ${colorClass}`
      }`}
    >
      <div className="flex justify-between items-center relative z-10">
        <div className="flex flex-col">
          <span className={`text-sm font-bold flex items-center gap-2 ${!canAfford.canAfford && 'opacity-70'}`}>
            {!canAfford.canAfford && <Lock className="h-3.5 w-3.5" />}
            {label} <span className="text-xs opacity-80 font-normal">Lv.{level} ➜ {level + 1}</span>
          </span>
          <span className="text-xs opacity-90 mt-1 flex gap-2">
            {Object.entries(cost).map(([key, value]) => (
              <span key={key} className="flex items-center gap-1">
                {formatResourceWithIcon(key, value as number)}
              </span>
            ))}
          </span>
        </div>
        
        {!canAfford.canAfford && (
          <div className="text-[10px] font-bold bg-black/20 px-2 py-1 rounded text-white/90">
            Thiếu {canAfford.missingResources.length} loại
          </div>
        )}
      </div>
    </button>
  );
};

export default ProvinceCard;