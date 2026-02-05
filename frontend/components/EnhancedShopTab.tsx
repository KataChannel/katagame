'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, 
  Calendar, 
  Zap, 
  Package, 
  Clock, 
  Star,
  TrendingUp,
  Gift,
  Crown,
  ChevronRight,
  CheckCircle,
  XCircle,
  History,
  Sparkles,
  Tag,
  Flame,
  Gem
} from 'lucide-react';
import { useGameStore } from '../lib/gameStore';
import VIPStatus from './VIPStatus';
import GemShop from './GemShop';
import {
  formatCountdown,
  getRarityColor,
  getRarityText,
  ShopItem,
  BundlePack,
  FlashSale,
  PurchaseHistory as PurchaseHistoryType
} from '../lib/enhancedShopSystem';

type ShopSubTab = 'daily' | 'weekly' | 'flash' | 'bundles' | 'gems' | 'vip' | 'history';

export default function EnhancedShopTab() {
  const [activeSubTab, setActiveSubTab] = useState<ShopSubTab>('daily');
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ShopItem | BundlePack | null>(null);
  const [selectedShopType, setSelectedShopType] = useState<'daily' | 'weekly' | 'flash' | 'bundle'>('daily');
  const [currentTime, setCurrentTime] = useState(Date.now());

  const {
    player,
    enhancedShopState,
    initializeEnhancedShop,
    purchaseShopItemAction,
    purchaseBundleAction,
    checkAndRefreshShops,
    startFlashSaleAction,
  } = useGameStore();

  // Initialize shop if not exists
  useEffect(() => {
    if (!enhancedShopState) {
      initializeEnhancedShop();
    }
  }, [enhancedShopState, initializeEnhancedShop]);

  // Update countdown timers every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
      checkAndRefreshShops();
    }, 1000);
    return () => clearInterval(interval);
  }, [checkAndRefreshShops]);

  if (!enhancedShopState || !player) {
    return (
      <div className="p-6 text-center">
        <div className="text-2xl mb-2">🏪</div>
        <p className="text-gray-400">Đang tải cửa hàng...</p>
      </div>
    );
  }

  const handlePurchase = (item: ShopItem | BundlePack, shopType: 'daily' | 'weekly' | 'flash' | 'bundle') => {
    setSelectedItem(item);
    setSelectedShopType(shopType);
    setShowPurchaseModal(true);
  };

  const confirmPurchase = () => {
    if (!selectedItem) return;

    if (selectedShopType === 'bundle') {
      purchaseBundleAction((selectedItem as BundlePack).id);
    } else {
      purchaseShopItemAction(selectedItem.id, selectedShopType);
    }

    setShowPurchaseModal(false);
    setSelectedItem(null);
  };

  const activeSale = enhancedShopState.flashSales.find(sale => sale.active);
  const timeUntilDailyRefresh = enhancedShopState.dailyShop.nextRefreshTimestamp - currentTime;
  const timeUntilWeeklyRefresh = enhancedShopState.weeklyShop.nextRefreshTimestamp - currentTime;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4 pb-24">
      {/* Header with VIP info */}
      <div className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl p-4 mb-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Crown className="w-8 h-8 text-yellow-200" />
            <div>
              <div className="text-white font-bold text-lg">VIP Cấp {enhancedShopState.vipSystem.level}</div>
              <div className="text-yellow-200 text-sm">
                {enhancedShopState.vipSystem.points} / {enhancedShopState.vipSystem.nextLevelPoints} điểm
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-yellow-200 text-xs">Ưu đãi VIP</div>
            <div className="text-white font-bold">-{enhancedShopState.vipSystem.benefits.shopDiscountPercent}% Giảm Giá</div>
          </div>
        </div>
        {/* VIP Progress Bar */}
        <div className="mt-3 bg-yellow-800 rounded-full h-2 overflow-hidden">
          <motion.div
            className="bg-yellow-300 h-full"
            initial={{ width: 0 }}
            animate={{ 
              width: `${(enhancedShopState.vipSystem.points / enhancedShopState.vipSystem.nextLevelPoints) * 100}%` 
            }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Flash Sale Banner */}
      {activeSale && (
        <motion.div
          className="bg-gradient-to-r from-red-600 to-orange-600 rounded-xl p-4 mb-4 shadow-lg"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="w-8 h-8 text-yellow-300 animate-pulse" />
              <div>
                <div className="text-white font-bold text-lg">{activeSale.title}</div>
                <div className="text-orange-200 text-sm">{activeSale.description}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-orange-200 text-xs">Còn lại</div>
              <div className="text-white font-bold text-xl">
                {formatCountdown(activeSale.endTime - currentTime)}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Sub Navigation */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {[
          { key: 'daily' as ShopSubTab, label: 'Hàng Ngày', icon: Calendar, count: enhancedShopState.dailyShop.items.length },
          { key: 'weekly' as ShopSubTab, label: 'Hàng Tuần', icon: TrendingUp, count: enhancedShopState.weeklyShop.items.length },
          { key: 'flash' as ShopSubTab, label: 'Flash Sale', icon: Zap, badge: activeSale ? '🔥' : null },
          { key: 'bundles' as ShopSubTab, label: 'Gói Giá Trị', icon: Package, count: enhancedShopState.bundles.filter(b => !b.purchased || !b.oneTime).length },
          { key: 'gems' as ShopSubTab, label: 'Đá Quý', icon: Gem },
          { key: 'vip' as ShopSubTab, label: 'VIP', icon: Crown },
          { key: 'history' as ShopSubTab, label: 'Lịch Sử', icon: History, count: enhancedShopState.purchaseHistory.length },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveSubTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-white text-purple-900 shadow-lg scale-105'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  isActive ? 'bg-purple-900 text-white' : 'bg-white/20'
                }`}>
                  {tab.count}
                </span>
              )}
              {tab.badge && (
                <span className="text-lg">{tab.badge}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeSubTab === 'daily' && (
          <DailyShopSubTab 
            items={enhancedShopState.dailyShop.items}
            timeUntilRefresh={timeUntilDailyRefresh}
            vipDiscount={enhancedShopState.vipSystem.benefits.shopDiscountPercent}
            onPurchase={(item) => handlePurchase(item, 'daily')}
          />
        )}
        {activeSubTab === 'weekly' && (
          <WeeklyShopSubTab 
            items={enhancedShopState.weeklyShop.items}
            timeUntilRefresh={timeUntilWeeklyRefresh}
            vipDiscount={enhancedShopState.vipSystem.benefits.shopDiscountPercent}
            onPurchase={(item) => handlePurchase(item, 'weekly')}
          />
        )}
        {activeSubTab === 'flash' && (
          <FlashSaleSubTab 
            sale={activeSale}
            vipDiscount={enhancedShopState.vipSystem.benefits.shopDiscountPercent}
            onPurchase={(item) => handlePurchase(item, 'flash')}
            onStartSale={startFlashSaleAction}
          />
        )}
        {activeSubTab === 'bundles' && (
          <BundlesSubTab 
            bundles={enhancedShopState.bundles}
            vipDiscount={enhancedShopState.vipSystem.benefits.shopDiscountPercent}
            onPurchase={(bundle) => handlePurchase(bundle, 'bundle')}
          />
        )}
        {activeSubTab === 'gems' && (
          <GemShop />
        )}
        {activeSubTab === 'vip' && (
          <VIPStatus />
        )}
        {activeSubTab === 'history' && (
          <PurchaseHistorySubTab history={enhancedShopState.purchaseHistory} />
        )}
      </AnimatePresence>

      {/* Purchase Confirmation Modal */}
      {showPurchaseModal && selectedItem && (
        <PurchaseModal
          item={selectedItem}
          shopType={selectedShopType}
          vipDiscount={enhancedShopState.vipSystem.benefits.shopDiscountPercent}
          playerResources={{ gold: player.totalResources.gold, gems: player.totalResources.gems || 0 }}
          onConfirm={confirmPurchase}
          onCancel={() => {
            setShowPurchaseModal(false);
            setSelectedItem(null);
          }}
        />
      )}
    </div>
  );
}

// Daily Shop Sub Tab
function DailyShopSubTab({ 
  items, 
  timeUntilRefresh,
  vipDiscount,
  onPurchase 
}: { 
  items: ShopItem[], 
  timeUntilRefresh: number,
  vipDiscount: number,
  onPurchase: (item: ShopItem) => void 
}) {
  return (
    <motion.div
      key="daily"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      {/* Refresh Timer */}
      <div className="bg-white/10 rounded-lg p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-300" />
          <span className="text-white">Làm mới sau:</span>
        </div>
        <div className="text-blue-300 font-bold">{formatCountdown(timeUntilRefresh)}</div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item, index) => (
          <ShopItemCard
            key={item.id}
            item={item}
            vipDiscount={vipDiscount}
            onPurchase={() => onPurchase(item)}
            index={index}
          />
        ))}
      </div>
    </motion.div>
  );
}

// Weekly Shop Sub Tab
function WeeklyShopSubTab({ 
  items, 
  timeUntilRefresh,
  vipDiscount,
  onPurchase 
}: { 
  items: ShopItem[], 
  timeUntilRefresh: number,
  vipDiscount: number,
  onPurchase: (item: ShopItem) => void 
}) {
  return (
    <motion.div
      key="weekly"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      {/* Refresh Timer */}
      <div className="bg-white/10 rounded-lg p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-300" />
          <span className="text-white">Làm mới sau:</span>
        </div>
        <div className="text-purple-300 font-bold">{formatCountdown(timeUntilRefresh)}</div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item, index) => (
          <ShopItemCard
            key={item.id}
            item={item}
            vipDiscount={vipDiscount}
            onPurchase={() => onPurchase(item)}
            index={index}
          />
        ))}
      </div>
    </motion.div>
  );
}

// Flash Sale Sub Tab
function FlashSaleSubTab({ 
  sale, 
  vipDiscount,
  onPurchase,
  onStartSale
}: { 
  sale: FlashSale | undefined, 
  vipDiscount: number,
  onPurchase: (item: ShopItem) => void,
  onStartSale: () => void
}) {
  if (!sale) {
    return (
      <motion.div
        key="flash-empty"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="text-center py-12"
      >
        <Zap className="w-20 h-20 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-300 text-lg mb-6">Hiện không có Flash Sale</p>
        <button
          onClick={onStartSale}
          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-lg font-bold transition-all shadow-lg"
        >
          🔥 Bắt Đầu Flash Sale (Test)
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      key="flash"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sale.items.map((item, index) => (
          <ShopItemCard
            key={item.id}
            item={item}
            vipDiscount={vipDiscount}
            onPurchase={() => onPurchase(item)}
            index={index}
            flashSale
          />
        ))}
      </div>
    </motion.div>
  );
}

// Bundles Sub Tab
function BundlesSubTab({ 
  bundles, 
  vipDiscount,
  onPurchase 
}: { 
  bundles: BundlePack[], 
  vipDiscount: number,
  onPurchase: (bundle: BundlePack) => void 
}) {
  return (
    <motion.div
      key="bundles"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
    >
      {bundles.map((bundle, index) => (
        <BundleCard
          key={bundle.id}
          bundle={bundle}
          vipDiscount={vipDiscount}
          onPurchase={() => onPurchase(bundle)}
          index={index}
        />
      ))}
    </motion.div>
  );
}

// VIP Sub Tab
function VIPSubTab({ vipSystem }: { vipSystem: any }) {
  return (
    <motion.div
      key="vip"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      {/* Current VIP Level */}
      <div className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl p-6 shadow-lg">
        <div className="text-center mb-4">
          <Crown className="w-16 h-16 mx-auto text-yellow-200 mb-2" />
          <h2 className="text-white text-2xl font-bold">VIP Cấp {vipSystem.level}</h2>
          <p className="text-yellow-200">
            {vipSystem.points} / {vipSystem.nextLevelPoints} điểm
          </p>
        </div>
        <div className="bg-yellow-800 rounded-full h-3 overflow-hidden">
          <div
            className="bg-yellow-300 h-full transition-all duration-500"
            style={{ width: `${(vipSystem.points / vipSystem.nextLevelPoints) * 100}%` }}
          />
        </div>
      </div>

      {/* Current Benefits */}
      <div className="bg-white/10 rounded-xl p-4">
        <h3 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-300" />
          Ưu Đãi Hiện Tại
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-yellow-300 text-xs mb-1">Đá Quý Hàng Ngày</div>
            <div className="text-white font-bold">+{vipSystem.benefits.dailyGemBonus} 💎</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-yellow-300 text-xs mb-1">Giảm Giá Cửa Hàng</div>
            <div className="text-white font-bold">-{vipSystem.benefits.shopDiscountPercent}%</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-yellow-300 text-xs mb-1">Thể Lực Bonus</div>
            <div className="text-white font-bold">+{vipSystem.benefits.extraStaminaRegen} ⚡</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-yellow-300 text-xs mb-1">Tăng Tốc</div>
            <div className="text-white font-bold">x{vipSystem.benefits.fastForwardSpeed}</div>
          </div>
        </div>
      </div>

      {/* How to Earn VIP Points */}
      <div className="bg-white/10 rounded-xl p-4">
        <h3 className="text-white font-bold text-lg mb-3">Cách Nhận Điểm VIP</h3>
        <ul className="space-y-2">
          <li className="flex items-center gap-2 text-white">
            <ChevronRight className="w-4 h-4 text-yellow-300" />
            <span>Chi tiêu đá quý: 10 💎 = 1 VIP điểm</span>
          </li>
          <li className="flex items-center gap-2 text-white">
            <ChevronRight className="w-4 h-4 text-yellow-300" />
            <span>Mua gói giá trị: Nhận thêm VIP điểm</span>
          </li>
          <li className="flex items-center gap-2 text-white">
            <ChevronRight className="w-4 h-4 text-yellow-300" />
            <span>Hoàn thành nhiệm vụ đặc biệt</span>
          </li>
        </ul>
      </div>
    </motion.div>
  );
}

// Purchase History Sub Tab
function PurchaseHistorySubTab({ history }: { history: PurchaseHistoryType[] }) {
  if (history.length === 0) {
    return (
      <motion.div
        key="history-empty"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="text-center py-12"
      >
        <History className="w-20 h-20 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-300 text-lg">Chưa có lịch sử mua hàng</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      key="history"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-2"
    >
      {history.map((purchase) => (
        <div key={purchase.id} className="bg-white/10 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-blue-300" />
              <span className="text-white font-medium">{purchase.itemName}</span>
            </div>
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              purchase.itemType === 'flash' ? 'bg-red-500 text-white' :
              purchase.itemType === 'bundle' ? 'bg-purple-500 text-white' :
              purchase.itemType === 'weekly' ? 'bg-blue-500 text-white' :
              'bg-green-500 text-white'
            }`}>
              {purchase.itemType === 'flash' ? 'Flash Sale' :
               purchase.itemType === 'bundle' ? 'Gói' :
               purchase.itemType === 'weekly' ? 'Tuần' : 'Ngày'}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-300">
              {new Date(purchase.timestamp).toLocaleString('vi-VN')}
            </span>
            <span className="text-yellow-300 font-bold">
              {purchase.price} {purchase.currency === 'gold' ? '💰' : '💎'}
            </span>
          </div>
        </div>
      ))}
    </motion.div>
  );
}

// Shop Item Card Component
function ShopItemCard({ 
  item, 
  vipDiscount,
  onPurchase, 
  index,
  flashSale = false
}: { 
  item: ShopItem, 
  vipDiscount: number,
  onPurchase: () => void, 
  index: number,
  flashSale?: boolean
}) {
  const finalPrice = Math.floor(item.currentPrice * (1 - vipDiscount / 100));
  const canPurchase = item.stock !== 0 && 
    (item.maxPurchasePerPlayer === -1 || item.purchaseCount < item.maxPurchasePerPlayer);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className={`bg-white/10 rounded-xl p-4 backdrop-blur-sm hover:bg-white/20 transition-all ${
        flashSale ? 'ring-2 ring-orange-500' : ''
      }`}
    >
      {/* Badges */}
      <div className="flex gap-2 mb-2 flex-wrap">
        {item.hot && <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full flex items-center gap-1">
          <Flame className="w-3 h-3" /> HOT
        </span>}
        {item.new && <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">MỚI</span>}
        {item.bestValue && <span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded-full">GIÁ TỐT</span>}
        {flashSale && <span className="px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full">⚡ FLASH</span>}
      </div>

      {/* Item Info */}
      <div className="text-center mb-3">
        <div className="text-4xl mb-2">{item.icon}</div>
        <div className="text-white font-bold mb-1">{item.name}</div>
        <div className="text-gray-300 text-sm mb-2">{item.description}</div>
        <div
          className="text-xs px-2 py-1 rounded inline-block"
          style={{ backgroundColor: getRarityColor(item.rarity) + '40', color: getRarityColor(item.rarity) }}
        >
          {getRarityText(item.rarity)}
        </div>
      </div>

      {/* Price */}
      <div className="mb-3">
        {item.discount > 0 && (
          <div className="text-center mb-1">
            <span className="text-gray-400 line-through text-sm">
              {item.originalPrice} {item.currency === 'gold' ? '💰' : '💎'}
            </span>
            <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
              -{item.discount}%
            </span>
          </div>
        )}
        <div className="text-center">
          <span className="text-yellow-300 font-bold text-lg">
            {finalPrice} {item.currency === 'gold' ? '💰' : '💎'}
          </span>
          {vipDiscount > 0 && (
            <div className="text-xs text-purple-300">
              (VIP -{vipDiscount}%)
            </div>
          )}
        </div>
      </div>

      {/* Stock */}
      {item.stock !== -1 && (
        <div className="text-center text-sm text-gray-300 mb-2">
          Còn lại: {item.stock}
        </div>
      )}

      {/* Purchase Button */}
      <button
        onClick={onPurchase}
        disabled={!canPurchase}
        className={`w-full py-2 rounded-lg font-bold transition-all ${
          canPurchase
            ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg'
            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
        }`}
      >
        {!canPurchase ? (item.stock === 0 ? 'Hết Hàng' : 'Đã Mua') : 'Mua Ngay'}
      </button>
    </motion.div>
  );
}

// Bundle Card Component
function BundleCard({ 
  bundle, 
  vipDiscount,
  onPurchase, 
  index 
}: { 
  bundle: BundlePack, 
  vipDiscount: number,
  onPurchase: () => void, 
  index: number 
}) {
  const finalPrice = Math.floor(bundle.currentPrice * (1 - vipDiscount / 100));
  const canPurchase = bundle.available && (!bundle.oneTime || !bundle.purchased);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      className={`bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-xl p-5 backdrop-blur-sm hover:scale-105 transition-all ${
        bundle.featured ? 'ring-2 ring-yellow-500' : ''
      }`}
    >
      {/* Badge */}
      {bundle.badgeText && (
        <div className="bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full inline-block mb-3">
          {bundle.badgeText}
        </div>
      )}

      {/* Bundle Info */}
      <div className="text-center mb-4">
        <div className="text-5xl mb-2">{bundle.icon}</div>
        <h3 className="text-white font-bold text-xl mb-1">{bundle.name}</h3>
        <p className="text-gray-300 text-sm">{bundle.description}</p>
      </div>

      {/* Contents */}
      <div className="bg-white/10 rounded-lg p-3 mb-4 space-y-2">
        {bundle.contents.gold > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-300">Vàng</span>
            <span className="text-yellow-300 font-bold">{bundle.contents.gold.toLocaleString()} 💰</span>
          </div>
        )}
        {bundle.contents.gems > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-300">Đá Quý</span>
            <span className="text-blue-300 font-bold">{bundle.contents.gems.toLocaleString()} 💎</span>
          </div>
        )}
        {bundle.contents.stamina > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-300">Thể Lực</span>
            <span className="text-green-300 font-bold">{bundle.contents.stamina} ⚡</span>
          </div>
        )}
        {bundle.contents.heroFragments > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-300">Mảnh Tướng</span>
            <span className="text-purple-300 font-bold">{bundle.contents.heroFragments} 👑</span>
          </div>
        )}
        {bundle.contents.petEggs > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-300">Trứng Thú</span>
            <span className="text-orange-300 font-bold">{bundle.contents.petEggs} 🥚</span>
          </div>
        )}
        {bundle.contents.vipPoints > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-300">Điểm VIP</span>
            <span className="text-yellow-300 font-bold">{bundle.contents.vipPoints} ⭐</span>
          </div>
        )}
        {bundle.contents.bonusItems && bundle.contents.bonusItems.length > 0 && (
          <div className="border-t border-white/20 pt-2 mt-2">
            <div className="text-yellow-300 text-xs mb-1">Bonus:</div>
            {bundle.contents.bonusItems.map((bonus, idx) => (
              <div key={idx} className="text-white text-xs">• {bonus}</div>
            ))}
          </div>
        )}
      </div>

      {/* Price */}
      <div className="mb-4">
        {bundle.discount > 0 && (
          <div className="text-center mb-1">
            <span className="text-gray-400 line-through">
              {bundle.originalPrice} 💎
            </span>
            <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
              -{bundle.discount}%
            </span>
          </div>
        )}
        <div className="text-center">
          <span className="text-yellow-300 font-bold text-2xl">
            {finalPrice} 💎
          </span>
          {vipDiscount > 0 && (
            <div className="text-xs text-purple-300">
              (VIP -{vipDiscount}%)
            </div>
          )}
        </div>
      </div>

      {/* Purchase Button */}
      <button
        onClick={onPurchase}
        disabled={!canPurchase}
        className={`w-full py-3 rounded-lg font-bold text-lg transition-all ${
          canPurchase
            ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-lg'
            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
        }`}
      >
        {bundle.oneTime && bundle.purchased ? 'Đã Mua' : 'Mua Ngay'}
      </button>
    </motion.div>
  );
}

// Purchase Confirmation Modal
function PurchaseModal({
  item,
  shopType,
  vipDiscount,
  playerResources,
  onConfirm,
  onCancel
}: {
  item: ShopItem | BundlePack,
  shopType: 'daily' | 'weekly' | 'flash' | 'bundle',
  vipDiscount: number,
  playerResources: { gold: number, gems: number },
  onConfirm: () => void,
  onCancel: () => void
}) {
  const isBundle = shopType === 'bundle';
  const currency = isBundle ? 'gems' : (item as ShopItem).currency;
  const currentPrice = isBundle ? (item as BundlePack).currentPrice : (item as ShopItem).currentPrice;
  const finalPrice = Math.floor(currentPrice * (1 - vipDiscount / 100));
  
  const canAfford = currency === 'gold' 
    ? playerResources.gold >= finalPrice
    : playerResources.gems >= finalPrice;

  return (
    <motion.div
      className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onCancel}
    >
      <motion.div
        className="bg-gradient-to-br from-purple-900 to-blue-900 rounded-xl p-6 max-w-md w-full"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-white font-bold text-xl mb-4 text-center">Xác Nhận Mua Hàng</h3>
        
        <div className="bg-white/10 rounded-lg p-4 mb-4">
          <div className="text-center">
            <div className="text-4xl mb-2">{isBundle ? (item as BundlePack).icon : (item as ShopItem).icon}</div>
            <div className="text-white font-bold">{item.name}</div>
            <div className="text-gray-300 text-sm mt-1">{item.description}</div>
          </div>
        </div>

        <div className="bg-white/10 rounded-lg p-4 mb-4">
          <div className="flex justify-between text-white mb-2">
            <span>Giá:</span>
            <span className="font-bold">
              {finalPrice} {currency === 'gold' ? '💰' : '💎'}
            </span>
          </div>
          <div className="flex justify-between text-gray-300 text-sm">
            <span>Số dư hiện tại:</span>
            <span className={canAfford ? 'text-green-300' : 'text-red-300'}>
              {currency === 'gold' ? playerResources.gold : playerResources.gems}{' '}
              {currency === 'gold' ? '💰' : '💎'}
            </span>
          </div>
        </div>

        {!canAfford && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 mb-4">
            <p className="text-red-300 text-sm text-center">
              Không đủ {currency === 'gold' ? 'vàng' : 'đá quý'}!
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-bold transition-all"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            disabled={!canAfford}
            className={`flex-1 py-3 rounded-lg font-bold transition-all ${
              canAfford
                ? 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            Xác Nhận
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
