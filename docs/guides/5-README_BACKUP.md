# 📦 Docker Backup & Restore Scripts

Hệ thống backup/restore tự động cho Docker containers với error handling và logging đầy đủ.

## 🚀 Tính Năng

### ✅ Script Backup (`6backupdocker.sh`)

- **Auto-detect containers**: Chỉ backup containers đang chạy
- **Multiple databases**: PostgreSQL, MongoDB, Redis
- **Volume backup**: Backup tất cả volumes của project
- **Config backup**: Backup docker-compose.yml, .env, Makefile
- **Compression**: Tự động nén với gzip để tiết kiệm dung lượng
- **Auto cleanup**: Tự động xóa backup cũ hơn 30 ngày
- **Error handling**: Continue on individual failures
- **Detailed logging**: Log file đầy đủ cho mỗi lần backup
- **Summary report**: Báo cáo tổng kết sau khi backup

### ✅ Script Restore (`7restoredocker.sh`)

- **Single file restore**: Restore từ 1 file backup cụ thể
- **Directory restore**: Restore tất cả từ thư mục (lấy latest backups)
- **Auto-detect**: Tự động nhận dạng loại backup
- **Safety confirmation**: Yêu cầu xác nhận trước khi restore
- **Service management**: Tự động stop/start services khi cần
- **Decompression**: Tự động giải nén file .gz

## 📖 Cách Sử Dụng

### Backup

```bash
# Backup với thư mục mặc định (./backups)
./scripts/6backupdocker.sh

# Backup vào thư mục tùy chọn
./scripts/6backupdocker.sh /path/to/backup/dir
```

**Output:**
```
./backups/
├── postgres_20231017_120000.sql.gz
├── redis_20231017_120000.rdb.gz
├── minio_20231017_120000.tar.gz
├── volume_katacore_postgres_data_20231017_120000.tar.gz
├── config_20231017_120000.tar.gz
├── backup_20231017_120000.log
└── backup_summary_20231017_120000.txt
```

### Restore

```bash
# Restore từ 1 file cụ thể
./scripts/7restoredocker.sh ./backups/postgres_20231017_120000.sql.gz

# Restore tất cả từ thư mục (lấy latest backups)
./scripts/7restoredocker.sh ./backups

# Script sẽ hỏi xác nhận:
# [WARN] ⚠️  WARNING: This will OVERWRITE existing data!
# [?] Are you sure you want to restore? (yes/no): yes
```

## 🔧 Các Loại Backup Được Hỗ Trợ

### 1. PostgreSQL Backup
- **Format**: `postgres_YYYYMMDD_HHMMSS.sql.gz`
- **Method**: `pg_dumpall` (full cluster dump)
- **Restore**: Drop/recreate database + import SQL

### 2. MongoDB Backup
- **Format**: `mongodb_YYYYMMDD_HHMMSS.archive.gz`
- **Method**: `mongodump --archive`
- **Restore**: `mongorestore --archive --drop`

### 3. Redis Backup
- **Format**: `redis_YYYYMMDD_HHMMSS.rdb.gz`
- **Method**: `BGSAVE` + copy dump.rdb
- **Restore**: Copy RDB file to volume + restart

### 4. MinIO Backup
- **Format**: `minio_YYYYMMDD_HHMMSS.tar.gz`
- **Method**: Tar volume data
- **Restore**: Extract to volume

### 5. Docker Volumes
- **Format**: `volume_NAME_YYYYMMDD_HHMMSS.tar.gz`
- **Method**: Tar volume data
- **Restore**: Extract to volume

### 6. Configuration Files
- **Format**: `config_YYYYMMDD_HHMMSS.tar.gz`
- **Includes**: docker-compose*.yml, .env*, Makefile*
- **Restore**: Manual extraction

## 📊 Log Files

Mỗi lần backup tạo 2 files:

### 1. Log File (`backup_YYYYMMDD_HHMMSS.log`)
```
[INFO] Starting backup process - 20231017_120000
[INFO] Backup directory: /path/to/backups
[INFO] Backing up PostgreSQL...
[INFO] PostgreSQL backup completed: postgres_20231017_120000.sql
[INFO] Compressed to: postgres_20231017_120000.sql.gz
...
```

### 2. Summary File (`backup_summary_YYYYMMDD_HHMMSS.txt`)
```
======================================
Backup Summary - 20231017_120000
======================================

Backup Location: /path/to/backups
Backup Date: Tue Oct 17 12:00:00 UTC 2023

Files Created:
postgres_20231017_120000.sql.gz - 125M
redis_20231017_120000.rdb.gz - 15M
...

Total Backup Size:
500M    /path/to/backups
======================================
```

## ⚙️ Cấu Hình

### Retention Policy
Mặc định: **30 ngày**

Thay đổi trong `6backupdocker.sh`:
```bash
# Line ~190
find "$BACKUP_DIR" -type f ... -mtime +30 -delete
#                                      ^^ thay đổi số ngày
```

### Backup Location
Mặc định: `./backups` (relative to project root)

Thay đổi khi chạy:
```bash
./scripts/6backupdocker.sh /custom/backup/path
```

## 🔄 Automation với Cron

### Setup Daily Backup (2 AM)

```bash
# Edit crontab
crontab -e

# Add line:
0 2 * * * cd /path/to/katacore && ./scripts/6backupdocker.sh >> /var/log/docker-backup.log 2>&1
```

### Setup với systemd timer (Ubuntu/Debian)

1. Tạo service file:
```bash
sudo nano /etc/systemd/system/docker-backup.service
```

```ini
[Unit]
Description=Docker Backup Service
After=docker.service

[Service]
Type=oneshot
User=your-user
WorkingDirectory=/path/to/katacore
ExecStart=/path/to/katacore/scripts/6backupdocker.sh
```

2. Tạo timer file:
```bash
sudo nano /etc/systemd/system/docker-backup.timer
```

```ini
[Unit]
Description=Daily Docker Backup
Requires=docker-backup.service

[Timer]
OnCalendar=daily
OnCalendar=02:00
Persistent=true

[Install]
WantedBy=timers.target
```

3. Enable và start:
```bash
sudo systemctl enable docker-backup.timer
sudo systemctl start docker-backup.timer
sudo systemctl status docker-backup.timer
```

## 🛡️ Best Practices

### 1. Test Restore Regularly
```bash
# Restore vào test environment
./scripts/7restoredocker.sh ./backups/postgres_latest.sql.gz
```

### 2. Off-site Backup
```bash
# Sync to remote server
rsync -avz ./backups/ user@remote:/backup/katacore/

# Or AWS S3
aws s3 sync ./backups/ s3://your-bucket/katacore-backups/
```

### 3. Monitor Backup Size
```bash
# Check total size
du -sh ./backups

# Check individual files
ls -lh ./backups/*.gz
```

### 4. Verify Backup Integrity
```bash
# Test gunzip
gunzip -t ./backups/postgres_*.sql.gz

# Test tar
tar tzf ./backups/volume_*.tar.gz > /dev/null
```

## 🐛 Troubleshooting

### Container Not Found
```
[WARN] PostgreSQL container not running, skipping...
```
**Fix**: Start container trước khi backup
```bash
docker-compose up -d postgres
```

### Permission Denied
```
[ERROR] PostgreSQL backup failed
```
**Fix**: Chạy với sudo hoặc add user vào docker group
```bash
sudo usermod -aG docker $USER
# Logout/login to apply
```

### Out of Disk Space
```
[ERROR] No space left on device
```
**Fix**: 
- Xóa old backups: `find ./backups -mtime +7 -delete`
- Thay đổi backup location: `./scripts/6backupdocker.sh /larger/disk/path`

### Backup Too Large
**Fix**: Exclude large volumes
```bash
# Edit script, comment out backup_minio hoặc backup_volumes
```

## 📝 Examples

### Disaster Recovery Plan

1. **Daily automated backup**
```bash
0 2 * * * cd /app && ./scripts/6backupdocker.sh
```

2. **Weekly full backup to S3**
```bash
0 3 * * 0 cd /app && ./scripts/6backupdocker.sh /tmp/weekly-backup && aws s3 sync /tmp/weekly-backup s3://backups/
```

3. **Test restore monthly**
```bash
# First day of month
./scripts/7restoredocker.sh ./backups
```

### Migration to New Server

```bash
# Old server: Create backup
./scripts/6backupdocker.sh /tmp/migration

# Copy to new server
scp -r /tmp/migration user@newserver:/tmp/

# New server: Setup docker-compose
cd /app
docker-compose up -d

# New server: Restore
./scripts/7restoredocker.sh /tmp/migration
```

## 📚 Related Documentation

- [Docker Volumes Documentation](https://docs.docker.com/storage/volumes/)
- [PostgreSQL Backup](https://www.postgresql.org/docs/current/backup.html)
- [MongoDB Backup](https://www.mongodb.com/docs/manual/core/backups/)
- [Redis Persistence](https://redis.io/docs/management/persistence/)

## 🆘 Support

Nếu gặp vấn đề, check:
1. Log files trong `./backups/backup_*.log`
2. Summary files `./backups/backup_summary_*.txt`
3. Docker logs: `docker-compose logs [service]`

---

**Version**: 1.0.0  
**Last Updated**: 2023-10-17  
**Author**: KataCore Team
