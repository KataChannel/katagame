# 🧭 DYNAMIC NAVIGATION SYSTEM - MVP1

## 📋 OVERVIEW

Dynamic Navigation System tự động điều chỉnh menu navigation dựa trên:
- **Player Level** - Cấp độ người chơi
- **Tutorial Progress** - Tiến độ hướng dẫn
- **Achievements** - Thành tựu đạt được
- **Premium Status** - Trạng thái VIP

## 🎯 FEATURES

### ✅ Core Features
1. **Progressive Unlock** - Tính năng mở dần theo level
2. **Tutorial-Gated** - Một số tính năng yêu cầu hoàn thành tutorial
3. **Achievement-Based** - Unlock qua thành tựu
4. **Premium Features** - Tính năng VIP độc quyền

### 🔓 Unlock Rules

| Feature | Unlock Level | Requirement | Category |
|---------|-------------|-------------|----------|
| Home | 1 | None | Core |
| World Map | 1 | Tutorial Step 1 | Core |
| Stories | 2 | Tutorial Step 5 | Core |
| Missions | 3 | None | Core |
| Heroes | 3 | Tutorial Step 4 | Combat |
| Shop | 2 | None | Premium |
| Combat | 5 | Has Hero | Combat |
| Friends | 5 | None | Social |
| Marketplace | 6 | None | Premium |
| Gacha | 7 | Achievement: Hero Collector | Premium |
| Guild | 8 | None | Social |
| Arena | 10 | None | Combat |
| Analytics | 10 | None | Core |
| Multiplayer | 12 | None | Social |
| Customization | 15 | Premium Active | Premium |

## 🔧 BACKEND API

### Endpoint
```
GET /api/v1/navigation/player
```

### Authentication
```
Authorization: Bearer <JWT_TOKEN>
```

### Response
```json
{
  "success": true,
  "data": {
    "playerId": "uuid",
    "navigation": [
      {
        "key": "game",
        "label": "Home",
        "labelVietnamese": "Trang Chủ",
        "icon": "Home",
        "color": "#10b981",
        "unlockLevel": 1,
        "isUnlocked": true,
        "order": 1,
        "category": "core"
      }
    ],
    "locked": [
      {
        "key": "gacha",
        "label": "Gacha",
        "labelVietnamese": "Triệu Hồi",
        "icon": "Gem",
        "color": "#a855f7",
        "unlockLevel": 7,
        "unlockRequirement": "achievement_hero_collector",
        "isUnlocked": false,
        "order": 13,
        "category": "premium"
      }
    ],
    "totalUnlocked": 5,
    "totalLocked": 10
  }
}
```

## 💻 FRONTEND USAGE

### 1. Import Navigation Service
```typescript
import { getPlayerNavigation, type NavigationItem } from '@/lib/navigationService'
```

### 2. Use in Component
```tsx
import MobileBottomNav from '@/components/MobileNavigation'

function MyApp() {
  const [activeTab, setActiveTab] = useState('game')
  const token = 'your-jwt-token'

  return (
    <MobileBottomNav
      activeTab={activeTab}
      onTabChange={setActiveTab}
      token={token} // Pass JWT token
    />
  )
}
```

### 3. Display Locked Features
```tsx
import { LockedFeaturesList } from '@/components/LockedFeatures'

function FeaturePage() {
  const [lockedFeatures, setLockedFeatures] = useState<NavigationItem[]>([])

  useEffect(() => {
    getPlayerNavigation(token).then(response => {
      setLockedFeatures(response.data.locked)
    })
  }, [token])

  return (
    <LockedFeaturesList
      features={lockedFeatures}
      onUpgradeClick={() => router.push('/premium')}
    />
  )
}
```

## 🎨 COMPONENTS

### MobileBottomNav
**Location**: `/frontend/components/MobileNavigation.tsx`

**Props**:
```typescript
interface MobileBottomNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
  className?: string
  token?: string // JWT for authentication
}
```

**Features**:
- ✅ Dynamic icon mapping
- ✅ Auto-fetch navigation from API
- ✅ Fallback to default navigation
- ✅ Smooth animations
- ✅ Haptic feedback
- ✅ Vietnamese labels

### LockedFeatures
**Location**: `/frontend/components/LockedFeatures.tsx`

**Props**:
```typescript
interface LockedFeaturesListProps {
  features: NavigationItem[]
  onUpgradeClick?: () => void
}
```

**Features**:
- ✅ Display locked features
- ✅ Show unlock requirements
- ✅ Level badge
- ✅ Upgrade CTA button
- ✅ Responsive grid layout

## 🔐 BACKEND SERVICE

### NavigationService
**Location**: `/motia/src/services/navigation.service.ts`

**Methods**:

1. **getPlayerNavigation(playerId)** - Get unlocked navigation items
2. **isFeatureUnlocked(playerId, featureKey)** - Check if feature is unlocked
3. **getLockedFeatures(playerId)** - Get features close to unlocking

**Example**:
```typescript
import { getNavigationService } from './services/navigation.service'

const navigationService = getNavigationService()
const navItems = await navigationService.getPlayerNavigation(playerId)
```

## 📊 PROGRESSION SYSTEM

### Level-Based Unlocks
```
Level 1:  Home, World Map, Premium
Level 2:  Stories, Shop
Level 3:  Missions, Heroes
Level 4:  Achievements
Level 5:  Combat, Friends, Battle Pass
Level 6:  Marketplace
Level 7:  Gacha (with achievement)
Level 8:  Guild
Level 10: Arena, Analytics
Level 12: Multiplayer
Level 15: Customization (Premium only)
```

### Tutorial-Based Unlocks
```
Step 1: World Map
Step 4: Heroes
Step 5: Stories
Complete: Advanced features
```

### Achievement-Based Unlocks
```
Hero Collector → Gacha System
Month Learner → Resource Bonus
Builder → Advanced Construction
```

## 🧪 TESTING

### Test Account
```
Email: test@katagame.com
Password: test123
Player ID: a0000000-0000-0000-0000-000000000001
Level: 5
```

### Test Scenarios

1. **New Player (Level 1)**
   - Should see: Home, World Map, Settings
   - Should NOT see: Combat, Arena, Gacha

2. **Mid-Level Player (Level 5)**
   - Should see: All core features + Combat + Friends
   - Should NOT see: Guild, Arena, Multiplayer

3. **High-Level Player (Level 15+)**
   - Should see: All features except premium-locked
   - Premium player: All features

### Manual Test
```bash
# Start backend
cd /chikiet/kataoffical/katagame/motia
bun dev

# Test API
curl -H "Authorization: Bearer <TOKEN>" \
  http://localhost:11001/api/v1/navigation/player | jq .
```

## 🔄 FUTURE ENHANCEMENTS

### Planned Features
- [ ] Real-time unlock notifications
- [ ] Feature preview tooltips
- [ ] Unlock animations
- [ ] Custom unlock sounds
- [ ] Achievement progress tracking
- [ ] Feature recommendations
- [ ] A/B testing for unlock levels

### Optimization
- [ ] Cache navigation config
- [ ] Optimize database queries
- [ ] Add Redis caching
- [ ] Batch API requests

## 📝 NOTES

### Design Decisions
1. **Always show Settings** - Core system access
2. **Limit mobile nav to 8 items** - UX best practice
3. **Progressive disclosure** - Reduce cognitive load
4. **Clear unlock requirements** - Motivate progression

### Performance
- Navigation cached in frontend state
- API called only on mount/token change
- Fallback to default navigation on error
- Minimal re-renders with proper memo

## 🐛 TROUBLESHOOTING

### Navigation not loading
1. Check JWT token is valid
2. Verify backend is running (port 11001)
3. Check browser console for errors
4. Verify API endpoint: `/api/v1/navigation/player`

### Feature not unlocking
1. Check player level in database
2. Verify tutorial progress
3. Check achievement status
4. Review unlock requirements in service

### Icons not showing
1. Verify icon name in iconMap
2. Check lucide-react is installed
3. Verify icon import in component

---

**Created**: 28/10/2025  
**Version**: 1.0.0  
**Status**: ✅ Production Ready
