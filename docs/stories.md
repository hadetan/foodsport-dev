# Foodsport User Stories

## Story Status Legend
- **Not Started** - Story not yet implemented
- **In Progress** - Story currently being worked on
- **Review** - Story completed, awaiting review
- **Done** - Story completed and approved

---

## Authentication & User Management

### Story #1: User Registration System
**Title**: Implement complete user registration flow  
**Description**: Create user registration with email/password, Google OAuth, and profile setup  
**Scope**: 
- User signup with email/password
- Google OAuth integration
- Email confirmation system
- Account recovery via email/SMS
- Initial profile data collection (name, DOB, weight, height, gender, activity level)
- Referral code handling
- SMS verification integration

**APIs Involved**:
- `POST /api/auth/signup`
- `POST /api/auth/google`
- `POST /api/auth/confirm-email`
- `POST /api/auth/recovery`

**Acceptance Criteria**:
- [ ] Users can register with email/password
- [ ] Users can register with Google OAuth
- [ ] Email verification is required for email registration
- [ ] SMS verification is supported
- [ ] Account recovery works via email and SMS
- [ ] All required profile fields are collected during signup
- [ ] Referral codes are validated and applied
- [ ] Proper error handling for duplicate emails, invalid data
- [ ] Success/error messages are displayed to user

**Current Status**: Not Started  
**Notes**: Consider implementing email templates for verification and recovery. SMS integration requires third-party service (Twilio, etc.)

---

### Story #2: User Login System
**Title**: Implement user authentication and login flow  
**Description**: Create secure login system with multiple authentication methods  
**Scope**:
- Email/password login
- Google OAuth login
- Session management
- Password reset functionality
- SMS-based login (optional)

**APIs Involved**:
- `POST /api/auth/login`
- `POST /api/auth/google`

**Acceptance Criteria**:
- [ ] Users can login with email/password
- [ ] Users can login with Google OAuth
- [ ] Secure session management with JWT tokens
- [ ] Password reset functionality
- [ ] Remember me functionality
- [ ] Proper error handling for invalid credentials
- [ ] Redirect to appropriate page after login
- [ ] Session timeout and refresh token handling

**Current Status**: Not Started  
**Notes**: Implement proper JWT token management and refresh tokens

---

### Story #3: User Profile Management
**Title**: Complete user profile system with customization options  
**Description**: Allow users to view, edit, and customize their profiles  
**Scope**:
- View user profile information
- Edit profile details (name, bio, weight, height, gender, activity level)
- Upload and change profile picture
- Customize profile borders and titles
- View user level and statistics
- Age calculation from DOB

**APIs Involved**:
- `GET /api/users/{userId}`
- `PUT /api/users/{userId}`
- `POST /api/users/{userId}/profile-picture`

**Acceptance Criteria**:
- [ ] Users can view their complete profile
- [ ] Users can edit all profile fields
- [ ] Profile picture upload works with image validation
- [ ] Profile borders and titles can be changed
- [ ] User level and statistics are displayed
- [ ] Age is calculated and displayed from DOB
- [ ] Changes are saved and reflected immediately
- [ ] Image upload supports common formats (JPG, PNG, WebP)
- [ ] Proper validation for all input fields

**Current Status**: Not Started  
**Notes**: Consider image compression and CDN integration for profile pictures

---

## User Dashboard & Goals

### Story #4: User Dashboard Implementation
**Title**: Create comprehensive user dashboard with statistics and progress tracking  
**Description**: Build main dashboard showing user's fitness progress, goals, and achievements  
**Scope**:
- Display calories donated and progress towards goal
- Show total points and current streak
- Display leaderboard rank
- Show calories lost today
- User level progression
- Progress bar visualization
- Real-time updates

**APIs Involved**:
- `GET /api/users/{userId}/dashboard`

**Acceptance Criteria**:
- [ ] Dashboard displays all key metrics clearly
- [ ] Progress bars show visual progress towards goals
- [ ] Real-time updates when data changes
- [ ] Responsive design for mobile and desktop
- [ ] Loading states for data fetching
- [ ] Error handling for failed API calls
- [ ] User level and streak are prominently displayed
- [ ] Leaderboard rank is shown with navigation

**Current Status**: Not Started  
**Notes**: Consider implementing real-time updates with WebSockets or polling

---

### Story #5: Goal Management System
**Title**: Implement comprehensive goal setting and tracking system  
**Description**: Allow users to set and track multiple types of fitness goals  
**Scope**:
- Set daily, weekly, monthly, yearly calorie goals
- Track progress towards each goal type
- Edit and update goals
- Visual progress indicators
- Goal completion celebrations

**APIs Involved**:
- `GET /api/users/{userId}/goals`
- `PUT /api/users/{userId}/goals`
- `PUT /api/users/{userId}/calorie-goal`

**Acceptance Criteria**:
- [ ] Users can set goals for different time periods
- [ ] Progress is calculated and displayed accurately
- [ ] Goals can be edited at any time
- [ ] Visual progress indicators (bars, charts)
- [ ] Goal completion celebrations
- [ ] Historical goal tracking
- [ ] Smart goal suggestions based on user history
- [ ] Goal sharing functionality

**Current Status**: Not Started  
**Notes**: Consider implementing goal templates and achievement badges

---

## Activities & Events

### Story #6: Activity Discovery and Listing
**Title**: Build comprehensive activity discovery system  
**Description**: Create system for users to discover and browse available activities  
**Scope**:
- List all available activities with filtering
- Activity details and information
- Search and filter functionality
- Activity status management (active, upcoming, open, closed)
- Participant limit display
- Activity type categorization

**APIs Involved**:
- `GET /api/activities`
- `GET /api/activities/{activityId}`

**Acceptance Criteria**:
- [ ] Activities are displayed in an attractive grid/list view
- [ ] Filtering by status (active, upcoming, open, closed) works
- [ ] Filtering by type, location, date works
- [ ] Search functionality works
- [ ] Activity details page shows complete information
- [ ] Participant limits and current participants are shown
- [ ] Activity images are displayed properly
- [ ] Responsive design for all screen sizes
- [ ] Loading states and error handling
- [ ] Activity status is clearly indicated

**Current Status**: In Progress (Basic activities API exists)  
**Notes**: Current activities data structure needs to be enhanced with status, participant limits, and more fields

---

### Story #7: Activity Joining and Ticket System
**Title**: Implement activity joining and ticket management  
**Description**: Allow users to join activities and manage their tickets  
**Scope**:
- Join activities with participant limits
- Create and manage tickets
- Send tickets via email/SMS
- View joined activities
- Ticket expiration handling (5-minute timeout)
- Waitlist functionality for full activities

**APIs Involved**:
- `POST /api/activities/{activityId}/join`
- `GET /api/users/{userId}/activities`
- `GET /api/users/{userId}/tickets`
- `POST /api/tickets/{ticketId}/send`

**Acceptance Criteria**:
- [ ] Users can join activities within participant limits
- [ ] Tickets are created automatically when joining
- [ ] Tickets can be sent via email or SMS
- [ ] Users can view all their joined activities
- [ ] Ticket expiration (5-minute timeout) is handled
- [ ] Waitlist functionality for full activities
- [ ] Proper error handling for full activities
- [ ] Confirmation messages for successful joins
- [ ] Ticket QR codes or unique identifiers
- [ ] SMS integration for ticket delivery

**Current Status**: Not Started  
**Notes**: Consider implementing waitlist functionality for full activities. SMS integration requires third-party service.

---

## Calorie Tracking & Management

### Story #8: Calorie Submission System
**Title**: Implement photo-based calorie submission and verification  
**Description**: Create system for users to submit calorie burns through photos  
**Scope**:
- Photo upload for calorie submission
- Photo verification process
- Calorie calculation and recording
- Submission history tracking
- Total calories update on success

**APIs Involved**:
- `POST /api/users/{userId}/calories/submit`
- `POST /api/users/{userId}/calories/verify`

**Acceptance Criteria**:
- [ ] Users can upload photos for calorie submission
- [ ] Photos are stored securely
- [ ] Verification process works (manual or AI-based)
- [ ] Calorie calculations are accurate
- [ ] Submission history is maintained
- [ ] Photo quality validation
- [ ] Multiple photo formats supported
- [ ] Progress tracking for verification status
- [ ] Total calories are updated on successful verification

**Current Status**: Not Started  
**Notes**: Consider AI integration for automatic calorie detection from photos

---

### Story #9: Calorie History and Analytics
**Title**: Create comprehensive calorie tracking and analytics system  
**Description**: Provide detailed history and analytics of user's calorie burns  
**Scope**:
- View calorie burn history
- Activity-based calorie tracking
- Points earned for activities and activity types
- Historical data visualization
- Total calories burnt per activity

**APIs Involved**:
- `GET /api/users/{userId}/calories/history`

**Acceptance Criteria**:
- [ ] Complete calorie burn history is displayed
- [ ] History can be filtered by date range
- [ ] Activity-specific calorie data is shown
- [ ] Points earned for each activity and activity type are displayed
- [ ] Data visualization (charts, graphs)
- [ ] Export functionality for data
- [ ] Search and filter capabilities
- [ ] Progress trends and insights
- [ ] Total calories burnt per activity type

**Current Status**: Not Started  
**Notes**: Consider implementing data visualization libraries for charts

---

## Charity & Donation System

### Story #10: Charity Discovery and Information
**Title**: Build charity discovery and information system  
**Description**: Allow users to discover and learn about available charities  
**Scope**:
- List current charities
- Charity details and information
- Donation goals and progress
- Charity mission and website links

**APIs Involved**:
- `GET /api/charities`
- `GET /api/charities/{charityId}`

**Acceptance Criteria**:
- [ ] Charity list is displayed attractively
- [ ] Charity details page shows complete information
- [ ] Donation goals and current progress are shown
- [ ] Charity images and branding are displayed
- [ ] Mission statements and website links work
- [ ] Search and filter charities
- [ ] Charity categories or tags
- [ ] Featured charities highlighting

**Current Status**: Not Started  
**Notes**: Consider implementing charity ratings and reviews

---

### Story #11: Calorie Donation System
**Title**: Implement calorie donation tracking and history  
**Description**: Track and display user's calorie donations to charities  
**Scope**:
- Track calories donated to each charity
- Donation history and timeline
- Donation impact visualization
- Charity-specific donation tracking
- History of calories donated (date, time, recipient)

**APIs Involved**:
- `GET /api/users/{userId}/donations`

**Acceptance Criteria**:
- [ ] Complete donation history is displayed
- [ ] Donations are tracked per charity
- [ ] Donation dates and times are recorded
- [ ] Impact visualization (e.g., "You've donated X calories")
- [ ] Charity-specific donation summaries
- [ ] Donation goals and achievements
- [ ] Social sharing of donations
- [ ] Donation certificates or badges
- [ ] Recipient information is tracked

**Current Status**: Not Started  
**Notes**: Consider implementing donation challenges and campaigns

---

## Gamification & Achievements

### Story #12: Badge System Implementation
**Title**: Create comprehensive badge and achievement system  
**Description**: Implement gamification through badges and achievements  
**Scope**:
- Display user badges
- Badge earning criteria
- Streak tracking with boolean status
- Seasonal and themed badges (Christmas, Halloween)
- Badge notifications
- Calorie-based badge awards

**APIs Involved**:
- `GET /api/users/{userId}/badges`
- `GET /api/users/{userId}/badges/check`

**Acceptance Criteria**:
- [ ] All user badges are displayed
- [ ] Badge earning criteria are clear
- [ ] Streak tracking works accurately with boolean status
- [ ] Seasonal badges (Christmas, Halloween) are awarded appropriately
- [ ] Calorie-based badges are awarded for specific burn amounts
- [ ] Badge notifications are sent
- [ ] Badge collection is visually appealing
- [ ] Badge sharing functionality
- [ ] Badge rarity levels

**Current Status**: Not Started  
**Notes**: Consider implementing badge trading or gifting. Seasonal badge logic needs date-based triggers.

---

### Story #13: Referral System
**Title**: Implement user referral and rewards system  
**Description**: Create system for users to refer friends and earn rewards  
**Scope**:
- Generate referral codes
- Track referral statistics
- Referral rewards system
- Referral code validation

**APIs Involved**:
- `POST /api/users/{userId}/referral-code`
- `GET /api/users/{userId}/referrals`

**Acceptance Criteria**:
- [ ] Users can generate referral codes
- [ ] Referral codes are unique and secure
- [ ] Referral statistics are tracked
- [ ] Rewards are given for successful referrals
- [ ] Referral code validation works
- [ ] Referral progress is displayed
- [ ] Social sharing of referral codes
- [ ] Referral leaderboards

**Current Status**: Not Started  
**Notes**: Consider implementing tiered referral rewards

---

## Leaderboards & Social Features

### Story #14: Leaderboard System
**Title**: Create comprehensive leaderboard system with multiple categories  
**Description**: Implement leaderboards for global, community, and friends rankings  
**Scope**:
- Global leaderboard
- Community leaderboard
- Friends leaderboard
- Leaderboard rankings and statistics
- Top 10 users with username, calorie, badges, title, calorie donated

**APIs Involved**:
- `GET /api/leaderboard/global`
- `GET /api/leaderboard/community`
- `GET /api/leaderboard/friends`

**Acceptance Criteria**:
- [ ] Global leaderboard shows top 10 users
- [ ] Community leaderboard works
- [ ] Friends leaderboard displays correctly
- [ ] User rankings are accurate
- [ ] Leaderboard updates in real-time
- [ ] User profiles are accessible from leaderboards
- [ ] Leaderboard filters and sorting
- [ ] Achievement highlights on leaderboards
- [ ] All required fields are displayed (username, calorie, badges, title, calorie donated)

**Current Status**: Not Started  
**Notes**: Consider implementing leaderboard categories (weekly, monthly, all-time)

---

## Technical Infrastructure

### Story #15: Database Integration and Setup
**Title**: Set up Supabase database and integrate with API routes  
**Description**: Implement database schema and integrate with Next.js API routes  
**Scope**:
- Supabase project setup
- Database schema design
- API route integration
- Data migration and seeding

**Acceptance Criteria**:
- [ ] Supabase project is configured
- [ ] Database schema is implemented
- [ ] All API routes connect to database
- [ ] Data seeding scripts work
- [ ] Database backups are configured
- [ ] Performance optimization
- [ ] Security rules are implemented
- [ ] Environment variables are configured

**Current Status**: Not Started  
**Notes**: Consider implementing database migrations and versioning

---

### Story #16: Authentication Middleware and Security
**Title**: Implement authentication middleware and security measures  
**Description**: Create secure authentication system with proper middleware  
**Scope**:
- JWT token management
- Authentication middleware
- Route protection
- Security headers and CORS

**Acceptance Criteria**:
- [ ] JWT tokens are properly managed
- [ ] Authentication middleware works
- [ ] Protected routes are secured
- [ ] Security headers are implemented
- [ ] CORS is configured properly
- [ ] Rate limiting is implemented
- [ ] Input validation and sanitization
- [ ] Error handling is secure

**Current Status**: Not Started  
**Notes**: Consider implementing refresh tokens and session management

---

### Story #17: File Upload and Storage System
**Title**: Implement secure file upload and storage system  
**Description**: Create system for handling profile pictures and calorie photos  
**Scope**:
- File upload handling
- Image processing and optimization
- Secure storage
- CDN integration

**Acceptance Criteria**:
- [ ] File uploads work securely
- [ ] Images are processed and optimized
- [ ] Storage is secure and scalable
- [ ] CDN integration works
- [ ] File validation and virus scanning
- [ ] Image compression and resizing
- [ ] Backup and recovery procedures
- [ ] File access controls

**Current Status**: Not Started  
**Notes**: Consider implementing image AI for automatic tagging and optimization

---

## Testing and Quality Assurance

### Story #18: API Testing and Documentation
**Title**: Implement comprehensive API testing and documentation  
**Description**: Create tests for all API endpoints and maintain documentation  
**Scope**:
- Unit tests for API routes
- Integration tests
- API documentation
- Postman collections

**Acceptance Criteria**:
- [ ] All API endpoints have unit tests
- [ ] Integration tests cover main flows
- [ ] API documentation is complete
- [ ] Postman collections are available
- [ ] Test coverage is above 80%
- [ ] Error scenarios are tested
- [ ] Performance tests are implemented
- [ ] Documentation is kept up to date

**Current Status**: Not Started  
**Notes**: Consider implementing automated testing in CI/CD pipeline

---

## Deployment and DevOps

### Story #19: Production Deployment Setup
**Title**: Set up production deployment on Vercel  
**Description**: Configure production environment and deployment pipeline  
**Scope**:
- Vercel project setup
- Environment configuration
- CI/CD pipeline
- Monitoring and logging

**Acceptance Criteria**:
- [ ] Vercel project is configured
- [ ] Environment variables are set
- [ ] CI/CD pipeline works
- [ ] Monitoring and logging are implemented
- [ ] Performance monitoring is active
- [ ] Error tracking is configured
- [ ] Backup and recovery procedures
- [ ] SSL certificates are configured

**Current Status**: Not Started  
**Notes**: Consider implementing staging environment for testing

---

## Summary

**Total Stories**: 19  
**Current Status Breakdown**:
- Not Started: 18
- In Progress: 1
- Review: 0
- Done: 0

**Priority Order**:
1. Stories #1-3 (Authentication & Profile) - Foundation
2. Stories #15-16 (Database & Security) - Infrastructure
3. Stories #6-7 (Activities) - Core Features
4. Stories #8-9 (Calorie Tracking) - Core Features
5. Stories #4-5 (Dashboard & Goals) - User Experience
6. Stories #10-11 (Charity) - Social Impact
7. Stories #12-14 (Gamification) - Engagement
8. Stories #17-19 (Technical) - Quality & Deployment

**Validation Status**: ✅ All requirements from req_doc.md and api_doc.md are now covered in the stories
