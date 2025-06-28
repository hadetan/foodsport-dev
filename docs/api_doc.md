# Foodsport API Documentation

## Architecture Overview

This is a **Next.js 15** application using the **App Router** architecture. All APIs are implemented as Next.js API routes located in the `src/app/api` folder.

### Technology Stack
- **Framework**: Next.js 15.3.4 with App Router
- **Frontend**: React 19.0.0
- **API Routes**: Next.js API Routes (`src/app/api/*/route.js`)
- **Database**: Supabase (planned)
- **Deployment**: Vercel (planned)

### API Route Structure
```
src/app/api/
├── auth/
│   ├── signup/route.js
│   ├── login/route.js
│   ├── google/route.js
│   ├── recovery/route.js
│   └── confirm-email/route.js
├── users/
│   ├── [userId]/route.js
│   ├── [userId]/dashboard/route.js
│   ├── [userId]/goals/route.js
│   ├── [userId]/activities/route.js
│   ├── [userId]/tickets/route.js
│   ├── [userId]/calories/
│   │   ├── submit/route.js
│   │   ├── verify/route.js
│   │   └── history/route.js
│   ├── [userId]/badges/route.js
│   ├── [userId]/referrals/route.js
│   └── [userId]/donations/route.js
├── activities/
│   ├── route.js
│   └── [activityId]/
│       ├── route.js
│       └── join/route.js
├── tickets/
│   └── [ticketId]/send/route.js
├── charities/
│   ├── route.js
│   └── [charityId]/route.js
└── leaderboard/
    ├── global/route.js
    ├── community/route.js
    └── friends/route.js
```

### Implementation Notes
- All API routes use Next.js 15's new `Response.json()` method
- Dynamic routes use `[paramName]` folder structure
- File uploads use `multipart/form-data` with Next.js built-in support
- Authentication will be handled with Next.js middleware
- Database integration will be through Supabase client

---

## Base URL
```
/api
```

## Authentication
All authenticated endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Authentication APIs

### User Registration & Login

#### 1. User Signup
- **POST** `/api/auth/signup`
- **Description**: Create a new user account
- **Request Body**:
  ```json
  {
    "email": "string",
    "password": "string",
    "name": "string",
    "dateOfBirth": "YYYY-MM-DD",
    "weight": "number",
    "height": "number",
    "referralCode": "string (optional)",
    "phoneNumber": "string",
    "gender": "string (male/female/other)",
    "activityLevel": "string (low/medium/high)"
  }
  ```

#### 2. Google Authentication
- **POST** `/api/auth/google`
- **Description**: Authenticate user with Google OAuth
- **Request Body**:
  ```json
  {
    "googleToken": "string"
  }
  ```

#### 3. User Login
- **POST** `/api/auth/login`
- **Description**: Authenticate user with email/password
- **Request Body**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```

#### 4. Account Recovery
- **POST** `/api/auth/recovery`
- **Description**: Send recovery email/SMS
- **Request Body**:
  ```json
  {
    "email": "string",
    "phoneNumber": "string (optional)"
  }
  ```

#### 5. Email Confirmation
- **POST** `/api/auth/confirm-email`
- **Description**: Confirm email with verification code
- **Request Body**:
  ```json
  {
    "email": "string",
    "verificationCode": "string"
  }
  ```

---

## User Profile APIs

### User Profile Management

#### 6. Get User Profile
- **GET** `/api/users/{userId}`
- **Description**: Get user profile information
- **Response**:
  ```json
  {
    "id": "string",
    "name": "string",
    "email": "string",
    "profilePicture": "string (URL)",
    "border": "string",
    "title": "string",
    "bio": "string",
    "weight": "number",
    "height": "number",
    "gender": "string",
    "age": "number",
    "activityLevel": "string",
    "level": "number",
    "currentStreak": "number",
    "totalPoints": "number"
  }
  ```

#### 7. Update User Profile
- **PUT** `/api/users/{userId}`
- **Description**: Update user profile information
- **Request Body**:
  ```json
  {
    "name": "string (optional)",
    "profilePicture": "string (URL, optional)",
    "border": "string (optional)",
    "title": "string (optional)",
    "bio": "string (optional)",
    "weight": "number (optional)",
    "height": "number (optional)",
    "gender": "string (optional)",
    "activityLevel": "string (optional)"
  }
  ```

#### 8. Change Profile Picture
- **POST** `/api/users/{userId}/profile-picture`
- **Description**: Upload new profile picture
- **Content-Type**: `multipart/form-data`
- **Request Body**: Form data with image file

---

## User Dashboard APIs

### User Statistics & Goals

#### 9. Get User Dashboard
- **GET** `/api/users/{userId}/dashboard`
- **Description**: Get user dashboard statistics
- **Response**:
  ```json
  {
    "caloriesDonated": "number",
    "calorieGoal": "number",
    "progressTowardsGoal": "number (percentage)",
    "totalPoints": "number",
    "caloriesLostToday": "number",
    "leaderboardRank": "number",
    "currentStreak": "number",
    "level": "number"
  }
  ```

#### 10. Update Calorie Goal
- **PUT** `/api/users/{userId}/calorie-goal`
- **Description**: Update user's calorie goal
- **Request Body**:
  ```json
  {
    "calorieGoal": "number"
  }
  ```

#### 11. Get User Goals
- **GET** `/api/users/{userId}/goals`
- **Description**: Get user's daily, weekly, monthly, yearly goals
- **Response**:
  ```json
  {
    "dailyGoal": "number",
    "weeklyGoal": "number",
    "monthlyGoal": "number",
    "yearlyGoal": "number"
  }
  ```

#### 12. Update User Goals
- **PUT** `/api/users/{userId}/goals`
- **Description**: Update user's goals
- **Request Body**:
  ```json
  {
    "dailyGoal": "number (optional)",
    "weeklyGoal": "number (optional)",
    "monthlyGoal": "number (optional)",
    "yearlyGoal": "number (optional)"
  }
  ```

---

## Activities APIs

### Activity Management

#### 13. Get All Activities
- **GET** `/api/activities`
- **Description**: Get list of all activities with filters
- **Query Parameters**:
  - `status`: `active`, `upcoming`, `open`, `closed`
  - `type`: `kayak`, `hiking`, `yoga`, etc.
  - `location`: `string`
  - `date`: `YYYY-MM-DD`
- **Response**:
  ```json
  {
    "activities": [
      {
        "id": "string",
        "title": "string",
        "description": "string",
        "type": "string",
        "location": "string",
        "date": "YYYY-MM-DD",
        "time": "HH:MM",
        "status": "string",
        "participantLimit": "number",
        "currentParticipants": "number",
        "organizer": "string",
        "image": "string (URL)"
      }
    ]
  }
  ```

#### 14. Get Activity Details
- **GET** `/api/activities/{activityId}`
- **Description**: Get detailed information about a specific activity
- **Response**:
  ```json
  {
    "id": "string",
    "title": "string",
    "description": "string",
    "type": "string",
    "location": "string",
    "date": "YYYY-MM-DD",
    "time": "HH:MM",
    "status": "string",
    "participantLimit": "number",
    "currentParticipants": "number",
    "organizer": "string",
    "image": "string (URL)",
    "participants": [
      {
        "userId": "string",
        "name": "string",
        "profilePicture": "string"
      }
    ]
  }
  ```

#### 15. Join Activity
- **POST** `/api/activities/{activityId}/join`
- **Description**: Join an activity (creates ticket)
- **Request Body**:
  ```json
  {
    "notificationPreference": "email" | "sms"
  }
  ```

#### 16. Get User's Joined Activities
- **GET** `/api/users/{userId}/activities`
- **Description**: Get activities that user has joined
- **Query Parameters**:
  - `status`: `upcoming`, `completed`, `cancelled`

---

## Tickets APIs

### Ticket Management

#### 17. Get User Tickets
- **GET** `/api/users/{userId}/tickets`
- **Description**: Get user's activity tickets
- **Response**:
  ```json
  {
    "tickets": [
      {
        "id": "string",
        "activityId": "string",
        "activityTitle": "string",
        "status": "string",
        "createdAt": "timestamp",
        "expiresAt": "timestamp"
      }
    ]
  }
  ```

#### 18. Send Ticket
- **POST** `/api/tickets/{ticketId}/send`
- **Description**: Send ticket to user via email/SMS
- **Request Body**:
  ```json
  {
    "method": "email" | "sms"
  }
  ```

---

## Calorie Management APIs

### Calorie Submission & Tracking

#### 19. Submit Calorie Photo
- **POST** `/api/users/{userId}/calories/submit`
- **Description**: Submit calorie burn through photo
- **Content-Type**: `multipart/form-data`
- **Request Body**: Form data with photo file

#### 20. Verify Calorie Submission
- **POST** `/api/users/{userId}/calories/verify`
- **Description**: Verify submitted calorie photo
- **Request Body**:
  ```json
  {
    "submissionId": "string",
    "verifiedCalories": "number"
  }
  ```

#### 21. Get Calorie History
- **GET** `/api/users/{userId}/calories/history`
- **Description**: Get user's calorie burn history
- **Query Parameters**:
  - `startDate`: `YYYY-MM-DD`
  - `endDate`: `YYYY-MM-DD`
- **Response**:
  ```json
  {
    "history": [
      {
        "id": "string",
        "activityId": "string",
        "activityTitle": "string",
        "caloriesBurned": "number",
        "pointsEarned": "number",
        "date": "YYYY-MM-DD",
        "status": "string"
      }
    ]
  }
  ```

---

## Charity & Donation APIs

### Charity Management

#### 22. Get Current Charities
- **GET** `/api/charities`
- **Description**: Get list of current charities
- **Response**:
  ```json
  {
    "charities": [
      {
        "id": "string",
        "name": "string",
        "description": "string",
        "image": "string (URL)",
        "currentGoal": "number",
        "currentDonations": "number"
      }
    ]
  }
  ```

#### 23. Get Charity Details
- **GET** `/api/charities/{charityId}`
- **Description**: Get detailed information about a charity
- **Response**:
  ```json
  {
    "id": "string",
    "name": "string",
    "description": "string",
    "image": "string (URL)",
    "currentGoal": "number",
    "currentDonations": "number",
    "mission": "string",
    "website": "string"
  }
  ```

#### 24. Get Donation History
- **GET** `/api/users/{userId}/donations`
- **Description**: Get user's calorie donation history
- **Response**:
  ```json
  {
    "donations": [
      {
        "id": "string",
        "charityId": "string",
        "charityName": "string",
        "caloriesDonated": "number",
        "date": "YYYY-MM-DD",
        "time": "HH:MM"
      }
    ]
  }
  ```

---

## Badges APIs

### Badge Management

#### 25. Get User Badges
- **GET** `/api/users/{userId}/badges`
- **Description**: Get all badges earned by user
- **Response**:
  ```json
  {
    "badges": [
      {
        "id": "string",
        "name": "string",
        "description": "string",
        "image": "string (URL)",
        "earnedAt": "timestamp",
        "type": "string (streak/calorie/seasonal)",
        "value": "number"
      }
    ]
  }
  ```

#### 26. Check Badge Eligibility
- **GET** `/api/users/{userId}/badges/check`
- **Description**: Check if user is eligible for new badges
- **Response**:
  ```json
  {
    "newBadges": [
      {
        "badgeId": "string",
        "name": "string",
        "description": "string"
      }
    ]
  }
  ```

---

## Referral APIs

### Referral Management

#### 27. Generate Referral Code
- **POST** `/api/users/{userId}/referral-code`
- **Description**: Generate new referral code for user
- **Response**:
  ```json
  {
    "referralCode": "string",
    "expiresAt": "timestamp"
  }
  ```

#### 28. Get Referral Stats
- **GET** `/api/users/{userId}/referrals`
- **Description**: Get user's referral statistics
- **Response**:
  ```json
  {
    "referralCode": "string",
    "totalReferrals": "number",
    "successfulReferrals": "number",
    "rewardsEarned": "number"
  }
  ```

---

## Leaderboard APIs

### Leaderboard Management

#### 29. Get Global Leaderboard
- **GET** `/api/leaderboard/global`
- **Description**: Get global leaderboard
- **Query Parameters**:
  - `limit`: `number (default: 10)`
- **Response**:
  ```json
  {
    "leaderboard": [
      {
        "rank": "number",
        "userId": "string",
        "username": "string",
        "calories": "number",
        "badges": "number",
        "title": "string",
        "caloriesDonated": "number",
        "profilePicture": "string"
      }
    ]
  }
  ```

#### 30. Get Community Leaderboard
- **GET** `/api/leaderboard/community`
- **Description**: Get community leaderboard
- **Query Parameters**:
  - `limit`: `number (default: 10)`

#### 31. Get Friends Leaderboard
- **GET** `/api/leaderboard/friends`
- **Description**: Get friends-only leaderboard
- **Query Parameters**:
  - `limit`: `number (default: 10)`

---

## Error Responses

All APIs return consistent error responses:

```json
{
  "error": {
    "code": "string",
    "message": "string",
    "details": "object (optional)"
  }
}
```

Common error codes:
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `422`: Validation Error
- `500`: Internal Server Error

---

## Implementation Guidelines

### Next.js API Route Structure
Each API endpoint should be implemented as a `route.js` file in the appropriate folder:

```javascript
// Example: src/app/api/users/[userId]/route.js
export async function GET(request, { params }) {
  const { userId } = params;
  // Implementation
  return Response.json(data);
}

export async function PUT(request, { params }) {
  const { userId } = params;
  const body = await request.json();
  // Implementation
  return Response.json(data);
}
```

### File Upload Handling
For file uploads (profile pictures, calorie photos):

```javascript
// Example: src/app/api/users/[userId]/profile-picture/route.js
import { writeFile } from 'fs/promises';

export async function POST(request, { params }) {
  const formData = await request.formData();
  const file = formData.get('image');
  
  if (file) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    // Save file and return URL
  }
  
  return Response.json({ success: true });
}
```

### Database Integration
When Supabase is integrated:

```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
```

---

## Notes

1. **Authentication**: Most endpoints require authentication except for public activities and charity listings
2. **File Uploads**: Profile pictures and calorie photos use multipart/form-data
3. **Pagination**: List endpoints support pagination with `page` and `limit` parameters
4. **Rate Limiting**: APIs are rate-limited to prevent abuse
5. **Webhooks**: Real-time updates for activity changes and notifications
6. **Next.js Features**: Leverages Next.js 15's built-in API routes, middleware, and optimizations
