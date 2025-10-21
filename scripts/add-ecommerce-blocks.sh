#!/bin/bash

# Add PRODUCT_LIST and PRODUCT_DETAIL to BlockType enum

echo "🔄 Updating BlockType enum to add E-commerce blocks..."

docker exec -i katacore-postgres psql -U postgres -d katacore <<-EOSQL
    BEGIN;
    
    -- Add new enum values
    ALTER TYPE "BlockType" ADD VALUE IF NOT EXISTS 'PRODUCT_LIST';
    ALTER TYPE "BlockType" ADD VALUE IF NOT EXISTS 'PRODUCT_DETAIL';
    
    COMMIT;
    
    -- Verify
    SELECT enumlabel FROM pg_enum WHERE enumtypid = '"BlockType"'::regtype ORDER BY enumsortorder;
EOSQL

echo "✅ BlockType enum updated with PRODUCT_LIST and PRODUCT_DETAIL!"
echo "📊 Current BlockType values:"
docker exec -i katacore-postgres psql -U postgres -d katacore -c "SELECT enumlabel FROM pg_enum WHERE enumtypid = '\"BlockType\"'::regtype ORDER BY enumsortorder;"
