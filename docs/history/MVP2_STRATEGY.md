# 📋 CHIẾN LƯỢC TRIỂN KHAI MVP2

**Ngày bắt đầu**: 29/11/2025  
**Thời gian ước tính**: 30-40 giờ làm việc  
**Mục tiêu**: Hoàn thành MVP Phase 2 - Core Features

---

## 🎯 TỔNG QUAN MỤC TIÊU MVP2

### Tính năng cần implement (8 features chính):

1. ✅ **63 tỉnh thành đầy đủ** - Database done, cần UI  
2. ⏳ **Hệ thống thời kỳ lịch sử** - Backend + Frontend  
3. ⏳ **Passive/Active skills cho tỉnh** - Backend + Frontend  
4. ⏳ **Hero levels (1-5) với stats scaling** - Backend + Frontend  
5. ⏳ **Pet system** - Backend + Frontend  
6. ⏳ **Tương sinh tài nguyên (Wu Xing)** - Backend + Frontend  
7. ⏳ **Daily story unlock system** - Backend + Frontend  
8. ⏳ **Quiz x5 reward multiplier** - Backend + Frontend  

---

## 📊 PHÂN TÍCH KHỐI LƯỢNG CÔNG VIỆC

### Phase 1: Database & Schema (✅ HOÀN THÀNH)
- [x] Schema enhancements cho MVP2 features
- [x] 63 provinces SQL data
- [x] Migration files created
- [ ] Run migrations (5 phút)
- [ ] Generate Prisma Client (2 phút)

**Thời gian thực tế**: 2 giờ ✅

---

### Phase 2: Backend Core Logic (⏳ 12-15 giờ)

#### 2.1 Province Skills System (3 giờ)
**Files cần sửa/tạo**:
- `backend/src/province/province.service.ts` - Skills logic
- `backend/src/province/dto/activate-skill.input.ts` - New DTO
- `backend/src/province/models/province-skills.model.ts` - GraphQL models

**Logic cần implement**:
```typescript
// Passive buffs unlock at milestones
calculatePassiveBuffs(resourceLevel: number) {
  // Level 3: +5% production
  // Level 5: +10% production  
  // Level 7: +15% production
  // Level 10: +20% production
}

// Active skills với cooldown
activateSkill(playerProvinceId, skillType) {
  // Check development_level unlock
  // Check cooldown (24 hours)
  // Apply multiplier: x2 (lv3), x3 (lv6), x5 (lv10)
  // Duration: 1 hour
  // Set cooldown_ends = now + 24h
}
```

#### 2.2 Hero Leveling System (4 giờ)
**Files cần sửa/tạo**:
- `backend/src/hero/hero.service.ts` - Level up logic
- `backend/src/hero/dto/level-up-hero.input.ts` - New DTO
- `backend/src/hero/models/hero-stats.model.ts` - Stats calculation

**Logic cần implement**:
```typescript
// Stats multipliers theo level
const LEVEL_MULTIPLIERS = {
  1: 1,    // Base stats (100%)
  2: 2,    // 2x base (200%)
  3: 6,    // 3x level 2 = 6x base (600%)
  4: 24,   // 4x level 3 = 24x base (2400%)
  5: 120   // 5x level 4 = 120x base (12000%)
};

// Level up costs
const LEVEL_UP_COSTS = {
  2: { gold: 1000, gems: 100 },
  3: { gold: 5000, gems: 500 },
  4: { gold: 20000, gems: 2000 },
  5: { gold: 100000, gems: 10000 }
};

levelUpHero(playerId, heroId) {
  // Check current level < 5
  // Check sufficient resources
  // Deduct costs
  // Update level, calculate new stats
  // Update pet_level if has pet
}
```

#### 2.3 Pet System (2 giờ)
**Files cần sửa/tạo**:
- `backend/src/hero/pet.service.ts` - Pet logic
- Integrate vào hero.service.ts

**Logic cần implement**:
```typescript
// Pet bonuses
applyPetBonus(heroStats, petBonus, petLevel) {
  // Pet bonus scales with pet_level
  // Base bonus * pet_level
  // Apply to all hero stats
}

evolvePet(playerId, heroId) {
  // Stage 1 (Lv 1-2): Basic
  // Stage 2 (Lv 3-4): Evolved (+50% bonus)
  // Stage 3 (Lv 5): Ultimate (+100% bonus)
}
```

#### 2.4 Resource Synergy (Wu Xing) (2 giờ)
**Files cần sửa/tạo**:
- `backend/src/resource/synergy.service.ts` - New service
- `backend/src/player/player.service.ts` - Calculate synergy on resource update

**Logic cần implement**:
```typescript
// Wu Xing cycle: Gold -> Rice -> Lumber -> Bazan -> Stone -> Gold
calculateSynergy(playerResources) {
  const synergy = {};
  
  // Gold boosts Rice production
  synergy.rice_bonus = playerResources.gold * 0.001; // 0.1% per gold
  
  // Rice boosts Lumber
  synergy.lumber_bonus = playerResources.rice * 0.001;
  
  // Lumber boosts Bazan
  synergy.bazan_bonus = playerResources.lumber * 0.001;
  
  // Bazan boosts Stone
  synergy.stone_bonus = playerResources.bazan * 0.002; // Bazan rarer
  
  // Stone boosts Gold
  synergy.gold_bonus = playerResources.stone * 0.001;
  
  return synergy;
}
```

#### 2.5 Daily Story Unlock (1.5 giờ)
**Files cần sửa/tạo**:
- `backend/src/story/story.service.ts` - Auto-unlock logic
- `backend/src/story/story.resolver.ts` - Filter available stories

**Logic cần implement**:
```typescript
getAvailableStories(playerId) {
  const player = await findPlayer(playerId);
  const daysSinceRegistration = calculateDays(player.registration_date);
  
  // Filter stories where story.day <= daysSinceRegistration
  return prisma.story.findMany({
    where: {
      day: { lte: daysSinceRegistration },
      is_available: true
    }
  });
}
```

#### 2.6 Quiz x5 Multiplier (1.5 giờ)
**Files cần sửa/tạo**:
- `backend/src/story/quiz.service.ts` - Answer checking
- `backend/src/story/dto/submit-quiz.input.ts` - Update response

**Logic cần implement**:
```typescript
submitQuiz(playerId, storyId, answers[]) {
  const questions = await getQuizQuestions(storyId);
  let correctCount = 0;
  
  answers.forEach((answer, index) => {
    if (answer === questions[index].correct_answer) {
      correctCount++;
    }
  });
  
  const isPerfect = correctCount === questions.length;
  const multiplier = isPerfect ? 5.0 : 1.0;
  
  const baseRewards = getStoryRewards(storyId);
  const actualRewards = {
    gold: baseRewards.gold * multiplier,
    rice: baseRewards.rice * multiplier,
    lumber: baseRewards.lumber * multiplier
  };
  
  // Update player resources
  // Update quiz_submissions với multiplier
  // Update player_stats (perfect_quizzes, quiz_perfect_streak)
  
  return { correctCount, totalQuestions, multiplier, rewards: actualRewards };
}
```

#### 2.7 Historical Era System (2 giờ)
**Files cần sửa/tạo**:
- `backend/src/era/era.service.ts` - New service
- `backend/src/player/player.service.ts` - Era progression
- `backend/src/province/province.service.ts` - Filter by era

**Logic cần implement**:
```typescript
const HISTORICAL_ERAS = [
  'Thời Hùng Vương',
  'Thời Bắc thuộc',
  'Nhà Đinh',
  'Nhà Lý',
  'Nhà Trần',
  'Nhà Lê',
  'Nhà Tây Sơn',
  'Nhà Nguyễn',
  'Hiện đại'
];

unlockNextEra(playerId) {
  const player = await findPlayer(playerId);
  const currentIndex = HISTORICAL_ERAS.indexOf(player.current_era);
  
  // Requirements to unlock next era:
  // - Complete 80% provinces of current era
  // - Player level >= era_requirement
  
  if (meetsRequirements) {
    const nextEra = HISTORICAL_ERAS[currentIndex + 1];
    await updatePlayer(playerId, {
      current_era: nextEra,
      unlocked_eras: [...player.unlocked_eras, nextEra]
    });
  }
}
```

**Tổng Backend**: ~15 giờ

---

### Phase 3: GraphQL API Extensions (⏳ 4-5 giờ)

#### 3.1 Schema Definitions
**File**: `backend/src/schema.gql`

```graphql
# Province Skills
type PassiveBuff {
  type: String!
  value: Float!
  unlockedAtLevel: Int!
}

type ActiveSkill {
  level: Int!
  multiplier: Float!
  duration: Int! # seconds
  cooldown: Int! # seconds
  cooldownEndsAt: DateTime
}

extend type PlayerProvince {
  passiveBuffs: [PassiveBuff!]!
  activeSkill: ActiveSkill
}

input ActivateSkillInput {
  playerProvinceId: String!
  skillType: String!
}

type ActivateSkillResponse {
  success: Boolean!
  message: String!
  endsAt: DateTime
  cooldownEndsAt: DateTime
}

# Hero Leveling
type HeroStats {
  hp: Int!
  attack: Int!
  defense: Int!
  speed: Int!
  multiplier: Float!
}

extend type PlayerHero {
  stats: HeroStats!
  levelUpCost: LevelUpCost
  canLevelUp: Boolean!
}

type LevelUpCost {
  gold: Int!
  gems: Int!
}

input LevelUpHeroInput {
  heroId: String!
}

type LevelUpHeroResponse {
  success: Boolean!
  newLevel: Int!
  newStats: HeroStats!
}

# Pet System
type PetInfo {
  name: String!
  emoji: String!
  level: Int!
  bonus: Int!
  evolutionStage: Int!
  stageName: String!
}

extend type PlayerHero {
  pet: PetInfo
}

# Resource Synergy
type ResourceSynergy {
  goldBonus: Float!
  riceBonus: Float!
  lumberBonus: Float!
  bazanBonus: Float!
  stoneBonus: Float!
}

extend type Player {
  resourceSynergy: ResourceSynergy!
}

# Quiz
type QuizSubmissionResponse {
  correctCount: Int!
  totalQuestions: Int!
  score: Float!
  multiplier: Float!
  rewards: ResourceRewards!
  isPerfect: Boolean!
}

type ResourceRewards {
  gold: Int!
  rice: Int!
  lumber: Int!
  stone: Int!
}

input SubmitQuizInput {
  storyId: String!
  answers: [Int!]!
}

# Historical Eras
type EraInfo {
  name: String!
  unlocked: Boolean!
  completionPercent: Float!
}

extend type Player {
  currentEra: String!
  unlockedEras: [String!]!
  eraProgress: [EraInfo!]!
}
```

#### 3.2 Resolvers
**Files**:
- `backend/src/province/province.resolver.ts` - Skills mutations
- `backend/src/hero/hero.resolver.ts` - Level up mutations
- `backend/src/story/story.resolver.ts` - Quiz submission
- `backend/src/player/player.resolver.ts` - Synergy, era queries

**Tổng GraphQL**: ~5 giờ

---

### Phase 4: Frontend - shadcn/ui Setup (⏳ 2 giờ)

#### 4.1 Install shadcn/ui
```bash
cd frontend
npx shadcn@latest init
```

#### 4.2 Install Components
```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog
npx shadcn@latest add badge
npx shadcn@latest add combobox
npx shadcn@latest add progress
npx shadcn@latest add tabs
npx shadcn@latest add tooltip
npx shadcn@latest add separator
```

#### 4.3 Configure Tailwind for Mobile-First
**File**: `frontend/tailwind.config.ts`
```typescript
export default {
  // Mobile-first breakpoints
  theme: {
    screens: {
      'sm': '640px',   // Tablets
      'md': '768px',   // Small laptops
      'lg': '1024px',  // Desktops
      'xl': '1280px',  // Large desktops
    }
  }
}
```

**Tổng Frontend Setup**: ~2 giờ

---

### Phase 5: Frontend UI Implementation (⏳ 10-12 giờ)

#### 5.1 Province Map với 63 tỉnh (3 giờ)
**Components cần tạo**:
- `ProvinceMapView.tsx` - Main map container
- `ProvinceMarker.tsx` - Individual province marker
- `ProvinceDetailsDialog.tsx` - Province details modal
- `EraFilter.tsx` - Filter provinces by era

**Layout**:
```tsx
<ProvinceMapView>
  <EraFilter onSelectEra={handleEraChange} />
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {provinces.map(province => (
      <ProvinceCard
        key={province.id}
        province={province}
        isUnlocked={isUnlocked}
        onClick={() => showDetails(province)}
      />
    ))}
  </div>
</ProvinceMapView>
```

#### 5.2 Province Skills UI (2.5 giờ)
**Components**:
- `PassiveBuffsDisplay.tsx` - Show unlocked buffs
- `ActiveSkillButton.tsx` - Activate skill with cooldown timer
- `SkillCooldownTimer.tsx` - Countdown display

```tsx
<ActiveSkillButton
  skill={activeSkill}
  onActivate={handleActivateSkill}
  disabled={isOnCooldown}
>
  {isOnCooldown ? (
    <SkillCooldownTimer endsAt={cooldownEndsAt} />
  ) : (
    `Kích hoạt x${multiplier}`
  )}
</ActiveSkillButton>
```

#### 5.3 Hero Leveling UI (2.5 giờ)
**Components**:
- `HeroCard.tsx` - Hero display with level
- `HeroStatsDisplay.tsx` - Show current stats
- `LevelUpButton.tsx` - Level up với cost display
- `HeroLevelProgress.tsx` - Visual level indicator

```tsx
<HeroCard hero={hero}>
  <HeroLevelProgress level={hero.level} maxLevel={5} />
  <HeroStatsDisplay stats={hero.stats} />
  <LevelUpButton
    cost={hero.levelUpCost}
    onLevelUp={handleLevelUp}
    disabled={!canAfford || hero.level >= 5}
  />
  {hero.pet && <PetDisplay pet={hero.pet} />}
</HeroCard>
```

#### 5.4 Pet System UI (1.5 giờ)
**Components**:
- `PetCard.tsx` - Pet info display
- `PetEvolutionStage.tsx` - Evolution visual

#### 5.5 Resource Synergy Display (1.5 giờ)
**Components**:
- `ResourceSynergyWidget.tsx` - Show Wu Xing cycle
- `SynergyBonusDisplay.tsx` - Show bonuses

```tsx
<ResourceSynergyWidget>
  <div className="flex items-center gap-2">
    <ResourceIcon type="gold" /> → 
    <ResourceIcon type="rice" />
    <span className="text-green-500">+{riceBonus}</span>
  </div>
  {/* Repeat for all 5 cycles */}
</ResourceSynergyWidget>
```

#### 5.6 Story & Quiz UI Improvements (2 giờ)
**Components**:
- `DailyStoryList.tsx` - Show available stories
- `StoryUnlockCountdown.tsx` - Next story unlock timer
- `QuizForm.tsx` - Quiz với x5 indicator
- `QuizResultDialog.tsx` - Show multiplier & rewards

```tsx
<QuizForm onSubmit={handleSubmitQuiz}>
  {questions.map((q, i) => (
    <QuizQuestion key={i} question={q} onChange={handleAnswer} />
  ))}
  <div className="text-yellow-500 font-bold">
    🎁 Trả lời đúng tất cả = x5 phần thưởng!
  </div>
  <Button type="submit">Nộp bài</Button>
</QuizForm>

<QuizResultDialog result={quizResult}>
  {result.isPerfect && (
    <Confetti />
    <div className="text-3xl">🎉 HOÀN HẢO! x5 PHẦN THƯỞNG!</div>
  )}
  <QuizScore score={result.score} multiplier={result.multiplier} />
  <RewardsDisplay rewards={result.rewards} />
</QuizResultDialog>
```

**Tổng Frontend UI**: ~12 giờ

---

### Phase 6: Integration & Testing (⏳ 3-4 giờ)

#### 6.1 GraphQL Query Hooks (1 giờ)
**File**: `frontend/lib/graphql/queries.ts`
```typescript
export const GET_PLAYER_WITH_MVP2 = gql`
  query GetPlayerWithMVP2 {
    me {
      id
      username
      resources
      currentEra
      unlockedEras
      resourceSynergy {
        goldBonus
        riceBonus
        lumberBonus
        bazanBonus
        stoneBonus
      }
    }
  }
`;

export const GET_MY_PROVINCES_WITH_SKILLS = gql`
  query GetMyProvincesWithSkills {
    myProvinces {
      province { id name region }
      farmerLevel
      resourceLevel
      developmentLevel
      passiveBuffs {
        type value unlockedAtLevel
      }
      activeSkill {
        level multiplier duration cooldown cooldownEndsAt
      }
    }
  }
`;

export const LEVEL_UP_HERO = gql`
  mutation LevelUpHero($heroId: String!) {
    levelUpHero(input: { heroId: $heroId }) {
      success
      newLevel
      newStats { hp attack defense speed multiplier }
    }
  }
`;

export const ACTIVATE_SKILL = gql`
  mutation ActivateSkill($playerProvinceId: String!, $skillType: String!) {
    activateSkill(input: { playerProvinceId: $playerProvinceId, skillType: $skillType }) {
      success
      message
      endsAt
      cooldownEndsAt
    }
  }
`;

export const SUBMIT_QUIZ_MVP2 = gql`
  mutation SubmitQuiz($storyId: String!, $answers: [Int!]!) {
    submitQuiz(input: { storyId: $storyId, answers: $answers }) {
      correctCount
      totalQuestions
      score
      multiplier
      rewards { gold rice lumber stone }
      isPerfect
    }
  }
`;
```

#### 6.2 End-to-End Testing (2 giờ)
- Test hero level up flow
- Test skill activation with cooldown
- Test quiz x5 multiplier
- Test resource synergy calculations
- Test daily story unlocks
- Test era progression

#### 6.3 Mobile Responsive Testing (1 giờ)
- Test all screens on 375px (iPhone SE)
- Test on 768px (iPad)
- Test on 1024px (Desktop)

**Tổng Testing**: ~4 giờ

---

### Phase 7: Documentation (⏳ 2 giờ)

#### 7.1 Create MVP2_HOAN_THANH.md (Vietnamese)
**Nội dung**:
- Tổng hợp 8 features đã implement
- Hướng dẫn sử dụng từng feature
- Screenshots/GIFs demo
- Technical notes
- Known issues & limitations

---

## ⏱️ TỔNG THỜI GIAN ƯỚC TÍNH

| Phase | Thời gian | Trạng thái |
|-------|-----------|------------|
| 1. Database & Schema | 2h | ✅ XONG |
| 2. Backend Core Logic | 15h | ⏳ TODO |
| 3. GraphQL API | 5h | ⏳ TODO |
| 4. shadcn/ui Setup | 2h | ⏳ TODO |
| 5. Frontend UI | 12h | ⏳ TODO |
| 6. Integration & Testing | 4h | ⏳ TODO |
| 7. Documentation | 2h | ⏳ TODO |
| **TOTAL** | **42 giờ** | **5% hoàn thành** |

---

## 🚀 CHIẾN LƯỢC TRIỂN KHAI

### Approach: Incremental Feature Development

**Không làm tất cả 8 features song song** → Sẽ dễ bị lỗi và khó debug

**Thay vào đó: Làm từng feature từ đầu đến cuối**

#### Sprint 1 (8h): Quiz x5 Multiplier + Daily Story Unlock
- Backend: Quiz service, Story service
- GraphQL: Mutations & queries
- Frontend: Quiz UI, Story list UI
- Test & verify
- ✅ 2 features hoàn chỉnh

#### Sprint 2 (10h): Province Skills System
- Backend: Skills service, cooldown logic
- GraphQL: Skill mutations
- Frontend: Skills UI, cooldown timers
- Test & verify
- ✅ 1 feature hoàn chỉnh

#### Sprint 3 (10h): Hero Leveling + Pet System
- Backend: Level up logic, pet calculations
- GraphQL: Hero mutations
- Frontend: Hero cards, level up UI, pet display
- Test & verify
- ✅ 2 features hoàn chỉnh

#### Sprint 4 (8h): Resource Synergy + Era System
- Backend: Synergy calculations, era progression
- GraphQL: Queries for synergy & era
- Frontend: Synergy widget, era filter
- Test & verify
- ✅ 2 features hoàn chỉnh

#### Sprint 5 (4h): 63 Provinces UI
- Frontend only: Province map/grid display
- Era filters
- Unlock UI
- ✅ 1 feature hoàn chỉnh

#### Sprint 6 (2h): Documentation
- Create MVP2_HOAN_THANH.md
- Update README
- ✅ All done

---

## 🎯 MỤC TIÊU KHẢ THI

**MVP2 Full (42h)** = Quá dài cho 1 session

**MVP2 Mini (Sprint 1 only - 8h)** = Khả thi hơn

### Đề xuất: MVP2 Phase 1 (Sprint 1)

**Focus**: Quiz x5 + Daily Story Unlock

**Why**: 
- 2 features quan trọng nhất cho engagement
- Ít complexity nhất (không cần UI phức tạp)
- Có thể complete trong ~6-8 giờ
- User immediately sees value (x5 rewards!)

**Deliverables**:
1. ✅ Backend: Quiz answer checking với x5 multiplier
2. ✅ Backend: Daily story unlock based on registration date
3. ✅ GraphQL: Submit quiz mutation
4. ✅ GraphQL: Get available stories query
5. ✅ Frontend: Quiz form với x5 indicator
6. ✅ Frontend: Quiz result dialog với confetti
7. ✅ Frontend: Story list với unlock status
8. ✅ Documentation: MVP2_PHASE1.md

---

## 📝 KẾT LUẬN

MVP2 Full là mục tiêu dài hạn (2-3 tuần development time).

**Immediate next steps**:
1. ✅ Chạy migrations (5 phút)
2. ✅ Generate Prisma Client (2 phút)
3. 🎯 **Implement Sprint 1: Quiz + Story (6-8h)**
4. ⏸️ Remaining sprints: Schedule for next sessions

**Ưu tiên**: Deliver working features incrementally rather than incomplete full system.

---

*Document này sẽ được update theo tiến độ thực tế*
