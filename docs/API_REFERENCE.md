# ProjectHub API Reference

Complete API documentation for ProjectHub. All endpoints return JSON responses.

## Base URL

```
http://localhost:3000/api
```

## Authentication

Currently, ProjectHub does not implement authentication. All API endpoints are publicly accessible. For production deployments, implement authentication middleware.

## Response Format

All successful responses return JSON:

```json
{
  "id": 1,
  "name": "John Doe",
  "contact": "555-1234",
  "department": "Mason",
  "created_at": "2026-06-20T10:30:00Z"
}
```

Error responses include a message:

```json
{
  "error": "Name is required"
}
```

## Team Members API

### List All Team Members

**GET** `/workers`

Returns all team members sorted by creation date.

**Response:**
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "contact": "555-1234",
    "department": "Mason",
    "created_at": "2026-06-20T10:30:00Z"
  }
]
```

**Status Codes:** 200 OK

---

### Get Single Team Member

**GET** `/workers/:id`

Retrieve details of a specific team member.

**Parameters:**
- `id` (number, path): Team member ID

**Response:**
```json
{
  "id": 1,
  "name": "John Doe",
  "contact": "555-1234",
  "department": "Mason",
  "created_at": "2026-06-20T10:30:00Z"
}
```

**Status Codes:** 
- 200 OK
- 404 Not Found

---

### Create Team Member

**POST** `/workers`

Add a new team member to the project.

**Request Body:**
```json
{
  "name": "Jane Smith",
  "contact": "555-5678",
  "department": "Carpenter"
}
```

**Required Fields:**
- `name` (string, 1-255 chars): Team member's full name

**Optional Fields:**
- `contact` (string): Phone or email contact
- `department` (string): Position or department

**Response:** 201 Created
```json
{
  "id": 2,
  "name": "Jane Smith",
  "contact": "555-5678",
  "department": "Carpenter",
  "created_at": "2026-06-20T11:00:00Z"
}
```

**Status Codes:**
- 201 Created
- 400 Bad Request (missing name)

---

### Update Team Member

**PUT** `/workers/:id`

Update team member information.

**Parameters:**
- `id` (number, path): Team member ID

**Request Body:**
```json
{
  "name": "Jane Smith Updated",
  "contact": "555-9999",
  "department": "Lead Carpenter"
}
```

**Response:** 200 OK
```json
{
  "id": 2,
  "name": "Jane Smith Updated",
  "contact": "555-9999",
  "department": "Lead Carpenter",
  "created_at": "2026-06-20T11:00:00Z"
}
```

**Status Codes:**
- 200 OK
- 404 Not Found

---

### Delete Team Member

**DELETE** `/workers/:id`

Remove a team member from the project.

**Parameters:**
- `id` (number, path): Team member ID

**Response:** 200 OK
```json
{
  "success": true,
  "id": 2
}
```

**Status Codes:**
- 200 OK
- 404 Not Found

---

## Labor Costs API

### List Labor Cost Records

**GET** `/records`

Retrieve all labor cost records with optional filtering.

**Query Parameters:**
- `worker_id` (number): Filter by team member
- `status` (string): "paid" or "unpaid"
- `from` (string, ISO date): Start date filter
- `to` (string, ISO date): End date filter
- `q` (string): Search worker name, department, phone

**Response:**
```json
[
  {
    "id": 1,
    "worker_id": 1,
    "worker_name": "John Doe",
    "worker_contact": "555-1234",
    "worker_department": "Mason",
    "week_start": "2026-06-16",
    "amount": 500.00,
    "status": "unpaid",
    "created_at": "2026-06-20T10:30:00Z",
    "updated_at": "2026-06-20T10:30:00Z"
  }
]
```

**Status Codes:** 200 OK

---

### Create Labor Cost Record

**POST** `/records`

Add a new labor cost entry.

**Request Body:**
```json
{
  "worker_id": 1,
  "week_start": "2026-06-16",
  "amount": 500.00,
  "status": "unpaid"
}
```

**Required Fields:**
- `worker_id` (number): ID of team member
- `week_start` (string, ISO date): Monday of the week
- `amount` (number): Cost amount
- `status` (string): "paid" or "unpaid"

**Response:** 201 Created
```json
{
  "id": 1,
  "worker_id": 1,
  "week_start": "2026-06-16",
  "amount": 500.00,
  "status": "unpaid",
  "created_at": "2026-06-20T10:30:00Z"
}
```

**Status Codes:**
- 201 Created
- 400 Bad Request

---

### Update Labor Cost Record

**PUT** `/records/:id`

Modify a labor cost entry or update payment status.

**Parameters:**
- `id` (number, path): Record ID

**Request Body:**
```json
{
  "week_start": "2026-06-16",
  "amount": 550.00,
  "status": "paid"
}
```

**Response:** 200 OK
```json
{
  "id": 1,
  "worker_id": 1,
  "week_start": "2026-06-16",
  "amount": 550.00,
  "status": "paid",
  "updated_at": "2026-06-20T12:00:00Z"
}
```

**Status Codes:**
- 200 OK
- 404 Not Found

---

### Delete Labor Cost Record

**DELETE** `/records/:id`

Remove a labor cost record.

**Parameters:**
- `id` (number, path): Record ID

**Response:** 200 OK

**Status Codes:**
- 200 OK
- 404 Not Found

---

## Materials API

### List Materials

**GET** `/materials`

Retrieve all material entries with optional filtering.

**Query Parameters:**
- `category` (string): Filter by material category
- `from` (string, ISO date): Start date filter
- `to` (string, ISO date): End date filter
- `q` (string): Search material name, supplier, notes

**Response:**
```json
[
  {
    "id": 1,
    "name": "Concrete Mix",
    "quantity": 50,
    "unit": "bags",
    "cost": 1500.00,
    "date": "2026-06-20",
    "category": "Concrete",
    "supplier": "BuildCo Supply",
    "notes": "Premium grade",
    "created_at": "2026-06-20T10:30:00Z"
  }
]
```

**Status Codes:** 200 OK

---

### Create Material Entry

**POST** `/materials`

Add a new material purchase record.

**Request Body:**
```json
{
  "name": "Steel Reinforcement",
  "quantity": 100,
  "unit": "kg",
  "cost": 2000.00,
  "date": "2026-06-20",
  "category": "Steel",
  "supplier": "Metro Steel Ltd",
  "notes": "Grade A, delivery included"
}
```

**Required Fields:**
- `name` (string): Material name
- `quantity` (number): Amount purchased
- `unit` (string): Unit type (kg, meters, bags, pcs, etc.)
- `cost` (number): Total cost
- `date` (string, ISO date): Purchase date
- `category` (string): Material category

**Optional Fields:**
- `supplier` (string): Where purchased
- `notes` (string): Additional details

**Response:** 201 Created
```json
{
  "id": 2,
  "name": "Steel Reinforcement",
  "quantity": 100,
  "unit": "kg",
  "cost": 2000.00,
  "date": "2026-06-20",
  "category": "Steel",
  "supplier": "Metro Steel Ltd",
  "notes": "Grade A, delivery included",
  "created_at": "2026-06-20T11:00:00Z"
}
```

**Status Codes:**
- 201 Created
- 400 Bad Request

---

### Update Material Entry

**PUT** `/materials/:id`

Modify a material record.

**Parameters:**
- `id` (number, path): Material ID

**Request Body:**
```json
{
  "name": "Steel Reinforcement",
  "quantity": 120,
  "unit": "kg",
  "cost": 2400.00,
  "date": "2026-06-20",
  "category": "Steel",
  "supplier": "Metro Steel Ltd",
  "notes": "Revised quantity"
}
```

**Response:** 200 OK

**Status Codes:**
- 200 OK
- 404 Not Found

---

### Delete Material Entry

**DELETE** `/materials/:id`

Remove a material record.

**Parameters:**
- `id` (number, path): Material ID

**Response:** 200 OK

**Status Codes:**
- 200 OK
- 404 Not Found

---

## Project Settings API

### Get Project Settings

**GET** `/project-settings`

Retrieve current project configuration.

**Response:**
```json
{
  "id": 1,
  "project_name": "Main Construction Project",
  "pm_name": "Alice Johnson",
  "pm_contact": "555-0001",
  "foreman_name": "Bob Smith",
  "foreman_contact": "555-0002",
  "currency": "USD",
  "budget": 50000.00
}
```

**Status Codes:** 200 OK

---

### Update Project Settings

**PUT** `/project-settings`

Modify project configuration.

**Request Body:**
```json
{
  "project_name": "Main Construction Project Phase 2",
  "pm_name": "Alice Johnson",
  "pm_contact": "555-0001",
  "foreman_name": "Bob Smith",
  "foreman_contact": "555-0002",
  "currency": "USD",
  "budget": 75000.00
}
```

**All Fields Required**

**Response:** 200 OK
```json
{
  "id": 1,
  "project_name": "Main Construction Project Phase 2",
  "pm_name": "Alice Johnson",
  "pm_contact": "555-0001",
  "foreman_name": "Bob Smith",
  "foreman_contact": "555-0002",
  "currency": "USD",
  "budget": 75000.00
}
```

**Status Codes:**
- 200 OK
- 404 Not Found

---

## Summary API

### Get Project Summary

**GET** `/summary`

Retrieve aggregated project metrics and statistics.

**Response:**
```json
{
  "salaryTotal": 5000.00,
  "paidTotal": 3000.00,
  "unpaidTotal": 2000.00,
  "materialTotal": 8000.00,
  "grandTotal": 13000.00,
  "workerCount": 5,
  "recordCount": 10,
  "materialCount": 15,
  "unpaidRecordCount": 4,
  "budget": 50000.00,
  "budgetRemaining": 37000.00,
  "budgetUsedPercent": 26.0
}
```

**Fields:**
- `salaryTotal`: Sum of all labor costs
- `paidTotal`: Sum of paid labor costs
- `unpaidTotal`: Sum of pending labor costs
- `materialTotal`: Sum of all material costs
- `grandTotal`: Total spend (labor + materials)
- `workerCount`: Number of team members
- `recordCount`: Number of labor cost records
- `materialCount`: Number of material entries
- `unpaidRecordCount`: Number of pending labor costs
- `budget`: Total project budget
- `budgetRemaining`: Budget - Grand Total
- `budgetUsedPercent`: (Grand Total / Budget) × 100

**Status Codes:** 200 OK

---

## Error Codes

| Status | Meaning | Example |
|--------|---------|---------|
| 200 | Success | Request completed successfully |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid data or missing required field |
| 404 | Not Found | Resource does not exist |
| 500 | Server Error | Internal server error |

---

## Usage Examples

### JavaScript/Fetch

```javascript
// Get all team members
const workers = await fetch('/api/workers').then(r => r.json());

// Add a team member
const newWorker = await fetch('/api/workers', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Jane Doe',
    contact: '555-1234',
    department: 'Electrician'
  })
}).then(r => r.json());

// Get project summary
const summary = await fetch('/api/summary').then(r => r.json());
console.log(`Total spent: $${summary.grandTotal}`);
```

### cURL

```bash
# List all materials
curl http://localhost:3000/api/materials

# Create labor cost record
curl -X POST http://localhost:3000/api/records \
  -H "Content-Type: application/json" \
  -d '{
    "worker_id": 1,
    "week_start": "2026-06-16",
    "amount": 500,
    "status": "unpaid"
  }'
```

---

## Rate Limiting

Currently, there is no rate limiting. For production use, implement rate limiting middleware.

## Versioning

API is currently v1 (no versioning prefix). All endpoints are subject to change.

---

**Last Updated**: 2026-06-20  
**API Version**: 1.0
