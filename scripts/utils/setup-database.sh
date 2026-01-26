#!/bin/bash

# ============================================================================
# KATAGAME - Database Setup & Seed Script
# Purpose: Initialize database with schema and seed data
# ============================================================================

set -e

echo ""
echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║           🎮 KATAGAME DATABASE SETUP & INITIALIZATION                     ║"
echo "║                                                                            ║"
echo "║           This script will:                                               ║"
echo "║           1. Create database tables from migrations                        ║"
echo "║           2. Seed 63 provinces, resources, buildings                       ║"
echo "║           3. Seed heroes and pets from Vietnamese history                  ║"
echo "║           4. Seed 30 educational stories with 90 quiz questions           ║"
echo "║                                                                            ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Load environment variables
if [ -f .env.local ]; then
  export $(cat .env.local | grep -v '#' | xargs)
  echo "✅ Loaded .env.local"
else
  echo "⚠️  .env.local not found, using defaults"
fi

# Set default database URL if not set
DATABASE_URL=${DATABASE_URL:-"postgresql://postgres:postgres@localhost:11003/katagame"}
echo "📌 Using DATABASE_URL: $DATABASE_URL"
echo ""

# Step 1: Run migrations
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 1: Running migrations..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if command -v psql &> /dev/null; then
  echo "Running PostgreSQL migrations..."
  psql "$DATABASE_URL" -f migrations/add_mvp1_tables.sql
  echo "✅ Migrations completed"
else
  echo "⚠️  psql not found. Skipping SQL migrations."
  echo "   Run manually: psql \"$DATABASE_URL\" -f migrations/add_mvp1_tables.sql"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 2: Running seed scripts..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Change to motia directory
cd motia

# Install dependencies if needed
if [ ! -d node_modules ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# Run all seeds
echo "🌱 Running comprehensive seed script..."
npm run seed

echo ""
echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║           ✅ DATABASE INITIALIZATION COMPLETE                             ║"
echo "║                                                                            ║"
echo "║           Next steps:                                                      ║"
echo "║           1. Start backend: npm run dev                                    ║"
echo "║           2. Start frontend: cd ../katagame && npm run dev                 ║"
echo "║           3. Test API endpoints: bash test-api-endpoints.sh               ║"
echo "║                                                                            ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""
