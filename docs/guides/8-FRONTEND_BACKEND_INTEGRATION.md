# Frontend - Backend Integration Guide

> Hướng dẫn kết nối frontend KataGame với backend Motia

## 🔗 API Connection Setup

### 1. Configure API Base URL

File: `katagame/lib/api-client.ts`

```typescript
// Create API client instance
import axios, { AxiosInstance } from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth interceptor
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired, refresh or redirect to login
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default apiClient
```

### 2. Add Environment Variables

File: `katagame/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:3001/ws
```

## 🔐 Authentication Integration

### Login/Register Flow

File: `katagame/lib/auth-service.ts`

```typescript
import apiClient from './api-client'

export const authService = {
  async register(username: string, email: string, password: string) {
    const { data } = await apiClient.post('/auth/register', {
      username,
      email,
      password,
    })
    
    if (data.data.token) {
      localStorage.setItem('auth_token', data.data.token)
      localStorage.setItem('player_id', data.data.playerId)
    }
    
    return data.data
  },

  async login(username: string, password: string) {
    const { data } = await apiClient.post('/auth/login', {
      username,
      password,
    })
    
    if (data.data.token) {
      localStorage.setItem('auth_token', data.data.token)
      localStorage.setItem('player_id', data.data.playerId)
    }
    
    return data.data
  },

  logout() {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('player_id')
  },

  getToken() {
    return localStorage.getItem('auth_token')
  },

  isAuthenticated() {
    return !!this.getToken()
  },
}
```

### Update Login Component

File: `katagame/components/LoginPage.tsx`

```typescript
import { authService } from '@/lib/auth-service'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(username: string, password: string) {
    setLoading(true)
    setError('')
    
    try {
      await authService.login(username, password)
      router.push('/game')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    // Your login UI
    <></>
  )
}
```

## 📊 Player Data Integration

### Update Player Store with Backend

File: `katagame/lib/store.ts`

```typescript
import { create } from 'zustand'
import apiClient from './api-client'

interface Player {
  id: string
  username: string
  level: number
  experience: number
  resources: {
    gold: number
    rice: number
    lumber: number
    stone: number
    culture: number
    gems: number
  }
  // ... other fields
}

interface GameStore {
  player: Player | null
  loading: boolean
  error: string | null
  
  // Actions
  fetchPlayerProfile: () => Promise<void>
  updatePlayerResources: (updates: Partial<Player['resources']>) => Promise<void>
  refreshPlayer: () => Promise<void>
}

export const useGameStore = create<GameStore>((set, get) => ({
  player: null,
  loading: false,
  error: null,

  fetchPlayerProfile: async () => {
    set({ loading: true })
    try {
      const { data } = await apiClient.get('/players/me')
      set({ player: data.data, error: null })
    } catch (error: any) {
      set({ error: error.message })
    } finally {
      set({ loading: false })
    }
  },

  updatePlayerResources: async (updates) => {
    const { player } = get()
    if (!player) return

    try {
      const newResources = { ...player.resources, ...updates }
      const { data } = await apiClient.put('/players/me', {
        resources: newResources,
      })
      set({ player: data.data })
    } catch (error: any) {
      console.error('Failed to update resources:', error)
    }
  },

  refreshPlayer: async () => {
    await get().fetchPlayerProfile()
  },
}))
```

## ⚔️ Battle Integration

### Battle Component Integration

File: `katagame/components/BattleTab.tsx`

```typescript
import apiClient from '@/lib/api-client'
import { useGameStore } from '@/lib/store'
import { useState } from 'react'

export default function BattleTab() {
  const { player } = useGameStore()
  const [defending, setDefending] = useState<string | null>(null)
  const [battleResult, setBattleResult] = useState(null)

  async function handleAttack(defenderId: string) {
    try {
      const { data } = await apiClient.post('/battles/start', {
        defenderId,
        battleType: 'pvp',
      })

      // Battle created
      const battle = data.data

      // Poll for result or use WebSocket
      checkBattleResult(battle.battleId)
    } catch (error) {
      console.error('Battle start failed:', error)
    }
  }

  async function checkBattleResult(battleId: string) {
    try {
      const { data } = await apiClient.get(`/battles/${battleId}`)
      if (data.data.result) {
        setBattleResult(data.data)
      }
    } catch (error) {
      console.error('Error checking battle:', error)
    }
  }

  return (
    <div>
      {/* Battle UI */}
    </div>
  )
}
```

## 📖 Quest Integration

### Quest Service

File: `katagame/lib/quest-service.ts`

```typescript
import apiClient from './api-client'

export const questService = {
  async getAvailableQuests(dynasty?: string, difficulty?: string) {
    const { data } = await apiClient.get('/quests', {
      params: { dynasty, difficulty },
    })
    return data.data
  },

  async getPlayerQuests() {
    const { data } = await apiClient.get('/quests/player/me')
    return data.data
  },

  async submitQuest(questId: string, answers: number[]) {
    const { data } = await apiClient.post(
      `/quests/${questId}/submit`,
      { answers }
    )
    return data.data
  },

  async getQuestDetails(questId: string) {
    const { data } = await apiClient.get(`/quests/${questId}`)
    return data.data
  },
}
```

### Quest Component

File: `katagame/components/EducationalTab.tsx`

```typescript
import { questService } from '@/lib/quest-service'
import { useEffect, useState } from 'react'

export default function EducationalTab() {
  const [quests, setQuests] = useState([])
  const [selectedQuest, setSelectedQuest] = useState(null)
  const [answers, setAnswers] = useState<number[]>([])

  useEffect(() => {
    loadQuests()
  }, [])

  async function loadQuests() {
    const quests = await questService.getAvailableQuests()
    setQuests(quests)
  }

  async function submitQuest() {
    if (!selectedQuest) return

    try {
      const result = await questService.submitQuest(selectedQuest.id, answers)
      alert(`Score: ${result.score}% | Culture: +${result.cultureEarned}`)
      loadQuests()
    } catch (error) {
      console.error('Submit failed:', error)
    }
  }

  return (
    <div>
      {/* Quest UI */}
    </div>
  )
}
```

## 🛒 Marketplace Integration

### Marketplace Service

File: `katagame/lib/marketplace-service.ts`

```typescript
import apiClient from './api-client'

export const marketplaceService = {
  async getListings(limit = 50, offset = 0) {
    const { data } = await apiClient.get('/marketplace/listings', {
      params: { limit, offset },
    })
    return data.data
  },

  async searchListings(query: string) {
    const { data } = await apiClient.get('/marketplace/search', {
      params: { q: query },
    })
    return data.data
  },

  async createListing(
    itemType: string,
    itemId: string,
    itemName: string,
    price: number
  ) {
    const { data } = await apiClient.post('/marketplace/listings', {
      itemType,
      itemId,
      itemName,
      price,
      auctionDurationMinutes: 1440,
    })
    return data.data
  },

  async purchaseItem(listingId: string) {
    const { data } = await apiClient.post('/marketplace/purchase', {
      listingId,
    })
    return data.data
  },
}
```

## 👥 Guild Integration

### Guild Service

File: `katagame/lib/guild-service.ts`

```typescript
import apiClient from './api-client'

export const guildService = {
  async createGuild(guildName: string) {
    const { data } = await apiClient.post('/guilds', { guildName })
    return data.data
  },

  async getGuild(guildId: string) {
    const { data } = await apiClient.get(`/guilds/${guildId}`)
    return data.data
  },

  async getGuildMembers(guildId: string) {
    const { data } = await apiClient.get(`/guilds/${guildId}/members`)
    return data.data
  },

  async joinGuild(guildId: string) {
    const { data } = await apiClient.post(`/guilds/${guildId}/join`)
    return data.data
  },

  async leaveGuild() {
    const { data } = await apiClient.post('/guilds/leave')
    return data.data
  },
}
```

## 📊 Leaderboard Integration

### Leaderboard Service

File: `katagame/lib/leaderboard-service.ts`

```typescript
import apiClient from './api-client'

export const leaderboardService = {
  async getLeaderboard(limit = 100, offset = 0) {
    const { data } = await apiClient.get('/players/leaderboard', {
      params: { limit, offset },
    })
    return data.data
  },

  async getPlayerStats(playerId?: string) {
    const endpoint = playerId ? `/players/${playerId}/stats` : '/players/me/stats'
    const { data } = await apiClient.get(endpoint)
    return data.data
  },
}
```

## 🔔 Real-Time Updates with WebSocket

### WebSocket Service

File: `katagame/lib/ws-client.ts`

```typescript
export class WSClient {
  private ws: WebSocket | null = null
  private url: string

  constructor() {
    this.url = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001/ws'
  }

  connect(token: string) {
    this.ws = new WebSocket(`${this.url}?token=${token}`)

    this.ws.onopen = () => {
      console.log('WebSocket connected')
    }

    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data)
      this.handleMessage(message)
    }

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    this.ws.onclose = () => {
      console.log('WebSocket disconnected')
      // Reconnect after 5 seconds
      setTimeout(() => this.connect(token), 5000)
    }
  }

  private handleMessage(message: any) {
    const { type, data } = message

    switch (type) {
      case 'player.resource_changed':
        // Update player resources in store
        break
      case 'battle.completed':
        // Update battle results
        break
      case 'leaderboard.updated':
        // Refresh leaderboard
        break
    }
  }

  subscribe(channel: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          action: 'subscribe',
          channel,
        })
      )
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
    }
  }
}

export const wsClient = new WSClient()
```

### Use WebSocket in Game

File: `katagame/components/GameLoop.tsx`

```typescript
import { wsClient } from '@/lib/ws-client'
import { useEffect } from 'react'

export default function GameLoop() {
  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      wsClient.connect(token)
      wsClient.subscribe(`player:${localStorage.getItem('player_id')}`)
    }

    return () => {
      wsClient.disconnect()
    }
  }, [])

  return (
    // Game content
    <></>
  )
}
```

## 📦 Required Dependencies

Add to `katagame/package.json`:

```json
{
  "dependencies": {
    "axios": "^1.6.5",
    "zustand": "^5.0.8"
  }
}
```

## ✅ Integration Checklist

- [ ] Setup API client with axios
- [ ] Configure environment variables
- [ ] Implement authentication service
- [ ] Update player store with API calls
- [ ] Integrate battle system
- [ ] Connect quest system
- [ ] Setup marketplace
- [ ] Implement guild features
- [ ] Add leaderboard
- [ ] Setup WebSocket for real-time updates
- [ ] Test all API endpoints
- [ ] Handle errors and loading states
- [ ] Add token refresh logic
- [ ] Implement offline fallback

## 🚀 Testing API Endpoints

Use curl or Postman:

```bash
# Register
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"Test1234"}'

# Login
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"Test1234"}'

# Get profile
curl -H "Authorization: Bearer <token>" \
  http://localhost:3001/api/v1/players/me

# Get leaderboard
curl http://localhost:3001/api/v1/players/leaderboard
```

## 🐛 Troubleshooting

### API Connection Issues
- Ensure backend is running: `npm run dev` in `motia/`
- Check `NEXT_PUBLIC_API_URL` matches backend URL
- Verify CORS is enabled in backend

### Authentication Errors
- Check token is being saved to localStorage
- Verify JWT_SECRET is same on backend
- Clear localStorage and login again

### Data Not Updating
- Check WebSocket connection
- Verify player subscription to correct channels
- Check browser console for errors

---

**Next Steps**: Start backend with `npm run dev` in `motia/` directory, then update frontend components as needed.
