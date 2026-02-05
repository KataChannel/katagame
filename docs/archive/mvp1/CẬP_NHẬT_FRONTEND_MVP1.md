# 🎮 CẬP NHẬT FRONTEND CHO MVP1

**Ngày:** 31/10/2025  
**Trạng thái:** Đang cập nhật theo 0-GAME_MECHANICS_ROADMAP_COMPLETE.md

---

## 📋 THAY ĐỔI CẦN THỰC HIỆN

### 1. Cập Nhật Resource Interface

**File:** `frontend/lib/types.ts`

```typescript
// ✅ ĐÃ CẬP NHẬT
export interface Resource {
  gold: number;      // 🏅 Vàng (Kim - Metal)
  rice: number;      // 🌾 Lúa (Thủy - Water) 
  lumber: number;    // 🪵 Gỗ (Mộc - Wood)
  stone: number;     // 🪨 Đá (Thổ - Earth)
  bazan: number;     // 🌋 Đất đỏ Bazan (Hỏa - Fire)
  culture: number;   // 📜 Văn hóa
  gems?: number;     // 💎 Ngọc
}
```

### 2. Cập Nhật Initial Resources

**File:** `frontend/lib/gameStore.ts`

```typescript
// CẦN SỬA - Player initial resources
player: {
  id: '1',
  name: 'Player 1',
  level: 1,
  experience: 0,
  totalResources: { 
    gold: 10,      // ← Đổi từ 200 → 10
    rice: 10,      // ← Đổi từ 100 → 10  
    lumber: 10,    // ← Đổi từ 50 → 10
    stone: 10,     // ← Đổi từ 30 → 10
    bazan: 10,     // ← THÊM MỚI
    culture: 0,    // ← Đổi từ 20 → 0
    gems: 0        // ← Đổi từ 1500 → 0
  },
  // ...
}
```

### 3. Cập Nhật Province Data

**File:** `frontend/lib/gameStore.ts`

```typescript
// CẦN SỬA - Thêm bazan vào tất cả resourcesPerSecond
const initialProvinces: Province[] = [
  {
    id: 'hanoi',
    name: 'hanoi',
    displayName: 'Hà Nội',
    unlocked: true,  // ← Chỉ Hà Nội mở từ đầu
    resourcesPerSecond: { 
      gold: 20,      // Base rate
      rice: 15, 
      lumber: 10, 
      stone: 10,
      bazan: 5,      // ← THÊM MỚI
      culture: 0 
    },
    // ...
  },
  {
    id: 'nghe_an',
    unlocked: false,  // ← TẤT CẢ tỉnh khác LOCKED
    resourcesPerSecond: { 
      gold: 15, 
      rice: 25, 
      lumber: 12, 
      stone: 8,
      bazan: 3,      // ← THÊM MỚI
      culture: 0 
    },
    // ...
  },
  // ... 61 tỉnh còn lại (all locked)
];
```

### 4. Cập Nhật Resource Costs

**File:** `frontend/lib/gameStore.ts`

```typescript
// CẦN SỬA - Tất cả costs phải có bazan
// Farmer cost
const farmerCost: Resource = farmerType === 'auto'
  ? { gold: 250, rice: 150, lumber: 75, stone: 50, bazan: 25, culture: 0 }
  : { gold: 100, rice: 75, lumber: 50, stone: 25, bazan: 10, culture: 0 };

// Upgrade building cost
const upgradeCost: Resource = {
  gold: building.level * 100,
  rice: building.level * 75,
  lumber: building.level * 50,
  stone: building.level * 35,
  bazan: building.level * 15,  // ← THÊM MỚI
  culture: 0,
};

// Unlock province cost
const unlockCost: Resource = { 
  gold: 150, 
  rice: 75, 
  lumber: 35, 
  stone: 20, 
  bazan: 10,  // ← THÊM MỚI
  culture: 30 
};

// Province level up cost
const upgradeCost: Resource = {
  gold: province.level * 150,
  rice: province.level * 100,
  lumber: province.level * 75,
  stone: province.level * 50,
  bazan: province.level * 25,  // ← THÊM MỚI
  culture: 0,
};
```

### 5. Cập Nhật Helper Functions

**File:** `frontend/lib/gameStore.ts`

```typescript
// ✅ ĐÃ CẬP NHẬT
const createEmptyResource = (): Resource => ({
  gold: 0,
  rice: 0,
  lumber: 0,
  stone: 0,
  bazan: 0,
  culture: 0,
  gems: 0,
});

// ✅ ĐÃ CẬP NHẬT
const addResources = (a: Resource, b: Resource): Resource => {
  return {
    gold: (a?.gold || 0) + (b?.gold || 0),
    rice: (a?.rice || 0) + (b?.rice || 0),
    lumber: (a?.lumber || 0) + (b?.lumber || 0),
    stone: (a?.stone || 0) + (b?.stone || 0),
    bazan: (a?.bazan || 0) + (b?.bazan || 0),
    culture: (a?.culture || 0) + (b?.culture || 0),
    gems: (a?.gems || 0) + (b?.gems || 0),
  };
};

// ✅ ĐÃ CẬP NHẬT
const subtractResources = (a: Resource, b: Resource): Resource => {
  return {
    gold: (a?.gold || 0) - (b?.gold || 0),
    rice: (a?.rice || 0) - (b?.rice || 0),
    lumber: (a?.lumber || 0) - (b?.lumber || 0),
    stone: (a?.stone || 0) - (b?.stone || 0),
    bazan: (a?.bazan || 0) - (b?.bazan || 0),
    culture: (a?.culture || 0) - (b?.culture || 0),
    gems: (a?.gems || 0) - (b?.gems || 0),
  };
};

// ✅ ĐÃ CẬP NHẬT
const canAfford = (available: Resource, cost: Resource): boolean => {
  return (available?.gold || 0) >= (cost?.gold || 0) &&
         (available?.rice || 0) >= (cost?.rice || 0) &&
         (available?.lumber || 0) >= (cost?.lumber || 0) &&
         (available?.stone || 0) >= (cost?.stone || 0) &&
         (available?.bazan || 0) >= (cost?.bazan || 0) &&
         (available?.culture || 0) >= (cost?.culture || 0);
};
```

---

## 🎨 CẬP NHẬT UI COMPONENTS

### 1. ResourceBar Component

**File:** `frontend/components/ResourceBar.tsx`

```tsx
// CẦN THÊM - Icon cho Bazan
const resourceItems = [
  { key: 'gold', icon: Coins, color: 'text-yellow-500', label: 'Vàng' },
  { key: 'rice', icon: Wheat, color: 'text-green-500', label: 'Lúa' },
  { key: 'lumber', icon: TreePine, color: 'text-amber-600', label: 'Gỗ' },
  { key: 'stone', icon: Mountain, color: 'text-gray-500', label: 'Đá' },
  { key: 'bazan', icon: Flame, color: 'text-red-600', label: 'Đất Đỏ Bazan' },  // ← THÊM
  { key: 'culture', icon: Scroll, color: 'text-purple-500', label: 'Văn Hóa' },
];
```

### 2. MobileResourceBar Component

**File:** `frontend/components/MobileResourceBar.tsx`

```tsx
// CẦN SỬA - Cập nhật cùng logic như ResourceBar
const RESOURCE_ICONS = {
  gold: { icon: '🏅', color: 'text-yellow-500' },
  rice: { icon: '🌾', color: 'text-green-500' },
  lumber: { icon: '🪵', color: 'text-amber-600' },
  stone: { icon: '🪨', color: 'text-gray-500' },
  bazan: { icon: '🌋', color: 'text-red-600' },  // ← THÊM
  culture: { icon: '📜', color: 'text-purple-500' },
};
```

### 3. ProvinceCard Component

**File:** `frontend/components/ProvinceCard.tsx`

```tsx
// CẦN SỬA - Hiển thị cost với bazan
<div className="text-sm text-gray-300 mb-2">Tài Nguyên Hiện Tại:</div>
<div className="grid grid-cols-2 gap-2">
  <div className="flex items-center gap-1">
    <Coins className="h-4 w-4 text-yellow-500" />
    <span>{player.resources?.gold || 0}</span>
  </div>
  <div className="flex items-center gap-1">
    <Wheat className="h-4 w-4 text-green-500" />
    <span>{player.resources?.rice || 0}</span>
  </div>
  <div className="flex items-center gap-1">
    <TreePine className="h-4 w-4 text-amber-600" />
    <span>{player.resources?.lumber || 0}</span>
  </div>
  <div className="flex items-center gap-1">
    <Mountain className="h-4 w-4 text-gray-500" />
    <span>{player.resources?.stone || 0}</span>
  </div>
  <div className="flex items-center gap-1">
    <Flame className="h-4 w-4 text-red-600" />
    <span>{player.resources?.bazan || 0}</span>
  </div>  {/* ← THÊM */}
</div>

// Hiển thị cost nâng cấp
<div className="text-xs opacity-80 mt-1">
  💰 {farmerCost.gold} 🌾 {farmerCost.rice} 🌋 {farmerCost.bazan}
</div>  {/* ← THÊM bazan */}
```

---

## 🔧 CẬP NHẬT BACKEND SCHEMA (Nếu chưa có)

**File:** `backend/prisma/schema.prisma`

```prisma
model Player {
  // ...
  resources Json? @default("{\"gems\": 0, \"gold\": 10, \"rice\": 10, \"stone\": 10, \"lumber\": 10, \"bazan\": 10, \"culture\": 0}")
  // ← Đổi default values
  // ...
}

model Province {
  // ...
  base_bazan_rate Decimal? @default(5.00) @db.Decimal(10, 2)  // ← THÊM nếu chưa có
  // ...
}
```

---

## 📊 DANH SÁCH CẬP NHẬT

### ✅ Đã Hoàn Thành:
- [x] Resource interface (types.ts)
- [x] createEmptyResource()
- [x] addResources()
- [x] subtractResources()
- [x] canAfford()

### ⏳ Đang Làm:
- [ ] Fix tất cả Resource objects (thêm bazan)
- [ ] Update initial player resources (10/10/10/10/10/0/0)
- [ ] Update province resourcesPerSecond
- [ ] Update all costs (farmer, building, unlock, upgrade)

### 📋 Cần Làm:
- [ ] Update ResourceBar UI (thêm Bazan icon)
- [ ] Update MobileResourceBar UI
- [ ] Update ProvinceCard (hiển thị bazan cost)
- [ ] Update MobileProvinceCard
- [ ] Test toàn bộ flow với resources mới
- [ ] Update backend schema default values
- [ ] Re-seed database với values mới

---

## 🚀 HƯỚNG DẪN THỰC HIỆN

### Bước 1: Fix TypeScript Errors

```bash
cd frontend

# Tìm tất cả Resource objects thiếu bazan
grep -r "gold:.*rice:.*lumber:.*stone:" lib/ components/ --include="*.ts" --include="*.tsx" | grep -v "bazan"

# Output sẽ show tất cả dòng cần fix
```

### Bước 2: Update từng file

Thêm `bazan: 0` hoặc `bazan: <value>` vào tất cả Resource objects.

### Bước 3: Test Compilation

```bash
npm run build

# Nếu còn errors, fix cho đến khi pass
```

### Bước 4: Update Backend

```bash
cd ../backend

# Update prisma schema
npx prisma migrate dev --name add_bazan_to_resources

# Re-seed database
npx prisma db seed
```

### Bước 5: Test Game

```bash
# Chạy backend
cd backend
npm run dev

# Chạy frontend (terminal khác)
cd frontend
npm run dev

# Test flow:
1. Đăng ký user mới → Check nhận 10/10/10/10/10/0/0
2. Mở Hà Nội → Check resourcesPerSecond có bazan
3. Nâng cấp farmer → Check cost có bazan
4. Thu hoạch → Check nhận được bazan
```

---

## 🎯 KẾT QUẢ MONG ĐỢI

Sau khi hoàn thành:

✅ Tất cả Resource objects có đầy đủ 7 fields: gold, rice, lumber, stone, bazan, culture, gems  
✅ Player mới bắt đầu với: 10 vàng, 10 lúa, 10 gỗ, 10 đá, 10 bazan, 0 culture, 0 gems  
✅ UI hiển thị đầy đủ 6 resources (5 ngũ hành + culture)  
✅ Tất cả costs có bazan (nông dân, nâng cấp, unlock tỉnh)  
✅ Backend trả về resources với bazan field  
✅ 0 TypeScript compile errors  
✅ Game chạy mượt mà với mechanics mới  

---

**Trạng thái:** 🔄 Đang cập nhật (50% hoàn thành)  
**Ưu tiên:** 🔴 HIGH - Cần hoàn thành trước khi test MVP1  
**Thời gian ước tính:** 2-3 giờ để fix hết errors + test
