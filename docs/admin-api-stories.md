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
-   [x] Proper security and authentication checks (admin-only access, checked via admin_user table)

**Current Status**: Done  
**Notes**: All acceptance criteria met. API is admin-only (checked via admin_user table), returns all required dashboard data, supports caching, and is production-ready.

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
  reason?: string
}
Response: Updated user object with audit log entry
```

**Acceptance Criteria**:

-   [x] User listing endpoint with filtering and pagination (returns all users, not single user by id)
-   [x] PATCH endpoint for user updates (status, reason)
-   [x] Proper validation of inputs
-   [x] Error handling with meaningful messages
-   [x] Audit logging for status changes
-   [x] Response caching where appropriate
-   [x] Security and permission checks (admin-only, checked via admin_user table)

**Current Status**: Done  
**Notes**: User listing endpoint returns all users for admin. PATCH endpoint for user updates is implemented. Filtering, pagination, admin-only access (checked via admin_user table), input validation, audit logging, and caching are all in place. Stats fields and related data are included.

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
-   [x] Security checks (admin-only, checked via admin_user table)
-   [x] Audit logging
-   [x] Response caching where appropriate

**Current Status**: Done  
**Notes**: All endpoints (listing, creation, update) implemented with validation, file upload, audit logging, error handling, security (checked via admin_user table), and caching. participantLimit, startTime, and endTime are now supported and required as per schema.

---

## Admin Authentication API

### Story #AA4: Admin Login API

**Title**: Admin-only login endpoint  
**Description**: Implement an API endpoint that allows only users with an entry in the admin_user table to log in to the admin panel. Regular users should not be able to log in via this endpoint.
**Scope**:
- Admin login with email and password
- Only users with a record in `admin_user` can authenticate as admin
- Returns Supabase Auth session on success (no manual JWT or password handling)
- Proper error messages for non-admins or invalid credentials
- Audit logging for all login attempts (success and failure)
- Uses Supabase Auth for session/token management and password security

**API Endpoint**:
```
POST /api/admin/login
Request: {
  email: string,
  password: string
}
Response (success): {
  session: object, // Supabase Auth session object
  admin: {
    id: string, // admin_user id
    user_id: string, // reference to users.id
    name: string,
    email: string
  }
}
Response (failure): {
  error: string
}
```

**Acceptance Criteria**:
- [x] Only users with an entry in admin_user can log in via this endpoint
- [x] Returns Supabase Auth session and admin info on success
- [x] Returns error for non-admins or invalid credentials
- [x] No manual password or JWT handling; all authentication and password security is managed by Supabase Auth
- [x] Audit logging for login attempts

**Current Status**: Done  
**Notes**: Endpoint implemented with Supabase Auth for authentication and password security. Admin check is now performed via admin_user table, audit logging, and error handling are in place. No manual password or JWT/session handling is performed.

---

### Story #AA5: Admin Creation API

**Title**: Create new admin users  
**Description**: Implement an API endpoint that allows existing admins (checked via admin_user table) to create new admin users who can log in via the admin login API.
**Scope**:
- Only authenticated admins (checked via admin_user table) can create new admins
- New admin must have unique email (returns a simple error message if email exists)
- Uses Supabase Auth's signUp method to create the user, then inserts a record into admin_user table
- Only name, email, password, and admin fields are set (no extra fields in users table)
- Audit logging for admin creation (success and failure)
- On success, returns a success message and the Supabase Auth session if available (no need to return full user object)

**API Endpoint**:
```
POST /api/admin/users
Request: {
  name: string,
  email: string,
  password: string
}
Response (success): {
  message: string, // e.g. "Admin user created successfully."
  session?: object // Supabase Auth session object if available
}
Response (failure): {
  error: string // e.g. "Email already exists."
}
```

**Acceptance Criteria**:
- [x] Only authenticated admins (checked via admin_user table) can create new admins
- [x] New admin must have unique email (returns a simple error message if not)
- [x] Uses Supabase Auth signUp and inserts into admin_user table
- [x] Only name, email, password fields are set in users table; admin fields are in admin_user
- [x] Audit logging for admin creation (success and failure)
- [x] On success, returns a message and session if available (no need for full user object)
- [x] New admin can log in via admin login API

**Current Status**: Done  
**Notes**: Endpoint implemented using Supabase Auth signUp, admin check (via admin_user table), audit logging, and error handling. Only required fields are set. Returns a message and session if available.

---

## Implementation Notes (Decisions & Clarifications)

- **Authentication/Authorization:** All admin and user authentication/authorization will use Supabase Auth. Admin status is determined by presence in the `admin_user` table, not by a field in `users`.
- **Admin Role Model:** The `admin_user` table contains all admin-specific fields (role, status, reason, etc). The `users` table contains only general user profile fields.
- **File Uploads:** Supabase Storage will be used for file uploads (a bucket will be created as needed).
- **Audit Logging:** A simple `audit_logs` table will be used for admin actions, to keep audit logging straightforward and easy to query.

---

## Summary

**Total API Stories**: 5  
**Current Status Breakdown**:

-   Not Started: 0
-   In Progress: 0
-   Review: 0
-   Done: 5

**Priority Order**:

1. Story #AA1 (Dashboard API) - Core Functionality
2. Story #AA2 (User Management API) - User Administration
3. Story #AA3 (Activity Management API) - Content Management
4. Story #AA4 (Admin Login API) - Authentication
5. Story #AA5 (Admin Creation API) - User Management

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
-   Authorization (admin checked via admin_user table)
-   Input Sanitization
-   Rate Limiting
-   Secure File Upload
