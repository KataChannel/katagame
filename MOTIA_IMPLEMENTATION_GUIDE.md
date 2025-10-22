# 🚀 MOTIA BACKEND IMPLEMENTATION GUIDE

**Date**: 22/10/2025  
**Framework**: Motia v0.8.2-beta.139  
**Status**: Step implementations created ✅ | Ready for integration

---

## 📋 CREATED MOTIA STEPS

All step files have been created in `/motia/steps/game/`:

### 1. **player-login.step.ts** ✅
**Type**: Cron (every 5 minutes)  
**Function**: Process player logins, award daily login bonuses  
**Emits**: 
- `player.daily_reward_claimed` - Daily 100 gold, 50 gems, 20 culture
- `leaderboard.update` - Mark player for leaderboard recalc

**Logic**:
```
For each logged-in player:
  - Check if already received daily reward today
  - If not, emit reward event
  - Update last_login timestamp
  - Emit leaderboard update
```

---

### 2. **battle-resolution.step.ts** ✅
**Type**: Cron (every 2 minutes)  
**Function**: Process completed battles, award experience/gold, update PvP ratings  
**Emits**:
- `player.exp_gained` - Attacker: 200 exp (win), 50 exp (loss)
- `leaderboard.score_update` - Update PvP rating (+50 to -20)
- `achievement.check` - Check battle-related achievements

**Logic**:
```
For each pending battle:
  - Get attacker & defender players
  - Determine reward tiers based on winner:
    * Winner: +200 exp, +500 gold, +50 rating
    * Loser: +100/150 exp, +0/300 gold, -20/+30 rating
    * Draw: +75 exp, +100 gold each
  - Update player experience & resources
  - Emit individual reward events
  - Mark battle as completed
```

---

### 3. **quest-submission.step.ts** ✅
**Type**: Cron (every 3 minutes)  
**Function**: Process educational quiz submissions, award culture points  
**Emits**:
- `player.culture_earned` - Award culture based on quiz score %
- `achievement.check` - Check "perfect quiz" achievement

**Logic**:
```
For each pending quest submission:
  - Get quest definition & player
  - Validate each answer against correct answer
  - Calculate score percentage (0-100%)
  - Award culture = quest_culture_points × (score% / 100)
  - Track completion progress
  - Check if perfect score (100%) → achievement unlock
```

**Example**:
- Quiz worth 100 culture points
- Player scores 80%
- Reward = 100 × 0.8 = 80 culture points

---

### 4. **marketplace-transaction.step.ts** ✅
**Type**: Cron (every 2 minutes)  
**Function**: Process buy/sell transactions, handle marketplace fees  
**Emits**:
- `player.gold_changed` - Buyer pays, Seller receives (after 5% fee)
- `player.item_received` - Buyer receives item

**Logic**:
```
For each pending transaction:
  - Get buyer, seller, listing
  - Check buyer has enough gold
  - Calculate: fee = price × 0.05
  - Update balances:
    * Buyer: -price
    * Seller: +(price - fee)
    * System: +fee (for rewards/charity)
  - Add item to buyer inventory
  - Mark listing as sold
  - Emit gold change & item received
```

**Example**:
- Item listed: 1000 gold
- Buyer pays: 1000 gold
- Fee: 50 gold (5%)
- Seller receives: 950 gold
- System charity fund: +50 gold

---

### 5. **guild-war.step.ts** ✅
**Type**: Cron (every 6 hours)  
**Function**: Process territorial guild wars, update province control  
**Emits**:
- `guild.territory_captured` - Attacker wins, receives 10K gold + 500 guild coins
- `guild.war_ended` - War outcome

**Logic**:
```
For each active guild war:
  - Get attacker guild, defender guild, province
  - Calculate: powerRatio = attacker.power / defender.power
  - Attacker wins if powerRatio > 1.2 (20% advantage required)
  
  If attacker wins:
    - Transfer province control
    - Award: +10K gold, +500 guild coins to treasury
  Else (defender wins):
    - Keep current control
    - Award defender: +5K gold, +250 guild coins
    
  - Mark war as completed
```

**Territory Control**:
- 50 Vietnam provinces total
- Each province = resource income (gold, culture)
- Guild with 51%+ wins war → gets income

---

### 6. **leaderboard-cron.step.ts** ✅
**Type**: Cron (Weekly, Sunday midnight)  
**Function**: Update global rankings, distribute weekly rewards  
**Emits**:
- `leaderboard.updated` - Updated rankings snapshot
- `season.rewards_distributed` - Top 10 reward distribution

**Logic**:
```
1. Get all players from state
2. Sort by experience (power)
3. Assign ranks (1st place = highest exp)
4. Store snapshots for historical tracking

5. Distribute weekly rewards:
   Rank 1: 5000 gold, 500 gems
   Rank 2: 3000 gold, 300 gems
   Rank 3: 2000 gold, 200 gems
   ...
   Rank 10: 100 gold, 10 gems
```

**Reward Distribution**:
- Top 10 get exclusive weekly rewards
- Incentivizes competition
- Resets weekly (players can reclaim spots)

---

### 7. **analytics-aggregation.step.ts** ✅
**Type**: Cron (Daily at 6 AM)  
**Function**: Aggregate daily metrics, calculate retention rates  
**Emits**:
- `analytics.daily_report` - Complete daily metrics
- `analytics.retention_calculated` - D1/D7/D30 retention

**Logic**:
```
1. Calculate DAU (Daily Active Users)
   = Players who logged in today

2. Calculate MAU (Monthly Active Users)
   = DAU × 1.5 (estimate)

3. Calculate retention:
   - D1 = ~40% of DAU
   - D7 = ~25% of DAU  
   - D30 = ~15% of DAU

4. Calculate revenue metrics:
   - Total revenue = sum of transactions today
   - ARPU = revenue / DAU
   - ARPPU = revenue / paying users

5. Store daily snapshot for dashboards
```

**Example Dashboard Output**:
```
Date: 2025-10-22
DAU: 15,000
MAU: 22,500
D1 Retention: 6,000 (40%)
D7 Retention: 3,750 (25%)
Revenue: 45,000,000 VND
ARPU: 3,000 VND
Paying Users: 3,000 (20%)
```

---

### 8. **achievement-unlock.step.ts** ✅
**Type**: Cron (every 5 minutes)  
**Function**: Monitor achievement progress, auto-unlock when conditions met  
**Emits**:
- `achievement.unlocked` - Achievement unlocked, award points
- `player.points_earned` - Add achievement points to profile

**Logic**:
```
For each player, check achievement conditions:
1. First Victory: battles_won >= 1 (10 points)
2. Level 10: level >= 10 (50 points)
3. Level 50: level >= 50 (200 points)
4. I'm Rich: gold >= 100K (100 points)
5. Scholar: culture >= 1000 (75 points)
6. Trader: transactions >= 10 (60 points)
7. Warrior: battles_won >= 50 (150 points)
8. Cultural Ambassador: quests >= 20 (120 points)

If condition met AND not already unlocked:
  - Unlock achievement
  - Award achievement points
  - Emit unlock event
```

---

## 🔗 EVENT FLOW DIAGRAM

```
┌─────────────────────────────────────────────────┐
│         MOTIA EVENT PROCESSING SYSTEM            │
└─────────────────────────────────────────────────┘

Frontend Action          Motia Event              Backend Step
─────────────────────────────────────────────────────────────

Player logs in ───→ player.login ────────→ player-login.step.ts
                                              ↓
                                      Daily reward check
                                              ↓
                                      Emit: player.daily_reward_claimed


Battle ends ───────→ battle.completed ──→ battle-resolution.step.ts
                                              ↓
                                      Calculate rewards
                                              ↓
                                      Emit: player.exp_gained
                                            leaderboard.score_update


Quest submitted ──→ quest.submitted ────→ quest-submission.step.ts
                                              ↓
                                      Grade answers
                                              ↓
                                      Emit: player.culture_earned
                                            achievement.check


Trade completed ──→ marketplace.purchase ─→ marketplace-transaction.step.ts
                                              ↓
                                      Process payment
                                              ↓
                                      Emit: player.gold_changed
                                            player.item_received


Guild war ends ───→ guild.war.declared ──→ guild-war.step.ts
                                              ↓
                                      Determine winner
                                              ↓
                                      Emit: guild.territory_captured
                                            guild.war_ended


[CRON] Every 6h ──────────────────────→ leaderboard-cron.step.ts
                                              ↓
                                      Rank all players
                                              ↓
                                      Emit: leaderboard.updated
                                            season.rewards_distributed


[CRON] Daily ──────────────────────────→ analytics-aggregation.step.ts
                                              ↓
                                      Aggregate metrics
                                              ↓
                                      Emit: analytics.daily_report


[CRON] Every 5m ────────────────────────→ achievement-unlock.step.ts
                                              ↓
                                      Check conditions
                                              ↓
                                      Emit: achievement.unlocked
```

---

## 📊 STATE STORAGE KEYS

### Player Data
```
player:{playerId}
├─ id, username, email
├─ level, experience
├─ resources: { gold, rice, lumber, stone, culture, gems }
├─ inventory: [ { itemId, name, type } ]
└─ last_login, created_at
```

### Battle Records
```
battle:pending:{battleId}
battle:completed:{battleId}
├─ attackerId, defenderId
├─ result: attacker_win | defender_win | draw
├─ rewards: { exp, gold, rating }
└─ timestamp
```

### Quest Progress
```
quest:{questId}
├─ title, dynasty, content
├─ quiz: [ { question, options, correctAnswer, points } ]
└─ culture_points

quest_submission:pending:{submissionId}
├─ playerId, questId
├─ answers: [ answer1, answer2, ... ]
└─ timestamp

progress:{playerId}:{questId}
├─ score (percentage)
├─ cultureEarned
└─ completedAt
```

### Marketplace
```
listing:{listingId}
├─ seller_id, item_id, item_name, item_type
├─ price, status (active|sold|expired)
└─ auction_end, created_at

transaction:pending:{transactionId}
transaction:completed:{transactionId}
├─ buyerId, sellerId, listingId, price
└─ timestamp
```

### Guild Wars
```
war:active:{warId}
├─ attackerGuildId, defenderGuildId, provinceId
└─ timestamp

province:{provinceId}
├─ name, controlled_by, control_since
└─ power_bonus

guild:{guildId}
├─ name, leader_id, total_power
├─ members_count
├─ treasury: { gold, guildCoins }
└─ created_at
```

### Leaderboards
```
leaderboard:rank:{playerId}
├─ rank, score (experience)
├─ level, updated
└─ playerName

leaderboard:snapshot:{ISO_TIMESTAMP}
├─ topPlayers: [ { rank, name, experience, level } ]
└─ totalPlayers, timestamp
```

### Analytics
```
analytics:daily:{YYYY-MM-DD}
├─ dau, mau
├─ retention: { d1, d7, d30 }
├─ revenue: { total, arpu, arppu, payingUsers }
├─ totalPlayers, avgLevel
└─ timestamp

event:login:{date}:{playerId}
event:purchase:{date}:{playerId}
```

### Achievements
```
achievement:{playerId}:{achievementId}
├─ playerId, achievementId, achievementName
├─ points, unlockedAt
└─ progress (0-100%)
```

---

## 🎯 IMPLEMENTATION CHECKLIST

### Phase 1: Setup & Infrastructure ✅
- [x] Created all 8 Motia step files
- [x] Defined event flow diagrams
- [x] Designed state storage schema
- [ ] Setup Motia CLI (`motia dev`)
- [ ] Configure Redis for state storage

### Phase 2: State Management
- [ ] Implement state.get() for player lookups
- [ ] Implement state.list() for batch operations
- [ ] Setup state persistence (Redis)
- [ ] Handle state transaction failures

### Phase 3: Event Emission
- [ ] Wire events to frontend
- [ ] Real-time WebSocket updates
- [ ] Event replay for recovery
- [ ] Event audit logging

### Phase 4: Data Validation
- [ ] Add Zod schemas to each step
- [ ] Validate player resources
- [ ] Validate battle records
- [ ] Error handling & logging

### Phase 5: Testing
- [ ] Unit test each step
- [ ] Integration tests (multiple events)
- [ ] Load test (1000 events/min)
- [ ] Failure recovery tests

### Phase 6: Production Deployment
- [ ] Docker containerization
- [ ] Horizontal scaling setup
- [ ] Monitoring & alerts
- [ ] Database backup strategy

---

## 💻 QUICK START

### 1. Install Dependencies
```bash
cd motia
npm install
```

### 2. Start Motia Dev Server
```bash
npm run dev
```

### 3. Verify Steps Are Loaded
```bash
# Check Motia dashboard
# http://localhost:3000/steps
# Should see all 8 game steps registered
```

### 4. Trigger Test Events
```bash
# Use Motia CLI or API to emit events
curl -X POST http://localhost:3000/events \
  -H "Content-Type: application/json" \
  -d '{"topic": "player.login", "data": {"playerId": "uuid-123", "timestamp": 1234567890}}'
```

---

## 🔧 NEXT STEPS

1. **Database Setup**: PostgreSQL schema + migrations
2. **State Storage**: Redis cluster setup
3. **API Layer**: REST endpoints for frontend
4. **Frontend Integration**: Connect frontend to backend events
5. **Authentication**: JWT + Firebase Auth
6. **Testing**: Load testing + chaos engineering
7. **Deployment**: Kubernetes + CI/CD pipeline

---

## 📞 TROUBLESHOOTING

**Step not loading?**
- Check step name matches in config.name
- Verify file in `/motia/steps/game/` directory
- Check TypeScript compilation: `npm run build`

**Event not emitting?**
- Verify state.list() returns items
- Check state.get() not returning null
- Check emit() function is called with correct topic
- Look at Motia logs for errors

**Performance issues?**
- Batch operations with state.list() (not individual get calls)
- Index frequently searched state keys
- Use Redis TTL for ephemeral data
- Monitor Motia worker memory usage

---

*Status: ✅ All Motia steps created and ready for integration*  
*Next: Database setup + State storage configuration*
