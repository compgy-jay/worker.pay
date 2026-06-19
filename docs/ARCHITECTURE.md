# ProjectHub Architecture Overview

Technical architecture and design documentation for ProjectHub.

## System Architecture

```
┌─────────────────────────────────────────────────────┐
│                    User Browser                      │
│              (Modern ES2020+ Browser)                │
└──────────────────┬──────────────────────────────────┘
                   │ HTTPS/HTTP
                   │
┌──────────────────▼──────────────────────────────────┐
│              Nginx Reverse Proxy (Optional)          │
│              or Direct Node.js Server                │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│          Next.js Server (Node.js Runtime)            │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │      React 19 Frontend Components             │  │
│  │  - Dashboard                                  │  │
│  │  - Team Management                            │  │
│  │  - Labor Cost Tracking                        │  │
│  │  - Material Management                        │  │
│  │  - Project Settings                           │  │
│  └──────────────────────────────────────────────┘  │
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │        Next.js API Routes (/api/*)            │  │
│  │  - /workers - Team member CRUD                │  │
│  │  - /records - Labor cost tracking             │  │
│  │  - /materials - Material procurement          │  │
│  │  - /project-settings - Configuration          │  │
│  │  - /summary - Metrics aggregation             │  │
│  └──────────────────────────────────────────────┘  │
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │      Business Logic Layer                     │  │
│  │  - Data validation                            │  │
│  │  - Error handling                             │  │
│  │  - Data transformation                        │  │
│  └──────────────────────────────────────────────┘  │
│                                                      │
└──────────────────┬──────────────────────────────────┘
                   │ SQL Queries
                   │
┌──────────────────▼──────────────────────────────────┐
│          SQLite Database (better-sqlite3)            │
│  ┌──────────────────────────────────────────────┐  │
│  │  Tables:                                      │  │
│  │  - workers                                    │  │
│  │  - salary_records                             │  │
│  │  - materials                                  │  │
│  │  - project_settings                           │  │
│  └──────────────────────────────────────────────┘  │
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │  Files:                                       │  │
│  │  - data.db (main database)                    │  │
│  │  - data.db-shm (shared memory)                │  │
│  │  - data.db-wal (write-ahead log)              │  │
│  └──────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **Framework**: React 19.2.4
- **Build Tool**: Next.js 16.2.6 (App Router)
- **Styling**: Tailwind CSS 4
- **Language**: TypeScript 5

### Backend
- **Runtime**: Node.js 18+
- **Server**: Next.js API Routes
- **Database**: SQLite with better-sqlite3 12.10.0

### Development
- **Linting**: ESLint 9
- **Package Manager**: npm
- **Port**: 3000 (default)

## Project Structure

```
project-hub/
├── src/
│   ├── app/
│   │   ├── api/                    # API routes
│   │   │   ├── workers/
│   │   │   │   ├── route.ts        # GET/POST workers
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts    # PUT/DELETE worker
│   │   │   ├── records/            # Labor costs
│   │   │   ├── materials/          # Materials
│   │   │   ├── project-settings/   # Project config
│   │   │   └── summary/            # Metrics
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Main dashboard
│   │   └── globals.css             # Global styles
│   └── lib/
│       ├── db.ts                   # Database connection
│       ├── format.ts               # Utility functions
│       └── types.ts                # TypeScript types
├── public/                         # Static assets
├── docs/                           # Documentation
│   ├── GETTING_STARTED.md
│   ├── API_REFERENCE.md
│   ├── CONFIGURATION.md
│   └── ARCHITECTURE.md
├── package.json
├── tsconfig.json
├── next.config.ts
└── tailwind.config.mjs
```

## Database Schema

### workers Table

```sql
CREATE TABLE workers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  contact TEXT DEFAULT '',
  department TEXT DEFAULT '',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Indexes:**
- PRIMARY KEY: id
- Created at for sorting

### salary_records Table

```sql
CREATE TABLE salary_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  worker_id INTEGER NOT NULL,
  week_start TEXT NOT NULL,
  amount REAL NOT NULL,
  status TEXT DEFAULT 'unpaid',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (worker_id) REFERENCES workers(id)
);
```

**Indexes:**
- PRIMARY KEY: id
- FOREIGN KEY: worker_id
- Indexed for filtering: worker_id, status, week_start

### materials Table

```sql
CREATE TABLE materials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  quantity REAL NOT NULL,
  unit TEXT NOT NULL,
  cost REAL NOT NULL,
  date TEXT NOT NULL,
  category TEXT DEFAULT '',
  supplier TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Indexes:**
- PRIMARY KEY: id
- Indexed for filtering: category, date

### project_settings Table

```sql
CREATE TABLE project_settings (
  id INTEGER PRIMARY KEY,
  project_name TEXT,
  pm_name TEXT,
  pm_contact TEXT,
  foreman_name TEXT,
  foreman_contact TEXT,
  currency TEXT DEFAULT 'USD',
  budget REAL DEFAULT 0
);
```

## Data Flow

### Creating a Labor Cost Entry

```
User Input (Form)
    ↓
Frontend Validation
    ↓
POST /api/records
    ↓
Backend Validation (name, amount required)
    ↓
Database Insert (salary_records table)
    ↓
Return New Record
    ↓
Update Frontend State
    ↓
Refresh Summary Metrics
```

### Retrieving Filtered Data

```
User Sets Filters
    ↓
Build Query String (?worker_id=1&status=paid&from=...)
    ↓
GET /api/records?query=string
    ↓
Parse Query Parameters
    ↓
Build SQL WHERE Clause
    ↓
Execute Query
    ↓
Return Filtered Results
    ↓
Update Frontend Table
```

## Key Components

### Frontend Components (page.tsx)

1. **SectionTitle**: Display section headers with optional actions
2. **MetricCard**: Show key metrics (total spend, pending, etc.)
3. **EmptyState**: Display when no data available
4. **StatusBadge**: Show payment status indicators
5. **Tab Navigation**: Switch between sections

### API Endpoints

All endpoints follow RESTful conventions:

```
GET    /api/workers              - List all
POST   /api/workers              - Create
PUT    /api/workers/:id          - Update
DELETE /api/workers/:id          - Delete

GET    /api/records              - List with filters
POST   /api/records              - Create
PUT    /api/records/:id          - Update
DELETE /api/records/:id          - Delete

GET    /api/materials            - List with filters
POST   /api/materials            - Create
PUT    /api/materials/:id        - Update
DELETE /api/materials/:id        - Delete

GET    /api/project-settings     - Get config
PUT    /api/project-settings     - Update config

GET    /api/summary              - Get metrics
```

## State Management

### Frontend State (React Hooks)

```typescript
// Data State
const [workers, setWorkers] = useState<Worker[]>([]);
const [salaryRecords, setSalaryRecords] = useState<SalaryRecord[]>([]);
const [materials, setMaterials] = useState<Material[]>([]);
const [settings, setSettings] = useState<ProjectSettings | null>(null);
const [summary, setSummary] = useState<Summary>(emptySummary);

// Form State
const [workerDraft, setWorkerDraft] = useState<WorkerDraft>(emptyWorker);
const [materialDraft, setMaterialDraft] = useState<MaterialDraft>(emptyMaterial());

// Filter State
const [salaryFilters, setSalaryFilters] = useState<SalaryFilters>({...});
const [materialFilters, setMaterialFilters] = useState<MaterialFilters>({...});

// UI State
const [tab, setTab] = useState<Tab>("dashboard");
const [notice, setNotice] = useState<Notice>(null);
```

## Styling Architecture

### Tailwind CSS Configuration

- **Color Palette**: Blue/slate theme with emerald, amber, rose accents
- **Typography**: Inter font family
- **Spacing**: Consistent padding/margin scale
- **Responsive**: Mobile-first design with md/lg breakpoints

### Component Styles

```css
.panel         - Card container (white bg, border)
.metric-card   - Metric display box
.control       - Input/select fields
.button        - Action buttons (primary/secondary)
.data-table    - Data display table
.filter-bar    - Filter controls
.ledger-row    - List item row
```

## Performance Considerations

### Database Optimization

1. **Indexes**: Created on frequently queried fields
2. **WAL Mode**: Enables better concurrency
3. **Pagination**: Not yet implemented but recommended for 10k+ records
4. **Query Limits**: No default limit (consider adding)

### Frontend Optimization

1. **Server Components**: Utilize Next.js Server Components where possible
2. **Lazy Loading**: Export functionality loads CSV asynchronously
3. **Memoization**: useMemo for expensive calculations
4. **Code Splitting**: Next.js automatic code splitting

### Caching

Currently minimal. Consider adding:
- HTTP cache headers for static assets
- Database query caching for summary metrics
- Browser localStorage for form drafts

## Security Considerations

### Current State
- No authentication
- No authorization
- All endpoints public
- No input sanitization beyond basic validation

### Recommended Enhancements

1. **Authentication**: Add JWT or session-based auth
2. **Authorization**: Role-based access control
3. **Input Validation**: Strengthen validation rules
4. **SQL Injection**: Use parameterized queries (already done)
5. **HTTPS**: Enforce in production
6. **CORS**: Configure for API access restrictions
7. **Rate Limiting**: Prevent abuse
8. **Data Encryption**: Encrypt sensitive fields

## Error Handling

### HTTP Error Responses

```json
{
  "error": "Name is required"
}
```

### Frontend Error Handling

- Try-catch blocks around API calls
- Toast notifications for user feedback
- Console logging for debugging
- Graceful degradation on network errors

## Testing Strategy

### Unit Tests (Recommended)
- API route handlers
- Utility functions
- Data validation logic

### Integration Tests (Recommended)
- Database operations
- API endpoint flows
- Data consistency

### E2E Tests (Recommended)
- User workflows
- Report generation
- Data export

## Scalability Limits

### SQLite Limitations
- ~100 concurrent connections reasonable
- File-based, not network transparent
- Better for <1GB databases
- ACID compliant but slower than alternatives

### Recommended Scaling Path

1. **Phase 1** (1-10 projects): Current SQLite setup
2. **Phase 2** (10-100 projects): Add caching layer
3. **Phase 3** (100+ projects): Migrate to PostgreSQL
4. **Phase 4** (1000+ projects): Implement micro-services

## Deployment Architecture

### Development
- Single machine
- SQLite file database
- Hot reload enabled

### Production - Small (1-10 users)
- Single machine or small VPS
- SQLite with regular backups
- Reverse proxy (Nginx)
- HTTPS

### Production - Medium (10-100 users)
- Multiple application servers behind load balancer
- Shared database (requires migration from SQLite)
- CDN for static assets
- Monitoring and alerting

### Production - Large (100+ users)
- Kubernetes cluster
- Managed database service
- Auto-scaling
- Multi-region deployment

## Future Enhancements

1. **Multi-tenancy**: Support multiple companies
2. **Real-time Collaboration**: WebSocket for live updates
3. **Mobile App**: React Native companion app
4. **Advanced Analytics**: Charts and trend analysis
5. **Integrations**: QuickBooks, Stripe, etc.
6. **Mobile-first Design**: Better mobile UX
7. **Offline Support**: Service workers for offline capability
8. **Audit Trail**: Track all data changes

## Monitoring & Logging

### Recommended Tools
- **APM**: New Relic, DataDog, or Sentry
- **Logging**: Pino or Winston
- **Metrics**: Prometheus
- **Alerts**: PagerDuty

### Key Metrics to Track
- API response times
- Error rates
- Database query times
- User activity
- Data backup status

---

**Document Version**: 1.0  
**Last Updated**: 2026-06-20  
**Architecture Review**: Quarterly
