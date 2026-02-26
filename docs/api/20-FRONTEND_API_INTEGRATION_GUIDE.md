# 🔄 FRONTEND API INTEGRATION GUIDE
**Ngày**: October 24, 2025  
**Mục tiêu**: Chuyển frontend sử dụng API thực tế thay vì mock data

---

## 📊 HIỆN TRẠNG PHÂN TÍCH

### ✅ Đã có sẵn:
1. **Backend API** chạy trên `http://localhost:11101/api/v1`
2. **API Client** (`mvp1ApiClient.ts`) - toàn bộ methods đã được tạo
3. **Database Schema** - đầy đủ (684 lines)
4. **Components** - 40+ components sử dụng mock data từ lib files

### ❌ Vấn đề hiện tại:
1. **Database chưa được seed** - không có data thực trong database
2. **Components sử dụng mock data** - import từ `heroesData.ts`, `enemiesData.ts`, v.v.
3. **Chưa integrate API calls** - components chưa gọi mvp1ApiClient
4. **No authentication flow** - chưa có login/logout logic

---

## 🎯 PLAN THỰC HIỆN

### Phase 1: Seed Database (Today)
- [ ] Setup database connections
- [ ] Run schema initialization
- [ ] Seed sample data (heroes, provinces, stories)
- [ ] Verify data via API

### Phase 2: Update Frontend (Today)
- [ ] Create API hooks (useHeroes, useProvinces, useStories, etc)
- [ ] Add authentication context
- [ ] Update main components to use API
- [ ] Add loading/error states

### Phase 3: Testing (Today)
- [ ] Test API integration
- [ ] Verify data flows correctly
- [ ] Performance testing

---

## 📝 BƯỚC 1: KIỂM TRA & SEED DATABASE

### 1.1 Check Docker status:

```bash
docker ps | grep katagame
```

### 1.2 Check PostgreSQL connection:

```bash
docker exec katagame-db psql -U katagame -d katagame -c "\dt"
```

### 1.3 Run database schema:

```bash
docker exec katagame-db psql -U katagame -d katagame < katagame_database_schema.sql
```

### 1.4 Seed sample data:

```bash
# Create seed script
cat > seed-data.sql << 'EOF'
-- Insert provinces
INSERT INTO provinces (id, name, is_capital, base_gold_rate, base_culture_rate) 
VALUES
  (1, 'Hà Nội', true, 150, 100),
  (2, 'Hồ Chí Minh', true, 150, 100),
  (3, 'Huế', false, 100, 80),
  (4, 'Hà Nam', false, 80, 60)
ON CONFLICT DO NOTHING;

-- Insert test player
INSERT INTO players (username, email, password_hash, resources)
VALUES (
  'testplayer',
  'test@example.com',
  '$2b$10$...',
  '{"gold": 1000, "rice": 500, "lumber": 300, "stone": 200, "culture": 100, "gems": 5000}'::jsonb
)
ON CONFLICT DO NOTHING;

EOF

docker exec katagame-db psql -U katagame -d katagame < seed-data.sql
```

---

## 🪝 BƯỚC 2: TẠOBAO API HOOKS

### 2.1 Tạo file `frontend/lib/hooks/useApi.ts`:

```typescript
'use client';

import { useState, useCallback, useEffect } from 'react';
import MVP1ApiClient from '../mvp1ApiClient';

export function useHeroes() {
  const [heroes, setHeroes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const response = await MVP1ApiClient.getHeroes();
        if (response.success) {
          setHeroes(response.data?.heroes || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load heroes');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { heroes, loading, error };
}

export function useProvinces() {
  const [provinces, setProvinces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const response = await MVP1ApiClient.getProvinces();
        if (response.success) {
          setProvinces(response.data?.provinces || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load provinces');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { provinces, loading, error };
}

export function useStories() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const response = await MVP1ApiClient.getStories();
        if (response.success) {
          setStories(response.data?.stories || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load stories');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { stories, loading, error };
}
```

### 2.2 Tạo authentication context `frontend/lib/hooks/useAuth.ts`:

```typescript
'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import MVP1ApiClient from '../mvp1ApiClient';

interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await MVP1ApiClient.request(
        'POST',
        '/auth/login',
        { email, password },
        false
      );
      
      if (response.success && response.data?.token) {
        MVP1ApiClient.setAuthToken(response.data.token);
        setUser(response.data.user);
      }
    } catch (error) {
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    MVP1ApiClient.setAuthToken('');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

---

## 🔄 BƯỚC 3: CẬP NHẬT COMPONENTS

### 3.1 Ví dụ cập nhật `HeroesTab.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHeroes } from '@/lib/hooks/useApi';
import MVP1ApiClient from '@/lib/mvp1ApiClient';
import { Crown, Star, Swords } from 'lucide-react';

export default function HeroesTab() {
  const { heroes: apiHeroes, loading, error } = useHeroes();
  const [selectedHero, setSelectedHero] = useState(null);

  if (loading) return <div className="text-center p-4">Loading heroes...</div>;
  if (error) return <div className="text-red-500 p-4">Error: {error}</div>;

  return (
    <div className="min-h-screen pb-24 md:pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-lg shadow-lg mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Crown className="w-8 h-8" />
          Anh Hùng Việt Nam
        </h1>
        <p className="text-purple-100 mt-1">
          Thu thập và nâng cấp các anh hùng huyền thoại
        </p>
        <div className="mt-4 flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-300" />
            <span>{apiHeroes.length} Anh Hùng Khả Dụng</span>
          </div>
        </div>
      </div>

      {/* Heroes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {apiHeroes.map((hero) => (
          <motion.div
            key={hero.id}
            className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg cursor-pointer transition-shadow"
            onClick={() => setSelectedHero(hero)}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-lg">{hero.name}</h3>
              <Star className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-gray-600 text-sm mb-3">{hero.description}</p>
            <div className="flex gap-2 text-xs text-gray-500">
              <span className="bg-gray-100 px-2 py-1 rounded">{hero.element}</span>
              <span className="bg-gray-100 px-2 py-1 rounded">{hero.rarity}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
```

### 3.2 Tương tự cho các components khác:

**ProvinceCard.tsx**:
```typescript
import { useProvinces } from '@/lib/hooks/useApi';

export default function ProvinceCard() {
  const { provinces, loading, error } = useProvinces();
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      {provinces.map(province => (
        <div key={province.id} className="...">
          {/* Render province */}
        </div>
      ))}
    </div>
  );
}
```

---

## 🧪 BƯỚC 4: KIỂM TRA API

### 4.1 Test heroes endpoint:

```bash
curl -s http://localhost:11101/api/v1/heroes | jq
```

### 4.2 Test provinces endpoint:

```bash
curl -s http://localhost:11101/api/v1/provinces | jq
```

### 4.3 Test with authentication:

```bash
# Get token first
TOKEN=$(curl -s -X POST http://localhost:11101/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}' | jq -r '.data.token')

# Use token
curl -s -H "Authorization: Bearer $TOKEN" \
  http://localhost:11101/api/v1/resources/my-resources | jq
```

---

## 📋 CHECKLIST CỬC KỲ CƠN

### Phase 1: Database Setup
- [ ] Database schema initialized
- [ ] Sample data seeded
- [ ] API endpoints returning data

### Phase 2: Frontend Hooks
- [ ] `useHeroes` hook created
- [ ] `useProvinces` hook created
- [ ] `useStories` hook created
- [ ] `useAuth` context created

### Phase 3: Component Updates
- [ ] HeroesTab updated to use useHeroes
- [ ] ProvinceCard updated to use useProvinces
- [ ] WorldMapTab updated
- [ ] All components removed mock data imports

### Phase 4: Testing
- [ ] API integration tests pass
- [ ] Components render real data
- [ ] Loading states work
- [ ] Error handling works

---

## 🚀 QUICK START SCRIPT

```bash
#!/bin/bash

# 1. Initialize database
echo "🔧 Initializing database..."
docker exec katagame-db psql -U katagame -d katagame < katagame_database_schema.sql

# 2. Seed data
echo "🌱 Seeding data..."
docker exec katagame-db psql -U katagame -d katagame << 'EOF'
INSERT INTO provinces (id, name, is_capital) VALUES
  (1, 'Hà Nội', true),
  (2, 'Hồ Chí Minh', true),
  (3, 'Huế', false);
EOF

# 3. Test API
echo "✅ Testing API..."
curl -s http://localhost:11101/api/v1/provinces | jq

echo "✅ Done! Frontend can now use real API data."
```

---

## 📚 NEXT STEPS

1. **Today**: 
   - Initialize database
   - Seed sample data
   - Create API hooks
   - Update 3-5 main components

2. **Tomorrow**:
   - Update all remaining components
   - Add authentication flow
   - Test entire integration

3. **This Week**:
   - Performance optimization
   - Error handling
   - Caching strategy

---

**Status**: Ready to implement
**Estimated Time**: 4-6 hours for full integration
