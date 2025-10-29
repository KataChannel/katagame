# MVP1 API Comparison - Backend vs Frontend

## Backend Endpoints Available (29 endpoints)

### ✅ Stories (4 endpoints)
- `stories-list` → GET /api/v1/stories
- `stories-by-day` → GET /api/v1/stories/:day
- `stories-with-quiz` → GET /api/v1/stories/:id/quiz
- `stories-mark-read` → POST /api/v1/stories/:id/read

### ✅ Quizzes (3 endpoints)
- `quizzes-submit` → POST /api/v1/quizzes/:id/submit
- `quizzes-stats` → GET /api/v1/quizzes/stats
- `quizzes-leaderboard` → GET /api/v1/quizzes/leaderboard

### ✅ Resources (4 endpoints)
- `resources-list` → GET /api/v1/resources
- `resources-player` → GET /api/v1/resources/my-resources
- `resources-harvest` → POST /api/v1/resources/harvest
- `resources-leaderboard` → GET /api/v1/resources/leaderboard

### ✅ Heroes (5 endpoints)
- `heroes-list` → GET /api/v1/heroes
- `heroes-player` → GET /api/v1/heroes/my-heroes
- `heroes-recruit` → POST /api/v1/heroes/recruit
- `heroes-deploy` → POST /api/v1/heroes/deploy
- `heroes-leaderboard` → GET /api/v1/heroes/leaderboard

### ✅ Provinces (6 endpoints)
- `provinces-list` → GET /api/v1/provinces
- `provinces-detail` → GET /api/v1/provinces/:id
- `provinces-player` → GET /api/v1/provinces/my-provinces
- `provinces-upgrade-farmer` → POST /api/v1/provinces/:id/upgrade/farmer
- `provinces-upgrade-resource` → POST /api/v1/provinces/:id/upgrade/resource
- `provinces-upgrade-dev` → POST /api/v1/provinces/:id/upgrade/development

### ✅ Pets (1 endpoint)
- `pets-player` → GET /api/v1/pets/my-pets

### ✅ Achievements (1 endpoint)
- `achievements-player` → GET /api/v1/achievements/my-achievements

### ✅ Battles (1 endpoint)
- `battles-player` → GET /api/v1/battles/my-battles

### ✅ Guilds (1 endpoint)
- `guilds-my-guild` → GET /api/v1/guilds/my-guild

### ✅ Config (2 endpoints)
- `config` → GET /api/v1/config
- `game-data` → GET /api/v1/game-data

### ✅ Navigation (1 endpoint)
- `navigation-player` → GET /api/v1/navigation/player

---

## Frontend MVP1ApiClient Methods

### ✅ Implemented Stories
- ✅ `getStories()` → /api/v1/stories
- ✅ `getStoriesByDay(day)` → /api/v1/stories/:day
- ✅ `getStoryQuiz(storyId)` → /api/v1/stories/:id/quiz
- ✅ `markStoryRead(storyId)` → /api/v1/stories/:id/read

### ✅ Implemented Quizzes
- ✅ `submitQuiz()` → /api/v1/quizzes/:id/submit
- ✅ `getQuizStats()` → /api/v1/quizzes/stats
- ✅ `getQuizLeaderboard()` → /api/v1/quizzes/leaderboard

### ✅ Implemented Resources
- ✅ `getResources()` → /api/v1/resources
- ✅ `getPlayerResources()` → /api/v1/resources/my-resources
- ✅ `harvestResources()` → /api/v1/resources/harvest
- ✅ `getResourceLeaderboard()` → /api/v1/resources/leaderboard

### ✅ Implemented Heroes
- ✅ `getHeroes()` → /api/v1/heroes
- ✅ `getPlayerHeroes()` → /api/v1/heroes/my-heroes
- ✅ `recruitHero()` → /api/v1/heroes/recruit
- ✅ `deployHero()` → /api/v1/heroes/deploy
- ✅ `getHeroLeaderboard()` → /api/v1/heroes/leaderboard

### ✅ Implemented Provinces
- ✅ `getProvinces()` → /api/v1/provinces
- ✅ `getProvinceDetail()` → /api/v1/provinces/:id
- ✅ `getPlayerProvinces()` → /api/v1/provinces/my-provinces
- ✅ `upgradeFarmer()` → /api/v1/provinces/:id/upgrade/farmer
- ✅ `upgradeResource()` → /api/v1/provinces/:id/upgrade/resource
- ✅ `upgradeDevelopment()` → /api/v1/provinces/:id/upgrade/development

### ✅ Implemented Config
- ✅ `getGameData()` → /api/v1/game-data
- ✅ `getConfig()` → /api/v1/config

---

## ❌ Missing in Frontend (API exists but no client method)

### 🔴 Pets
- ❌ `getPets()` → GET /api/v1/pets/my-pets
  - Backend: ✅ `mvp1-pets-player.step.ts`
  - Frontend: ❌ Missing method

### 🔴 Achievements
- ❌ `getAchievements()` → GET /api/v1/achievements/my-achievements
  - Backend: ✅ `mvp1-achievements-player.step.ts`
  - Frontend: ❌ Missing method

### 🔴 Battles
- ❌ `getBattles()` → GET /api/v1/battles/my-battles
  - Backend: ✅ `mvp1-battles-player.step.ts`
  - Frontend: ❌ Missing method

### 🔴 Guilds
- ❌ `getMyGuild()` → GET /api/v1/guilds/my-guild
  - Backend: ✅ `mvp1-guilds-my-guild.step.ts`
  - Frontend: ❌ Missing method

### 🔴 Navigation
- ❌ `getPlayerNavigation()` → Already exists in `/frontend/lib/navigationService.ts`
  - Backend: ✅ `mvp1-navigation-player.step.ts`
  - Frontend: ✅ But in separate file

---

## Database Tables vs Frontend Implementation

### ✅ Fully Implemented
1. **players** → Auth system working
2. **provinces** → Full CRUD with upgrades
3. **heroes** → Full CRUD with recruitment/deployment  
4. **resources** → Harvest and leaderboards
5. **stories** → Reading and quiz system
6. **quizzes** → Submit and stats

### 🟡 Partially Implemented (Backend ready, Frontend missing)
7. **pets** → Backend ✅, Frontend ❌
8. **achievements** / **user_achievements** → Backend ✅, Frontend ❌
9. **battles** → Backend ✅, Frontend ❌
10. **guilds** / **guild_members** → Backend ✅, Frontend ❌

### 🔴 Not Implemented (Database exists, no API)
11. **marketplace_listings** / **marketplace_transactions** → No API yet
12. **guild_wars** → No API yet
13. **seasons** / **battle_pass_progress** → No API yet
14. **educational_quests** / **quest_progress** → No API yet
15. **leaderboard_entries** → No comprehensive API
16. **analytics_events** / **daily_metrics** → No API yet

---

## Summary

| Category | Backend API | Frontend Client | Status |
|----------|-------------|-----------------|--------|
| Stories | 4 endpoints | 4 methods | ✅ Complete |
| Quizzes | 3 endpoints | 3 methods | ✅ Complete |
| Resources | 4 endpoints | 4 methods | ✅ Complete |
| Heroes | 5 endpoints | 5 methods | ✅ Complete |
| Provinces | 6 endpoints | 6 methods | ✅ Complete |
| Config | 2 endpoints | 2 methods | ✅ Complete |
| **Pets** | 1 endpoint | 0 methods | 🔴 **Missing** |
| **Achievements** | 1 endpoint | 0 methods | 🔴 **Missing** |
| **Battles** | 1 endpoint | 0 methods | 🔴 **Missing** |
| **Guilds** | 1 endpoint | 0 methods | 🔴 **Missing** |
| Navigation | 1 endpoint | Separate file | ✅ Complete |

**Total Coverage**: 24/29 endpoints (82.76%)

---

## Action Items

### High Priority (Core MVP1 Features)
1. ✅ Add `getPets()` method to MVP1ApiClient
2. ✅ Add `getAchievements()` method to MVP1ApiClient
3. ✅ Add `getBattles()` method to MVP1ApiClient
4. ✅ Add `getMyGuild()` method to MVP1ApiClient

### Medium Priority (Data Sync)
5. Update `useApiDataSync` to fetch pets data
6. Update `useApiDataSync` to fetch achievements data
7. Update `useApiDataSync` to fetch battles data
8. Update `useApiDataSync` to fetch guild data

### Low Priority (UI Components)
9. Verify PetsTab component uses real API
10. Verify Achievements component uses real API
11. Verify CombatTab component uses real API
12. Verify GuildTab component uses real API

---

## Next Steps

1. **Add missing methods to MVP1ApiClient**
2. **Update useApiDataSync hook**
3. **Test all components with real data**
4. **Document usage patterns**
