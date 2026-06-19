# ProjectHub Configuration Guide

Complete guide to configuring ProjectHub for different environments and deployment scenarios.

## Environment Setup

### Development Environment

Create `.env.local` in project root:

```bash
# Database
PROJECT_HUB_DB_PATH=./data.db

# Server
NODE_ENV=development
PORT=3000
```

### Production Environment

Create `.env.production.local`:

```bash
# Database - use absolute path
PROJECT_HUB_DB_PATH=/var/data/project-hub/database.db

# Server
NODE_ENV=production
PORT=3000

# Optional: Enable access logs
LOG_LEVEL=info
```

## Database Configuration

### Local SQLite (Default)

```bash
PROJECT_HUB_DB_PATH=./data.db
```

**Pros:**
- No setup required
- File-based persistence
- Easy backup

**Cons:**
- Limited concurrent users
- Not suitable for distributed systems
- Performance limits on large datasets

### Custom Database Path

```bash
# Linux/macOS
export PROJECT_HUB_DB_PATH=/var/data/project-hub/database.db

# Windows (PowerShell)
$env:PROJECT_HUB_DB_PATH="C:\data\project-hub\database.db"

# Windows (CMD)
set PROJECT_HUB_DB_PATH=C:\data\project-hub\database.db
```

### Permissions Setup (Linux)

```bash
# Create dedicated directory
sudo mkdir -p /var/data/project-hub
sudo chown app:app /var/data/project-hub
sudo chmod 755 /var/data/project-hub

# Set environment variable
export PROJECT_HUB_DB_PATH=/var/data/project-hub/database.db
```

## Deployment Scenarios

### 1. Local Development

```bash
npm install
npm run dev
```

Access at `http://localhost:3000`

### 2. Production Server (Single Machine)

#### Prerequisites:
- Node.js 18+
- Systemd (Linux)
- SSL certificate (optional but recommended)

#### Setup:

```bash
# Clone repository
git clone <repository> /opt/project-hub
cd /opt/project-hub

# Install dependencies
npm install

# Build for production
npm run build

# Create systemd service
sudo nano /etc/systemd/system/project-hub.service
```

**Systemd Service File:**

```ini
[Unit]
Description=ProjectHub Service
After=network.target

[Service]
Type=simple
User=app
WorkingDirectory=/opt/project-hub
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10
Environment="NODE_ENV=production"
Environment="PROJECT_HUB_DB_PATH=/var/data/project-hub/database.db"
Environment="PORT=3000"

[Install]
WantedBy=multi-user.target
```

**Start the service:**

```bash
sudo systemctl daemon-reload
sudo systemctl enable project-hub
sudo systemctl start project-hub

# Check status
sudo systemctl status project-hub
```

### 3. Docker Deployment

#### Dockerfile:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application
COPY . .

# Build for production
RUN npm run build

# Create data directory
RUN mkdir -p /data

# Expose port
EXPOSE 3000

# Set environment
ENV NODE_ENV=production
ENV PROJECT_HUB_DB_PATH=/data/database.db

# Start application
CMD ["npm", "start"]
```

#### docker-compose.yml:

```yaml
version: '3.8'

services:
  project-hub:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - project-data:/data
    environment:
      - NODE_ENV=production
      - PROJECT_HUB_DB_PATH=/data/database.db
      - PORT=3000
    restart: unless-stopped

volumes:
  project-data:
```

**Run:**

```bash
docker-compose up -d
docker-compose logs -f project-hub
```

### 4. Nginx Reverse Proxy

#### Setup:

```bash
# Install Nginx
sudo apt-get install nginx

# Create Nginx config
sudo nano /etc/nginx/sites-available/project-hub
```

**Nginx Configuration:**

```nginx
upstream project_hub {
    server localhost:3000;
}

server {
    listen 80;
    server_name project.example.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name project.example.com;
    
    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/project.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/project.example.com/privkey.pem;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    
    # Proxy settings
    location / {
        proxy_pass http://project_hub;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Enable site:**

```bash
sudo ln -s /etc/nginx/sites-available/project-hub /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 5. Cloud Deployment (Example: DigitalOcean App Platform)

#### app.yaml:

```yaml
name: project-hub
services:
- name: project-hub
  github:
    repo: your-user/project-hub
    branch: main
  build_command: npm install && npm run build
  run_command: npm start
  envs:
  - key: NODE_ENV
    value: production
  - key: PROJECT_HUB_DB_PATH
    value: /mnt/data/database.db
  http_port: 3000
  
  volumes:
  - name: data
    mount_path: /mnt/data
    
static_sites:
- source_dir: public

databases:
- name: project-hub-db
  engine: sqlite
```

## Security Configuration

### Authentication (Recommended for Production)

Add middleware to `next.config.ts`:

```typescript
export const config = {
  matcher: ['/api/:path*'],
};

export async function middleware(request: NextRequest) {
  const token = request.headers.get('authorization');
  
  if (!isValidToken(token)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  return NextResponse.next();
}
```

### HTTPS/SSL

```bash
# Using Let's Encrypt with Certbot
sudo certbot certonly --standalone -d project.example.com
sudo certbot renew --dry-run  # Test renewal
```

### Database Backup Encryption

```bash
#!/bin/bash
# Automated encrypted backups

BACKUP_DIR="/backups/project-hub"
DB_PATH="/var/data/project-hub/database.db"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup with encryption
gpg --symmetric --cipher-algo AES256 \
    --output $BACKUP_DIR/database_$DATE.db.gpg \
    $DB_PATH

# Keep only last 30 days
find $BACKUP_DIR -name "*.gpg" -mtime +30 -delete
```

## Performance Optimization

### Increase Database Limits

In `src/lib/db.ts`:

```typescript
const db = Database(dbPath);

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');

// Optimize for speed
db.pragma('synchronous = NORMAL');
db.pragma('cache_size = -64000');  // 64MB cache
```

### Enable Caching

In `next.config.ts`:

```typescript
const nextConfig = {
  staticPageGenerationTimeout: 120,
  swcMinify: true,
  compress: true,
  
  headers: async () => [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Cache-Control', value: 'no-store' }
      ]
    }
  ]
};
```

## Monitoring

### Health Check Endpoint

Create `src/app/api/health/route.ts`:

```typescript
export async function GET() {
  try {
    const db = require('@/lib/db').default;
    const result = db.prepare('SELECT 1').get();
    return NextResponse.json({ status: 'healthy', db: 'connected' });
  } catch (error) {
    return NextResponse.json(
      { status: 'unhealthy', error: error.message },
      { status: 503 }
    );
  }
}
```

### Logging Setup

```bash
# Using PM2 for process management
npm install -g pm2

pm2 start npm -- start --name "project-hub"
pm2 logs project-hub
pm2 save
pm2 startup
```

## Scaling Considerations

### For Large Projects (50,000+ records)

1. **Archive old data**: Move completed projects to separate database
2. **Implement pagination**: Add limits to API endpoints
3. **Database indexing**: Add indexes on frequently queried fields
4. **Read replicas**: Consider SQLite replication for backups

### Backup Strategy for Production

```bash
#!/bin/bash
# Daily backup with rotation

BACKUP_DIR="/backups/project-hub"
DB_PATH="/var/data/project-hub/database.db"
DATE=$(date +%Y%m%d)

mkdir -p $BACKUP_DIR

# Create backup
cp $DB_PATH $BACKUP_DIR/database_$DATE.db

# Keep last 30 days
find $BACKUP_DIR -name "database_*.db" -mtime +30 -delete

# Optional: Upload to cloud storage
# aws s3 cp $BACKUP_DIR/database_$DATE.db s3://backups/project-hub/
```

## Troubleshooting

### Database Locked

```bash
# Remove WAL files and rebuild
rm data.db-shm data.db-wal
npm run dev
```

### Out of Memory

Increase Node.js heap:

```bash
NODE_OPTIONS="--max-old-space-size=2048" npm start
```

### Port Already in Use

```bash
# Find and kill process
lsof -i :3000
kill -9 <PID>

# Or use different port
PORT=3001 npm start
```

## Environment Variables Summary

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | development | Environment mode |
| `PROJECT_HUB_DB_PATH` | ./data.db | Database file location |
| `PORT` | 3000 | Server port |
| `LOG_LEVEL` | error | Logging level |

---

**Last Updated**: 2026-06-20
