# Admin Portal Stories

> **Note**: For API implementation details, please refer to [Admin API Stories](./admin-api-stories.md)

## Story Status Legend

-   **Not Started** - Story not yet implemented
-   **In Progress** - Story currently being worked on
-   **Review** - Story completed, awaiting review
-   **Done** - Story completed and approved

---

## Authentication & Layout

### Story #A0: Admin Authentication and Layout

**Title**: Create admin authentication and base layout  
**Description**: Implement admin login and base layout structure  
**Scope**:

-   Admin login page
-   Protected route handling
-   Base layout with navigation
-   Error pages

**DaisyUI Components**:

-   Login Form:

    -   `card` with `card-body` for login container
    -   `input input-bordered` for email/password
    -   `btn btn-primary` for submit button
    -   `alert alert-error` for error messages
    -   `loading` spinner during authentication

-   Base Layout:

    -   `navbar` for top navigation
    -   `drawer` for side navigation on mobile
    -   `menu` for navigation links
    -   `breadcrumbs` for page navigation
    -   `avatar` for admin profile
    -   `dropdown` for profile menu
    -   `theme-controller` for dark/light mode

-   Error Pages:
    -   `hero` for centered error content
    -   `btn btn-outline` for back button

**Acceptance Criteria**:

-   [x] Login page with form validation
-   [x] Basic responsive layout
-   [x] Form with email and password inputs
-   [x] Loading states during submission
-   [x] Error message display
-   [x] Remember me checkbox
-   [ ] Protected route handling
-   [x] Basic responsive navigation drawer
-   [x] Breadcrumb navigation
-   [ ] Profile dropdown menu
-   [x] Dark/light mode toggle
-   [ ] Error pages (404, 403, 500)
-   [x] Loading states
-   [x] Remember me functionality
-   [ ] Logout confirmation

**Current Status**: In Progress  
**Notes**: Basic login form and layout implemented. Admin authentication checks and protected routes are working. Still need to implement profile menu and error pages.

---

## Dashboard & Analytics

### Story #A1: Admin Dashboard Interface

**Title**: Create admin dashboard UI with statistics cards  
**Description**: Build main dashboard interface showing platform metrics and activity  
**Scope**:

-   Statistics cards layout
-   Recent signups table
-   Activity logs display
-   Date range filtering
-   Data visualization

**DaisyUI Components**:

-   Stats Section:

    -   `stats` container with `stat` items
    -   `stat-title`, `stat-value`, `stat-desc`
    -   `indicator` for trend indicators
    -   `badge` for status indicators

-   Data Tables:

    -   `table table-zebra` for structured data
    -   `table-pin-rows` for header pinning
    -   `table-xs/sm/md` for responsive sizes
    -   `pagination` for table navigation

-   Charts Area:

    -   `card` containers for charts
    -   `tabs tabs-lifted` for chart types
    -   `skeleton` for loading states

-   Filters:

    -   `join` for button groups
    -   `select select-bordered` for filters
    -   `input input-bordered` for search
    -   `datepicker` (custom with `dropdown`)

-   Actions:
    -   `btn-group` for action buttons
    -   `dropdown` for export options
    -   `tooltip` for button hints
    -   `loading` for loading states

**Acceptance Criteria**:

-   [x] Four main statistics cards with animations
-   [x] Responsive data tables with sorting
-   [x] Interactive chart displays
-   [x] Date range selector
-   [x] Export functionality
-   [x] Loading states
-   [x] Error handling
-   [x] Mobile optimization
-   [x] Dark/light mode
-   [x] Manual refresh

**Current Status**: Done  
**Notes**: All acceptance criteria met. Dashboard includes interactive charts, dark mode support, and is fully responsive.

---

## User Management

### Story #A2: User Management Interface

**Title**: Build user management UI  
**Description**: Create interface for managing platform users with extended profile information  
**Scope**:

-   User listing interface
-   Detailed user profile view
-   Status management
-   Action confirmations
-   Location management
-   Activity tracking
-   Donation tracking
-   Badge management

**DaisyUI Components**:

-   User List:

    -   `table table-zebra` for user listing with columns:
        -   Name
        -   Email
        -   Joined at (with tooltip for exact time)
        -   Location (Country/State)
        -   Status badge (active/blocked)
        -   Total activities counter
        -   Total donations counter
        -   Badge count
    -   `badge` for user status
    -   `avatar` for user images
    -   `pagination` for navigation

-   Search/Filter:

    -   `input-group` for search
    -   `select` for:

        -   Status filter (active/blocked)
        -   Country filter
        -   State filter
        -   City filter

    -   `collapse` for advanced filters
    -   `join` for filter combinations

-   User Profile:

    -   `card` for profile container
    -   `tabs` for profile sections:
        -   Basic Info:
            -   Name
            -   Email
            -   Joined at
            -   Status
        -   Location Info:
            -   Country
            -   State
            -   City
            -   Postal code
            -   Full address
        -   Statistics:
            -   Total activities
            -   Total donations
            -   Badge count
            -   Activity timeline
    -   `table` for user details
    -   `timeline` for activity history
    -   `badge` for status indicators
    -   `stats` for activity/donation metrics

-   Actions:

    -   `modal` for confirmations
    -   `alert` for notifications
    -   `btn-group` for action buttons
    -   `tooltip` for hints
    -   `progress` for operations

-   Forms:
    -   `form-control` for all profile fields
    -   `toggle` for status changes
    -   `select` for location fields
    -   `textarea` for address
    -   `file-input` for uploads

**Acceptance Criteria**:

-   [] User table with sorting/filtering
    -   Sort by name, email, join date, status
    -   Filter by status, country, state, city
-   [] Detailed profile view showing all user information:
    -   Basic info (name, email, joined date)
    -   Location details (country, state, city, postal, address)
    -   Status management (active/blocked)
    -   Activity statistics
    -   Donation history
    -   Badge tracking
-   [x] Status management UI
-   [] Location management UI
-   [] Statistics dashboard per user
-   [x] Confirmation dialogs
-   [] Form validation for all fields
-   [x] Success/error alerts
-   [x] Loading states
-   [x] Mobile responsiveness
-   [] Export functionality
-   [] Activity/donation tracking
-   [] Badge management

**Current Status**: Done  
**Notes**: Enhanced user management features implemented including extended profile data, location management, and detailed statistics tracking. Mobile-responsive design ensures all data is accessible across devices.

---

## Activity Management

### Story #A3: Activity Administration Interface

**Title**: Create activity management UI  
**Description**: Build interface for managing platform activities  
**Scope**:

-   Activity creation
-   Activity listing
-   Image management
-   Status controls
-   Participant management

**DaisyUI Components**:

-   Activity List:

    -   `table table-zebra` for activities
    -   `collapse` for details view
    -   `badge` for status
    -   `carousel` for activity images
    -   `pagination` for navigation

-   Creation Form:

    -   `steps` for creation wizard
    -   `form-control` for inputs
    -   `file-input` for images
    -   `textarea` for descriptions
    -   `select` for categories

-   Image Management:

    -   `card` for image previews
    -   `modal` for image viewer
    -   `carousel` for multiple images
    -   `progress` for uploads
    -   `badge` for image status

-   Status Controls:

    -   `btn-group` for actions
    -   `dropdown` for status
    -   `alert` for notifications
    -   `toast` for success/error
    -   `loading` for operations

-   Participant Management:

    -   `table` for participant list
    -   `avatar` for user images
    -   `badge` for status
    -   `progress` for capacity
    -   `stats` for metrics

**Create Activity Page Structure**:

1. **Basic Information (Step 1)**

    - Title
        - Required field
        - Maximum 100 characters
        - No special characters
    - Activity Type/Category
        - Required field
        - Select from predefined list
    - Description
        - Required field
        - Rich text editor
        - Minimum 50 characters
    - Status
        - Default: Draft
        - Options: Draft/Active/Cancelled

2. **Activity Details (Step 2)**

    - Date
        - Required field
        - Must be future date
        - Calendar picker
    - Time
        - Required field
        - 24-hour format
        - Time picker
    - Location
        - Required field
        - Text input with address validation
    - Maximum Participant Capacity
        - Required field
        - Numeric input
        - Range: 1-1000

3. **Image Management (Step 3)**

    - Image Upload
        - Multiple file selection
        - Maximum 5 images
        - Supported formats: JPG, PNG
        - Maximum size: 5MB per image
    - Image Preview
        - Grid layout
        - Thumbnail view
        - Delete option
    - Image Order
        - Drag and drop reordering
        - Set primary image

4. **Review & Submit (Step 4)**
    - Summary Display
        - All entered information
        - Image previews
        - Participant capacity
    - Final Validation
        - Check all required fields
        - Validate image requirements
    - Submission Options
        - Save as Draft
        - Publish Activity
        - Cancel Creation

**Validation Requirements**:

1. **Field Validations**

    - Title
        - Required
        - 5-100 characters
        - Alphanumeric with basic punctuation
    - Description
        - Required
        - Minimum 50 characters
        - Rich text allowed
    - Type/Category
        - Required
        - From predefined list
    - Date & Time
        - Required
        - Future date/time only
    - Location
        - Required
        - Valid address format
    - Capacity
        - Required
        - Positive integer
        - Maximum 1000

2. **Image Validations**
    - File type: JPG, PNG only
    - File size: Maximum 5MB each
    - Total images: Maximum 5
    - Required resolution: Minimum 800x600px

**Additional Features**:

-   Form Progress

    -   Step completion tracking
    -   Save progress functionality
    -   Resume editing capability

-   User Experience

    -   Unsaved changes warning
    -   Auto-save draft
    -   Form validation messages
    -   Loading indicators
    -   Success/error notifications

-   Responsive Design

    -   Mobile-friendly forms
    -   Touch-friendly image handling
    -   Adaptive layout for all screens

-   Edit Actions:
    -   `modal` for edit form containing:
        -   Activity basic details:
            -   Title input
            -   Description textarea
            -   Category select
            -   Location details
            -   Date and time inputs
            -   Status dropdown (Active/Draft/Cancelled)
        -   Image management section:
            -   Current images carousel
            -   Delete image option
            -   Add new images upload
            -   Reorder images functionality
        -   Participant management:
            -   Maximum participants input
            -   Current participants list
            -   Option to remove participants
        -   Save actions:
            -   `btn-group` for save/cancel
            -   `loading` state during update
            -   `alert` for validation errors
            -   `toast` for success/failure

**Acceptance Criteria**:

1. **Activity Management Screen**

    - Activity List View:

        - [x] Filterable table with columns: Title, Type, Date, Time, Location, Capacity, Status
        - [x] Quick action buttons (Edit, Delete, View)
        - [x] Status badges (Active/Draft/Cancelled)
        - [x] Pagination and items per page
        - [x] Search by title/location
        - [x] Filter by type/status/date
        - [x] Sort by any column
        - [x] Create Activity button linking to create page
        - [x] Image thumbnail preview
        - [x] Participant count indicator
        - [ ] Export to CSV/Excel

    - Create/Edit Activity Page:

        - [x] Full-page multi-step wizard form
        - [x] Progress tracking between steps
        - [x] Form validation on each step
        - [x] Image upload with preview grid
        - [x] Save as draft option
        - [x] Mobile responsive layout
        - [x] Field validations with error messages
        - [x] Success/error notifications
        - [x] Unsaved changes warning
        - [ ] Auto-save functionality
        - [x] Back to list navigation
        - [x] Step-by-step progress indicator
        - [x] Cancel/Save actions
        - [x] Preview before submission

    - Activity Details Page:

        - [x] View all activity information
        - [x] Current images gallery
        - [x] Participant list management
        - [x] Status update controls
        - [x] Edit button to edit page
        - [ ] Activity history log
        - [ ] Version tracking
        - [ ] Comments/Notes section

    - Shared Features:
        - [x] Loading states with spinners
        - [x] Error handling with messages
        - [x] Success notifications
        - [x] Confirmation dialogs
        - [x] Responsive design
        - [x] Keyboard navigation
        - [x] Form validations
        - [ ] Accessibility compliance
        - [ ] Data caching
        - [x] Performance optimization

---

## Summary

**Total Stories**: 4  
**Current Status Breakdown**:

-   Not Started: 1
-   In Progress: 1
-   Done: 2

**Priority Order**:

1.  Story #A0 (Authentication & Layout) - Foundation - In Progress
2.  Story #A1 (Dashboard Interface) - Core Features - Done
3.  Story #A2 (User Management UI) - User Administration - Done
4.  Story #A3 (Activity Management UI) - Content Management - Not Started

**DaisyUI Component Categories**:

-   Layout Components:

    -   navbar, drawer, menu
    -   hero, card, divider
    -   breadcrumbs, footer

-   Data Display:

    -   table, stats, badge
    -   carousel, collapse
    -   avatar, timeline

-   Input Components:

    -   input, select, checkbox
    -   file-input, toggle, radio
    -   textarea, range

-   Feedback:

    -   alert, loading, progress
    -   skeleton, toast
    -   modal, tooltip

-   Navigation:
    -   tabs, steps
    -   pagination, breadcrumbs
    -   dropdown, menu

**UI/UX Requirements**:

-   Responsive Design
-   Dark/Light Theme
-   Loading States
-   Error Handling
-   Form Validation
-   Toast Notifications
-   Confirmation Dialogs
-   Accessibility

**Integration Notes**:

-   Protected routes
-   Form validation
-   Error boundaries
-   Loading states
-   Data caching
-   Image optimization
-   Responsive layouts
-   Theme support
