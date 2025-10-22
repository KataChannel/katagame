# 🎮 KATAGAME - PROJECT REVIEW & ARCHITECTURE

**Date**: 22/10/2025  
**Branch**: vietnamgame_backend (Motia setup)  
**Status**: Frontend ✅ 100% | Backend 🔄 In Progress

---

## 📊 PROJECT OVERVIEW

### Frontend (katagame/) - COMPLETE ✅
- **Framework**: Next.js 15 + React 19 + TypeScript 5
- **UI**: Tailwind CSS + Framer Motion + Lucide Icons
- **State**: Zustand + LocalStorage persistence
- **Total Code**: ~40,100 lines
- **Components**: 39 files, 30 backend systems
- **Features**: 8 MVP 4 systems fully implemented

### Backend (motia/) - SETUP 🔄
- **Framework**: Motia (Event-driven workflow engine)
- **Status**: Template structure created
- **Database**: PostgreSQL ready
- **Need**: Real data models + integration

---

## 🎯 BACKEND ARCHITECTURE WITH MOTIA

Motia is perfect for event-driven game backend:

```
┌─────────────────┐
│  Client (Web)   │
└────────┬────────┘
         │ REST/WebSocket
         ▼
┌─────────────────────────────────────┐
│  Motia Event Processing             │
│  ├─ Events: player.login,          │
│  │           player.harvest,        │
│  │           battle.start,          │
│  │           guild.war.declared     │
│  ├─ Steps: processing, rewards      │
│  └─ Flows: multi-step workflows     │
└────────┬────────────────────────────┘
         │
    ┌────┴──────────┬──────────────┐
    ▼               ▼              ▼
┌─────────┐   ┌──────────┐   ┌─────────┐
│PostgreSQL│   │ Redis    │   │ Analytics│
│ (State) │   │(Leaderbd)│   │ (Events) │
└─────────┘   └──────────┘   └─────────┘
```

---

## 📦 DATA MODELS NEEDED

### 1. Player Model
```sql
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  level INTEGER DEFAULT 1,
  experience INTEGER DEFAULT 0,
  resources JSONB DEFAULT '{"gold":200,"rice":100,"lumber":50,"stone":30,"culture":20,"gems":1500}',
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);
```

### 2. Battle Records
```sql
CREATE TABLE battles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attacker_id UUID REFERENCES players(id),
  defender_id UUID REFERENCES players(id),
  battle_type VARCHAR(20),
  result VARCHAR(10),
  attacker_reward JSONB,
  defender_reward JSONB,
  duration INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 3. Leaderboard Data
```sql
CREATE TABLE leaderboard_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id),
  board_type VARCHAR(20),
  rank INTEGER,
  score INTEGER,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 4. Educational Quests
```sql
CREATE TABLE educational_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200),
  dynasty VARCHAR(50),
  content TEXT,
  quiz JSONB,
  culture_points INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔧 MOTIA STEPS IMPLEMENTATION

### Step 1: Player Login Handler
```typescript
// steps/game/player-login.step.ts
import { EventConfig, Handlers } from 'motia'

export const config: EventConfig = {
  type: 'event',
  topic: 'player.login',
  name: 'PlayerLoginHandler',
  description: 'Handle player login, update last_login, award daily rewards',
  emits: ['player.daily_reward_claimed', 'leaderboard.update'],
  flows: ['game-flow'],
}

export const handler: Handlers['PlayerLoginHandler'] = async ({
  event,
  logger,
  state,
  emit,
}) => {
  const { playerId, timestamp } = event.data

  // Get player from state
  const player = await state.get(`player:${playerId}`)
  
  if (!player) {
    logger.error('Player not found', { playerId })
    return
  }

  // Check if daily reward eligible
  const lastLoginDate = new Date(player.last_login).toDateString()
  const todayDate = new Date(timestamp).toDateString()

  if (lastLoginDate !== todayDate) {
    // Award daily reward
    await emit({
      topic: 'player.daily_reward_claimed',
      data: {
        playerId,
        rewards: {
          gold: 100,
          gems: 50,
          culture: 20,
        },
      },
    })
  }

  // Update last login
  const updatedPlayer = {
    ...player,
    last_login: timestamp,
  }
  
  await state.set(`player:${playerId}`, updatedPlayer)
  
  logger.info('Player login recorded', { playerId })
}
```

### Step 2: Battle Resolution
```typescript
// steps/game/battle-resolution.step.ts
import { EventConfig, Handlers } from 'motia'

export const config: EventConfig = {
  type: 'event',
  topic: 'battle.completed',
  name: 'BattleResolutionHandler',
  description: 'Process battle results, award exp/gold, update leaderboard',
  emits: ['player.exp_gained', 'leaderboard.score_update'],
  flows: ['game-flow'],
}

export const handler: Handlers['BattleResolutionHandler'] = async ({
  event,
  logger,
  state,
  emit,
}) => {
  const { attackerId, defenderId, result, battleLog } = event.data

  // Get both players
  const attacker = await state.get(`player:${attackerId}`)
  const defender = await state.get(`player:${defenderId}`)

  let attackerReward = { exp: 0, gold: 0, rating: 0 }
  let defenderReward = { exp: 0, gold: 0, rating: 0 }

  if (result === 'attacker_win') {
    attackerReward = { exp: 200, gold: 500, rating: 50 }
    defenderReward = { exp: 100, gold: 0, rating: -20 }
  } else {
    attackerReward = { exp: 50, gold: 0, rating: -20 }
    defenderReward = { exp: 150, gold: 300, rating: 30 }
  }

  // Update states
  attacker.experience += attackerReward.exp
  defender.experience += defenderReward.exp

  await state.set(`player:${attackerId}`, attacker)
  await state.set(`player:${defenderId}`, defender)

  // Emit rewards
  await emit({
    topic: 'player.exp_gained',
    data: {
      playerId: attackerId,
      exp: attackerReward.exp,
    },
  })

  await emit({
    topic: 'leaderboard.score_update',
    data: {
      playerId: attackerId,
      scoreChange: attackerReward.rating,
      boardType: 'pvp',
    },
  })

  logger.info('Battle resolved', { attackerId, defenderId, result })
}
```

### Step 3: Educational Quest Submission
```typescript
// steps/game/quest-submission.step.ts
import { EventConfig, Handlers } from 'motia'

export const config: EventConfig = {
  type: 'event',
  topic: 'quest.submitted',
  name: 'QuestSubmissionHandler',
  description: 'Process educational quest submission, award culture points',
  emits: ['player.culture_earned', 'achievement.unlock_check'],
  flows: ['game-flow'],
}

export const handler: Handlers['QuestSubmissionHandler'] = async ({
  event,
  logger,
  state,
  emit,
}) => {
  const { playerId, questId, answers, timestamp } = event.data

  const quest = await state.get(`quest:${questId}`)
  const player = await state.get(`player:${playerId}`)

  // Validate answers
  let score = 0
  quest.quiz.forEach((q: any, idx: number) => {
    if (answers[idx] === q.correctAnswer) {
      score += q.points
    }
  })

  const cultureReward = Math.floor(quest.culture_points * (score / 100))

  // Award culture points
  player.resources.culture += cultureReward

  // Track completion
  const progressKey = `progress:${playerId}:${questId}`
  await state.set(progressKey, {
    questId,
    playerId,
    score,
    completedAt: timestamp,
  })

  await state.set(`player:${playerId}`, player)

  await emit({
    topic: 'player.culture_earned',
    data: {
      playerId,
      culturePo: cultureReward,
      questId,
    },
  })

  logger.info('Quest submitted', { playerId, questId, score })
}
```

### Step 4: Marketplace Transaction
```typescript
// steps/game/marketplace-transaction.step.ts
import { EventConfig, Handlers } from 'motia'

export const config: EventConfig = {
  type: 'event',
  topic: 'marketplace.purchase',
  name: 'MarketplaceTransactionHandler',
  description: 'Process buy/sell transactions, handle fees',
  emits: ['player.gold_changed', 'player.item_received'],
  flows: ['game-flow'],
}

export const handler: Handlers['MarketplaceTransactionHandler'] = async ({
  event,
  logger,
  state,
  emit,
}) => {
  const { buyerId, sellerId, listingId, price } = event.data

  const buyer = await state.get(`player:${buyerId}`)
  const seller = await state.get(`player:${sellerId}`)
  const listing = await state.get(`listing:${listingId}`)

  // Calculate fees (5%)
  const fee = Math.floor(price * 0.05)
  const sellerEarnings = price - fee

  // Update balances
  buyer.resources.gold -= price
  seller.resources.gold += sellerEarnings

  await state.set(`player:${buyerId}`, buyer)
  await state.set(`player:${sellerId}`, seller)

  // Mark listing sold
  listing.status = 'sold'
  await state.set(`listing:${listingId}`, listing)

  // Emit events
  await emit({
    topic: 'player.gold_changed',
    data: { playerId: buyerId, goldChange: -price },
  })

  await emit({
    topic: 'player.item_received',
    data: { playerId: buyerId, item: listing.item },
  })

  logger.info('Marketplace transaction', {
    buyerId,
    sellerId,
    amount: price,
    fee,
  })
}
```

### Step 5: Guild War Processing
```typescript
// steps/game/guild-war.step.ts
import { EventConfig, Handlers } from 'motia'

export const config: EventConfig = {
  type: 'event',
  topic: 'guild.war.declared',
  name: 'GuildWarHandler',
  description: 'Process guild wars, update territory control',
  emits: ['guild.territory_captured', 'guild.war_ended'],
  flows: ['game-flow'],
}

export const handler: Handlers['GuildWarHandler'] = async ({
  event,
  logger,
  state,
  emit,
}) => {
  const { attackerGuildId, defenderGuildId, provinceId } = event.data

  const province = await state.get(`province:${provinceId}`)
  const attacker = await state.get(`guild:${attackerGuildId}`)
  const defender = await state.get(`guild:${defenderGuildId}`)

  // Simulate war - attacker wins if power > 10000
  const attackerWins = attacker.totalPower > 10000

  if (attackerWins) {
    province.controlledBy = attackerGuildId
    province.controlSince = Date.now()

    await emit({
      topic: 'guild.territory_captured',
      data: {
        guildId: attackerGuildId,
        provinceId,
        reward: { gold: 10000, guildCoins: 500 },
      },
    })
  }

  await state.set(`province:${provinceId}`, province)

  logger.info('Guild war processed', {
    attacker: attackerGuildId,
    defender: defenderGuildId,
    winner: attackerWins ? attackerGuildId : defenderGuildId,
  })
}
```

### Step 6: Leaderboard Update (Cron)
```typescript
// steps/game/leaderboard-cron.step.ts
import { CronConfig, Handlers } from 'motia'

export const config: CronConfig = {
  type: 'cron',
  cron: '0 0 * * 0', // Weekly on Sunday midnight
  name: 'LeaderboardUpdateCron',
  description: 'Update leaderboards, calculate rankings',
  emits: ['leaderboard.updated', 'season.rewards_distributed'],
  flows: ['game-flow'],
}

export const handler: Handlers['LeaderboardUpdateCron'] = async ({
  logger,
  state,
  emit,
}) => {
  // Get all players
  const playerKeys = await state.list('player:*')
  const players: any[] = []

  for (const key of playerKeys) {
    const player = await state.get(key)
    players.push(player)
  }

  // Sort by experience (power)
  const sorted = players.sort((a, b) => b.experience - a.experience)

  // Update leaderboard positions
  for (let i = 0; i < sorted.length; i++) {
    const entry = {
      playerId: sorted[i].id,
      rank: i + 1,
      score: sorted[i].experience,
      updated: Date.now(),
    }
    await state.set(`leaderboard:rank:${sorted[i].id}`, entry)
  }

  // Emit leaderboard updated event
  await emit({
    topic: 'leaderboard.updated',
    data: {
      totalPlayers: players.length,
      topPlayer: sorted[0]?.id,
    },
  })

  logger.info('Leaderboard updated', { totalPlayers: players.length })
}
```

### Step 7: Analytics Aggregation
```typescript
// steps/game/analytics-aggregation.step.ts
import { CronConfig, Handlers } from 'motia'

export const config: CronConfig = {
  type: 'cron',
  cron: '0 6 * * *', // Daily at 6 AM
  name: 'AnalyticsAggregationCron',
  description: 'Aggregate daily analytics, retention metrics',
  emits: ['analytics.daily_report'],
  flows: ['game-flow'],
}

export const handler: Handlers['AnalyticsAggregationCron'] = async ({
  logger,
  state,
  emit,
}) => {
  const yesterday = new Date(Date.now() - 86400000)
  const logins = await state.getGroup<any>('event:login:' + yesterday.toDateString())

  const dau = logins.length
  const mau = Math.floor(dau * 1.5) // Estimate MAU

  const metrics = {
    dau,
    mau,
    retention_d1: Math.floor(dau * 0.4), // 40% D1
    retention_d7: Math.floor(dau * 0.25), // 25% D7
    date: yesterday.toISOString(),
  }

  await state.set(`analytics:daily:${yesterday.toDateString()}`, metrics)

  await emit({
    topic: 'analytics.daily_report',
    data: metrics,
  })

  logger.info('Daily analytics aggregated', metrics)
}
```

---

## 📊 DATABASE SCHEMA (PostgreSQL)

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Players table
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255),
  level INTEGER DEFAULT 1,
  experience INTEGER DEFAULT 0,
  resources JSONB DEFAULT '{"gold":200,"rice":100,"lumber":50,"stone":30,"culture":20,"gems":1500}',
  status VARCHAR(20) DEFAULT 'active',
  region VARCHAR(20) DEFAULT 'global',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);

-- Battles table
CREATE TABLE battles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attacker_id UUID REFERENCES players(id),
  defender_id UUID REFERENCES players(id),
  battle_type VARCHAR(20), -- pvp, pve, guild_war
  result VARCHAR(20), -- attacker_win, defender_win, draw
  attacker_reward JSONB,
  defender_reward JSONB,
  duration INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Marketplace listings
CREATE TABLE marketplace_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES players(id),
  item_type VARCHAR(50),
  item_id VARCHAR(100),
  item_name VARCHAR(200),
  price INTEGER,
  status VARCHAR(20) DEFAULT 'active', -- active, sold, expired
  auction_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Leaderboard
CREATE TABLE leaderboard_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id),
  board_type VARCHAR(20), -- power, pvp, wealth, seasonal
  rank INTEGER,
  score INTEGER,
  region VARCHAR(20) DEFAULT 'global',
  timeframe VARCHAR(20) DEFAULT 'all_time', -- weekly, monthly, all_time
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Educational quests
CREATE TABLE educational_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200),
  dynasty VARCHAR(50),
  content TEXT,
  quiz JSONB, -- array of questions
  culture_points INTEGER,
  difficulty VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Quest progress
CREATE TABLE quest_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id),
  quest_id UUID REFERENCES educational_quests(id),
  score INTEGER,
  completed_at TIMESTAMP,
  UNIQUE(player_id, quest_id)
);

-- Guilds
CREATE TABLE guilds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  leader_id UUID REFERENCES players(id),
  total_power INTEGER DEFAULT 0,
  members_count INTEGER DEFAULT 1,
  treasury JSONB DEFAULT '{"gold":0,"gems":0}',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Guild members
CREATE TABLE guild_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id UUID REFERENCES guilds(id),
  player_id UUID REFERENCES players(id),
  rank VARCHAR(20), -- leader, officer, member
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(guild_id, player_id)
);

-- Province territories
CREATE TABLE provinces (
  id INTEGER PRIMARY KEY,
  name VARCHAR(100),
  controlled_by UUID REFERENCES guilds(id),
  control_since TIMESTAMP,
  power_bonus INTEGER DEFAULT 0
);

-- Analytics events
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(50),
  player_id UUID REFERENCES players(id),
  data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_players_username ON players(username);
CREATE INDEX idx_players_email ON players(email);
CREATE INDEX idx_players_status ON players(status);
CREATE INDEX idx_players_region ON players(region);

CREATE INDEX idx_battles_attacker ON battles(attacker_id);
CREATE INDEX idx_battles_defender ON battles(defender_id);
CREATE INDEX idx_battles_created ON battles(created_at);

CREATE INDEX idx_leaderboard_type_rank ON leaderboard_entries(board_type, rank);
CREATE INDEX idx_leaderboard_player ON leaderboard_entries(player_id);

CREATE INDEX idx_quests_dynasty ON educational_quests(dynasty);
CREATE INDEX idx_quest_progress_player ON quest_progress(player_id);

CREATE INDEX idx_analytics_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_player ON analytics_events(player_id);
CREATE INDEX idx_analytics_created ON analytics_events(created_at);

-- Materialized view for leaderboards
CREATE MATERIALIZED VIEW v_leaderboard_global AS
SELECT 
  p.id,
  p.username,
  p.level,
  p.experience,
  ROW_NUMBER() OVER (ORDER BY p.experience DESC) as rank
FROM players p
WHERE p.status = 'active'
ORDER BY p.experience DESC;

CREATE INDEX idx_v_leaderboard_rank ON v_leaderboard_global(rank);
```

---

## 🚀 MOTIA FLOW (Multi-step Workflow)

```typescript
// src/flows/game-flow.flow.ts
import { FlowConfig } from 'motia'

export const config: FlowConfig = {
  id: 'game-flow',
  name: 'Game Main Flow',
  description: 'Core game loop: login → harvest → battle → leaderboard',
  steps: [
    'PlayerLoginHandler',
    'BattleResolutionHandler',
    'QuestSubmissionHandler',
    'MarketplaceTransactionHandler',
    'GuildWarHandler',
    'LeaderboardUpdateCron',
    'AnalyticsAggregationCron',
  ],
  errorHandling: 'retry', // retry, skip, pause
  maxRetries: 3,
}
```

---

## 🎯 IMPLEMENTATION CHECKLIST

### Phase 1: Core Infrastructure
- [ ] Database schema setup (PostgreSQL)
- [ ] Motia steps for player lifecycle
- [ ] Event emission system
- [ ] State management (Redis)

### Phase 2: Game Systems
- [ ] Battle system events
- [ ] Marketplace transactions
- [ ] Guild wars processing
- [ ] Educational quest validation

### Phase 3: Analytics & Operations
- [ ] Analytics event aggregation
- [ ] Leaderboard updates
- [ ] Retention calculations
- [ ] Admin dashboard data feeds

### Phase 4: Integration
- [ ] Frontend → Backend API
- [ ] Real-time updates (WebSocket)
- [ ] Payment processing
- [ ] Charity tracking

---

## 📈 SCALABILITY STRATEGY

```
Single Server (MVP):
├─ Next.js frontend + Motia backend
├─ PostgreSQL single instance
└─ Redis for caching

Production (1M users):
├─ Frontend: CDN + Load balancer
├─ Backend: 
│  ├─ Motia workers (horizontal scaling)
│  ├─ PostgreSQL HA cluster (primary + replicas)
│  ├─ Redis Cluster (leaderboards, sessions)
│  └─ Kafka for event queues
├─ Database sharding by region
└─ Monitoring: Prometheus + Grafana
```

---

## 🔗 NEXT STEPS

1. **Setup Database**: PostgreSQL with provided schema
2. **Create Motia Steps**: Implement handlers for all game events
3. **Setup State Storage**: Redis or Motia's built-in state
4. **Build API Layer**: REST/GraphQL endpoints
5. **Frontend Integration**: Connect frontend to backend
6. **Testing**: Load test with 1000+ concurrent users
7. **Deployment**: Docker containerization
8. **Monitoring**: Error tracking + analytics

---

*Ready to build the backend? Let's go! 🚀*
