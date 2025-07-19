# User API Stories

## Story Status Legend

-   **Not Started** - Story not yet implemented
-   **In Progress** - Story currently being worked on
-   **Review** - Story completed, awaiting review
-   **Done** - Story completed and approved

---

## Activities API

### Story #UA1: Activities API Implementation

**Title**: Implement activities API endpoints  
**Description**: Provide endpoints for users to view all available activities, join an activity, and leave an activity.  
**Scope**:

-   List all activities (global, not user-specific)
-   Join an activity (via `/activities/join`)
-   Leave an activity (via `/activities/leave`)
-   View activity details
-   Caching for GET endpoints

**API Endpoints**:

```
GET /api/activities
Query params: status, page, limit, type
Response: {
  activities: [{
    id: string,
    title: string,
    description?: string,
    activityType: string,
    location: string,
    startDate: string,
    endDate: string,
    startTime: string,
    endTime: string,
    status: string,
    participantLimit?: number,
    currentParticipants: number,
    organizerName?: string,
    organizerId?: string,
    imageUrl?: string,
    pointsPerParticipant: number,
    caloriesPerHour: number,
    isFeatured: boolean,
    joined: boolean, // true if the current user has joined
  }],
  pagination: {
    page: number,
    limit: number,
    total: number
  }
}

GET /api/activities/{activityId}
Response: {
  id: string,
  title: string,
  description?: string,
  activityType: string,
  location: string,
  startDate: string,
  endDate: string,
  startTime: string,
  endTime: string,
  status: string,
  participantLimit?: number,
  currentParticipants: number,
  organizerName?: string,
  organizerId?: string,
  imageUrl?: string,
  pointsPerParticipant: number,
  caloriesPerHour: number,
  isFeatured: boolean,
  joined: boolean
}

POST /api/my/activities/join
Request: {
  activityId: string,
  userId: string
}
Response: {
  message: string // e.g. "Joined activity successfully."
}

POST /api/my/activities/leave
Request: {
  activityId: string,
  userId: string
}
Response: {
  message: string // e.g. "Left activity successfully."
}
```


**Acceptance Criteria**:

-   [x] User can list all activities
-   [x] User can join an activity via /my/activities/join
-   [x] User can leave an activity via /my/activities/leave
-   [x] User can view details of a specific activity
-   [x] GET /api/activities and GET /api/activities/{activityId} responses are cached (1-minute TTL)
-   [x] Proper validation and error handling
-   [ ] Only authenticated users can access `/my/activities/join` &  `/my/activities/leave` endpoints

**Current Status**: Not Started  
**Notes**: Activities are global. Join/leave APIs require userId in the request. All fields match the Activity model in the schema. GET endpoints use the caching mechanism from `src/utils/cache.js` (1-minute TTL).

---

## Login API

### Story #UA2: User Login API Implementation

**Title**: Implement user login API endpoint  
**Description**: Allow users to log in using email and password.  
**Scope**:

-   User login with email and password
-   Returns session/token on success
-   Proper error messages for invalid credentials

**API Endpoint**:

```
POST /api/my/login
Request: {
  email: string,
  password: string
}
Response (success): {
  session: object, // Auth session object
  user: {
    id: string,
    name: string,
    email: string
  }
}
Response (failure): {
  error: string
}
```

**Acceptance Criteria**:

-   [x] User can log in with valid credentials
-   [x] Returns session and user info on success
-   [x] Returns error for invalid credentials
-   [x] No manual password or JWT handling; all authentication managed by Auth provider

**Current Status**: Done  
**Notes**: Standard user login endpoint. All ACs complete.

---

## Profile API

### Story #UA3: User Profile API Implementation

**Title**: Implement user profile API endpoints  
**Description**: Allow users to view and update their profile information.  
**Scope**:

-   Get user profile
-   Update user profile (all editable fields)

**API Endpoints**:

```
GET /api/my/profile
Response: {
  id: string,
  email: string,
  firstname?: string,
  lastname?: string,
  dateOfBirth: string,
  weight?: number,
  height?: number,
  gender?: string,
  activityLevel: string,
  phoneNumber?: string,
  profilePictureUrl?: string,
  border?: string,
  title?: string,
  bio?: string,
  totalActivities: number,
  totalDonations: number,
  badgeCount: number,
  currentStreak: number,
  totalPoints: number,
  totalCaloriesBurned: number,
  totalCaloriesDonated: number,
  calorieGoal: number,
  dailyGoal: number,
  weeklyGoal: number,
  monthlyGoal: number,
  yearlyGoal: number,
  createdAt: string,
  updatedAt: string
}

PATCH /api/my/profile/edit
Request: {
  firstname?: string,
  lastname?: string,
  dateOfBirth?: string,
  weight?: number,
  height?: number,
  gender?: string,
  phoneNumber?: string,
  profilePictureUrl?: string,
  border?: string,
  title?: string,
  bio?: string,
  calorieGoal?: number,
  dailyGoal?: number,
  weeklyGoal?: number,
  monthlyGoal?: number,
  yearlyGoal?: number
}
Response: Updated user profile object
```

**Acceptance Criteria**:

-   [ ] User can view their profile (all fields from User model)
-   [ ] User can update their profile (editable fields only)
-   [ ] Proper validation and error handling
-   [ ] Only authenticated users can access endpoints

**Current Status**: Not Started  
**Notes**: All fields and editable fields are based on the User model in the schema.

---

## Register API

### Story #UA4: User Registration API Implementation

**Title**: Implement multi-step user registration API endpoints  
**Description**: Allow new users to register in multiple steps, collecting required and additional profile information.  
**Scope**:

-   Step 1: Register with email, password, firstname, lastname (`/register`)
-   Step 2: Add personal details (`/register/personal_details`)
-   Step 3: Add additional details (`/register/additional`)

**API Endpoints**:

```
POST /api/register
Request: {
  email: string,
  password: string,
  firstname: string,
  lastname: string
}
Response (success): {
  message: string, // e.g. "User registered successfully."
  session?: object, // Auth session object if available
  userId: string,
}
Response (failure): {
  error: string // e.g. "Email already exists."
}

POST /api/register/personal_details
Request: {
  userId: string,
  dateOfBirth: string, // ISO date
  weight?: number,
  height?: number,
  gender?: string,
  phoneNumber?: string
}
Response (success): {
  message: string // e.g. "Personal details updated."
}
Response (failure): {
  error: string
}

POST /api/register/additional
Request: {
  userId: string,
  profilePictureUrl?: string,
  title?: string,
  bio?: string,
  dailyGoal?: number,
  calorieGoal?: number
}
Response (success): {
  message: string // e.g. "Additional details updated."
}
Response (failure): {
  error: string
}
```

**Acceptance Criteria**:

-   [x] User can register with email, password, firstname, lastname
-   [x] User can add personal details (date of birth, weight, height, gender, phone number)
-   [x] User can add additional details (profile picture, title, bio, daily goal, calorie goal)
-   [x] Proper validation and error handling for each step
-   [x] No duplicate emails allowed
-   [x] Only valid userId can proceed to next steps

**Current Status**: Done  
**Notes**: Registration is a multi-step process. All fields are based on the User model in the schema. All ACs complete.

---

## Implementation Notes (Decisions & Clarifications)

- **Authentication/Authorization:** All user authentication/authorization will use the Auth provider (e.g., Supabase Auth). Only authenticated users can access "my" endpoints.
- **User Role Model:** No special admin checks; endpoints are for regular users.
- **File Uploads:** If profile/avatar upload is supported, use secure storage (e.g., Supabase Storage).
- **Audit Logging:** Not required unless specified in future stories.

---

## Summary

**Total API Stories**: 4  
**Current Status Breakdown**:

-   Not Started: 4
-   In Progress: 0
-   Review: 0
-   Done: 0

**Priority Order**:

1. Story #UA4 (User Registration API)
2. Story #UA2 (User Login API)
3. Story #UA1 (User Activities API)
4. Story #UA3 (User Profile API)

**Technical Requirements**:

-   Next.js 13+ API Routes
-   Supabase Database (or equivalent Auth provider)
-   Input Validation
-   Error Handling

**Security Requirements**:

-   Authentication (user-only access)
-   Input Sanitization
-   Rate Limiting
