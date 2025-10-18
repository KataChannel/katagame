'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Palette, 
  Shirt, 
  PawPrint, 
  Map, 
  Monitor, 
  Frame as FrameIcon,
  Lock,
  Check,
  Eye,
  Sparkles,
  Crown,
  Star,
  Gem
} from 'lucide-react';
import { useGameStore } from '../lib/gameStore';
import {
  getRarityColor,
  getRarityText,
  HeroSkin,
  PetColorVariant,
  ProvinceThemeConfig,
  AvatarFrame
} from '../lib/customizationSystem';

type CustomizationSubTab = 'skins' | 'pets' | 'themes' | 'ui' | 'frames';

export default function CustomizationTab() {
  const [activeSubTab, setActiveSubTab] = useState<CustomizationSubTab>('skins');
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedItemType, setSelectedItemType] = useState<'skin' | 'variant' | 'theme' | 'frame'>('skin');

  const {
    player,
    heroes,
    pets,
    customizationState,
    initializeCustomization,
    unlockHeroSkinAction,
    equipHeroSkinAction,
    unlockPetVariantAction,
    equipPetVariantAction,
    unlockProvinceThemeAction,
    activateProvinceThemeAction,
    switchUIThemeAction,
    unlockAvatarFrameAction,
    equipAvatarFrameAction,
    startPreviewAction,
    endPreviewAction,
  } = useGameStore();

  // Initialize if not exists
  React.useEffect(() => {
    if (!customizationState) {
      initializeCustomization();
    }
  }, [customizationState, initializeCustomization]);

  if (!customizationState || !player) {
    return (
      <div className="p-6 text-center">
        <div className="text-2xl mb-2">🎨</div>
        <p className="text-gray-400">Đang tải tùy chỉnh...</p>
      </div>
    );
  }

  const handleUnlock = (item: any, type: 'skin' | 'variant' | 'theme' | 'frame') => {
    setSelectedItem(item);
    setSelectedItemType(type);
    setShowUnlockModal(true);
  };

  const confirmUnlock = () => {
    if (!selectedItem) return;

    switch (selectedItemType) {
      case 'skin':
        unlockHeroSkinAction(selectedItem.id);
        break;
      case 'variant':
        unlockPetVariantAction(selectedItem.id);
        break;
      case 'theme':
        unlockProvinceThemeAction(selectedItem.id);
        break;
      case 'frame':
        unlockAvatarFrameAction(selectedItem.id);
        break;
    }

    setShowUnlockModal(false);
    setSelectedItem(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-900 via-purple-900 to-indigo-900 p-4 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl p-4 mb-4 shadow-lg">
        <div className="flex items-center gap-3">
          <Palette className="w-8 h-8 text-white" />
          <div>
            <h2 className="text-white font-bold text-xl">Tùy Chỉnh</h2>
            <p className="text-pink-200 text-sm">Cá nhân hóa trải nghiệm của bạn</p>
          </div>
        </div>
      </div>

      {/* Sub Navigation */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {[
          { key: 'skins' as CustomizationSubTab, label: 'Trang Phục', icon: Shirt, count: customizationState.heroSkins.filter(s => s.unlocked).length },
          { key: 'pets' as CustomizationSubTab, label: 'Thú Cưỡi', icon: PawPrint, count: customizationState.petVariants.filter(v => v.unlocked).length },
          { key: 'themes' as CustomizationSubTab, label: 'Chủ Đề', icon: Map, count: customizationState.provinceThemes.filter(t => t.unlocked).length },
          { key: 'ui' as CustomizationSubTab, label: 'Giao Diện', icon: Monitor },
          { key: 'frames' as CustomizationSubTab, label: 'Khung Avatar', icon: FrameIcon, count: customizationState.avatarFrames.filter(f => f.unlocked).length },
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
              {tab.count !== undefined && (
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  isActive ? 'bg-purple-900 text-white' : 'bg-white/20'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeSubTab === 'skins' && (
          <SkinsSubTab
            skins={customizationState.heroSkins}
            heroes={heroes || []}
            onUnlock={(skin) => handleUnlock(skin, 'skin')}
            onEquip={(skinId) => equipHeroSkinAction(skinId)}
            onPreview={(skinId) => startPreviewAction('skin', skinId)}
          />
        )}
        {activeSubTab === 'pets' && (
          <PetsSubTab
            variants={customizationState.petVariants}
            pets={pets || []}
            onUnlock={(variant) => handleUnlock(variant, 'variant')}
            onEquip={(variantId) => equipPetVariantAction(variantId)}
            onPreview={(variantId) => startPreviewAction('variant', variantId)}
          />
        )}
        {activeSubTab === 'themes' && (
          <ThemesSubTab
            themes={customizationState.provinceThemes}
            onUnlock={(theme) => handleUnlock(theme, 'theme')}
            onActivate={(themeId) => activateProvinceThemeAction(themeId)}
            onPreview={(themeId) => startPreviewAction('theme', themeId)}
          />
        )}
        {activeSubTab === 'ui' && (
          <UIThemeSubTab
            currentTheme={customizationState.uiTheme}
            onSwitch={(theme) => switchUIThemeAction(theme)}
          />
        )}
        {activeSubTab === 'frames' && (
          <FramesSubTab
            frames={customizationState.avatarFrames}
            onUnlock={(frame) => handleUnlock(frame, 'frame')}
            onEquip={(frameId) => equipAvatarFrameAction(frameId)}
            onPreview={(frameId) => startPreviewAction('frame', frameId)}
          />
        )}
      </AnimatePresence>

      {/* Unlock Modal */}
      {showUnlockModal && selectedItem && (
        <UnlockModal
          item={selectedItem}
          type={selectedItemType}
          playerResources={{
            gems: player.totalResources.gems || 0,
            gold: player.totalResources.gold,
            achievementPoints: 0, // TODO: Add achievement points to player
          }}
          onConfirm={confirmUnlock}
          onCancel={() => {
            setShowUnlockModal(false);
            setSelectedItem(null);
          }}
        />
      )}
    </div>
  );
}

// Skins Sub Tab
function SkinsSubTab({
  skins,
  heroes,
  onUnlock,
  onEquip,
  onPreview
}: {
  skins: HeroSkin[],
  heroes: any[],
  onUnlock: (skin: HeroSkin) => void,
  onEquip: (skinId: string) => void,
  onPreview: (skinId: string) => void
}) {
  // Group skins by hero
  const skinsByHero = heroes.map(hero => ({
    hero,
    skins: skins.filter(s => s.heroId === hero.id)
  }));

  if (skins.length === 0) {
    return (
      <motion.div
        key="skins-empty"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="text-center py-12"
      >
        <Shirt className="w-20 h-20 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-300 text-lg">Chưa có trang phục</p>
        <p className="text-gray-400 text-sm mt-2">Tuyển dụng anh hùng để mở khóa trang phục!</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      key="skins"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {skinsByHero.map(({ hero, skins }) => (
        <div key={hero.id} className="bg-white/10 rounded-xl p-4">
          <h3 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
            <span className="text-2xl">{hero.icon}</span>
            <span>{hero.name}</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {skins.map((skin, index) => (
              <SkinCard
                key={skin.id}
                skin={skin}
                onUnlock={() => onUnlock(skin)}
                onEquip={() => onEquip(skin.id)}
                onPreview={() => onPreview(skin.id)}
                index={index}
              />
            ))}
          </div>
        </div>
      ))}
    </motion.div>
  );
}

// Pets Sub Tab
function PetsSubTab({
  variants,
  pets,
  onUnlock,
  onEquip,
  onPreview
}: {
  variants: PetColorVariant[],
  pets: any[],
  onUnlock: (variant: PetColorVariant) => void,
  onEquip: (variantId: string) => void,
  onPreview: (variantId: string) => void
}) {
  // Group variants by pet
  const variantsByPet = pets.map(pet => ({
    pet,
    variants: variants.filter(v => v.petId === pet.id)
  }));

  if (variants.length === 0) {
    return (
      <motion.div
        key="pets-empty"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="text-center py-12"
      >
        <PawPrint className="w-20 h-20 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-300 text-lg">Chưa có thú cưỡi</p>
        <p className="text-gray-400 text-sm mt-2">Hatch trứng để mở khóa màu sắc!</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      key="pets"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {variantsByPet.map(({ pet, variants }) => (
        <div key={pet.id} className="bg-white/10 rounded-xl p-4">
          <h3 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
            <span className="text-2xl">{pet.icon}</span>
            <span>{pet.name}</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {variants.map((variant, index) => (
              <VariantCard
                key={variant.id}
                variant={variant}
                onUnlock={() => onUnlock(variant)}
                onEquip={() => onEquip(variant.id)}
                onPreview={() => onPreview(variant.id)}
                index={index}
              />
            ))}
          </div>
        </div>
      ))}
    </motion.div>
  );
}

// Themes Sub Tab
function ThemesSubTab({
  themes,
  onUnlock,
  onActivate,
  onPreview
}: {
  themes: ProvinceThemeConfig[],
  onUnlock: (theme: ProvinceThemeConfig) => void,
  onActivate: (themeId: string) => void,
  onPreview: (themeId: string) => void
}) {
  return (
    <motion.div
      key="themes"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
    >
      {themes.map((theme, index) => (
        <ThemeCard
          key={theme.id}
          theme={theme}
          onUnlock={() => onUnlock(theme)}
          onActivate={() => onActivate(theme.id)}
          onPreview={() => onPreview(theme.id)}
          index={index}
        />
      ))}
    </motion.div>
  );
}

// UI Theme Sub Tab
function UIThemeSubTab({
  currentTheme,
  onSwitch
}: {
  currentTheme: any,
  onSwitch: (theme: 'light' | 'dark') => void
}) {
  return (
    <motion.div
      key="ui"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="grid grid-cols-1 md:grid-cols-2 gap-6"
    >
      <div
        className={`bg-white rounded-xl p-6 cursor-pointer border-4 transition-all ${
          currentTheme.theme === 'light' ? 'border-blue-500 shadow-lg' : 'border-transparent'
        }`}
        onClick={() => onSwitch('light')}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-gray-900 font-bold text-xl">☀️ Giao Diện Sáng</h3>
            <p className="text-gray-600 text-sm">Dễ nhìn ban ngày</p>
          </div>
          {currentTheme.theme === 'light' && (
            <Check className="w-8 h-8 text-blue-500" />
          )}
        </div>
        <div className="bg-gray-100 rounded-lg p-4 space-y-2">
          <div className="bg-white rounded p-2 shadow">
            <div className="h-2 bg-red-500 rounded w-3/4 mb-2"></div>
            <div className="h-2 bg-gray-300 rounded w-1/2"></div>
          </div>
          <div className="flex gap-2">
            <div className="bg-white rounded p-2 shadow flex-1">
              <div className="h-2 bg-gray-300 rounded"></div>
            </div>
            <div className="bg-white rounded p-2 shadow flex-1">
              <div className="h-2 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`bg-gray-900 rounded-xl p-6 cursor-pointer border-4 transition-all ${
          currentTheme.theme === 'dark' ? 'border-purple-500 shadow-lg' : 'border-transparent'
        }`}
        onClick={() => onSwitch('dark')}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-white font-bold text-xl">🌙 Giao Diện Tối</h3>
            <p className="text-gray-400 text-sm">Bảo vệ mắt ban đêm</p>
          </div>
          {currentTheme.theme === 'dark' && (
            <Check className="w-8 h-8 text-purple-500" />
          )}
        </div>
        <div className="bg-gray-800 rounded-lg p-4 space-y-2">
          <div className="bg-gray-700 rounded p-2">
            <div className="h-2 bg-blue-500 rounded w-3/4 mb-2"></div>
            <div className="h-2 bg-gray-600 rounded w-1/2"></div>
          </div>
          <div className="flex gap-2">
            <div className="bg-gray-700 rounded p-2 flex-1">
              <div className="h-2 bg-gray-600 rounded"></div>
            </div>
            <div className="bg-gray-700 rounded p-2 flex-1">
              <div className="h-2 bg-gray-600 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Frames Sub Tab
function FramesSubTab({
  frames,
  onUnlock,
  onEquip,
  onPreview
}: {
  frames: AvatarFrame[],
  onUnlock: (frame: AvatarFrame) => void,
  onEquip: (frameId: string) => void,
  onPreview: (frameId: string) => void
}) {
  return (
    <motion.div
      key="frames"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
    >
      {frames.map((frame, index) => (
        <FrameCard
          key={frame.id}
          frame={frame}
          onUnlock={() => onUnlock(frame)}
          onEquip={() => onEquip(frame.id)}
          onPreview={() => onPreview(frame.id)}
          index={index}
        />
      ))}
    </motion.div>
  );
}

// Skin Card Component
function SkinCard({
  skin,
  onUnlock,
  onEquip,
  onPreview,
  index
}: {
  skin: HeroSkin,
  onUnlock: () => void,
  onEquip: () => void,
  onPreview: () => void,
  index: number
}) {
  const rarityColor = getRarityColor(skin.rarity);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className={`bg-white/10 rounded-lg p-4 backdrop-blur-sm border-2 ${
        skin.isEquipped ? 'border-yellow-500' : 'border-transparent'
      }`}
    >
      <div className="text-center mb-3">
        <div className="text-5xl mb-2">{skin.icon}</div>
        <div className="text-white font-bold mb-1">{skin.name}</div>
        <div
          className="text-xs px-2 py-1 rounded inline-block"
          style={{ backgroundColor: rarityColor + '40', color: rarityColor }}
        >
          {getRarityText(skin.rarity)}
        </div>
      </div>

      <p className="text-gray-300 text-xs mb-3 text-center">{skin.description}</p>

      {skin.unlocked ? (
        <div className="space-y-2">
          {skin.isEquipped ? (
            <div className="bg-yellow-500 text-black py-2 rounded-lg font-bold text-center flex items-center justify-center gap-2">
              <Check className="w-4 h-4" />
              Đang Dùng
            </div>
          ) : (
            <button
              onClick={onEquip}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-2 rounded-lg font-bold transition-all"
            >
              Trang Bị
            </button>
          )}
          <button
            onClick={onPreview}
            className="w-full bg-white/20 hover:bg-white/30 text-white py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Xem Trước
          </button>
        </div>
      ) : (
        <button
          onClick={onUnlock}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-2"
        >
          <Lock className="w-4 h-4" />
          Mở Khóa
        </button>
      )}
    </motion.div>
  );
}

// Variant Card Component
function VariantCard({
  variant,
  onUnlock,
  onEquip,
  onPreview,
  index
}: {
  variant: PetColorVariant,
  onUnlock: () => void,
  onEquip: () => void,
  onPreview: () => void,
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className={`bg-white/10 rounded-lg p-3 backdrop-blur-sm border-2 ${
        variant.isEquipped ? 'border-yellow-500' : 'border-transparent'
      }`}
    >
      <div className="mb-2">
        <div
          className="w-full h-24 rounded-lg mb-2"
          style={{
            background: `linear-gradient(135deg, ${variant.colors.primary}, ${variant.colors.secondary}, ${variant.colors.accent})`
          }}
        ></div>
        <div className="text-white font-bold text-sm text-center">{variant.name}</div>
      </div>

      {variant.unlocked ? (
        variant.isEquipped ? (
          <div className="bg-yellow-500 text-black py-1.5 rounded-lg font-bold text-center text-sm flex items-center justify-center gap-1">
            <Check className="w-3 h-3" />
            Đang Dùng
          </div>
        ) : (
          <button
            onClick={onEquip}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-1.5 rounded-lg font-bold text-sm transition-all"
          >
            Trang Bị
          </button>
        )
      ) : (
        <button
          onClick={onUnlock}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-1.5 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-1"
        >
          <Lock className="w-3 h-3" />
          Mở Khóa
        </button>
      )}
    </motion.div>
  );
}

// Theme Card Component
function ThemeCard({
  theme,
  onUnlock,
  onActivate,
  onPreview,
  index
}: {
  theme: ProvinceThemeConfig,
  onUnlock: () => void,
  onActivate: () => void,
  onPreview: () => void,
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      className={`bg-white/10 rounded-xl p-5 backdrop-blur-sm border-3 ${
        theme.isActive ? 'border-yellow-500' : 'border-transparent'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <span className="text-2xl">{theme.preview}</span>
            {theme.name}
          </h3>
          <p className="text-gray-300 text-sm">{theme.description}</p>
        </div>
        {theme.isActive && <Crown className="w-6 h-6 text-yellow-500" />}
      </div>

      <div className={`bg-gradient-to-br ${theme.colors.background} rounded-lg p-4 mb-3`}>
        <div className={`${theme.colors.card} rounded p-2 mb-2`}>
          <div className={`h-2 ${theme.colors.accent} rounded w-3/4 mb-1`}></div>
          <div className={`h-2 ${theme.colors.text} opacity-50 rounded w-1/2`}></div>
        </div>
      </div>

      {theme.unlocked ? (
        theme.isActive ? (
          <div className="bg-yellow-500 text-black py-2 rounded-lg font-bold text-center flex items-center justify-center gap-2">
            <Check className="w-4 h-4" />
            Đang Áp Dụng
          </div>
        ) : (
          <button
            onClick={onActivate}
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white py-2 rounded-lg font-bold transition-all"
          >
            Áp Dụng
          </button>
        )
      ) : (
        <button
          onClick={onUnlock}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-2"
        >
          <Lock className="w-4 h-4" />
          Mở Khóa
        </button>
      )}
    </motion.div>
  );
}

// Frame Card Component
function FrameCard({
  frame,
  onUnlock,
  onEquip,
  onPreview,
  index
}: {
  frame: AvatarFrame,
  onUnlock: () => void,
  onEquip: () => void,
  onPreview: () => void,
  index: number
}) {
  const rarityColor = getRarityColor(frame.rarity);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.03 }}
      className={`bg-white/10 rounded-lg p-3 backdrop-blur-sm`}
    >
      <div className="text-center mb-3">
        <div className={`text-4xl mb-2 ${frame.glowEffect || ''}`}>{frame.icon}</div>
        <div className="text-white font-bold text-sm mb-1">{frame.name}</div>
        <div
          className="text-xs px-2 py-0.5 rounded inline-block"
          style={{ backgroundColor: rarityColor + '40', color: rarityColor }}
        >
          {getRarityText(frame.rarity)}
        </div>
      </div>

      {frame.unlocked ? (
        frame.isEquipped ? (
          <div className="bg-yellow-500 text-black py-1.5 rounded-lg font-bold text-center text-xs flex items-center justify-center gap-1">
            <Check className="w-3 h-3" />
            Đang Dùng
          </div>
        ) : (
          <button
            onClick={onEquip}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-1.5 rounded-lg font-bold text-xs transition-all"
          >
            Trang Bị
          </button>
        )
      ) : (
        <button
          onClick={onUnlock}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-1.5 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1"
        >
          <Lock className="w-3 h-3" />
          Mở
        </button>
      )}
    </motion.div>
  );
}

// Unlock Modal Component
function UnlockModal({
  item,
  type,
  playerResources,
  onConfirm,
  onCancel
}: {
  item: any,
  type: 'skin' | 'variant' | 'theme' | 'frame',
  playerResources: { gems: number, gold: number, achievementPoints: number },
  onConfirm: () => void,
  onCancel: () => void
}) {
  const cost = item.unlockCost;
  if (!cost) return null;

  const canAfford = 
    (!cost.gems || playerResources.gems >= cost.gems) &&
    (!cost.gold || playerResources.gold >= cost.gold) &&
    (!cost.achievementPoints || playerResources.achievementPoints >= cost.achievementPoints);

  return (
    <motion.div
      className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onCancel}
    >
      <motion.div
        className="bg-gradient-to-br from-purple-900 to-pink-900 rounded-xl p-6 max-w-md w-full"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-white font-bold text-xl mb-4 text-center flex items-center justify-center gap-2">
          <Sparkles className="w-6 h-6" />
          Mở Khóa
        </h3>
        
        <div className="bg-white/10 rounded-lg p-4 mb-4 text-center">
          <div className="text-4xl mb-2">{item.icon}</div>
          <div className="text-white font-bold">{item.name}</div>
          <div className="text-gray-300 text-sm mt-1">{item.description}</div>
        </div>

        <div className="bg-white/10 rounded-lg p-4 mb-4 space-y-2">
          <div className="text-white font-bold mb-2">Chi Phí:</div>
          {cost.gems && (
            <div className="flex justify-between text-white">
              <span className="flex items-center gap-1"><Gem className="w-4 h-4" /> Đá Quý:</span>
              <span className={playerResources.gems >= cost.gems ? 'text-green-300' : 'text-red-300'}>
                {cost.gems} / {playerResources.gems}
              </span>
            </div>
          )}
          {cost.gold && (
            <div className="flex justify-between text-white">
              <span>💰 Vàng:</span>
              <span className={playerResources.gold >= cost.gold ? 'text-green-300' : 'text-red-300'}>
                {cost.gold.toLocaleString()} / {playerResources.gold.toLocaleString()}
              </span>
            </div>
          )}
          {cost.achievementPoints && (
            <div className="flex justify-between text-white">
              <span className="flex items-center gap-1"><Star className="w-4 h-4" /> Thành Tích:</span>
              <span className={playerResources.achievementPoints >= cost.achievementPoints ? 'text-green-300' : 'text-red-300'}>
                {cost.achievementPoints} / {playerResources.achievementPoints}
              </span>
            </div>
          )}
        </div>

        {!canAfford && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 mb-4">
            <p className="text-red-300 text-sm text-center">
              Không đủ tài nguyên để mở khóa!
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
