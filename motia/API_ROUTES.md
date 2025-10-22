# KataGame Backend API Routes

Tài liệu này định nghĩa tất cả các API endpoints cho frontend kết nối với backend Motia.

## Base URL
```
http://localhost:3001/api/v1
```

## Authentication

Tất cả các endpoints được bảo vệ cần token JWT trong header:
```
Authorization: Bearer <token>
```

---

## 1. Authentication Endpoints

### Register
```
POST /auth/register
Content-Type: application/json

{
  "username": "player_name",
  "email": "player@example.com",
  "password": "SecurePass123"
}

Response:
{
  "success": true,
  "data": {
    "token": "eyJhbGc...",
    "playerId": "550e8400-e29b-41d4-a716-446655440000"
  },
  "timestamp": 1629789600000
}
```

### Login
```
POST /auth/login
Content-Type: application/json

{
  "username": "player_name",
  "password": "SecurePass123"
}

Response:
{
  "success": true,
  "data": {
    "token": "eyJhbGc...",
    "playerId": "550e8400-e29b-41d4-a716-446655440000"
  },
  "timestamp": 1629789600000
}
```

### Refresh Token
```
POST /auth/refresh
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "token": "eyJhbGc..."
  },
  "timestamp": 1629789600000
}
```

---

## 2. Player Endpoints

### Get Player Profile
```
GET /players/me
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "player_name",
    "level": 15,
    "experience": 25000,
    "resources": {
      "gold": 5000,
      "rice": 200,
      "lumber": 150,
      "stone": 100,
      "culture": 500,
      "gems": 1000
    },
    "status": "active",
    "created_at": "2024-01-01T00:00:00Z",
    "last_login": "2024-10-22T10:30:00Z"
  },
  "timestamp": 1629789600000
}
```

### Get Player by ID
```
GET /players/:playerId

Response: Player object
```

### Update Player Profile
```
PUT /players/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "new_name"
}

Response: Updated Player object
```

### Get Leaderboard
```
GET /players/leaderboard?limit=100&offset=0

Response:
{
  "success": true,
  "data": [
    {
      "rank": 1,
      "playerId": "550e8400-e29b-41d4-a716-446655440000",
      "username": "TopPlayer",
      "level": 50,
      "experience": 1000000
    },
    ...
  ],
  "timestamp": 1629789600000
}
```

### Get Player Statistics
```
GET /players/me/stats
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "battles": {
      "total": 156,
      "wins": 98,
      "winRate": 0.628
    },
    "quests": {
      "completed": 45,
      "cultureEarned": 5000
    },
    "achievements": {
      "total": 12,
      "points": 850
    }
  },
  "timestamp": 1629789600000
}
```

---

## 3. Battle Endpoints

### Start Battle
```
POST /battles/start
Authorization: Bearer <token>
Content-Type: application/json

{
  "defenderId": "550e8400-e29b-41d4-a716-446655440001",
  "battleType": "pvp"
}

Response:
{
  "success": true,
  "data": {
    "battleId": "550e8400-e29b-41d4-a716-446655440002",
    "attackerId": "550e8400-e29b-41d4-a716-446655440000",
    "defenderId": "550e8400-e29b-41d4-a716-446655440001",
    "status": "pending",
    "createdAt": "2024-10-22T10:30:00Z"
  },
  "timestamp": 1629789600000
}
```

### Get Battle Results
```
GET /battles/:battleId
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "battleId": "550e8400-e29b-41d4-a716-446655440002",
    "result": "attacker_win",
    "attackerReward": {
      "exp": 200,
      "gold": 500,
      "rating": 50
    },
    "defenderReward": {
      "exp": 100,
      "gold": 0,
      "rating": -20
    },
    "duration": 45,
    "completedAt": "2024-10-22T10:31:00Z"
  },
  "timestamp": 1629789600000
}
```

### Get Battle History
```
GET /battles/player/me?limit=50&offset=0
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": [
    { battle objects },
    ...
  ],
  "total": 156,
  "timestamp": 1629789600000
}
```

---

## 4. Quest Endpoints

### Get Available Quests
```
GET /quests?dynasty=Tang&difficulty=medium&limit=20

Response:
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "title": "Tang Dynasty History",
      "dynasty": "Tang",
      "difficulty": "medium",
      "culturePoints": 100,
      "quiz": [
        {
          "question": "When was Tang Dynasty founded?",
          "options": ["618 AD", "700 AD", "800 AD"],
          "correctAnswer": 0,
          "points": 25
        }
      ]
    },
    ...
  ],
  "timestamp": 1629789600000
}
```

### Submit Quest
```
POST /quests/:questId/submit
Authorization: Bearer <token>
Content-Type: application/json

{
  "answers": [0, 1, 2, 0]
}

Response:
{
  "success": true,
  "data": {
    "questId": "550e8400-e29b-41d4-a716-446655440003",
    "score": 85,
    "cultureEarned": 85,
    "completedAt": "2024-10-22T10:32:00Z"
  },
  "timestamp": 1629789600000
}
```

### Get Player Quest Progress
```
GET /quests/player/me?limit=50&offset=0
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": [
    {
      "questId": "550e8400-e29b-41d4-a716-446655440003",
      "title": "Tang Dynasty History",
      "score": 85,
      "completedAt": "2024-10-22T10:32:00Z"
    },
    ...
  ],
  "total": 45,
  "timestamp": 1629789600000
}
```

---

## 5. Marketplace Endpoints

### List Active Listings
```
GET /marketplace/listings?limit=50&offset=0

Response:
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440004",
      "sellerId": "550e8400-e29b-41d4-a716-446655440000",
      "itemType": "weapon",
      "itemName": "Iron Sword",
      "price": 500,
      "status": "active",
      "auctionEnd": "2024-10-23T10:30:00Z",
      "createdAt": "2024-10-22T10:30:00Z"
    },
    ...
  ],
  "timestamp": 1629789600000
}
```

### Search Listings
```
GET /marketplace/search?q=sword&limit=20

Response: Array of listings
```

### Get Listings by Item Type
```
GET /marketplace/by-type/weapon?limit=20

Response: Array of listings
```

### Create Listing
```
POST /marketplace/listings
Authorization: Bearer <token>
Content-Type: application/json

{
  "itemType": "weapon",
  "itemId": "item_123",
  "itemName": "Iron Sword",
  "price": 500,
  "auctionDurationMinutes": 1440
}

Response:
{
  "success": true,
  "data": {
    "listingId": "550e8400-e29b-41d4-a716-446655440004",
    "status": "active"
  },
  "timestamp": 1629789600000
}
```

### Purchase Item
```
POST /marketplace/purchase
Authorization: Bearer <token>
Content-Type: application/json

{
  "listingId": "550e8400-e29b-41d4-a716-446655440004"
}

Response:
{
  "success": true,
  "data": {
    "transactionId": "550e8400-e29b-41d4-a716-446655440005",
    "itemReceived": "Iron Sword",
    "totalCost": 525
  },
  "timestamp": 1629789600000
}
```

### Get Marketplace Stats
```
GET /marketplace/stats

Response:
{
  "success": true,
  "data": {
    "totalListings": 1250,
    "activeListings": 987,
    "totalSold": 5432,
    "averagePrice": 750
  },
  "timestamp": 1629789600000
}
```

---

## 6. Guild Endpoints

### Create Guild
```
POST /guilds
Authorization: Bearer <token>
Content-Type: application/json

{
  "guildName": "Dragon Slayers"
}

Response:
{
  "success": true,
  "data": {
    "guildId": "550e8400-e29b-41d4-a716-446655440006",
    "name": "Dragon Slayers",
    "leaderId": "550e8400-e29b-41d4-a716-446655440000",
    "membersCount": 1
  },
  "timestamp": 1629789600000
}
```

### Get Guild Info
```
GET /guilds/:guildId

Response:
{
  "success": true,
  "data": {
    "guildId": "550e8400-e29b-41d4-a716-446655440006",
    "name": "Dragon Slayers",
    "leaderId": "550e8400-e29b-41d4-a716-446655440000",
    "totalPower": 125000,
    "membersCount": 45,
    "treasury": {
      "gold": 50000,
      "gems": 2000
    },
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "timestamp": 1629789600000
}
```

### Get Guild Members
```
GET /guilds/:guildId/members

Response:
{
  "success": true,
  "data": [
    {
      "playerId": "550e8400-e29b-41d4-a716-446655440000",
      "username": "player1",
      "rank": "leader",
      "joinedAt": "2024-01-01T00:00:00Z"
    },
    ...
  ],
  "timestamp": 1629789600000
}
```

### Join Guild
```
POST /guilds/:guildId/join
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "guildId": "550e8400-e29b-41d4-a716-446655440006",
    "joinedAt": "2024-10-22T10:30:00Z"
  },
  "timestamp": 1629789600000
}
```

### Leave Guild
```
POST /guilds/leave
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "message": "Left guild successfully"
  },
  "timestamp": 1629789600000
}
```

---

## 7. Achievement Endpoints

### Get Achievements
```
GET /achievements?limit=50

Response:
{
  "success": true,
  "data": [
    {
      "id": "first_win",
      "name": "First Victory",
      "description": "Win your first battle",
      "points": 10,
      "icon": "trophy"
    },
    ...
  ],
  "timestamp": 1629789600000
}
```

### Get Player Achievements
```
GET /achievements/player/me
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": [
    {
      "achievementId": "first_win",
      "name": "First Victory",
      "points": 10,
      "unlockedAt": "2024-10-22T10:30:00Z"
    },
    ...
  ],
  "total": 12,
  "totalPoints": 850,
  "timestamp": 1629789600000
}
```

---

## 8. Analytics Endpoints

### Get Daily Report
```
GET /analytics/daily?date=2024-10-22
(Requires admin role)

Response:
{
  "success": true,
  "data": {
    "date": "2024-10-22",
    "dau": 5432,
    "mau": 12500,
    "retention": {
      "d1": 2173,
      "d7": 1358,
      "d30": 813
    },
    "revenue": {
      "total": 125000,
      "arpu": 23,
      "arppu": 450,
      "payingUsers": 278
    }
  },
  "timestamp": 1629789600000
}
```

### Get Leaderboard Snapshot
```
GET /analytics/leaderboard-snapshot?date=2024-10-22

Response:
{
  "success": true,
  "data": {
    "topPlayers": [
      {
        "rank": 1,
        "name": "TopPlayer",
        "experience": 1000000,
        "level": 50
      },
      ...
    ],
    "totalPlayers": 45678,
    "date": "2024-10-22"
  },
  "timestamp": 1629789600000
}
```

---

## Error Responses

Tất cả lỗi trả về dạng:

```json
{
  "success": false,
  "error": "Unauthorized",
  "timestamp": 1629789600000
}
```

### Common HTTP Status Codes
- `200`: Success
- `400`: Bad Request
- `401`: Unauthorized (Missing/Invalid token)
- `403`: Forbidden (Not authorized for action)
- `404`: Not Found
- `429`: Too Many Requests (Rate limited)
- `500`: Internal Server Error

---

## Rate Limiting

API có rate limiting:
- Window: 15 phút
- Max requests: 1000 per window
- Header response: `X-RateLimit-Remaining`

---

## WebSocket Events (Real-time)

Để nhận real-time updates, kết nối WebSocket:

```
ws://localhost:3001/ws
```

### Subscribe to Events
```json
{
  "action": "subscribe",
  "channel": "player:550e8400-e29b-41d4-a716-446655440000"
}
```

### Event Examples
```json
{
  "type": "player.resource_changed",
  "data": {
    "playerId": "550e8400-e29b-41d4-a716-446655440000",
    "resources": {
      "gold": 5500,
      "gems": 950
    }
  }
}
```

---

## Implementation Notes

1. **Token Expiry**: Tokens hết hạn sau 24 giờ. Sử dụng `/auth/refresh` để lấy token mới.

2. **CORS**: API cho phép requests từ `http://localhost:3000`

3. **Pagination**: Sử dụng `limit` và `offset` cho pagination (default limit=50)

4. **Timestamps**: Tất cả timestamps là ISO 8601 format

5. **IDs**: Tất cả IDs sử dụng UUIDs v4

---

*Generated: 2024-10-22*
*Version: 1.0.0*
