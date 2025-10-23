# 📱 Mobile Testing Quick Guide
**For:** Đất Việt Truyền Thuyết MVP 2  
**Date:** 17/10/2025  
**Sprint:** Week 1 Day 1

---

## 🚀 Quick Start

### 1. Open in Browser:
```
http://localhost:3001
```

### 2. Enable Mobile View:
1. Press `F12` (Open DevTools)
2. Press `Ctrl+Shift+M` (Toggle device toolbar)
3. Select device or enter custom size

---

## 📱 Test Devices

### Recommended Sizes:
| Device | Width | Height | Purpose |
|--------|-------|--------|---------|
| iPhone SE | 375px | 667px | Small screen |
| iPhone 14 | 390px | 844px | Standard |
| iPhone 14 Pro Max | 430px | 932px | Large screen |
| Samsung Galaxy S20 | 360px | 800px | Android |
| iPad Mini | 768px | 1024px | Tablet |

---

## ✅ Testing Checklist

### 1. Bottom Navigation ⬇️
**Location:** Fixed at bottom of screen

**Tests:**
- [ ] All 6 tabs visible
- [ ] Active tab highlighted (red)
- [ ] Smooth animation when switching
- [ ] Icons + labels clear
- [ ] No overlap with content
- [ ] Settings gear icon separate

**Interactions:**
- [ ] Tap each tab → switches view
- [ ] Active indicator animates smoothly
- [ ] Haptic feedback (if device supports)

**Expected Behavior:**
```
Tap "Game" → Shows provinces
Tap "VIP" → Shows premium pass
Tap "Shop" → Shows shop items
Tap "Văn Hóa" → Shows culture center
Tap "Thành Tích" → Shows achievements
Tap "Cài Đặt" → Shows settings
```

---

### 2. Resource Bar (Mobile) 💰
**Location:** Below player info, above provinces

**Tests:**
- [ ] Shows carousel (not grid)
- [ ] 1 resource visible at a time
- [ ] Dots indicator shows position (● ○ ○ ○ ○)
- [ ] Current value + per second rate
- [ ] Smooth swipe transitions

**Interactions:**
- [ ] Swipe left → Next resource
- [ ] Swipe right → Previous resource
- [ ] Auto-loops (last → first)
- [ ] Dots update on swipe
- [ ] Arrows work on click

**Expected Order:**
```
1. 💰 Vàng (Gold)
2. 🌾 Lúa (Rice)
3. 🪵 Gỗ (Lumber)
4. 🪨 Đá (Stone)
5. 📚 Văn Hóa (Culture)
```

---

### 3. Province Cards (Mobile) 🗺️
**Location:** Main content area (game tab)

#### Locked Province:
**Tests:**
- [ ] Gray background
- [ ] Lock icon visible
- [ ] Province name + description
- [ ] "Mở Khóa" button shows cost
- [ ] Button disabled if not enough gold

**Interactions:**
- [ ] Tap "Mở Khóa" (if have gold) → Unlocks province
- [ ] Shows error if not enough gold
- [ ] Haptic feedback on unlock (30ms vibration)

#### Unlocked Province (Collapsed):
**Tests:**
- [ ] White card with colored border
- [ ] Province name + level badge
- [ ] Top 3 resources preview (+X/s)
- [ ] 2 quick action buttons (Thuê ND, Nâng Cấp)
- [ ] Chevron right icon

**Interactions:**
- [ ] Tap card header → Expands
- [ ] Tap "Thuê ND" → Hires farmer
- [ ] Tap "Nâng Cấp" → Upgrades province
- [ ] Chevron rotates 90° on expand

#### Unlocked Province (Expanded):
**Tests:**
- [ ] Shows all 5 resources with rates
- [ ] Farmer count visible
- [ ] Full "Thuê Nông Dân" button
- [ ] Full "Nâng Cấp" button with cost
- [ ] Smooth height animation

**Interactions:**
- [ ] Tap header → Collapses
- [ ] Tap farmer button → Hires farmer (50 gold)
- [ ] Tap upgrade → Upgrades (cost = level * 100)
- [ ] All buttons show haptic feedback

---

### 4. Layout & Spacing 📐
**Tests:**
- [ ] No horizontal scrolling
- [ ] All content within viewport
- [ ] Bottom nav doesn't cover content
- [ ] Adequate spacing (16px margins)
- [ ] Text readable without zoom
- [ ] Touch targets ≥ 48px

---

### 5. Animations 🎬
**Tests:**
- [ ] Tab switching: smooth fade
- [ ] Resource carousel: slide left/right
- [ ] Province expand: smooth height
- [ ] Button tap: scale down (0.95)
- [ ] Active indicator: smooth follow
- [ ] All 60fps (no lag)

---

### 6. Touch Interactions 👆
**Tests:**
- [ ] All buttons respond immediately (<100ms)
- [ ] No accidental double-taps
- [ ] Swipe gestures smooth
- [ ] Scroll doesn't trigger swipe
- [ ] Pinch zoom disabled (if applicable)

---

### 7. Responsiveness 📱↔️💻

#### Mobile (<768px):
- [ ] Bottom navigation visible
- [ ] Desktop nav hidden
- [ ] Resource carousel active
- [ ] Province cards vertical stack
- [ ] Footer hidden

#### Desktop (≥768px):
- [ ] Bottom navigation hidden
- [ ] Desktop nav visible (horizontal)
- [ ] Resource grid (not carousel)
- [ ] Province cards in grid
- [ ] Footer visible

**Breakpoint Test:**
1. Start at 375px width
2. Slowly increase to 768px
3. Check layout switches smoothly
4. Continue to 1024px, 1280px
5. Verify no layout breaks

---

## 🐛 Common Issues to Check

### 1. Content Cut Off:
- **Problem:** Bottom nav covers content
- **Fix:** Verify `pb-24 md:pb-6` on main content
- **Check:** Scroll to bottom, all visible?

### 2. Carousel Not Swiping:
- **Problem:** Touch events blocked
- **Fix:** Check no elements over carousel
- **Check:** Can you swipe smoothly?

### 3. Province Card Not Expanding:
- **Problem:** Click handler not firing
- **Fix:** Verify header has click handler
- **Check:** Tap header multiple times

### 4. Navigation Not Switching:
- **Problem:** Active tab not updating
- **Fix:** Check state management
- **Check:** Does content change when tap tab?

### 5. Animations Laggy:
- **Problem:** Too many re-renders
- **Fix:** Use Framer Motion, not CSS transitions
- **Check:** Open Performance tab, profile

---

## 📊 Performance Checks

### 1. Open React DevTools:
- Install extension if needed
- Go to Profiler tab
- Click record
- Interact with app
- Stop and review

**Look for:**
- [ ] Render times <16ms (60fps)
- [ ] No unnecessary re-renders
- [ ] Efficient state updates

### 2. Console Checks:
- Open Console tab
- Look for:
  - [ ] No errors (red text)
  - [ ] No warnings (yellow text)
  - [ ] No failed network requests

### 3. Network Tab:
- [ ] All resources load <1s
- [ ] No 404 errors
- [ ] Images optimized

---

## 🎯 Success Criteria

### Must Pass:
- ✅ All 6 tabs work
- ✅ Resource carousel swipes
- ✅ Province cards expand/collapse
- ✅ All buttons clickable
- ✅ No console errors
- ✅ Responsive 375px - 1920px
- ✅ Animations smooth (60fps)

### Nice to Have:
- ✅ Haptic feedback works
- ✅ Safe area respected (notched devices)
- ✅ Accessibility (keyboard nav)
- ✅ Offline mode (PWA)

---

## 🔧 Developer Tools Tips

### Chrome DevTools Shortcuts:
```
F12              - Open DevTools
Ctrl+Shift+M     - Toggle device toolbar
Ctrl+Shift+C     - Inspect element
Ctrl+Shift+P     - Command palette
Ctrl+R           - Reload page
Ctrl+Shift+R     - Hard reload (clear cache)
```

### Useful Commands:
```javascript
// In console:
// Check viewport size
console.log(window.innerWidth, window.innerHeight);

// Check if mobile
console.log(window.matchMedia('(max-width: 768px)').matches);

// Trigger haptic
navigator.vibrate(10);

// Check touch support
console.log('ontouchstart' in window);
```

---

## 📱 Real Device Testing

### iOS (iPhone):
1. Connect iPhone to same WiFi
2. Find computer's IP: `ipconfig` (Windows) or `ifconfig` (Mac)
3. Open Safari on iPhone
4. Navigate to: `http://[YOUR_IP]:3001`
5. Test all interactions

### Android:
1. Enable USB debugging
2. Connect via USB
3. Chrome → `chrome://inspect`
4. Or use WiFi method (same as iOS)

### Things to Test on Real Device:
- [ ] Touch response feels natural
- [ ] Haptic feedback strength
- [ ] Gestures work (swipe, tap, scroll)
- [ ] Performance smooth (no lag)
- [ ] Text readable
- [ ] Colors look good
- [ ] Safe area on notched devices

---

## 📝 Report Template

Use this when reporting issues:

```markdown
### Issue: [Brief description]

**Device:** iPhone 14 Pro / Chrome Desktop / etc.
**Screen Size:** 390x844px
**Browser:** Safari 17 / Chrome 120
**Issue:** [What went wrong]
**Expected:** [What should happen]
**Steps to Reproduce:**
1. Open app
2. Navigate to Game tab
3. Tap province card
4. See error

**Screenshots:** [If applicable]
**Console Errors:** [Copy from console]
```

---

## ✅ Daily Test Run

### Morning Check (5 minutes):
```
1. Open http://localhost:3001
2. Mobile view (375px)
3. Click all tabs → All work? ✅
4. Swipe resources → Smooth? ✅
5. Expand province → Animates? ✅
6. No console errors? ✅
```

### Full Test (15 minutes):
```
1. Test all checklist items above
2. Try 3 different screen sizes
3. Check performance
4. Test on real device
5. Document any issues
```

---

## 🚀 Quick Test Script

Copy-paste into Chrome Console:

```javascript
// Auto-test script
console.log('🚀 Starting mobile tests...');

// 1. Check viewport
const isMobile = window.innerWidth < 768;
console.log('📱 Mobile view:', isMobile);

// 2. Check components
const bottomNav = document.querySelector('nav[class*="bottom"]');
console.log('⬇️ Bottom nav:', bottomNav ? '✅' : '❌');

// 3. Check carousel
const carousel = document.querySelector('[class*="carousel"]');
console.log('🎠 Carousel:', carousel ? '✅' : '❌');

// 4. Check province cards
const cards = document.querySelectorAll('[class*="province"]');
console.log('🗺️ Province cards:', cards.length, 'found');

// 5. Summary
console.log('✅ Basic tests complete!');
```

---

**Happy Testing! 🎉**  
**Report issues in:** `#github-issues` or create ticket  
**Questions?** Ask in team chat

🇻🇳 **Đất Việt Truyền Thuyết** - Built with ❤️
