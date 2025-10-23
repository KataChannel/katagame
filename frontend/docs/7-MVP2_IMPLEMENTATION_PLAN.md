# 🚀 MVP 2 Implementation Plan - Mobile-First Redesign

## Sprint 1: Mobile-First UI/UX (Tuần 1)

### ✅ Đã Hoàn Thành
1. ✅ `/lib/mobileDesignSystem.ts` - Mobile design system & utilities
2. ✅ `/components/MobileNavigation.tsx` - Bottom navigation bar
3. ✅ `PROJECT_SUMMARY_MVP2.md` - Tổng hợp dự án & roadmap

### 🔄 Đang Thực Hiện
4. 🔄 `/components/MobileResourceBar.tsx` - Cần fix để tương thích với gameStore

### 📋 Cần Làm Tiếp

#### Phase 1.1: Core Components (2-3 ngày)
- [ ] Fix `MobileResourceBar.tsx` - Use `player.totalResources` instead of `resources`
- [ ] Update `app/page.tsx` - Integrate MobileNavigation
- [ ] Create `/components/MobileProvinceCard.tsx` - Mobile-optimized province cards
- [ ] Update `/components/ProvinceCard.tsx` - Add mobile breakpoints

#### Phase 1.2: Layout Optimization (2-3 ngày)
- [ ] Create `/components/MobileLayout.tsx` - Wrapper with safe areas
- [ ] Update `/app/layout.tsx` - Add viewport meta tags & PWA manifest
- [ ] Create `/components/SwipeableCards.tsx` - Swipeable province carousel
- [ ] Add gesture support with `react-use-gesture`

#### Phase 1.3: Touch Interactions (1-2 ngày)
- [ ] Implement haptic feedback system
- [ ] Add pull-to-refresh for resources
- [ ] Long-press interactions for quick actions
- [ ] Swipe gestures for tab navigation

#### Phase 1.4: Performance (1 ngày)
- [ ] Optimize images with next/image
- [ ] Lazy load non-critical components
- [ ] Add loading skeletons
- [ ] Implement virtual scrolling for long lists

---

## Sprint 2: Combat System (Tuần 2)

### Phase 2.1: Data Structures
- [ ] Create `/lib/combatTypes.ts` - Hero, Enemy, Combat types
- [ ] Create `/lib/combatEngine.ts` - Turn-based combat logic
- [ ] Create `/lib/heroData.ts` - 5 heroes truyền thuyết
- [ ] Create `/lib/petData.ts` - 5 pet system

### Phase 2.2: UI Components
- [ ] `/components/CombatScreen.tsx` - Main combat interface
- [ ] `/components/HeroCard.tsx` - Hero display & management
- [ ] `/components/PetCard.tsx` - Pet collection & bonuses
- [ ] `/components/SkillButton.tsx` - Hero skills UI

### Phase 2.3: Integration
- [ ] Add combat to gameStore
- [ ] Implement PvE raids
- [ ] Boss fights system
- [ ] Loot & rewards

---

## Sprint 3: Content Expansion (Tuần 3)

### Phase 3.1: 6 New Provinces
- [ ] Create province data: Huế, Đà Nẵng, TP.HCM, Cần Thơ, Đà Lạt, Phú Quốc
- [ ] Design unique specialties per province
- [ ] Create cultural content for each
- [ ] Implement unlock progression

### Phase 3.2: Ngũ Hành System
- [ ] `/lib/elementSystem.ts` - Element types & interactions
- [ ] Implement element bonuses
- [ ] Province element assignments
- [ ] Combo system for multiple provinces

### Phase 3.3: Achievements & Quests
- [ ] Add 10 new achievements for MVP 2
- [ ] Daily quests system
- [ ] Cultural challenges
- [ ] Reward system

---

## Sprint 4: Monetization (Tuần 4)

### Phase 4.1: Battle Pass
- [ ] `/components/BattlePass.tsx` - Battle pass UI
- [ ] `/lib/battlePassData.ts` - 50 level rewards
- [ ] Free vs Premium tracks
- [ ] XP progression system

### Phase 4.2: Gacha System
- [ ] `/components/GachaScreen.tsx` - Pull interface
- [ ] `/lib/gachaEngine.ts` - Probability system
- [ ] Pity system (50 pulls guarantee)
- [ ] Daily free pull
- [ ] Cosmetic items only

### Phase 4.3: Shop Updates
- [ ] Add hero packs
- [ ] Pet bundles
- [ ] Battle Pass purchase
- [ ] Starter packs for new provinces

---

## Technical Debt & Optimization

### Must Do
- [ ] Add error boundaries for all new components
- [ ] Implement proper TypeScript types
- [ ] Add unit tests for combat engine
- [ ] Performance testing on low-end devices
- [ ] Accessibility (a11y) improvements

### Nice to Have
- [ ] Add animations with Framer Motion
- [ ] Particle effects for combat
- [ ] Sound effects for all interactions
- [ ] Background music tracks
- [ ] Localization system (EN support)

---

## Testing Checklist

### Mobile Devices to Test
- [ ] iPhone SE (small screen)
- [ ] iPhone 14 Pro (notch)
- [ ] Samsung Galaxy S23 (Android)
- [ ] iPad Mini (tablet)
- [ ] Landscape mode support

### Browsers
- [ ] Safari iOS
- [ ] Chrome Android
- [ ] Chrome Desktop
- [ ] Firefox
- [ ] Edge

### Features to Test
- [ ] Touch interactions smooth
- [ ] No layout shift on load
- [ ] Fast load time (< 3s)
- [ ] Offline support (PWA)
- [ ] No memory leaks

---

## File Structure After MVP 2

```
katagame/
├── app/
│   ├── layout.tsx (updated for mobile)
│   ├── page.tsx (integrated mobile nav)
│   └── manifest.json (PWA)
├── components/
│   ├── Mobile/
│   │   ├── MobileNavigation.tsx ✅
│   │   ├── MobileResourceBar.tsx 🔄
│   │   ├── MobileProvinceCard.tsx
│   │   ├── MobileLayout.tsx
│   │   └── SwipeableCards.tsx
│   ├── Combat/
│   │   ├── CombatScreen.tsx
│   │   ├── HeroCard.tsx
│   │   ├── PetCard.tsx
│   │   └── SkillButton.tsx
│   ├── Monetization/
│   │   ├── BattlePass.tsx
│   │   ├── GachaScreen.tsx
│   │   └── ShopV2.tsx
│   └── (existing components...)
├── lib/
│   ├── mobileDesignSystem.ts ✅
│   ├── combatTypes.ts
│   ├── combatEngine.ts
│   ├── heroData.ts
│   ├── petData.ts
│   ├── elementSystem.ts
│   ├── battlePassData.ts
│   ├── gachaEngine.ts
│   └── provinceDataMVP2.ts
└── public/
    ├── heroes/ (images)
    ├── pets/ (images)
    ├── provinces/ (images)
    └── sounds/ (audio files)
```

---

## Key Metrics to Track

### Engagement
- Session length: Target 25-35 min (from 15-30)
- DAU: 2000-5000 (from 500-1000)
- D1 Retention: 70% (from 60%)
- D7 Retention: 40% (from 30%)

### Monetization
- Battle Pass take rate: 25-35%
- Gacha conversion: 15-25%
- ARPU: 75-150k VND (from 50-100k)
- Monthly revenue: 15-40M VND (from 5-15M)

### Technical
- Page load: < 3s
- FCP (First Contentful Paint): < 1.5s
- Time to Interactive: < 3.5s
- Lighthouse score: 90+

---

## Next Steps (Immediate)

1. **Fix MobileResourceBar** - Update to use correct gameStore structure
2. **Integrate MobileNavigation** - Replace old nav in page.tsx
3. **Test on real device** - Verify touch interactions
4. **Create MobileProvinceCard** - Start Province UI redesign
5. **Begin combat system** - Start with data structures

**Target for Tuần 1:** Complete mobile UI/UX foundation
**Ready for:** Sprint 2 combat implementation

---

**Last Updated:** 17/10/2025
**Branch:** vietnamgame_mvp2
**Status:** ✅ Ready to implement
