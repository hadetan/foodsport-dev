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

-   [ ] Single endpoint returns all necessary dashboard data
-   [ ] Proper error handling and validation
-   [ ] Response caching (1-minute TTL)
-   [ ] Date range filtering works correctly
-   [ ] All counts and statistics are accurate
-   [ ] Response includes recent user signups
-   [ ] Response includes recent activity logs
-   [ ] Proper security and authentication checks

**Current Status**: Not Started  
**Notes**: Implement proper caching headers for optimal performance

---

## User Management API

### Story #AA2: User Management API Implementation

**Title**: Create user management API endpoints  
**Description**: Implement API endpoints for user management functionality  
**Scope**:

-   User listing with filters
-   User details retrieval
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

GET /api/admin/users/{userId}
Response: Detailed user object with all related data

PATCH /api/admin/users/{userId}
Request: {
  status?: "active" | "banned" | "locked",
  role?: string,
  reason?: string
}
```

**Acceptance Criteria**:

-   [ ] User listing endpoint with filtering and pagination
-   [ ] Detailed user info endpoint
-   [ ] PATCH endpoint for user updates
-   [ ] Proper validation of inputs
-   [ ] Error handling with meaningful messages
-   [ ] Audit logging for status changes
-   [ ] Response caching where appropriate
-   [ ] Security and permission checks

**Current Status**: Not Started  
**Notes**: Use database triggers for audit logging

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
    startDate: string,
    endDate: string,
    location: string
  }],
  pagination: {
    page: number,
    limit: number,
    total: number
  }
}

POST /api/admin/activities
Request: FormData with activity fields and images

PATCH /api/admin/activities/{activityId}
Request: {
  status?: "draft" | "active" | "closed",
  title?: string,
  description?: string,
  type?: string,
  // other optional fields
}
```

**Acceptance Criteria**:

-   [ ] Activity listing with filtering and pagination
-   [ ] Activity creation with image upload
-   [ ] Activity update endpoint
-   [ ] Status management functionality
-   [ ] Input validation
-   [ ] Error handling
-   [ ] Security checks
-   [ ] Audit logging

**Current Status**: Not Started  
**Notes**: Implement proper file upload handling

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
