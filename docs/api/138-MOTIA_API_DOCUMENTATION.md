# 📡 MOTIA BACKEND API DOCUMENTATION - MVP1
**Version**: 1.0.0  
**Base URL**: `http://localhost:11001`  
**API Prefix**: `/api/v1`  
**Last Updated**: October 29, 2025

---

## 🔐 AUTHENTICATION

### Response Format (Motia Wrapper)
```typescript
{
  status: number,          // HTTP status code
  body: {
    success: boolean,
    data?: any,           // Response data
    message?: string      // Error/Success message
  }
}
```

### 1. Register User
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123",
  "username": "username"
}
```

**Response**:
```json
{
  "status": 200,
  "body": {
    "success": true,
    "data": {
      "token": "eyJhbGc...",
      "playerId": "uuid",
      "username": "username",
      "level": 1
    }
  }
}
```

### 2. Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123"
}
```

### 3. Google OAuth
```http
POST /api/v1/auth/google
Content-Type: application/json

{
  "credential": "google_id_token"
}
```

### 4. Logout
```http
POST /api/v1/auth/logout
Authorization: Bearer {token}
```

### 5. Refresh Token
```http
POST /api/v1/auth/refresh-token
Authorization: Bearer {token}
```

---

## 🏛️ PROVINCES (63 Tỉnh Thành)

### 1. Get All Provinces
```http
GET /api/v1/provinces
```

**Response**:
```json
{
  "status": 200,
  "body": {
    "success": true,
    "data": {
      "provinces": [
        {
          "id": 1,
          "name": "Hà Nội",
          "nameEnglish": "Hanoi",
          "region": "north",
          "description": "Thủ đô của Việt Nam...",
          "isCapital": true,
          "baseGoldRate": 100.00,
          "baseRiceRate": 100.00,
          "baseWoodRate": 80.00,
          "baseStoneRate": 100.00,
          "baseBazanRate": 30.00,
          "historicalEras": ["Thăng Long", "Hà Nội"],
          "unlockOrder": 1,
          "unlockStoryDay": 0
        }
      ]
    }
  }
}
```

### 2. Get Province Details
```http
GET /api/v1/provinces/:id
```

### 3. Get Player's Provinces
```http
GET /api/v1/provinces/my-provinces
Authorization: Bearer {token}
```

**Response**:
```json
{
  "status": 200,
  "body": {
    "success": true,
    "data": {
      "provinces": [
        {
          "provinceId": 1,
          "name": "Hà Nội",
          "farmerLevel": 5,        // 1-20
          "resourceLevel": 3,      // 1-10
          "devLevel": 2,
          "productionMultiplier": 1.5,
          "isUnlocked": true,
          "lastHarvest": "2025-10-29T10:00:00Z"
        }
      ]
    }
  }
}
```

### 4. Upgrade Farmer Level
```http
POST /api/v1/provinces/upgrade-farmer
Authorization: Bearer {token}
Content-Type: application/json

{
  "provinceId": 1
}
```

**Logic**:
- Max level: 20
- Cost tăng theo level
- Tăng production rate

### 5. Upgrade Resource Level
```http
POST /api/v1/provinces/upgrade-resource
Authorization: Bearer {token}
Content-Type: application/json

{
  "provinceId": 1,
  "resourceType": "gold"  // gold, rice, lumber, stone, bazan
}
```

**Special Effects**:
- Level 3: Unlock passive boost 1 (random % tăng resource)
- Level 6: Unlock passive boost 2 (tăng resource tương sinh)
- Level 10: Unlock active skill (x2, x3, x5 trong 1h, cooldown 24h)

### 6. Upgrade Development Level
```http
POST /api/v1/provinces/upgrade-dev
Authorization: Bearer {token}
Content-Type: application/json

{
  "provinceId": 1
}
```

---

## 💎 RESOURCES (Ngũ Hành Tài Nguyên)

### Resource Types
```typescript
{
  GOLD: "Kim" (Vàng),
  RICE: "Thủy" (Lúa),
  LUMBER: "Mộc" (Gỗ),
  STONE: "Thổ" (Đá),
  BAZAN: "Hỏa" (Đất đỏ Bazan)
}
```

### Tương Sinh (Synergy)
```
Gỗ (Mộc) → Lúa (Thủy)
Lúa (Thủy) → Đá (Thổ)
Đá (Thổ) → Vàng (Kim)
Vàng (Kim) → Bazan (Hỏa)
Bazan (Hỏa) → Gỗ (Mộc)
```

### 1. Get Resource Definitions
```http
GET /api/v1/resources
```

**Response**:
```json
{
  "status": 200,
  "body": {
    "success": true,
    "data": {
      "resources": [
        {
          "type": "gold",
          "name": "Vàng",
          "element": "Kim",
          "icon": "🪙",
          "description": "Tài nguyên quý giá...",
          "synergy": ["bazan"]
        }
      ]
    }
  }
}
```

### 2. Get Player Resources
```http
GET /api/v1/resources/my-resources
Authorization: Bearer {token}
```

**Response**:
```json
{
  "status": 200,
  "body": {
    "success": true,
    "data": {
      "playerId": "uuid",
      "resources": {
        "gold": 10,
        "rice": 10,
        "lumber": 10,
        "stone": 10,
        "bazan": 10,
        "gems": 1500,      // Premium currency
        "culture": 20      // Cultural points
      }
    }
  }
}
```

### 3. Harvest Resources
```http
POST /api/v1/resources/harvest
Authorization: Bearer {token}
Content-Type: application/json

{
  "provinceId": 1,
  "resourceType": "gold"
}
```

**Logic**:
- Harvest từ province của player
- Amount = baseRate × farmerLevel × resourceLevel × multipliers
- Cooldown theo province settings

### 4. Resource Leaderboard
```http
GET /api/v1/resources/leaderboard?type=gold&limit=10&offset=0
```

---

## 🦸 HEROES (Anh Hùng)

### Hero Levels
```
Level 1: Base stats (x1)
Level 2: 2x Level 1
Level 3: 3x Level 2 = 6x base
Level 4: 4x Level 3 = 24x base
Level 5: 5x Level 4 = 120x base (MAX)
```

### 1. Get All Heroes
```http
GET /api/v1/heroes
```

**Response**:
```json
{
  "status": 200,
  "body": {
    "success": true,
    "data": {
      "heroes": [
        {
          "id": "uuid",
          "name": "Lý Thường Kiệt",
          "type": "warrior",
          "rarity": "legendary",
          "icon": "🗡️",
          "description": "Danh tướng thời Lý...",
          "basePower": 100,
          "recruitCost": {
            "gold": 1000,
            "culture": 50
          },
          "skills": [
            {
              "name": "Chiến thần",
              "type": "passive",
              "effect": "+20% attack"
            }
          ],
          "historicalPeriod": "Nhà Lý (1009-1225)"
        }
      ]
    }
  }
}
```

### 2. Get Player's Heroes
```http
GET /api/v1/heroes/my-heroes
Authorization: Bearer {token}
```

**Response**:
```json
{
  "status": 200,
  "body": {
    "success": true,
    "data": {
      "heroes": [
        {
          "heroId": "uuid",
          "name": "Lý Thường Kiệt",
          "level": 3,
          "currentPower": 600,    // basePower × level multiplier
          "experience": 1500,
          "isDeployed": true,
          "deployedProvinceId": 1,
          "acquiredAt": "2025-10-15T10:00:00Z"
        }
      ]
    }
  }
}
```

### 3. Recruit Hero
```http
POST /api/v1/heroes/recruit
Authorization: Bearer {token}
Content-Type: application/json

{
  "heroId": "uuid"
}
```

**Requirements**:
- Đủ resources (recruitCost)
- Unlock story day tương ứng (if any)

### 4. Deploy Hero to Province
```http
POST /api/v1/heroes/deploy
Authorization: Bearer {token}
Content-Type: application/json

{
  "heroId": "uuid",
  "provinceId": 1
}
```

**Effects**:
- Tăng production rate của province
- Unlock special abilities
- Hero chỉ deploy được 1 province tại 1 thời điểm

### 5. Hero Leaderboard
```http
GET /api/v1/heroes/leaderboard?limit=10&offset=0
```

---

## 📚 STORIES & QUIZZES (Câu Chuyện Lịch Sử)

### Story System
- 365 câu chuyện (1 năm)
- Mở khóa 1 câu/ngày
- Mỗi story có 1 quiz (3 câu hỏi)
- Reward x5 nếu đúng cả 3 câu

### 1. Get All Stories
```http
GET /api/v1/stories?page=1&limit=10
```

### 2. Get Story by Day
```http
GET /api/v1/stories/:day
```

**Response**:
```json
{
  "status": 200,
  "body": {
    "success": true,
    "data": {
      "story": {
        "id": "uuid",
        "day": 1,
        "title": "Khởi Nguồn Văn Lang",
        "content": "Vào khoảng thế kỷ VII TCN...",
        "historicalPeriod": "Văn Lang (2879-258 TCN)",
        "provinceId": 1,
        "heroId": "uuid",
        "baseReward": {
          "gold": 100,
          "culture": 10
        },
        "hasRead": false,
        "quiz": {
          "questions": [
            {
              "id": 1,
              "question": "Vua Hùng đầu tiên là ai?",
              "options": [
                "Kinh Dương Vương",
                "Lạc Long Quân",
                "Hùng Vương I",
                "Âu Cơ"
              ],
              "correctAnswer": 2
            }
          ]
        }
      }
    }
  }
}
```

### 3. Get Story Quiz
```http
GET /api/v1/stories/:storyId/quiz
```

### 4. Mark Story as Read
```http
POST /api/v1/stories/:storyId/read
Authorization: Bearer {token}
```

**Reward**:
- Nhận baseReward
- Unlock quiz

### 5. Submit Quiz Answers
```http
POST /api/v1/quizzes/:storyId/submit
Authorization: Bearer {token}
Content-Type: application/json

{
  "answers": [
    { "questionId": 1, "selectedOption": 2 },
    { "questionId": 2, "selectedOption": 0 },
    { "questionId": 3, "selectedOption": 1 }
  ]
}
```

**Response**:
```json
{
  "status": 200,
  "body": {
    "success": true,
    "data": {
      "score": 3,           // Số câu đúng
      "totalQuestions": 3,
      "isPerfect": true,
      "reward": {
        "gold": 500,        // baseReward × 5
        "culture": 50
      },
      "correctAnswers": [2, 0, 1]
    }
  }
}
```

### 6. Get Quiz Statistics
```http
GET /api/v1/quizzes/stats
Authorization: Bearer {token}
```

**Response**:
```json
{
  "status": 200,
  "body": {
    "success": true,
    "data": {
      "totalQuizzes": 15,
      "perfectScores": 8,
      "totalScore": 42,
      "averageScore": 2.8,
      "rank": 123,
      "totalCultureEarned": 420
    }
  }
}
```

### 7. Quiz Leaderboard
```http
GET /api/v1/quizzes/leaderboard?limit=10&offset=0
```

---

## 🗺️ NAVIGATION (Dynamic Menu)

### Get Player Navigation
```http
GET /api/v1/navigation/player
Authorization: Bearer {token}
```

**Response**:
```json
{
  "status": 200,
  "body": {
    "success": true,
    "data": {
      "playerId": "uuid",
      "navigation": [
        {
          "key": "game",
          "label": "Game",
          "labelVietnamese": "Chơi Game",
          "icon": "🎮",
          "color": "#FF6B6B",
          "unlockLevel": 1,
          "isUnlocked": true,
          "order": 1,
          "category": "core"
        },
        {
          "key": "provinces",
          "label": "Provinces",
          "labelVietnamese": "Tỉnh Thành",
          "icon": "🏛️",
          "color": "#4ECDC4",
          "unlockLevel": 1,
          "isUnlocked": true,
          "order": 2,
          "category": "core"
        }
      ],
      "locked": [
        {
          "key": "arena",
          "label": "Arena",
          "labelVietnamese": "Đấu Trường",
          "icon": "⚔️",
          "unlockLevel": 10,
          "unlockRequirement": "Đạt level 10",
          "isUnlocked": false,
          "category": "combat"
        }
      ],
      "totalUnlocked": 8,
      "totalLocked": 5
    }
  }
}
```

**Unlock Logic**:
- Dựa vào player level
- Dựa vào story progress
- Dựa vào achievements

---

## 🎮 OTHER GAME FEATURES

### 1. Game Data (Full Config)
```http
GET /api/v1/game-data
```

**Response**: Toàn bộ game configuration

### 2. Config (Simplified)
```http
GET /api/v1/config
```

### 3. Pets
```http
GET /api/v1/pets/my-pets
Authorization: Bearer {token}
```

### 4. Achievements
```http
GET /api/v1/achievements/my-achievements
Authorization: Bearer {token}
```

### 5. Battles
```http
GET /api/v1/battles/my-battles
Authorization: Bearer {token}

POST /api/v1/battles/start
Authorization: Bearer {token}
Content-Type: application/json

{
  "opponentId": "uuid",
  "battleType": "pvp"  // pvp, pve
}
```

### 6. Guilds
```http
GET /api/v1/guilds/my-guild
Authorization: Bearer {token}
```

---

## 🔒 ERROR CODES

```typescript
// Success
200: OK
201: Created

// Client Errors
400: Bad Request - Invalid input
401: Unauthorized - Invalid/missing token
403: Forbidden - Insufficient permissions
404: Not Found - Resource not found
409: Conflict - Resource already exists
422: Unprocessable Entity - Validation failed
429: Too Many Requests - Rate limit exceeded

// Server Errors
500: Internal Server Error
503: Service Unavailable
```

**Error Response Format**:
```json
{
  "status": 400,
  "body": {
    "success": false,
    "message": "Invalid input",
    "errors": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  }
}
```

---

## 📊 RATE LIMITING

```
Default: 100 requests / 15 minutes per IP
Auth endpoints: 5 requests / 15 minutes per IP
```

**Headers**:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1698580800
```

---

## 🧪 TESTING

### Example: Complete User Flow

```bash
# 1. Register
curl -X POST http://localhost:11001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@game.com",
    "password": "Test123!",
    "username": "player1"
  }'

# Response: {"status":200,"body":{"success":true,"data":{"token":"..."}}}

# 2. Get provinces
TOKEN="your_token_here"
curl -X GET http://localhost:11001/api/v1/provinces \
  -H "Authorization: Bearer $TOKEN"

# 3. Get player's provinces
curl -X GET http://localhost:11001/api/v1/provinces/my-provinces \
  -H "Authorization: Bearer $TOKEN"

# 4. Upgrade farmer
curl -X POST http://localhost:11001/api/v1/provinces/upgrade-farmer \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"provinceId": 1}'

# 5. Harvest resources
curl -X POST http://localhost:11001/api/v1/resources/harvest \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"provinceId": 1, "resourceType": "gold"}'

# 6. Get today's story
curl -X GET http://localhost:11001/api/v1/stories/1 \
  -H "Authorization: Bearer $TOKEN"

# 7. Submit quiz
curl -X POST http://localhost:11001/api/v1/quizzes/story-uuid/submit \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "answers": [
      {"questionId": 1, "selectedOption": 2},
      {"questionId": 2, "selectedOption": 0},
      {"questionId": 3, "selectedOption": 1}
    ]
  }'
```

---

## 📝 NOTES

### Default Resources on Register
```json
{
  "gold": 10,
  "rice": 10,
  "lumber": 10,
  "stone": 10,
  "bazan": 10,
  "gems": 1500,    // Premium currency
  "culture": 20
}
```

### Province Unlock Order
```
1. Hà Nội (default, unlockOrder: 1)
2. Hồ Chí Minh (unlockOrder: 2)
3. Đà Nẵng (unlockOrder: 3)
... (total 63 provinces)
```

### Historical Periods
```
- Văn Lang (2879-258 TCN)
- Âu Lạc (257-179 TCN)
- Bắc thuộc (179 TCN - 938)
- Ngô (939-965)
- Đinh - Tiền Lê (968-1009)
- Lý (1009-1225)
- Trần (1225-1400)
- Hồ (1400-1407)
- Lê sơ - Mạc - Lê trung hưng (1428-1788)
- Tây Sơn (1778-1802)
- Nguyễn (1802-1945)
- Hiện đại (1945-nay)
```

---

**Maintained by**: KataGame Development Team  
**Last Updated**: October 29, 2025  
**Backend Framework**: Motia 0.8.2-beta.139  
**Database**: PostgreSQL 15
