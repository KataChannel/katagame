## 🎮 MVP1 - KataGame API Documentation

**Status**: ✅ Fully Implemented  
**Version**: 1.0.0  
**Last Updated**: October 24, 2025  

---

## 📊 API Endpoints Overview

### MVP1 API v1 Structure

Base URL: `http://localhost:11101/api/v1`

All endpoints require authentication except `/api/v1/game-data` and `/api/v1/config`

---

## 👤 PLAYER ENDPOINTS

### GET /api/v1/players/profile
**Get player profile with stats**

Request:
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:11101/api/v1/players/profile
```

Response:
```json
{
  "success": true,
  "player": {
    "id": "uuid",
    "username": "player_name",
    "email": "player@example.com",
    "level": 1,
    "experience": 0,
    "resources": {
      "gold": 200,
      "rice": 100,
      "wood": 50,
      "stone": 30,
      "bazan": 10
    },
    "stories_read": 0,
    "quizzes_taken": 0,
    "heroes_collected": 0,
    "culture_points": 0
  }
}
```

---

## 📖 STORY ENDPOINTS

### GET /api/v1/stories
**Get all stories (paginated)**

Query Parameters:
- `limit` (optional, default: 30, max: 100)
- `offset` (optional, default: 0)

Response:
```json
{
  "success": true,
  "stories": [
    {
      "id": "story_day_01",
      "day": 1,
      "title_vietnamese": "Hùng Vương Lập Nước",
      "title_english": "Hung Vuong Founds the Nation",
      "content": "...",
      "category": "history",
      "era": "Ancient Era",
      "reading_time_minutes": 7,
      "base_gold_reward": 100,
      "base_rice_reward": 100,
      "base_wood_reward": 50
    }
  ],
  "count": 30
}
```

### GET /api/v1/stories/:day
**Get specific story by day (1-365)**

### GET /api/v1/stories/:id/quiz
**Get story with quiz questions**

Response includes:
- Story data
- Array of 3 quiz questions with options

### POST /api/v1/stories/:id/read
**Track story read event**

---

## 🧠 QUIZ ENDPOINTS

### POST /api/v1/quizzes/:storyId/submit
**Submit quiz answers and get rewards**

Request Body:
```json
{
  "answers": [0, 1, 2]
}
```

Response:
```json
{
  "success": true,
  "quiz_result": {
    "correct_answers": 3,
    "total_questions": 3,
    "score_percentage": 100
  },
  "rewards": {
    "gold": 500,
    "rice": 500,
    "wood": 250,
    "bonus": {
      "gold": 250,
      "rice": 250,
      "wood": 125
    },
    "multiplier": 5
  }
}
```

Scoring Multipliers:
- 3/3 correct: ×5 (250 bonus)
- 2/3 correct: ×3 (150 bonus)
- 1/3 correct: ×2 (100 bonus)
- 0/3 correct: ×1 (100 base)

### GET /api/v1/quizzes/stats
**Get player quiz statistics**

### GET /api/v1/quizzes/leaderboard
**Get global quiz leaderboard**

---

## 💰 RESOURCE ENDPOINTS

### GET /api/v1/resources
**Get all resource types**

Response:
```json
{
  "success": true,
  "resources": [
    {
      "id": "gold",
      "name_vietnamese": "Vàng",
      "emoji": "🟡",
      "element": "metal",
      "base_generation_rate": 1.0,
      "base_storage_capacity": 500
    }
  ]
}
```

### GET /api/v1/resources/my-resources
**Get player's current resources**

### POST /api/v1/resources/harvest
**Harvest resources from a province**

Request Body:
```json
{
  "province_id": 1
}
```

Cooldown: 5 minutes between harvests

### GET /api/v1/resources/leaderboard
**Get resource earnings leaderboard**

---

## 🦸 HERO ENDPOINTS

### GET /api/v1/heroes
**Get all MVP1 heroes (5 available)**

### GET /api/v1/heroes/my-heroes
**Get player's heroes**

### POST /api/v1/heroes/recruit
**Recruit a hero (free in MVP1)**

Request Body:
```json
{
  "hero_id": "6d2e1f33-8a4c-4e5b-9f1a-2c3d4e5f6a7b"
}
```

### POST /api/v1/heroes/deploy
**Deploy hero to a province**

Request Body:
```json
{
  "hero_id": "6d2e1f33-8a4c-4e5b-9f1a-2c3d4e5f6a7b",
  "province_id": 1
}
```

### GET /api/v1/heroes/leaderboard
**Get hero collection leaderboard**

---

## 🗺️ PROVINCE ENDPOINTS

### GET /api/v1/provinces
**Get all 63 provinces**

### GET /api/v1/provinces/:id
**Get specific province data**

### GET /api/v1/provinces/my-provinces
**Get player's provinces**

### POST /api/v1/provinces/:provinceId/upgrade/farmer
**Upgrade farmer level**

Costs increase with level:
- Level 1→2: 100 gold, 50 rice
- Level 2→3: 115 gold, 58 rice (×1.15 multiplier)

### POST /api/v1/provinces/:provinceId/upgrade/resource
**Upgrade resource level**

Costs use 1.2x multiplier

### POST /api/v1/provinces/:provinceId/upgrade/development
**Upgrade development level**

Costs use 1.18x multiplier

---

## 🎮 GAME DATA ENDPOINTS

### GET /api/v1/game-data
**Get ALL game configuration (no auth required)**

Includes:
- Resource definitions
- Building specs
- All 5 heroes
- Achievements
- Premium pass tiers
- Game balance constants
- Tutorial steps

### GET /api/v1/config
**Get simplified game config**

---

## 📊 RESPONSE STRUCTURE

All responses follow this structure:

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message"
}
```

HTTP Status Codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

---

## 🔐 AUTHENTICATION

All protected endpoints require `Authorization: Bearer <jwt_token>` header

Token is obtained via login/registration (see auth.routes.ts)

---

## 📈 MVP1 GAME MECHANICS

### Resource System (5 Elemental)
- **Gold (🟡)**: Base generation 1.0/30sec
- **Rice (🟢)**: Base generation 0.8/30sec
- **Wood (🟫)**: Base generation 0.7/30sec
- **Stone (🪨)**: Base generation 0.6/30sec
- **Bazan (🔴)**: Base generation 0.3/30sec (rarest)

### Province Upgrades (3 Dimensions)
- **Farmer Level** (1-20): +5% resource generation per level
- **Resource Level** (1-10): +10% specific resource per level
- **Development Level** (1-15): +8% province growth per level

### Heroes (5 MVP1 Available)
1. Hùng Vương I (Rare) - Population Bonus
2. Lý Thái Tổ (Rare) - Gold Generation
3. Lý Thánh Tông (Epic) - Cultural Development
4. Trần Hưng Đạo (Legendary) - Combat Power
5. Modern Leader (Epic) - Administrative Efficiency

### Stories & Quizzes
- 30 historical stories (1 per day in first month)
- 3 questions per story (Comprehension, Context, Application)
- Scoring: 0-3 correct (Multipliers: 1x, 2x, 3x, 5x)
- Base reward: 100 Gold + 100 Rice + 50 Wood

### Achievements (MVP1)
- First Week Learner (7 stories)
- Month Learner (30 stories)
- Perfect Quiz Master (3 perfect scores)
- Builder (5 buildings)
- Hero Collector (All 5 heroes)

---

## 🧪 TEST COMMANDS

### Get All Stories
```bash
curl http://localhost:11101/api/v1/stories
```

### Submit Quiz
```bash
curl -X POST http://localhost:11101/api/v1/quizzes/story_day_01/submit \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"answers": [0, 1, 2]}'
```

### Harvest Resources
```bash
curl -X POST http://localhost:11101/api/v1/resources/harvest \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"province_id": 1}'
```

### Get Game Data
```bash
curl http://localhost:11101/api/v1/game-data
```

---

## 📚 RELATED FILES

- **Config**: `/src/config/mvp1.config.ts`
- **Routes**: `/src/routes/mvp1.routes.ts`
- **Services**:
  - `/src/services/story.service.ts`
  - `/src/services/quiz.service.ts`
  - `/src/services/resource.service.ts`
  - `/src/services/hero.service.ts`
  - `/src/services/province.service.ts`

---

## 🚀 NEXT STEPS

1. **Frontend Integration**: Connect React/Next.js app to these endpoints
2. **Authentication**: Implement JWT token generation
3. **Auto-save**: Add periodic game state saves
4. **Analytics**: Track gameplay metrics
5. **Push Notifications**: Send daily reminders

---

**Status**: ✅ Ready for Frontend Development  
**Last Updated**: October 24, 2025
