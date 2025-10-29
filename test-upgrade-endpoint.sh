#!/bin/bash

echo "=== Testing Province Upgrade Endpoints ==="
echo ""

# Test without auth - should return 401 Unauthorized (not 400 Province ID required)
echo "1. Testing /provinces/1/upgrade/farmer WITHOUT auth (expect 401):"
curl -s -X POST http://localhost:11001/api/v1/provinces/1/upgrade/farmer \
  -H "Content-Type: application/json" | jq .

echo ""
echo "2. Testing /provinces/1/upgrade/resource WITHOUT auth (expect 401):"
curl -s -X POST http://localhost:11001/api/v1/provinces/1/upgrade/resource \
  -H "Content-Type: application/json" | jq .

echo ""
echo "3. Testing /provinces/1/upgrade/development WITHOUT auth (expect 401):"
curl -s -X POST http://localhost:11001/api/v1/provinces/1/upgrade/development \
  -H "Content-Type: application/json" | jq .

echo ""
echo "=== All tests should return 401 Unauthorized (not 400 Province ID required) ==="
echo "=== This confirms provinceId parameter is being extracted correctly ===" 
