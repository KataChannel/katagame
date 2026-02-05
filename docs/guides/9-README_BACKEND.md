# KataGame Backend - Motia Event-Driven Architecture

> Event-driven game backend sử dụng Motia workflow engine

## 🎮 Overview

KataGame backend được xây dựng trên nền tảng **Motia** - một event-driven workflow engine mạnh mẽ. Backend xử lý tất cả game logic, events, và state management cho ứng dụng frontend.

### Architecture
```
┌─────────────────┐
│  Frontend       │  (Next.js 15 + React 19)
│  (katagame/)    │
└────────┬────────┘
         │ REST API / WebSocket
         ▼
┌─────────────────────────────────────┐
│  Motia Event Processing Layer       │
│  ├─ Event Handlers (8 steps)       │
│  ├─ Cron Jobs                       │
│  └─ Game Flow Orchestration         │
└────────┬────────────────────────────┘
         │
    ┌────┴──────────┬──────────────┐
    ▼               ▼              ▼
┌─────────┐   ┌──────────┐   ┌─────────┐
│PostgreSQL│   │ Redis    │   │Analytics│
│ (State) │   │(Leaderbd)│   │ (Events)│
└─────────┘   └──────────┘   └─────────┘
```

## 📦 Project Structure

```
motia/
├── src/
│   ├── services/              # Domain services
│   │   ├── database.service.ts
│   │   ├── player.service.ts
│   │   ├── battle.service.ts
│   │   ├── quest.service.ts
│   │   ├── marketplace.service.ts
│   │   ├── guild.service.ts
│   │   ├── auth.service.ts
│   │   └── index.ts
│   ├── game-flow.config.ts    # Game flow configuration
│   ├── config.ts              # Environment configuration
│   ├── api.utils.ts           # API utilities
│   └── ...
├── steps/
│   └── game/                  # Motia event handlers
│       ├── player-login.step.ts
│       ├── battle-resolution.step.ts
│       ├── quest-submission.step.ts
│       ├── marketplace-transaction.step.ts
│       ├── guild-war.step.ts
│       ├── leaderboard-cron.step.ts
│       ├── analytics-aggregation.step.ts
│       └── achievement-unlock.step.ts
├── .env.local                 # Local configuration
├── .env.example               # Configuration template
├── package.json
├── tsconfig.json
└── API_ROUTES.md              # API documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 13+
- Redis 6+

### Installation

1. **Clone repository**
```bash
cd katagame/motia
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment**
```bash
cp .env.example .env.local
# Edit .env.local với PostgreSQL, Redis credentials
```

4. **Initialize database**
```bash
# Create database
createdb katagame

# Run schema migration
psql katagame < ../katagame_database_schema.sql
```

5. **Start development server**
```bash
npm run dev
```

Server sẽ chạy tại `http://localhost:3001`

## 🎯 Core Systems

### 1. Player System
```typescript
// Get player
const player = await playerService.getPlayer(playerId)

// Award experience
await playerService.awardExperience(playerId, 100)

// Update resources
await playerService.updateResources(playerId, {
  gold: player.resources.gold + 500
})
```

### 2. Battle System
```typescript
// Create battle
const battle = await battleService.createBattle(attackerId, defenderId, 'pvp')

// Resolve battle
await battleService.updateBattle(
  battleId,
  'attacker_win',
  { exp: 200, gold: 500, rating: 50 },
  { exp: 100, gold: 0, rating: -20 },
  45 // duration in seconds
)
```

### 3. Quest System
```typescript
// Get quest
const quest = await questService.getQuest(questId)

// Submit quest
await questService.completeQuest(playerId, questId, score)

// Get player culture earned
const culture = await questService.getPlayerCultureFromQuests(playerId)
```

### 4. Marketplace System
```typescript
// Create listing
const listing = await marketplaceService.createListing(
  sellerId, 'weapon', 'item_123', 'Iron Sword', 500
)

// Search listings
const results = await marketplaceService.searchListings('sword', 50)
```

### 5. Guild System
```typescript
// Create guild
const guild = await guildService.createGuild('Dragon Slayers', leaderId)

// Add member
await guildService.addMember(guildId, playerId, 'member')

// Update power
await guildService.updateGuildPower(guildId)
```

### 6. Achievement System
```typescript
// Achievements tự động unlock khi điều kiện đạt
// Available achievements:
// - first_win: Win 1 battle
// - level_10, level_50: Reach level
// - rich: Have 100k gold
// - scholar: Have 1k culture
// - trader: 10 marketplace transactions
// - warrior: Win 50 battles
// - cultural_ambassador: Complete 20 quests
```

## 📊 Game Events

### Player Events
- `player.login` - Player login
- `player.daily_reward_claimed` - Daily reward
- `player.exp_gained` - Experience gained
- `player.culture_earned` - Culture earned
- `player.gold_changed` - Gold changed
- `player.points_earned` - Points earned

### Battle Events
- `battle.started` - Battle started
- `battle.completed` - Battle completed
- Winner và rewards được xử lý bởi `BattleResolutionProcessor`

### Quest Events
- `quest.submitted` - Quest submitted
- Tự động validation và culture award

### Marketplace Events
- `marketplace.purchase` - Purchase transaction
- Fees (5%) được tính tự động

### Guild Events
- `guild.created` - Guild created
- `guild.war.declared` - War declared
- `guild.territory_captured` - Territory captured

### Achievement Events
- `achievement.check` - Check for unlock
- `achievement.unlocked` - Achievement unlocked

## 🔄 Game Flow & Event Processing

### Event Processing Pipeline

```
Event Emitted
    ↓
Motia Router
    ↓
Handler Processor
    ↓
State Update (Redis/Memory)
    ↓
Side Effects
    ↓
Event Emission (next events)
    ↓
Leaderboard Update (cron)
    ↓
Analytics Recording
```

### Cron Jobs

| Job | Schedule | Purpose |
|-----|----------|---------|
| PlayerLoginProcessor | Every 5 min | Check daily rewards |
| BattleResolutionProcessor | Every 2 min | Resolve pending battles |
| QuestSubmissionProcessor | Every 3 min | Process quest submissions |
| MarketplaceTransactionProcessor | Every 2 min | Process transactions |
| GuildWarProcessor | Every 6 hours | Resolve guild wars |
| AchievementUnlockProcessor | Every 5 min | Check achievements |
| LeaderboardUpdateCron | Weekly | Update rankings |
| AnalyticsAggregationCron | Daily | Aggregate metrics |

## 🔐 Authentication

### JWT Tokens
```typescript
// Generate token (24 hour expiry)
const token = authService.generateToken(playerId, username)

// Verify token
const decoded = authService.verifyToken(token)
// Returns: { playerId, username }

// Refresh token
const newToken = authService.refreshToken(token)
```

### Login/Register
```typescript
// Register
const { token, playerId } = await authService.register(
  'username', 'email@example.com', 'SecurePass123'
)

// Login
const { token, playerId } = await authService.login('username', 'SecurePass123')
```

## 📡 API Usage

### Base URL
```
http://localhost:3001/api/v1
```

### Example: Get Player Profile
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:3001/api/v1/players/me
```

### Example: Start Battle
```bash
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"defenderId":"<uuid>","battleType":"pvp"}' \
  http://localhost:3001/api/v1/battles/start
```

See [API_ROUTES.md](./API_ROUTES.md) for complete API documentation.

## 🛠️ Development

### Database Migrations
```bash
# Check migration status
npm run prisma:status

# Create new migration
npm run prisma:migrate "add feature"

# Reset database (DEV ONLY)
npm run prisma:reset
```

### Generate Types
```bash
npm run generate-types
```

### Build
```bash
npm run build
```

### Testing
```bash
npm test
```

## 📈 Performance & Scaling

### Current Setup (Development)
- Single Motia worker process
- PostgreSQL single instance (connection pool: 20)
- Redis local instance
- In-memory state management

### Production Scaling
```
┌──────────────────┐
│  Load Balancer   │
└────────┬─────────┘
    ┌────┴────┬────────┐
    ▼         ▼        ▼
┌────────┐ ┌────────┐ ┌────────┐
│ Motia  │ │ Motia  │ │ Motia  │
│Worker 1│ │Worker 2│ │Worker 3│
└────┬───┘ └───┬────┘ └───┬────┘
     │         │          │
     └─────────┼──────────┘
               ▼
    ┌──────────────────┐
    │ PostgreSQL HA    │
    │ Cluster (3 node) │
    └──────────────────┘
               
    ┌──────────────────┐
    │ Redis Cluster    │
    │ (3 node)         │
    └──────────────────┘
```

### Optimization Tips
- Enable Redis caching for frequently accessed data
- Use database indexes on player_id, created_at, status
- Monitor event queue depth
- Profile slow handlers with timing logs

## 🐛 Troubleshooting

### Connection Errors
```
Error: connect ECONNREFUSED 127.0.0.1:5432

Solution: Ensure PostgreSQL is running
$ psql -U postgres
```

### Database Schema Issues
```
Solution: Run schema migration
$ psql katagame < ../katagame_database_schema.sql
```

### Token Errors
```
Error: Invalid token signature

Solution: Ensure JWT_SECRET is same in all processes
$ echo $JWT_SECRET
```

### Event Processing Delays
```
Solution: Check event queue and handler logs
npm run dev -- --debug
```

## 📚 Documentation

- [API Routes Documentation](./API_ROUTES.md)
- [Backend Architecture Review](../BACKEND_ARCHITECTURE_REVIEW.md)
- [Motia Documentation](https://docs.motia.dev)
- [Database Schema](../katagame_database_schema.sql)

## 📝 Environment Variables

See `.env.example` for complete list. Key variables:

| Variable | Description | Default |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection | postgresql://user@localhost/katagame |
| REDIS_URL | Redis connection | redis://localhost:6379 |
| JWT_SECRET | JWT signing key | dev-secret |
| NODE_ENV | Environment | development |
| PORT | Server port | 3001 |

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/my-feature`
2. Commit changes: `git commit -am 'Add feature'`
3. Push branch: `git push origin feature/my-feature`
4. Create Pull Request

## 📜 License

Copyright © 2024 KataGame. All rights reserved.

---

**Last Updated**: October 22, 2024  
**Version**: 1.0.0  
**Status**: Development ✅
