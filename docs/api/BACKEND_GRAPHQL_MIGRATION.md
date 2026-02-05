# 🚀 Backend Migration Plan: Motia → NestJS + GraphQL + Prisma

## ✅ Đã Hoàn Thành

### 1. Prisma Schema Setup ✅
- ✅ Tạo/cập nhật `schema.prisma` với 25+ models
- ✅ Thêm relations: PlayerProvince, PlayerHero, PlayerResource, QuizSubmission
- ✅ Thêm indexes cho performance
- ✅ Generate Prisma Client (`npx prisma generate`)

### 2. NestJS GraphQL Setup ✅
- ✅ Cài đặt dependencies:
  ```bash
  npm install @nestjs/graphql @nestjs/apollo @apollo/server graphql
  npm install class-validator class-transformer
  npm install graphql-type-json
  ```
- ✅ Tạo `PrismaModule` và `PrismaService`
- ✅ Config `GraphQLModule` trong `app.module.ts` với Code-First approach
- ✅ Tạo GraphQL Object Types:
  - `player.model.ts` ✅
  - `province.model.ts` ✅
  - `hero.model.ts` ✅
  - `story.model.ts` ✅
  - `resource.model.ts` ✅

---

## 📋 Cần Implement Tiếp

### 3. Tạo GraphQL Resolvers (Ưu tiên cao)

#### 3.1 Player Resolver
**File:** `src/graphql/resolvers/player.resolver.ts`

```typescript
import { Resolver, Query, Mutation, Args, ID, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { Player } from '../models/player.model';
import { PlayerService } from './player.service';

@Resolver(() => Player)
export class PlayerResolver {
  constructor(private playerService: PlayerService) {}

  @Query(() => Player)
  @UseGuards(GqlAuthGuard)
  async player(@Context() context) {
    return this.playerService.findById(context.req.user.id);
  }

  @Query(() => [Player])
  async players() {
    return this.playerService.findAll();
  }

  @Mutation(() => Player)
  @UseGuards(GqlAuthGuard)
  async updatePlayer(
    @Args('level', { type: () => Int, nullable: true }) level?: number,
    @Args('experience', { type: () => Int, nullable: true }) experience?: number,
    @Context() context
  ) {
    return this.playerService.update(context.req.user.id, { level, experience });
  }
}
```

**Queries:**
- `player` - Get current player (Auth required)
- `players` - Get all players (Admin)

**Mutations:**
- `updatePlayer` - Update player data

---

#### 3.2 Province Resolver
**File:** `src/graphql/resolvers/province.resolver.ts`

```typescript
@Resolver(() => Province)
export class ProvinceResolver {
  constructor(private provinceService: ProvinceService) {}

  @Query(() => [Province])
  async provinces(
    @Args('limit', { type: () => Int, defaultValue: 100 }) limit: number,
    @Args('offset', { type: () => Int, defaultValue: 0 }) offset: number
  ) {
    return this.provinceService.findAll(limit, offset);
  }

  @Query(() => Province)
  async province(@Args('id', { type: () => Int }) id: number) {
    return this.provinceService.findById(id);
  }

  @Query(() => [PlayerProvince])
  @UseGuards(GqlAuthGuard)
  async playerProvinces(@Context() context) {
    return this.provinceService.findPlayerProvinces(context.req.user.id);
  }

  @Mutation(() => PlayerProvince)
  @UseGuards(GqlAuthGuard)
  async upgradeFarmer(
    @Args('provinceId', { type: () => Int }) provinceId: number,
    @Context() context
  ) {
    return this.provinceService.upgradeFarmer(context.req.user.id, provinceId);
  }

  @Mutation(() => PlayerProvince)
  @UseGuards(GqlAuthGuard)
  async upgradeResource(
    @Args('provinceId', { type: () => Int }) provinceId: number,
    @Context() context
  ) {
    return this.provinceService.upgradeResource(context.req.user.id, provinceId);
  }

  @Mutation(() => PlayerProvince)
  @UseGuards(GqlAuthGuard)
  async upgradeDevelopment(
    @Args('provinceId', { type: () => Int }) provinceId: number,
    @Context() context
  ) {
    return this.provinceService.upgradeDevelopment(context.req.user.id, provinceId);
  }
}
```

**Queries:**
- `provinces` - Get all provinces
- `province(id)` - Get single province
- `playerProvinces` - Get player's provinces with levels

**Mutations:**
- `upgradeFarmer(provinceId)` - Upgrade farmer level
- `upgradeResource(provinceId)` - Upgrade resource production
- `upgradeDevelopment(provinceId)` - Upgrade development

---

#### 3.3 Hero Resolver
**File:** `src/graphql/resolvers/hero.resolver.ts`

```typescript
@Resolver(() => Hero)
export class HeroResolver {
  constructor(private heroService: HeroService) {}

  @Query(() => [Hero])
  async heroes() {
    return this.heroService.findAll();
  }

  @Query(() => [PlayerHero])
  @UseGuards(GqlAuthGuard)
  async playerHeroes(@Context() context) {
    return this.heroService.findPlayerHeroes(context.req.user.id);
  }

  @Mutation(() => PlayerHero)
  @UseGuards(GqlAuthGuard)
  async recruitHero(
    @Args('heroId', { type: () => ID }) heroId: string,
    @Context() context
  ) {
    return this.heroService.recruit(context.req.user.id, heroId);
  }

  @Mutation(() => PlayerHero)
  @UseGuards(GqlAuthGuard)
  async deployHero(
    @Args('heroId', { type: () => ID }) heroId: string,
    @Args('provinceId', { type: () => Int }) provinceId: number,
    @Context() context
  ) {
    return this.heroService.deploy(context.req.user.id, heroId, provinceId);
  }

  @Query(() => [PlayerHero])
  async heroLeaderboard(
    @Args('limit', { type: () => Int, defaultValue: 100 }) limit: number
  ) {
    return this.heroService.getLeaderboard(limit);
  }
}
```

**Queries:**
- `heroes` - Get all available heroes
- `playerHeroes` - Get player's recruited heroes
- `heroLeaderboard` - Top players by hero collection

**Mutations:**
- `recruitHero(heroId)` - Recruit a new hero
- `deployHero(heroId, provinceId)` - Deploy hero to province

---

#### 3.4 Story & Quiz Resolver
**File:** `src/graphql/resolvers/story.resolver.ts`

```typescript
@Resolver(() => Story)
export class StoryResolver {
  constructor(private storyService: StoryService) {}

  @Query(() => [Story])
  async stories(
    @Args('limit', { type: () => Int, defaultValue: 100 }) limit: number,
    @Args('offset', { type: () => Int, defaultValue: 0 }) offset: number
  ) {
    return this.storyService.findAll(limit, offset);
  }

  @Query(() => Story)
  async storyByDay(@Args('day', { type: () => Int }) day: number) {
    return this.storyService.findByDay(day);
  }

  @Query(() => [QuizQuestion])
  async quizQuestions(@Args('storyId', { type: () => ID }) storyId: string) {
    return this.storyService.getQuizQuestions(storyId);
  }

  @Mutation(() => Story)
  @UseGuards(GqlAuthGuard)
  async markStoryRead(
    @Args('storyId', { type: () => ID }) storyId: string,
    @Context() context
  ) {
    return this.storyService.markAsRead(context.req.user.id, storyId);
  }

  @Mutation(() => QuizSubmission)
  @UseGuards(GqlAuthGuard)
  async submitQuiz(
    @Args('storyId', { type: () => ID }) storyId: string,
    @Args('answers', { type: () => [Int] }) answers: number[],
    @Context() context
  ) {
    return this.storyService.submitQuiz(context.req.user.id, storyId, answers);
  }

  @Query(() => [QuizSubmission])
  async quizLeaderboard(
    @Args('limit', { type: () => Int, defaultValue: 100 }) limit: number
  ) {
    return this.storyService.getQuizLeaderboard(limit);
  }
}
```

**Queries:**
- `stories` - Get all stories
- `storyByDay(day)` - Get story for specific day
- `quizQuestions(storyId)` - Get quiz for a story
- `quizLeaderboard` - Top quiz scores

**Mutations:**
- `markStoryRead(storyId)` - Mark story as read
- `submitQuiz(storyId, answers)` - Submit quiz answers

---

#### 3.5 Resource Resolver
**File:** `src/graphql/resolvers/resource.resolver.ts`

```typescript
@Resolver(() => Resource)
export class ResourceResolver {
  constructor(private resourceService: ResourceService) {}

  @Query(() => [Resource])
  async resources() {
    return this.resourceService.findAll();
  }

  @Query(() => [PlayerResource])
  @UseGuards(GqlAuthGuard)
  async playerResources(@Context() context) {
    return this.resourceService.findPlayerResources(context.req.user.id);
  }

  @Mutation(() => PlayerResource)
  @UseGuards(GqlAuthGuard)
  async harvestResource(
    @Args('resourceType') resourceType: string,
    @Context() context
  ) {
    return this.resourceService.harvest(context.req.user.id, resourceType);
  }

  @Query(() => [PlayerResource])
  async resourceLeaderboard(
    @Args('resourceType', { defaultValue: 'gold' }) resourceType: string,
    @Args('limit', { type: () => Int, defaultValue: 100 }) limit: number
  ) {
    return this.resourceService.getLeaderboard(resourceType, limit);
  }
}
```

**Queries:**
- `resources` - Get all resource types
- `playerResources` - Get player's resources
- `resourceLeaderboard(type)` - Top players by resource

**Mutations:**
- `harvestResource(resourceType)` - Harvest resources with cooldown

---

### 4. Tạo Service Layer với Prisma

Migrate logic từ 5 service files trong Motia sang Prisma:

#### 4.1 PlayerService
**File:** `src/graphql/services/player.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PlayerService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.player.findUnique({
      where: { id },
      include: {
        player_provinces: {
          include: { province: true }
        },
        player_heroes: {
          include: { hero: true }
        },
        player_resources: true,
        player_stats: true,
      },
    });
  }

  async findAll() {
    return this.prisma.player.findMany({
      take: 100,
      orderBy: { level: 'desc' },
    });
  }

  async update(id: string, data: { level?: number; experience?: number }) {
    return this.prisma.player.update({
      where: { id },
      data,
    });
  }
}
```

#### 4.2 ProvinceService  
**File:** `src/graphql/services/province.service.ts`

```typescript
@Injectable()
export class ProvinceService {
  constructor(private prisma: PrismaService) {}

  async findAll(limit: number, offset: number) {
    return this.prisma.province.findMany({
      take: limit,
      skip: offset,
      orderBy: { unlock_order: 'asc' },
    });
  }

  async findPlayerProvinces(playerId: string) {
    return this.prisma.playerProvince.findMany({
      where: { player_id: playerId },
      include: { province: true },
    });
  }

  async upgradeFarmer(playerId: string, provinceId: number) {
    // 1. Get current level
    const playerProvince = await this.prisma.playerProvince.findUnique({
      where: {
        player_id_province_id: { player_id: playerId, province_id: provinceId },
      },
    });

    // 2. Calculate cost (from MVP1_CONFIG)
    const cost = this.calculateUpgradeCost(playerProvince.farmer_level);

    // 3. Check resources
    const player = await this.prisma.player.findUnique({ where: { id: playerId } });
    if (!this.hasEnoughResources(player.resources, cost)) {
      throw new Error('Insufficient resources');
    }

    // 4. Update with transaction
    return this.prisma.$transaction(async (tx) => {
      // Deduct resources
      await tx.player.update({
        where: { id: playerId },
        data: {
          resources: this.deductResources(player.resources, cost),
        },
      });

      // Upgrade level
      return tx.playerProvince.update({
        where: {
          player_id_province_id: { player_id: playerId, province_id: provinceId },
        },
        data: {
          farmer_level: { increment: 1 },
        },
        include: { province: true },
      });
    });
  }

  // Similar for upgradeResource() and upgradeDevelopment()
}
```

#### 4.3 HeroService, StoryService, ResourceService
Tương tự migrate logic từ `motia/src/services/*.service.ts` sang Prisma queries

---

### 5. JWT Authentication Guard

**File:** `src/graphql/auth/gql-auth.guard.ts`

```typescript
import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class GqlAuthGuard extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }
}
```

**File:** `src/graphql/auth/jwt.strategy.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
    });
  }

  async validate(payload: any) {
    return { id: payload.playerId, username: payload.username };
  }
}
```

---

### 6. Frontend Migration

#### 6.1 Install Apollo Client
```bash
cd frontend
npm install @apollo/client graphql
```

#### 6.2 Create Apollo Client
**File:** `frontend/lib/apollo-client.ts`

```typescript
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httpLink = createHttpLink({
  uri: 'http://localhost:11002/graphql',
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('authToken');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
```

#### 6.3 Create GraphQL Queries
**File:** `frontend/lib/graphql/queries.ts`

```typescript
import { gql } from '@apollo/client';

export const GET_PLAYER_PROVINCES = gql`
  query GetPlayerProvinces {
    playerProvinces {
      id
      provinceId
      farmerLevel
      resourceLevel
      developmentLevel
      province {
        id
        name
        nameEnglish
        region
      }
    }
  }
`;

export const UPGRADE_FARMER = gql`
  mutation UpgradeFarmer($provinceId: Int!) {
    upgradeFarmer(provinceId: $provinceId) {
      id
      farmerLevel
    }
  }
`;

export const GET_PLAYER_HEROES = gql`
  query GetPlayerHeroes {
    playerHeroes {
      id
      level
      hero {
        id
        nameVietnamese
        rarity
        role
      }
    }
  }
`;

export const GET_STORIES = gql`
  query GetStories($limit: Int, $offset: Int) {
    stories(limit: $limit, offset: $offset) {
      id
      day
      titleVietnamese
      category
      isAvailable
    }
  }
`;
```

#### 6.4 Replace MVP1ApiClient with Apollo
**Before (REST):**
```typescript
const response = await MVP1ApiClient.getPlayerProvinces();
```

**After (GraphQL):**
```typescript
const { data } = await apolloClient.query({
  query: GET_PLAYER_PROVINCES,
});
```

**Component Usage:**
```typescript
import { useQuery, useMutation } from '@apollo/client';

function ProvincePage() {
  const { data, loading, error } = useQuery(GET_PLAYER_PROVINCES);
  const [upgradeFarmer] = useMutation(UPGRADE_FARMER);

  const handleUpgrade = async (provinceId: number) => {
    await upgradeFarmer({ variables: { provinceId } });
  };

  return (
    // render data.playerProvinces
  );
}
```

---

## 📊 Migration Checklist

### Backend
- [✅] Prisma Schema
- [✅] PrismaService  
- [✅] GraphQL Module Setup
- [✅] GraphQL Object Types
- [ ] GraphQL Resolvers (5 files)
- [ ] Service Layer với Prisma (5 files)
- [ ] JWT Auth Guard
- [ ] Testing với Apollo Playground

### Frontend
- [ ] Install Apollo Client
- [ ] Create Apollo Config
- [ ] Create GraphQL Queries/Mutations
- [ ] Replace MVP1ApiClient
- [ ] Update hooks (useApiDataSync → Apollo hooks)
- [ ] Testing

---

## 🎯 Next Steps

1. **Complete Resolvers** - Implement 5 resolver files
2. **Complete Services** - Migrate business logic to Prisma
3. **Add Authentication** - JWT Strategy + Guards
4. **Test Backend** - Use Apollo Playground at http://localhost:11002/graphql
5. **Migrate Frontend** - Apollo Client + Queries
6. **Integration Testing** - E2E tests
7. **Performance Optimization** - DataLoader for N+1 queries

---

## 🔥 Benefits của GraphQL Migration

1. **Unified API** - 1 endpoint thay vì 30+ REST endpoints
2. **Type Safety** - Auto-generated TypeScript types
3. **Flexible Queries** - Frontend request exact data needed
4. **Real-time** - Ready for subscriptions (future)
5. **Better DX** - Apollo DevTools, GraphQL Playground
6. **Less Code** - Prisma reduces boilerplate significantly

---

**Bạn muốn tôi tiếp tục implement phần nào tiếp theo?**
