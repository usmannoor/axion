# School Management System API (Axion Template)

This repository implements the **School Management System REST API** required in the technical challenge, using the **Axion** project template and its existing patterns (manager-based architecture, response dispatcher, token manager, Pine validation, etc.).

## Tech Stack

- Node.js + Express
- MongoDB (Mongoose) for persistence
- JWT authentication (long token)
- RBAC (Superadmin + School Administrator)
- Validation using Axion's Pine validator loader (`*.schema.js`)
- Security: Helmet + rate limiting

---

## Setup

### 1) Prerequisites
- Node.js 18+
- MongoDB (local or MongoDB Atlas)
- Redis (recommended for Axion Cortex features; local is fine)

### 2) Install
```bash
npm install
```

### 3) Environment variables
Copy `.env.example` to `.env` and update values:
```bash
cp .env.example .env
```

### 4) Run
```bash
npm run dev
# or
npm start
```

Default base URL:
- `http://localhost:5111/api`

Health check:
- `GET /api/health`

---

## Authentication Flow

### Bootstrap superadmin (one-time)
Creates the initial superadmin **only if none exists**.

`POST /api/auth/bootstrap-superadmin`
```json
{
  "name": "Super Admin",
  "email": "superadmin@example.com",
  "password": "Password1234!"
}
```

### Login
`POST /api/auth/login`
```json
{
  "email": "superadmin@example.com",
  "password": "Password1234!"
}
```

Response contains a `longToken`.

### Auth header
Use either header:
- `Authorization: Bearer <longToken>`
- `token: <longToken>` (legacy Axion header)

---

## RBAC Rules

### Roles
- **superadmin**
  - Full system access
  - Manages Schools
  - Can create School Administrators for a specific school
- **school_admin**
  - Restricted to assigned school (`school` claim in JWT)
  - Can manage Classrooms and Students inside the assigned school only

---

## API Documentation

### Auth
| Method | Endpoint | Role | Description |
|---|---|---|---|
| POST | `/api/auth/bootstrap-superadmin` | public | Create initial superadmin (only once) |
| POST | `/api/auth/login` | public | Login and receive JWT long token |
| POST | `/api/auth/school-admins` | superadmin | Create a school admin for a school |

### Schools (Superadmin only)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/schools` | Create school |
| GET | `/api/schools` | List schools |
| GET | `/api/schools/:id` | Get a school |
| PUT | `/api/schools/:id` | Update school |
| DELETE | `/api/schools/:id` | Delete school |

Example create:
```json
{
  "name": "Green Valley School",
  "address": "Dubai, UAE",
  "contactEmail": "info@greenvalley.edu",
  "phone": "+971501234567"
}
```

### Classrooms (School scoped for school_admin)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/classrooms` | Create classroom |
| GET | `/api/classrooms` | List classrooms (school scoped) |
| PUT | `/api/classrooms/:id` | Update classroom |
| DELETE | `/api/classrooms/:id` | Delete classroom |

Create example:
```json
{
  "name": "Grade 5 - A",
  "capacity": 30,
  "resources": ["Projector", "Whiteboard"]
}
```

> If you are `superadmin`, you may optionally provide `schoolId` in body for classroom creation.  
> If you are `school_admin`, the classroom is always created in your assigned school.

### Students (Enrollment + Transfer)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/students` | Enroll student |
| GET | `/api/students` | List students (school scoped) |
| PUT | `/api/students/:id` | Update student |
| DELETE | `/api/students/:id` | Remove student |
| PUT | `/api/students/:id/transfer` | Transfer student |

Enroll example:
```json
{
  "firstName": "Ali",
  "lastName": "Khan",
  "email": "ali.khan@student.com",
  "classroomId": "OPTIONAL_CLASSROOM_ID"
}
```

Transfer example:
```json
{
  "targetSchoolId": "TARGET_SCHOOL_ID",
  "targetClassroomId": "OPTIONAL_TARGET_CLASSROOM_ID"
}
```

---

## Error Handling / Status Codes

Standard format:
```json
{
  "ok": false,
  "data": {},
  "errors": ["..."],
  "message": "..."
}
```

Common HTTP codes:
- `200` OK
- `201` Created
- `400` Validation error / bad request
- `401` Unauthorized (missing/invalid token)
- `403` Forbidden (RBAC)
- `404` Not found
- `409` Conflict (duplicate / bootstrap already done)
- `500` Internal Server Error

---

## Database Schema

### Collections
- `users`
- `schools`
- `classrooms`
- `students`

### Diagram (simplified)
```
User (superadmin) 1 ---- * School
User (school_admin) * ---- 1 School

School 1 ---- * Classroom
School 1 ---- * Student
Classroom 1 ---- * Student (optional)
```

---

## Tests (Jest + Supertest)

> Tests require MongoDB available via `MONGO_URI` in `.env`.

Run:
```bash
npm test
```

Included test cases:
- Bootstrap superadmin and login
- RBAC blocks unauthenticated access

---

## Deployment Instructions (example: Render)

1. Create MongoDB Atlas database and get connection string
2. (Optional) Create Redis (Upstash/Render Redis) if you want Axion Cortex enabled
3. Create a Render Web Service from your GitHub repo
4. Set environment variables from `.env.example`
5. Start command:
```bash
npm start
```

## Postman Collection

To quickly test the API, import these Postman files:

- Collection: `postman/school-api.collection.json`
- Environment: `postman/school-api.environment.json`

### Import Steps
1. Open Postman
2. Click **Import**
3. Select the collection + environment JSON files above
4. Select the environment **Local (School API)**
5. Ensure `baseUrl` is set to your running server (example: `http://localhost:5111`)

### Recommended Run Order
1. **Auth → Bootstrap Superadmin (one-time)**
2. **Auth → Login** (auto-saves token)
3. **Schools → Create School** (auto-saves schoolId)
4. **Auth → Create School Admin**
5. Login as School Admin (change credentials in Login request)
6. **Classrooms → Create Classroom**
7. **Students → Create Student**
8. **Students → Transfer Student**

---

## Assumptions / Notes

- Superadmin is bootstrapped once through `/api/auth/bootstrap-superadmin`
- School admins are created by superadmin via `/api/auth/school-admins`
- School admins are **restricted** to their assigned school via JWT claim (`school`)

