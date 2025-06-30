# Admin API Stories

## Story Status Legend

-   **Not Started** - Story not yet implemented
-   **In Progress** - Story currently being worked on
-   **Review** - Story completed, awaiting review
-   **Done** - Story completed and approved

---

## Dashboard API

### Story #AA1: Admin Dashboard API Implementation

**Title**: Create consolidated admin dashboard API  
**Description**: Implement a single API endpoint for all admin dashboard data  
**Scope**:

-   Combined dashboard statistics endpoint
-   Basic metrics and counts
-   Recent activity data
-   Cached responses

**API Endpoint**:
`GET /api/admin/dashboard`
Query Parameters:

-   dateRange: '24h' | '7d' | '30d' (default: '7d')

Response Structure:

```json
{
  "stats": {
    "totalUsers": number,
    "activeActivities": number,
    "totalRewards": number,
    "totalDonations": number,
    "dailyStats": {
      "newUsers": number,
      "completedActivities": number,
      "caloriesDonated": number
    }
  },
  "recentSignups": [
    {
      "id": string,
      "name": string,
      "email": string,
      "signupDate": string,
      "status": string
    }
  ],
  "activityLogs": [
    {
      "id": string,
      "type": string,
      "action": string,
      "userId": string,
      "details": object,
      "timestamp": string
    }
  ]
}
```

**Acceptance Criteria**:

-   [x] Single endpoint returns all necessary dashboard data
-   [x] Proper error handling and validation
-   [x] Response caching (1-minute TTL)
-   [x] Date range filtering works correctly
-   [x] All counts and statistics are accurate
-   [x] Response includes recent user signups
-   [x] Response includes recent activity logs
-   [x] Proper security and authentication checks (admin-only access)

**Current Status**: Done  
**Notes**: All acceptance criteria met. API is admin-only, returns all required dashboard data, supports caching, and is production-ready.

---

## User Management API

### Story #AA2: User Management API Implementation

**Title**: Create user management API endpoints  
**Description**: Implement API endpoints for user management functionality  
**Scope**:

-   User listing with filters
-   User status management
-   Simple PATCH operation for user updates

**API Endpoints**:

```
GET /api/admin/users
Query params: search, status, page, limit, sortBy, sortOrder
Response: {
  users: [{
    id: string,
    name: string,
    email: string,
    status: string,
    joinDate: string,
    lastActive: string,
    stats: {
      totalActivities: number,
      totalDonations: number,
      badgeCount: number
    }
  }],
  pagination: {
    page: number,
    limit: number,
    total: number
  }
}

PATCH /api/admin/users/{userId}
Request: {
  status?: "active" | "banned" | "locked",
  role?: "admin" | "user",
  reason?: string
}
Response: Updated user object with audit log entry
```

**Acceptance Criteria**:

-   [x] User listing endpoint with filtering and pagination (returns all users, not single user by id)
-   [x] PATCH endpoint for user updates (status, role, reason)
-   [x] Proper validation of inputs
-   [x] Error handling with meaningful messages
-   [x] Audit logging for status/role changes
-   [x] Response caching where appropriate
-   [x] Security and permission checks (admin-only)

**Current Status**: Done  
**Notes**: User listing endpoint returns all users for admin. PATCH endpoint for user updates is implemented. Filtering, pagination, admin-only access, input validation, audit logging, and caching are all in place. Stats fields and related data are included.

---

## Activity Management API

### Story #AA3: Activity Management API Implementation

**Title**: Create activity management API endpoints  
**Description**: Implement API endpoints for managing activities  
**Scope**:

-   Activity CRUD operations
-   Status management
-   Simple file uploads

**API Endpoints**:

```
GET /api/admin/activities
Query params: status, page, limit, type
Response: {
  activities: [{
    id: string,
    title: string,
    status: string,
    type: string,
    participantCount: number,
    participantLimit: number,
    startDate: string,
    endDate: string,
    startTime: string,   // <-- required
    endTime: string,     // <-- required
    location: string
  }],
  pagination: {
    page: number,
    limit: number,
    total: number
  }
}

POST /api/admin/activities
Request: FormData with required fields:
  - title (string, required)
  - type (string, required)
  - location (string, required)
  - startDate (string, required)
  - endDate (string, required)
  - startTime (string, required)
  - endTime (string, required)
Optional fields:
  - description (string)
  - status (string)
  - image (file)
  - participantLimit (number)
Response: Created activity object

PATCH /api/admin/activities/{activityId}
Request: {
  status?: "draft" | "active" | "closed" | "upcoming" | "completed" | "cancelled" | "open",
  title?: string,
  description?: string,
  type?: string,
  location?: string,
  startDate?: string,
  endDate?: string,
  startTime?: string,
  endTime?: string,
  participantLimit?: number
  // other optional fields
}
Response: Updated activity object with audit log entry
```

**Acceptance Criteria**:

-   [x] Activity listing with filtering and pagination (includes participantLimit)
-   [x] Activity creation with image upload and participantLimit
-   [x] Activity update endpoint (can update participantLimit)
-   [x] Status management functionality
-   [x] Input validation (including startTime and endTime required)
-   [x] Error handling
-   [x] Security checks
-   [x] Audit logging
-   [x] Response caching where appropriate

**Current Status**: Done  
**Notes**: All endpoints (listing, creation, update) implemented with validation, file upload, audit logging, error handling, security, and caching. participantLimit, startTime, and endTime are now supported and required as per schema.

---

## Implementation Notes (Decisions & Clarifications)

- **Authentication/Authorization:** All admin and user authentication/authorization will use Supabase Auth.
- **File Uploads:** Supabase Storage will be used for file uploads (a bucket will be created as needed).
- **Admin Role Model:** The `users` table will be updated to include an `is_admin BOOLEAN DEFAULT FALSE` column for admin checks.
- **Audit Logging:** A simple `audit_logs` table will be added for admin actions, to keep audit logging straightforward and easy to query.

---

## Summary

**Total API Stories**: 3  
**Current Status Breakdown**:

-   Not Started: 3
-   In Progress: 0
-   Review: 0
-   Done: 0

**Priority Order**:

1. Story #AA1 (Dashboard API) - Core Functionality
2. Story #AA2 (User Management API) - User Administration
3. Story #AA3 (Activity Management API) - Content Management

**Technical Requirements**:

-   Next.js 13+ API Routes
-   Supabase Database
-   File Upload Handling
-   Input Validation
-   Error Handling
-   Response Caching
-   Audit Logging

**Security Requirements**:

-   Authentication
-   Authorization
-   Input Sanitization
-   Rate Limiting
-   Secure File Upload
