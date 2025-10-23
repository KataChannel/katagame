# 🎮 KATAGAME - DATABASE INITIALIZATION GUIDE

## Overview

This guide explains how to initialize the KataGame database with all MVP1 data including provinces, resources, heroes, and educational content.

## What Gets Seeded

### 1. **Provinces (63 Vietnamese Provinces)**
- All 63 Vietnamese provinces with historical data
- 5 historical eras per province (Ancient → Modern)
- Resource generation rates specific to each province
- Unlock progression system

### 2. **Resources (5 Elemental Types)**
- 🟡 **Gold** - Economy & trade (metal element)
- 🟢 **Rice** - Culture & population (water element)
- 🟫 **Wood** - Construction & building (wood element)
- 🪨 **Stone** - Defense & fortification (earth element)
- 🔴 **Bazan** - Special crafting & technology (fire element)

### 3. **Buildings (6 Types)**
- 🚜 **Farm** - Produces Rice
- ⛏️ **Gold Mine** - Produces Gold
- 📦 **Storage** - Increases resource capacity
- 🏪 **Market** - Trading hub
- 🏯 **Temple** - Cultural building
- 🏰 **Barracks** - Military building

### 4. **Heroes (23 Total)**
- **MVP1 (5 Heroes)** - Unlocked at start
  - Hùng Vương I (Common)
  - Lý Thái Tổ (Common)
  - Lý Thánh Tông (Uncommon)
  - Trần Hưng Đạo (Epic) - Premium
  - Modern Leader (Legendary)

- **MVP2-5 (18 Heroes)** - Unlocked in later versions
  - Including: Hồ Chí Minh, Ngô Quyền, Võ Nguyên Giáp, etc.

### 5. **Educational Content (MVP1)**
- **30 Historical Stories** - 1 per day for 30 days
  - Complete stories with detailed Vietnamese history content
  - Examples: "Hùng Vương Lập Nước", "Thăng Long: Thành Phố Thiên Niên", etc.
  
- **90 Quiz Questions** - 3 questions per story
  - Comprehension (Easy)
  - Historical Context (Medium)
  - Application/Reflection (Hard)
  - Scoring system with ×1-×5 multipliers

## Quick Start

### Option 1: Automated Setup (Recommended)

```bash
# From project root
bash setup-database.sh
```

This runs all migrations and seeds automatically.

### Option 2: Manual Setup

#### Step 1: Run Migrations
```bash
cd /chikiet/kataoffical/katagame
psql "$DATABASE_URL" -f migrations/add_mvp1_tables.sql
```

#### Step 2: Seed Database
```bash
cd motia
npm install

# Run all seeds
npm run seed

# Or run individual seeds
npm run seed:provinces      # 63 Vietnamese provinces
npm run seed:resources      # 5 resources + 6 buildings
npm run seed:heroes         # 23 heroes from Vietnamese history
npm run seed:stories        # 30 stories + 90 quizzes
```

## Database Schema

### Key Tables

```sql
-- Core data
resources              -- 5 elemental resource types
buildings              -- 6 building types
provinces              -- 63 Vietnamese provinces with eras
heroes                 -- 23 heroes from Vietnamese history
stories                -- 30 MVP1 educational stories
quiz_questions         -- 90 quiz questions (3 per story)

-- Player tracking
player_stats           -- Player learning & achievement stats
daily_quest_progress   -- Daily story & quiz completion
player_provinces       -- Player province upgrades (Farmer, Resource, Development)
```

### Schema Documentation

See `katagame_database_schema.sql` for complete schema.
See `migrations/add_mvp1_tables.sql` for MVP1-specific tables.

## Verification

After seeding, verify data was loaded:

```bash
# Check provinces
psql "$DATABASE_URL" -c "SELECT COUNT(*) as provinces FROM provinces;"
# Expected: 63

# Check resources
psql "$DATABASE_URL" -c "SELECT COUNT(*) as resources FROM resources;"
# Expected: 5

# Check buildings
psql "$DATABASE_URL" -c "SELECT COUNT(*) as buildings FROM buildings;"
# Expected: 6

# Check heroes
psql "$DATABASE_URL" -c "SELECT COUNT(*) as heroes FROM heroes WHERE is_available = true;"
# Expected: 5 (MVP1 heroes)

# Check stories
psql "$DATABASE_URL" -c "SELECT COUNT(*) as stories FROM stories;"
# Expected: 30

# Check quizzes
psql "$DATABASE_URL" -c "SELECT COUNT(*) as quizzes FROM quiz_questions;"
# Expected: 90
```

## Database Connection

### Environment Variables

Set in `.env.local`:

```env
DATABASE_URL=postgresql://postgres:password@localhost:11003/katagame
MOTIA_ENV=development
JWT_SECRET=your-secret-key
```

### Connection Details

- **Host**: `localhost`
- **Port**: `11003`
- **Database**: `katagame`
- **User**: `postgres` (default)
- **Password**: `postgres` (default - change in production!)

## Seed Data Details

### Story Structure

Each story includes:
- **Title** (Vietnamese & English)
- **Content** - Full historical narrative (500-600 words)
- **Category** - history, geography, culture, resources, or civilization
- **Era** - Historical period (e.g., "Khởi Nguyên Việt (2879 BCE)")
- **Province** - Associated Vietnamese province
- **Hero** - Related historical figure
- **Reading Time** - 5-10 minutes
- **Rewards** - 100 Gold + 100 Rice + 50 Wood base

### Quiz Structure

Each story has 3 quiz questions:

```typescript
{
  question: "string",           // The quiz question
  options: ["A", "B", "C", "D"], // Multiple choice options
  correct_answer: 0,            // Index of correct option (0-3)
  difficulty: "easy|medium|hard",
  type: "comprehension|context|application"
}
```

**Reward System:**
- 3/3 correct: ×5 multiplier ⭐
- 2/3 correct: ×3 multiplier
- 1/3 correct: ×2 multiplier
- 0/3 correct: ×1 multiplier

## API Integration

After seeding, use these endpoints:

```bash
# Get all provinces
GET /api/provinces

# Get story by day
GET /api/stories/:day

# Get quiz for story
GET /api/stories/:storyId/quiz

# Submit quiz answer
POST /api/stories/:storyId/quiz/submit

# Get hero details
GET /api/heroes/:heroId

# Get player stats
GET /api/players/:playerId/stats
```

## Development Tips

### Adding New Stories

To add more stories beyond MVP1:

1. Edit `motia/src/seeds/stories.seed.ts`
2. Add story entries to `MVP1_STORIES` array
3. Ensure each story has exactly 3 quiz questions
4. Run: `npm run seed:stories`

### Updating Resource Rates

To adjust resource generation rates:

1. Edit `motia/src/seeds/resources-buildings.seed.ts`
2. Modify `base_generation_rate` values
3. Run: `npm run seed:resources`

### Modifying Hero Stats

To change hero stats or bonuses:

1. Edit `motia/src/seeds/heroes.seed.ts`
2. Adjust `base_hp`, `bonus_value`, etc.
3. Run: `npm run seed:heroes`

## Troubleshooting

### "Database connection failed"
- Check DATABASE_URL in .env.local
- Verify PostgreSQL is running on port 11003
- Check credentials

### "Table already exists"
- Run migrations first: `npm run seed` handles this automatically
- Or drop and recreate: `psql -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"`

### "No data seeded"
- Check seed scripts completed without errors
- Verify database connection is active
- Run verification queries above

### "Heroes/Stories not appearing"
- Check `is_available` flag in database
- Verify `unlock_requirement` is met
- Check `is_premium` flag for premium content

## Next Steps

After database initialization:

1. **Start Backend**
   ```bash
   cd motia
   npm run dev
   ```

2. **Start Frontend**
   ```bash
   cd katagame
   npm run dev
   ```

3. **Test APIs**
   ```bash
   bash test-api-endpoints.sh
   ```

4. **Verify Game State**
   - Create test player account
   - Verify can read first story
   - Verify can answer quiz
   - Check resource calculations

## Documentation References

- **Feature Design**: See `NEW_FEATURES_DETAILED_DESIGN.md`
- **Educational Content**: See `EDUCATIONAL_CONTENT_SYSTEM.md`
- **MVP1 Specification**: See `MVP1_GAME_FEATURES_SUMMARY_UPDATED.md`
- **Database Schema**: See `katagame_database_schema.sql`

## Support

For issues or questions:
1. Check error logs in terminal
2. Verify database connection
3. Run verification queries
4. Check documentation files

---

**Last Updated**: October 23, 2025  
**Version**: MVP1 - Database Initialization
