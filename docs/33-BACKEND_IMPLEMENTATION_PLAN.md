# 🛠️ KATAGAME - BACKEND IMPLEMENTATION PLAN (MVP 1.0)

**Target**: 5 weeks from now (November 1, 2025)  
**Team**: 4 backend devs + 2 DevOps + 1 QA  
**Language**: TypeScript + Node.js  
**Framework**: Motia (event-driven)  

---

## 📋 WEEK-BY-WEEK BREAKDOWN

### WEEK 1: Foundation & Schema (Oct 22-28)

#### Day 1: Project Setup & Architecture
**Task**: Backend infrastructure setup
```
motia/
├── src/
│   ├── config/
│   │   ├── database.ts          (PostgreSQL config)
│   │   ├── environment.ts       (env variables)
│   │   └── middleware.ts        (auth, validation, etc.)
│   ├── services/
│   │   ├── auth.service.ts      ✅ (exists, refine)
│   │   ├── player.service.ts    ✅ (exists, refine)
│   │   ├── battle.service.ts    ✅ (exists)
│   │   ├── quest.service.ts     ✅ (exists)
│   │   ├── hero.service.ts      (new)
│   │   ├── resource.service.ts  (new)
│   │   └── save-game.service.ts (new)
│   ├── models/
│   │   ├── Player.ts
│   │   ├── Hero.ts
│   │   ├── Battle.ts
│   │   └── Quest.ts
│   ├── types/
│   │   ├── player.types.ts
│   │   ├── battle.types.ts
│   │   └── api.types.ts
│   └── utils/
│       ├── validators.ts        (input validation)
│       ├── errors.ts            (custom errors)
│       └── helpers.ts           (utilities)
├── steps/
│   └── game/                    ✅ (exists)
└── migrations/
    └── 001_initial_schema.sql   (new)
```

**Deliverables**:
- ✅ Docker setup (services running)
- ✅ Environment configuration
- ✅ TypeScript compilation working
- ✅ Motia framework configured
- ✅ ESLint & prettier setup

---

#### Day 2: Database Schema - Tables 1-4
**Task**: Create core tables in PostgreSQL

```sql
-- 1. players table
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  level INTEGER DEFAULT 1,
  experience INTEGER DEFAULT 0,
  gold INTEGER DEFAULT 100,
  gems INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_players_username ON players(username);
CREATE INDEX idx_players_email ON players(email);

-- 2. heroes table
CREATE TABLE heroes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  element VARCHAR(20) NOT NULL,
  rarity VARCHAR(20) NOT NULL,
  base_power INTEGER NOT NULL,
  skills JSONB DEFAULT '[]',
  lore TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. player_heroes table
CREATE TABLE player_heroes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL,
  hero_id UUID NOT NULL,
  level INTEGER DEFAULT 1,
  experience INTEGER DEFAULT 0,
  recruited_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
  FOREIGN KEY (hero_id) REFERENCES heroes(id)
);

CREATE INDEX idx_player_heroes_player_id ON player_heroes(player_id);
CREATE INDEX idx_player_heroes_hero_id ON player_heroes(hero_id);

-- 4. player_resources table
CREATE TABLE player_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  amount BIGINT DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
  UNIQUE(player_id, resource_type)
);

CREATE INDEX idx_player_resources_player_id ON player_resources(player_id);
```

**Deliverables**:
- ✅ Tables 1-4 created in production DB
- ✅ Indexes optimized
- ✅ Foreign keys validated
- ✅ Test data inserted (5 heroes)

---

#### Day 3: Database Schema - Tables 5-8
**Task**: Continue schema creation

```sql
-- 5. battles table
CREATE TABLE battles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL,
  enemy_id VARCHAR(100) NOT NULL,
  player_hero_id UUID,
  winner_id UUID,
  reward_gold INTEGER DEFAULT 0,
  reward_exp INTEGER DEFAULT 0,
  battle_log JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
  FOREIGN KEY (player_hero_id) REFERENCES player_heroes(id)
);

CREATE INDEX idx_battles_player_id ON battles(player_id);
CREATE INDEX idx_battles_created_at ON battles(created_at);

-- 6. resources table (reference data)
CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  type VARCHAR(50) NOT NULL,
  base_value INTEGER NOT NULL,
  rarity VARCHAR(20)
);

-- 7. quests table
CREATE TABLE quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50),
  reward_gold INTEGER DEFAULT 0,
  reward_exp INTEGER DEFAULT 0,
  difficulty VARCHAR(20) DEFAULT 'normal',
  created_at TIMESTAMP DEFAULT NOW()
);

-- 8. player_achievements table
CREATE TABLE player_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL,
  achievement_id VARCHAR(100) NOT NULL,
  unlocked_at TIMESTAMP DEFAULT NOW(),
  progress INTEGER DEFAULT 0,
  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
  UNIQUE(player_id, achievement_id)
);

CREATE INDEX idx_player_achievements_player_id ON player_achievements(player_id);
```

**Deliverables**:
- ✅ Tables 5-8 created
- ✅ Relationships verified
- ✅ Migration script created

---

#### Day 4: Database Schema - Tables 9-12
**Task**: Final tables + reference data

```sql
-- 9. provinces table
CREATE TABLE provinces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  level_required INTEGER DEFAULT 1,
  resources JSONB DEFAULT '{}',
  bonuses JSONB DEFAULT '{}',
  unlocked_at TIMESTAMP
);

-- 10. player_save_games table
CREATE TABLE player_save_games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL,
  data JSONB NOT NULL,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  synced_at TIMESTAMP,
  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
);

CREATE INDEX idx_save_games_player_id ON player_save_games(player_id);
CREATE INDEX idx_save_games_created_at ON player_save_games(created_at);

-- 11. game_sessions table
CREATE TABLE game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL,
  token VARCHAR(500) NOT NULL UNIQUE,
  ip_address VARCHAR(50),
  user_agent VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  last_activity TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
);

CREATE INDEX idx_sessions_player_id ON game_sessions(player_id);
CREATE INDEX idx_sessions_token ON game_sessions(token);
CREATE INDEX idx_sessions_expires_at ON game_sessions(expires_at);

-- 12. audit_logs table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID,
  action VARCHAR(100) NOT NULL,
  details JSONB DEFAULT '{}',
  ip_address VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE SET NULL
);

CREATE INDEX idx_audit_logs_player_id ON audit_logs(player_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
```

**Seed Reference Data**:
```sql
-- Heroes
INSERT INTO heroes (name, element, rarity, base_power, lore) VALUES
('Hùng Vương', 'Earth', 'Legendary', 150, 'Vị vua sáng lập nước Việt'),
('Trần Hưng Đạo', 'Fire', 'Legendary', 140, 'Tướng quân vĩ đại'),
('Hai Bà Trưng', 'Light', 'Legendary', 130, 'Nữ anh hùng giải phóng'),
('Lý Thái Tổ', 'Wind', 'Epic', 110, 'Nhà sáng lập triều Lý'),
('Võ Nguyên Giáp', 'Dark', 'Legendary', 135, 'Tướng nhân dân');

-- Provinces (3 initial)
INSERT INTO provinces (name, level_required) VALUES
('Hà Nội', 1),
('Nghệ An', 10),
('Quảng Ninh', 20);

-- Resources
INSERT INTO resources (name, type, base_value, rarity) VALUES
('Gold', 'currency', 1, 'common'),
('Rice', 'food', 5, 'common'),
('Lumber', 'material', 10, 'uncommon'),
('Stone', 'material', 15, 'uncommon');

-- Quests
INSERT INTO quests (name, reward_gold, reward_exp, difficulty) VALUES
('Harvest Rice', 50, 10, 'easy'),
('Defeat Enemy', 100, 25, 'medium'),
('Collect Gems', 150, 40, 'hard');
```

**Deliverables**:
- ✅ All 12 tables created
- ✅ Indexes optimized
- ✅ Reference data inserted
- ✅ Database diagram generated
- ✅ Migration script complete

---

#### Day 5: Migration Setup & Database Connection
**Task**: Setup migration tooling and test connections

```typescript
// src/config/database.ts
import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 11003,
  database: process.env.DB_NAME || 'katagame',
});

export const query = (text: string, params?: any[]) =>
  pool.query(text, params);

export const connect = async () => {
  const client = await pool.connect();
  return client;
};

export const runMigrations = async () => {
  const migrations = [
    './migrations/001_initial_schema.sql',
    './migrations/002_seed_data.sql',
  ];
  
  for (const migration of migrations) {
    // Execute migration
  }
};
```

**Deliverables**:
- ✅ Database connection working
- ✅ Connection pooling configured
- ✅ Migration system setup
- ✅ Error handling implemented
- ✅ Database backup script created

---

### WEEK 2: API Endpoints 1-5 (Oct 29 - Nov 4)

#### Day 1-2: Authentication Endpoints

**Endpoint 1**: `POST /api/v1/auth/register` ✅ (refine)
```typescript
// steps/game/auth-register.step.ts (REFINE EXISTING)
export const config = {
  type: 'api',
  method: 'POST',
  path: '/api/v1/auth/register',
  name: 'AuthRegisterHandler',
};

export const handler = async (request: any) => {
  try {
    const { username, email, password } = request.body;
    
    // Validation
    if (!username || username.length < 3) {
      return { success: false, message: 'Username must be 3+ characters' };
    }
    if (!email.includes('@')) {
      return { success: false, message: 'Invalid email' };
    }
    if (password.length < 8) {
      return { success: false, message: 'Password must be 8+ characters' };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create player
    const result = await query(
      'INSERT INTO players (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email',
      [username, email, hashedPassword]
    );

    const player = result.rows[0];

    // Generate token
    const token = jwt.sign(
      { playerId: player.id, email: player.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Initialize resources
    await query(
      'INSERT INTO player_resources (player_id, resource_type, amount) VALUES ($1, $2, $3)',
      [player.id, 'gold', 100]
    );

    return {
      success: true,
      message: 'Registration successful',
      data: {
        token,
        playerId: player.id,
        username: player.username,
        email: player.email,
        level: 1,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};
```

**Endpoint 2**: `POST /api/v1/auth/login` (new)
```typescript
// steps/game/auth-login.step.ts (NEW)
export const config = {
  type: 'api',
  method: 'POST',
  path: '/api/v1/auth/login',
};

export const handler = async (request: any) => {
  try {
    const { email, password } = request.body;

    const result = await query(
      'SELECT id, username, password_hash, level FROM players WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return { success: false, message: 'Invalid credentials' };
    }

    const player = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, player.password_hash);

    if (!passwordMatch) {
      return { success: false, message: 'Invalid credentials' };
    }

    // Update last login
    await query('UPDATE players SET last_login = NOW() WHERE id = $1', [player.id]);

    const token = jwt.sign(
      { playerId: player.id, email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      success: true,
      data: { token, playerId: player.id, username: player.username, level: player.level },
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
};
```

**Endpoint 3**: `POST /api/v1/auth/logout` (new)
```typescript
export const config = {
  type: 'api',
  method: 'POST',
  path: '/api/v1/auth/logout',
};

export const handler = async (request: any) => {
  const token = request.headers.authorization?.split(' ')[1];
  if (!token) return { success: false, message: 'No token' };

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await query('DELETE FROM game_sessions WHERE player_id = $1', [decoded.playerId]);
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
};
```

**Endpoint 4**: `POST /api/v1/auth/refresh-token` (new)
```typescript
export const config = {
  type: 'api',
  method: 'POST',
  path: '/api/v1/auth/refresh-token',
};

export const handler = async (request: any) => {
  try {
    const { refreshToken } = request.body;
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const newToken = jwt.sign(
      { playerId: decoded.playerId, email: decoded.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return { success: true, token: newToken };
  } catch (error) {
    return { success: false, message: 'Invalid refresh token' };
  }
};
```

---

#### Day 3-4: Player & Battle Endpoints

**Endpoint 5**: `GET /api/v1/players/me` (new)
```typescript
export const config = {
  type: 'api',
  method: 'GET',
  path: '/api/v1/players/me',
};

export const handler = async (request: any) => {
  const token = extractToken(request);
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const result = await query(
    'SELECT id, username, level, experience, gold, gems FROM players WHERE id = $1',
    [decoded.playerId]
  );

  const player = result.rows[0];
  if (!player) return { success: false, message: 'Player not found' };

  return { success: true, data: player };
};
```

**Endpoint 6**: `PUT /api/v1/players/update` (new)
**Endpoint 7**: `GET /api/v1/players/{id}/profile` (new)

**Endpoint 8**: `POST /api/v1/battles/start` (new)
**Endpoint 9**: `POST /api/v1/battles/resolve` (new)

**Deliverables**:
- ✅ 4 auth endpoints tested & working
- ✅ 2 player endpoints tested
- ✅ 2 battle endpoints skeleton
- ✅ Unit tests for auth (60% coverage)
- ✅ Error handling implemented
- ✅ Input validation added

---

#### Day 5: Testing & Documentation

**Deliverables**:
- ✅ API documentation (Swagger/OpenAPI)
- ✅ Unit tests written (60% coverage)
- ✅ Integration tests for endpoints
- ✅ Error response standardized
- ✅ Logging setup

---

### WEEK 3: API Endpoints 6-15 (Nov 5 - Nov 11)

#### Day 1-2: Resources & Heroes Endpoints

**Endpoints 10-12**: Resource management
- `GET /api/v1/resources/harvest`
- `POST /api/v1/resources/trade`
- `GET /api/v1/heroes/list`

#### Day 3-4: Achievements & Save Game

**Endpoints 13-15**: Completion
- `POST /api/v1/heroes/recruit`
- `GET /api/v1/achievements/list`
- `POST /api/v1/save-game/sync`

#### Day 5: Integration & Testing

**Deliverables**:
- ✅ All 15 endpoints complete
- ✅ 60%+ test coverage
- ✅ Load testing passed
- ✅ Documentation complete

---

### WEEK 4: Testing, Optimization, Security (Nov 12 - Nov 18)

#### Tasks
1. **Performance Optimization**
   - [ ] Database query optimization
   - [ ] Add Redis caching
   - [ ] Index verification
   - [ ] N+1 query detection

2. **Security Hardening**
   - [ ] SQL injection prevention
   - [ ] XSS protection (helmet)
   - [ ] Rate limiting
   - [ ] CORS configuration
   - [ ] Input validation middleware

3. **Testing**
   - [ ] Unit tests: 60%+
   - [ ] Integration tests: 40%+
   - [ ] E2E tests: Critical paths
   - [ ] Load test: 1,000 concurrent users
   - [ ] Security audit

4. **DevOps**
   - [ ] CI/CD pipeline setup
   - [ ] Docker image creation
   - [ ] Staging deployment
   - [ ] Monitoring setup

---

### WEEK 5: Beta Launch & Deployment (Nov 19 - Nov 25)

#### Tasks
1. **Final Testing**
   - [ ] Beta testing with 100 users
   - [ ] Bug fixes from feedback
   - [ ] Performance monitoring

2. **Production Deployment**
   - [ ] AWS RDS setup
   - [ ] AWS EC2 deployment
   - [ ] DNS configuration
   - [ ] SSL certificates
   - [ ] Backup procedures

3. **Launch Preparation**
   - [ ] Marketing materials
   - [ ] App store submission
   - [ ] Support team training
   - [ ] Monitoring alerts

---

## 🔧 TECHNOLOGY & TOOLS

### Development Stack
```
Runtime: Node.js 18+
Language: TypeScript 5
Framework: Motia 0.8.2-beta
Database: PostgreSQL 15
Cache: Redis 7
Testing: Jest + Supertest
Documentation: Swagger/OpenAPI
```

### Dependencies to Add
```json
{
  "dependencies": {
    "pg": "^8.11",
    "redis": "^4.6",
    "jsonwebtoken": "^9.1",
    "bcryptjs": "^2.4",
    "express": "^4.18",
    "helmet": "^7.1",
    "cors": "^2.8",
    "uuid": "^9.0",
    "zod": "^3.22"
  },
  "devDependencies": {
    "jest": "^29.7",
    "@types/jest": "^29.5",
    "supertest": "^6.3",
    "ts-jest": "^29.1",
    "@types/node": "^20.9"
  }
}
```

---

## 📊 EFFORT ESTIMATION

| Phase | Feature | Backend | Frontend | Total |
|-------|---------|---------|----------|-------|
| Week 1 | Database Schema | 40h | 0h | 40h |
| Week 2 | Auth + Player | 35h | 5h | 40h |
| Week 3 | Game Systems | 35h | 5h | 40h |
| Week 4 | Testing + Optimization | 30h | 10h | 40h |
| Week 5 | Deployment | 20h | 0h | 20h |
| **TOTAL** | | **160h** | **20h** | **180h** |

**Team**: 4 backend developers
- Developer A: Database + Auth (40h + 35h)
- Developer B: Game systems (35h)
- Developer C: Testing + Optimization (30h)
- DevOps: Infrastructure (20h)

---

## ✅ SUCCESS CRITERIA

By end of Week 5:

1. **Functionality**
   - [ ] All 15 API endpoints working
   - [ ] Database fully functional
   - [ ] Authentication secure
   - [ ] Game loop integrated

2. **Quality**
   - [ ] 60%+ test coverage
   - [ ] 0 critical bugs
   - [ ] 0 SQL errors
   - [ ] API response < 500ms

3. **Performance**
   - [ ] Handles 1,000 concurrent users
   - [ ] Database queries < 100ms
   - [ ] No memory leaks
   - [ ] Uptime > 99%

4. **Security**
   - [ ] Penetration test passed
   - [ ] No SQL injections
   - [ ] Password properly hashed
   - [ ] HTTPS/SSL enabled

5. **Deployment**
   - [ ] Production environment ready
   - [ ] Backups automated
   - [ ] Monitoring active
   - [ ] Support team trained

---

**Document created**: 22 October 2025  
**Status**: READY TO EXECUTE  
**Questions?**: Contact Tech Lead
