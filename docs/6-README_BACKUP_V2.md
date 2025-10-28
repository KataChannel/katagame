# 📦 Docker Backup & Restore Scripts v2.0

Hệ thống backup/restore Docker với cấu trúc thư mục timestamp và giao diện tương tác.

## 🆕 Thay Đổi v2.0

### ✅ Cấu Trúc Backup Mới

**Before (v1.0):**
```
backups/
├── postgres_20251017_011126.sql.gz
├── redis_20251017_011126.rdb.gz
├── backup_20251017_011126.log
└── backup_summary_20251017_011126.txt
```

**After (v2.0):**
```
backups/
├── 20251017014610/          # Timestamp folder
│   ├── postgres.sql.gz
│   ├── redis.rdb.gz
│   ├── minio.tar.gz
│   ├── volume_*.tar.gz
│   ├── config.tar.gz
│   ├── backup.log
│   └── summary.txt
├── 20251017013945/          # Previous backup
│   └── ...
└── latest -> 20251017014610 # Symlink to latest
```

### ✅ Restore Tương Tác

**Chọn từ danh sách:**
```bash
./scripts/7restoredocker.sh

=== Available Backups ===

  [1] 20251017014610
      Date: 2025-10-17 01:46:10
      Size: 28M
      Files: postgres.sql.gz, redis.rdb.gz, ...

  [2] 20251017013945
      Date: 2025-10-17 01:39:45
      Size: 28M
      Files: postgres.sql.gz, redis.rdb.gz, ...

Select backup number (1-5), enter timestamp (YYYYMMDDHHMMSS), or 'latest':
```

**Hoặc trực tiếp:**
```bash
# Restore từ timestamp
./scripts/7restoredocker.sh 20251017014610

# Restore latest
./scripts/7restoredocker.sh latest
```

## 📖 Hướng Dẫn Sử Dụng

### 1️⃣ Backup

```bash
# Backup tự động (tạo folder timestamp)
./scripts/6backupdocker.sh

# Output:
[INFO] Backup timestamp: 20251017014610
[INFO] Backup directory: /path/to/backups/20251017014610
[INFO] Created symlink: /path/to/backups/latest -> 20251017014610
```

**Cấu trúc tạo ra:**
```
backups/20251017014610/
├── postgres.sql.gz         # PostgreSQL full dump
├── redis.rdb.gz           # Redis snapshot
├── minio.tar.gz           # MinIO data
├── volume_katacore_postgres_data.tar.gz
├── volume_katacore_redis_data.tar.gz
├── volume_katacore_elasticsearch_data.tar.gz
├── volume_katacore_minio_data.tar.gz
├── volume_katacore_pgadmin_data.tar.gz
├── config.tar.gz          # docker-compose, .env, Makefile
├── backup.log             # Detailed log
└── summary.txt            # Summary report
```

### 2️⃣ Restore

#### Cách 1: Tương Tác
```bash
./scripts/7restoredocker.sh

# Chọn từ menu:
# - Nhập số [1-5]
# - Nhập timestamp: 20251017014610
# - Nhập 'latest' cho backup mới nhất
```

#### Cách 2: Trực Tiếp
```bash
# Restore bằng timestamp
./scripts/7restoredocker.sh 20251017014610

# Restore latest
./scripts/7restoredocker.sh latest

# Restore từ đường dẫn
./scripts/7restoredocker.sh /path/to/backups/20251017014610
```

**Xác nhận:**
```
[WARN] ⚠️  WARNING: This will OVERWRITE existing data!
[?] Are you sure you want to restore? (yes/no):
```

### 3️⃣ Quản Lý Backups

#### List All Backups
```bash
./scripts/8manage-backups.sh list

# Output:
TIMESTAMP            DATE                 SIZE       FILES
------------------------------------------------------------------------
20251017014610       2025-10-17 01:46:10  28M        11 files
20251017013945       2025-10-17 01:39:45  28M        11 files
20251017013855       2025-10-17 01:38:55  28M        11 files

Latest: 20251017014610
```

#### Show Latest 5
```bash
./scripts/8manage-backups.sh latest

# Hiển thị chi tiết 5 backups gần nhất với:
# - Timestamp
# - Date formatted
# - Size
# - File list
```

#### Show Sizes
```bash
./scripts/8manage-backups.sh size

# Output:
Total: 84M

By Backup (Top 10):
  28M - 20251017014610 (2025-10-17 01:46)
  28M - 20251017013945 (2025-10-17 01:39)
  28M - 20251017013855 (2025-10-17 01:38)

Backup Count:
  Total backups: 3
```

#### Show Info
```bash
# Bằng timestamp
./scripts/8manage-backups.sh info 20251017014610

# Bằng đường dẫn
./scripts/8manage-backups.sh info ./backups/20251017014610

# Output: Chi tiết files, sizes, types
```

#### Clean Old Backups
```bash
# Xóa backup cũ hơn 7 ngày
./scripts/8manage-backups.sh clean 7

# Xóa backup cũ hơn 30 ngày (mặc định)
./scripts/8manage-backups.sh clean
```

#### Verify Integrity
```bash
./scripts/8manage-backups.sh verify

# Kiểm tra tất cả .gz và .tar.gz files
# Output:
  ✓ postgres.sql.gz
  ✓ redis.rdb.gz
  ✓ volume_katacore_postgres_data.tar.gz
  ...
All backups verified successfully!
```

#### Sync to Remote
```bash
# Sync tất cả backups
./scripts/8manage-backups.sh sync user@server:/backup/

# Sử dụng rsync (nếu có) hoặc scp
```

## 🎯 Use Cases

### Daily Automated Backup
```bash
# Crontab
0 2 * * * cd /app && ./scripts/6backupdocker.sh >> /var/log/backup.log 2>&1
```

**Kết quả:** Mỗi ngày có 1 folder timestamp mới

### Restore Specific Date
```bash
# User muốn restore backup ngày 17/10
./scripts/8manage-backups.sh list

# Tìm timestamp: 20251017014610
./scripts/7restoredocker.sh 20251017014610
```

### Quick Restore Latest
```bash
# Restore backup mới nhất
./scripts/7restoredocker.sh latest

# Hoặc interactive
./scripts/7restoredocker.sh
# Nhập: latest
```

### Migration to New Server
```bash
# Old server: Backup
./scripts/6backupdocker.sh
# Lấy timestamp: 20251017014610

# Copy folder
scp -r backups/20251017014610 user@newserver:/app/backups/

# New server: Restore
./scripts/7restoredocker.sh 20251017014610
```

### Disaster Recovery
```bash
# List backups
./scripts/8manage-backups.sh latest

# Chọn backup tốt nhất (trước khi sự cố)
./scripts/7restoredocker.sh 20251017010000

# Xác nhận: yes
```

## 📊 Backup Structure Details

### Timestamp Format
```
YYYYMMDDHHMMSS
└─┬─┘└┬┘└┬┘└─┬──┘
  Year Month Day Time
  
Example: 20251017014610
         = 2025-10-17 01:46:10
```

### Folder Contents

| File | Description | Typical Size |
|------|-------------|--------------|
| `postgres.sql.gz` | Full PostgreSQL dump | 1-5 MB |
| `redis.rdb.gz` | Redis snapshot | 10-100 KB |
| `minio.tar.gz` | MinIO S3 data | 100 KB - 1 GB |
| `volume_*.tar.gz` | Docker volumes | 10 MB - 5 GB |
| `config.tar.gz` | Configuration files | 5-10 KB |
| `backup.log` | Detailed execution log | 2-5 KB |
| `summary.txt` | Summary report | 1 KB |

### Symlink 'latest'
```bash
backups/latest -> 20251017014610

# Luôn trỏ đến backup mới nhất
# Tự động update sau mỗi backup
```

## 🔧 Advanced Features

### Custom Backup Location
```bash
# Backup vào custom location
./scripts/6backupdocker.sh /mnt/external/backups

# Structure:
/mnt/external/backups/
├── 20251017014610/
├── 20251017013945/
└── latest -> 20251017014610
```

### Restore Specific Component
```bash
# Restore chỉ PostgreSQL
cd backups/20251017014610
gunzip -c postgres.sql.gz | docker compose exec -T postgres psql -U postgres

# Restore chỉ Redis
cd backups/20251017014610
docker compose stop redis
docker run --rm \
  -v katacore_redis_data:/data \
  -v $(pwd):/backup \
  alpine sh -c "gunzip -c /backup/redis.rdb.gz > /data/dump.rdb"
docker compose start redis
```

### Automated Cleanup
```bash
# Auto cleanup trong backup script
# Edit scripts/6backupdocker.sh
# Line ~190: -mtime +30 (thay đổi số ngày)

# Hoặc tạo cron job riêng
0 3 * * * cd /app && ./scripts/8manage-backups.sh clean 7
```

## 🆘 Troubleshooting

### "No backups found"
```bash
# Check backup directory
ls -la backups/

# Check permissions
chmod 755 backups/
```

### "Backup not found: 20251017014610"
```bash
# List available backups
./scripts/8manage-backups.sh list

# Check exact timestamp
ls -la backups/ | grep ^d
```

### "Invalid timestamp format"
```bash
# Timestamp phải đúng format: YYYYMMDDHHMMSS
# ✓ Correct: 20251017014610
# ✗ Wrong: 2025-10-17-01-46-10
# ✗ Wrong: 20251017_014610
```

### Symlink 'latest' broken
```bash
# Recreate symlink manually
cd backups
ln -sfn 20251017014610 latest

# Hoặc chạy backup mới (sẽ tự tạo)
../scripts/6backupdocker.sh
```

## 📈 Performance Tips

### Backup Speed
- PostgreSQL: ~30s for 5GB database
- Redis: ~5s for 100MB data
- Volumes: ~2min for 10GB data

### Storage Space
```bash
# Ước tính: 1 backup = ~30MB + volumes
# 30 backups/month = ~900MB + volumes
# Recommend: 10GB free space minimum

# Check space
df -h /path/to/backups
```

### Compression Ratio
- PostgreSQL SQL: ~5:1 (5MB -> 1MB)
- Redis RDB: ~2:1 (100KB -> 50KB)
- Volumes: ~3:1 (varies by content)

## 🔐 Security Best Practices

### Off-site Backup
```bash
# Daily sync to remote
0 4 * * * cd /app && ./scripts/8manage-backups.sh sync user@backup-server:/secure/backups/
```

### Encryption
```bash
# Encrypt sensitive backups
cd backups/20251017014610
tar czf - postgres.sql.gz | gpg --encrypt -r admin@company.com > postgres.sql.gz.gpg
```

### Access Control
```bash
# Restrict backup directory
chmod 700 backups/
chown backup-user:backup-user backups/
```

## 📝 Changelog

### v2.0 (2025-10-17)
- ✅ Timestamp-based folder structure
- ✅ Interactive restore with menu
- ✅ 'latest' symlink support
- ✅ Direct timestamp restore
- ✅ Improved management tools
- ✅ Better file organization
- ✅ Enhanced listing and info

### v1.0 (2025-10-17)
- Initial release
- Basic backup/restore
- Multiple database support

---

**Version**: 2.0.0  
**Last Updated**: 2025-10-17  
**Author**: KataCore Team
