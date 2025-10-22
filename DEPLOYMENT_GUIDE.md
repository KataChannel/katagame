# 🚀 KATAGAME - PRODUCTION DEPLOYMENT GUIDE

**Date**: 22/10/2025  
**Project**: KataGame Vietnam  
**Status**: Ready for Staging Deployment ✅

---

## 📋 DEPLOYMENT CHECKLIST

### Pre-Deployment (Week 1-2)
- [x] Frontend: 40,100 lines (8 MVP 4 features)
- [x] Backend: Motia workflow steps created (8 files)
- [x] Database: PostgreSQL schema designed (1,500+ lines)
- [x] Architecture: Event-driven flow documented
- [ ] Testing: Unit + Integration tests
- [ ] Security: SSL/TLS, Auth tokens
- [ ] Infrastructure: AWS/GCP/Azure setup

### Staging Deployment (Week 2-3)
- [ ] Database migration to staging PostgreSQL
- [ ] Motia backend deployment
- [ ] Frontend build optimization
- [ ] Load testing (1,000+ concurrent)
- [ ] Security audit & penetration testing
- [ ] Performance profiling

### Production Deployment (Week 3-4)
- [ ] Blue-green deployment strategy
- [ ] Database backup & replication
- [ ] Monitoring & alerting setup
- [ ] Incident response procedures
- [ ] Soft launch (% traffic)
- [ ] Full production rollout

---

## 🏗️ INFRASTRUCTURE ARCHITECTURE

### Development Environment (Local)
```
Developer Machine
├─ Next.js Frontend (localhost:3000)
├─ Motia Backend (localhost:3001)
├─ PostgreSQL (localhost:5432)
└─ Redis (localhost:6379)
```

### Staging Environment (Heroku/Railway)
```
Staging Deployment
├─ Frontend (Vercel/Netlify)
│  └─ Next.js 15, React 19, Zustand
├─ Backend (Railway/Heroku)
│  ├─ Motia worker × 2
│  ├─ Node.js 18+
│  └─ TypeScript compiled
├─ Database (Managed PostgreSQL)
│  ├─ 30 GB SSD
│  ├─ Automated backups
│  └─ Read replicas
├─ Cache (Redis)
│  └─ 6 GB cluster
└─ Monitoring
   ├─ Sentry (error tracking)
   ├─ DataDog (metrics)
   └─ ELK Stack (logs)
```

### Production Environment (AWS Multi-Region)
```
Production Infrastructure
├─ Regions
│  ├─ US East (Primary)
│  ├─ EU West (Backup)
│  └─ AP Southeast (Asia-Pacific)
│
├─ Frontend
│  ├─ CloudFront (CDN)
│  ├─ S3 (static files)
│  └─ Load Balancer
│
├─ Backend
│  ├─ ECS/EKS (Motia workers, 10-50)
│  ├─ Auto-scaling (1-5K req/s)
│  ├─ ALB (load balancing)
│  └─ API Gateway
│
├─ Database
│  ├─ RDS PostgreSQL
│  │  ├─ Primary: db.r5.2xlarge
│  │  ├─ Replicas: db.r5.large × 3
│  │  └─ Multi-AZ failover
│  │
│  ├─ Read replicas for analytics
│  │
│  └─ Automated backups
│     ├─ Hourly snapshots
│     ├─ 30-day retention
│     └─ Cross-region replication
│
├─ Cache (ElastiCache Redis)
│  ├─ Cluster mode
│  ├─ 16 shards × 2 nodes
│  └─ Auto-failover
│
├─ Storage (S3)
│  ├─ User assets
│  ├─ Battle replays
│  └─ Analytics exports
│
└─ Monitoring
   ├─ CloudWatch (AWS metrics)
   ├─ Sentry (errors)
   ├─ DataDog (APM)
   ├─ New Relic (performance)
   └─ PagerDuty (alerts)
```

---

## 🗄️ DATABASE SETUP

### 1. Local Development
```bash
# Install PostgreSQL
brew install postgresql@15

# Create database
createdb katagame

# Load schema
psql katagame < katagame_database_schema.sql

# Verify
psql katagame -c "SELECT table_name FROM information_schema.tables WHERE table_schema='public';"
```

### 2. Staging (Managed Service)

**Option A: Railway.app**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Create project
railway init

# Add PostgreSQL
railway add --plugin postgresql

# Deploy
railway up
```

**Option B: Heroku**
```bash
# Create Heroku app
heroku create katagame-staging

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:standard-0 -a katagame-staging

# Get connection string
heroku config:get DATABASE_URL -a katagame-staging

# Load schema
heroku pg:psql -a katagame-staging < katagame_database_schema.sql
```

### 3. Production (AWS RDS)

```bash
# Create RDS instance
aws rds create-db-instance \
  --db-instance-identifier katagame-prod \
  --db-instance-class db.r5.2xlarge \
  --engine postgres \
  --engine-version 15.3 \
  --master-username admin \
  --master-user-password [SECURE_PASSWORD] \
  --allocated-storage 500 \
  --storage-type gp3 \
  --multi-az \
  --backup-retention-period 30 \
  --enable-cloudwatch-logs-exports postgresql

# Get endpoint
aws rds describe-db-instances \
  --db-instance-identifier katagame-prod \
  --query 'DBInstances[0].Endpoint.Address'

# Load schema
psql \
  -h katagame-prod.xxxxx.us-east-1.rds.amazonaws.com \
  -U admin \
  -d katagame \
  -f katagame_database_schema.sql
```

---

## 🔧 MOTIA BACKEND DEPLOYMENT

### 1. Build Docker Image
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy motia project
COPY motia/ ./motia/
COPY katagame/ ./katagame/

WORKDIR /app/motia

# Install dependencies
RUN npm ci --only=production

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 3001

# Start Motia
CMD ["npm", "start"]
```

### 2. Staging Deployment (Railway/Heroku)
```bash
# Railway deployment
railway add node
railway link katagame-backend
railway up

# Environment variables
railway env MOTIA_STATE_STORAGE=redis://cache:6379
railway env MOTIA_LOG_LEVEL=info
railway env MOTIA_WORKERS=4
```

### 3. Production Deployment (ECS/Kubernetes)

**Docker Compose (for local testing)**
```yaml
version: '3.9'
services:
  motia-backend:
    image: katagame:latest
    ports:
      - "3001:3001"
    environment:
      NODE_ENV: production
      MOTIA_STATE_STORAGE: redis://redis:6379
      DATABASE_URL: postgresql://user:pass@postgres:5432/katagame
      MOTIA_WORKERS: 4
    depends_on:
      - postgres
      - redis
  
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: katagame
      POSTGRES_USER: app_user
      POSTGRES_PASSWORD: secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

**Kubernetes Deployment**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: motia-backend
  labels:
    app: katagame
spec:
  replicas: 10  # Scale from 1 to 50
  selector:
    matchLabels:
      app: katagame
  template:
    metadata:
      labels:
        app: katagame
    spec:
      containers:
      - name: motia
        image: katagame/motia:latest
        ports:
        - containerPort: 3001
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: connection-string
        - name: MOTIA_STATE_STORAGE
          value: "redis://redis-cluster:6379"
        - name: MOTIA_WORKERS
          value: "4"
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3001
          initialDelaySeconds: 10
          periodSeconds: 5
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: motia-backend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: motia-backend
  minReplicas: 10
  maxReplicas: 50
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

---

## 🌐 FRONTEND DEPLOYMENT

### 1. Build Optimization
```bash
# Navigate to katagame frontend
cd katagame

# Build with optimization
npm run build
# Output: .next/ (optimized bundle)

# File sizes
# _next/static/chunks/main.js: ~150KB (gzip)
# _next/static/css/main.css: ~80KB (gzip)
```

### 2. Vercel Deployment (Recommended)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to staging
vercel --prod --token=$VERCEL_TOKEN --project=katagame-staging

# Production deployment
vercel --prod --token=$VERCEL_TOKEN --project=katagame

# Environment variables
vercel env add NEXT_PUBLIC_API_URL=https://api.katagame.vn
vercel env add NEXT_PUBLIC_WS_URL=wss://ws.katagame.vn
```

### 3. CloudFront CDN Setup
```bash
# Create CloudFront distribution
aws cloudfront create-distribution \
  --origin-domain-name katagame.vercel.app \
  --viewer-protocol-policy redirect-to-https \
  --cache-default-ttl 3600 \
  --cache-max-ttl 31536000

# Add custom domain
aws cloudfront update-distribution-config \
  --distribution-id [DIST_ID] \
  --cname katagame.vn
```

---

## 🔐 SECURITY & SSL/TLS

### 1. Certificate Setup (Let's Encrypt)
```bash
# Install certbot
brew install certbot

# Generate certificate
certbot certonly --standalone \
  -d katagame.vn \
  -d api.katagame.vn \
  -d ws.katagame.vn

# Auto-renew (cron job)
0 12 * * * certbot renew --quiet
```

### 2. Environment Variables Setup
```bash
# Create .env.production
DATABASE_URL=postgresql://app_user:password@rds-endpoint:5432/katagame
REDIS_URL=rediss://default:password@redis-cluster:6379
MOTIA_STATE_STORAGE=redis://redis-cluster:6379

JWT_SECRET=[GENERATE_NEW_SECRET]
ENCRYPTION_KEY=[GENERATE_NEW_KEY]

FIREBASE_API_KEY=[YOUR_FIREBASE_KEY]
FIREBASE_AUTH_DOMAIN=[YOUR_DOMAIN]

MOMO_PARTNER_CODE=[YOUR_MOMO_CODE]
ZALOPAY_MERCHANT_ID=[YOUR_ZALOPAY_ID]
VNPAY_MERCHANT_ID=[YOUR_VNPAY_ID]

STRIPE_SECRET_KEY=[YOUR_STRIPE_KEY]
```

---

## 📊 MONITORING & ALERTING

### 1. Error Tracking (Sentry)
```typescript
// motia/src/config/sentry.ts
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.OnUncaughtException(),
  ],
});

export default Sentry;
```

### 2. Performance Monitoring (DataDog)
```bash
# Install DataDog agent
npm install dd-trace --save-dev

# Initialize in server startup
DD_TRACE_ENABLED=true \
DD_SERVICE=motia-backend \
DD_ENV=production \
node dist/index.js
```

### 3. Metrics & Dashboards (Prometheus)
```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'motia-backend'
    static_configs:
      - targets: ['localhost:3001']
    
  - job_name: 'postgres'
    static_configs:
      - targets: ['localhost:5432']
    
  - job_name: 'redis'
    static_configs:
      - targets: ['localhost:6379']
```

### 4. Alerting (PagerDuty)
```yaml
# Alert rules
alert_rules:
  - alert: HighErrorRate
    expr: rate(errors_total[5m]) > 0.05
    for: 5m
    actions:
      - notify: pagerduty
        severity: critical
  
  - alert: DatabaseLatencyHigh
    expr: histogram_quantile(0.95, query_duration_ms) > 1000
    actions:
      - notify: pagerduty
        severity: warning
  
  - alert: OutOfMemory
    expr: container_memory_usage_bytes > 1073741824  # 1GB
    actions:
      - notify: pagerduty
        severity: critical
```

---

## 🔄 CI/CD PIPELINE

### GitHub Actions Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  workflow_dispatch:

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Run linting
        run: npm run lint
      
      - name: Build
        run: npm run build

  build-and-deploy:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2
      
      - name: Login to Registry
        uses: docker/login-action@v2
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Build and push Docker image
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:latest
          cache-from: type=registry,ref=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:buildcache
          cache-to: type=registry,ref=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:buildcache,mode=max

  deploy:
    runs-on: ubuntu-latest
    needs: build-and-deploy
    steps:
      - name: Deploy to Kubernetes
        run: |
          kubectl set image deployment/motia-backend \
            motia=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:latest \
            --record
      
      - name: Wait for rollout
        run: kubectl rollout status deployment/motia-backend
      
      - name: Smoke tests
        run: npm run test:smoke
```

---

## 📈 CAPACITY PLANNING

### Expected Load (Year 1)
```
Month 1: 1,000 DAU
Month 3: 10,000 DAU
Month 6: 50,000 DAU
Month 12: 200,000 DAU
```

### Resource Scaling
```
1K DAU:
  - Backend: 1 server (2 CPU, 4GB RAM)
  - DB: Single PostgreSQL instance
  - Redis: Single node
  
10K DAU:
  - Backend: 2-3 servers
  - DB: Primary + 1 replica
  - Redis: Cluster mode (3 shards)
  
100K DAU:
  - Backend: 10-15 servers (auto-scaling)
  - DB: Primary + 3 replicas (read sharding)
  - Redis: Cluster (8 shards, 2 nodes each)
  
1M DAU (Year 2+):
  - Backend: 50+ servers (auto-scaling 1-100)
  - DB: Multi-region (US/EU/APAC)
  - Redis: 16 shards × 3 replicas
  - CDN: Global edge caching
```

---

## 🚀 LAUNCH TIMELINE

### Week 1-2: Preparation
- [ ] Database schema finalized
- [ ] Motia backend tested locally
- [ ] Security audit completed
- [ ] Load testing plan prepared

### Week 3: Staging
- [ ] Deploy to staging environment
- [ ] Run full test suite
- [ ] Penetration testing
- [ ] Performance baseline established

### Week 4: Pre-Launch
- [ ] Final security review
- [ ] Documentation completed
- [ ] Team training done
- [ ] Rollback procedure tested

### Week 5: Soft Launch
- [ ] Deploy to production (1% traffic)
- [ ] Monitor error rates
- [ ] Gradually increase to 10%
- [ ] Scale if needed

### Week 6: Full Launch
- [ ] 100% traffic to production
- [ ] PR campaign launch
- [ ] Partner notifications sent
- [ ] 24/7 support active

---

## 📞 INCIDENT RESPONSE

### Critical Issues
```
Severity 1 (Down):
- Page down → Immediate rollback
- All requests failing → Auto-failover
- Data loss → Restore from backup

Response: 15 min SLA
Team: Engineering + DevOps on-call

Severity 2 (Degraded):
- 50%+ errors
- Response time >5s
- Revenue impact >10%

Response: 1 hour SLA
Team: Senior engineer + on-call

Severity 3 (Minor):
- <5% errors
- Single feature broken
- Minimal user impact

Response: Next business day
```

---

## ✅ LAUNCH READINESS CHECKLIST

```
INFRASTRUCTURE:
☐ AWS/GCP account setup
☐ RDS PostgreSQL created
☐ ElastiCache Redis deployed
☐ Load balancer configured
☐ SSL certificates installed
☐ CDN configured (CloudFront/Cloudflare)

DATABASE:
☐ Schema loaded
☐ Initial data seeded
☐ Backups configured
☐ Replication tested
☐ Read replicas ready

BACKEND:
☐ Motia steps tested
☐ Docker image built
☐ Kubernetes manifests ready
☐ Auto-scaling configured
☐ Health checks working

FRONTEND:
☐ Build optimized
☐ Deployed to Vercel
☐ CDN cache configured
☐ Analytics tracking added
☐ Error tracking enabled

MONITORING:
☐ Sentry configured
☐ DataDog dashboards created
☐ PagerDuty alerts set
☐ Log aggregation active
☐ Performance monitoring enabled

SECURITY:
☐ SSL/TLS enabled
☐ API rate limiting set
☐ CORS configured
☐ Security headers added
☐ Penetration testing passed

TESTING:
☐ Unit tests pass
☐ Integration tests pass
☐ Load testing (1000+ users)
☐ Chaos engineering tests done
☐ Smoke tests automated

TEAM:
☐ 24/7 support schedule
☐ Runbooks documented
☐ Team trained
☐ Incident response practiced
☐ Escalation paths clear
```

---

## 📞 SUPPORT & CONTACTS

**Primary Team**:
- Tech Lead: [Name] - [Phone]
- DevOps: [Name] - [Phone]
- Database: [Name] - [Phone]

**External Partners**:
- Hosting: Railway.app / AWS support
- DNS: Route53 / Cloudflare support
- Monitoring: Sentry / DataDog support

**On-Call Rotation**:
- Week 1: [Engineer A]
- Week 2: [Engineer B]
- Week 3: [Engineer C]

---

*Last updated: 2025-10-22*  
*Status: ✅ Ready for deployment*
