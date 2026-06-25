# Pulse — API Reference

All endpoints return JSON. Authenticated endpoints require a valid Supabase session cookie (set automatically on login).

## Base URL

```
http://localhost:3000/api
https://worker-pay.vercel.app/api
```

## Authentication

All endpoints except auth pages require authentication. Unauthenticated requests return:

```json
{ "error": "Unauthorized" }
```

## Response Format

**Success:**
```json
{ "id": 1, "name": "John Doe", ... }
```

**Error:**
```json
{ "error": "Name is required" }
```

---

## Workers

### List
**GET** `/workers` → 200

### Create
**POST** `/workers`
```json
{ "name": "Jane Smith", "contact": "555-5678", "department": "Carpenter" }
```
→ 201

### Update
**PUT** `/workers/:id`
→ 200

### Delete
**DELETE** `/workers/:id`
→ 200 `{ "success": true, "id": 2 }`

---

## Labor Records

### List
**GET** `/records`

Query params: `worker_id`, `status` (paid/unpaid), `from`, `to`, `q` (search name/phone/dept)

→ 200

### Create
**POST** `/records`
```json
{ "worker_id": 1, "week_start": "2026-06-16", "amount": 500, "status": "unpaid" }
```
→ 201

### Update
**PUT** `/records/:id` → 200

### Delete
**DELETE** `/records/:id` → 200

---

## Materials

### List
**GET** `/materials`

Query params: `category`, `from`, `to`, `q` (search name/supplier/notes)

→ 200

### Create
**POST** `/materials`
```json
{ "name": "Concrete", "quantity": 50, "unit": "bags", "cost": 1500, "date": "2026-06-20", "category": "Cement" }
```
→ 201

### Update
**PUT** `/materials/:id` → 200

### Delete
**DELETE** `/materials/:id` → 200

---

## Project Settings

### Get
**GET** `/project-settings` → 200

### Update
**PUT** `/project-settings`
```json
{ "project_name": "...", "pm_name": "...", "pm_contact": "...", "foreman_name": "...", "foreman_contact": "...", "currency": "KES", "budget": 50000 }
```
→ 200

---

## Summary

### Get
**GET** `/summary`

```json
{
  "salaryTotal": 5000, "paidTotal": 3000, "unpaidTotal": 2000,
  "materialTotal": 8000, "grandTotal": 13000,
  "workerCount": 5, "recordCount": 10, "materialCount": 15,
  "unpaidRecordCount": 4,
  "budget": 50000, "budgetRemaining": 37000, "budgetUsedPercent": 26
}
```

---

## Notifications

### Send
**POST** `/notifications/send`
```json
{
  "channel": "email",
  "to": "worker@example.com",
  "template": "wage-paid",
  "data": { "name": "John", "amount": "5000" }
}
```

Channels: `email`, `sms`, `whatsapp`

Templates: `wage-paid`, `budget-threshold`, `welcome` (varies by channel)

→ `{ "success": true, "id": "..." }` or `{ "success": false, "error": "..." }`

---

## Send SMS (Direct)

**POST** `/send-sms`
```json
{ "to": "+254712345678", "message": "Your OTP code is 1234" }
```

→ `{ "success": true, "sid": "SM..." }` or `{ "success": false, "error": "..." }`

---

## Status Codes

| Status | Meaning |
|--------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation) |
| 401 | Unauthorized (no session) |
| 404 | Not Found |
| 500 | Server Error |
