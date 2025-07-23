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

### Story #A3: Create Activity Page Structure\*

**Title**: Create activity page with advanced writing tools and image cropping  
**Description**: Build a single-page interface for creating activities with a large description box, support for all writing formats, and an image cropping tool.  
**Scope**:

-   Single-page activity creation form
-   Advanced writing tools for description
-   Image upload and cropping functionality
-   Validation for all fields
-   Responsive design

**DaisyUI Components**:

-   Activity Form:

    -   `form-control` for all inputs
    -   `textarea` for a large description box with rich text editor
    -   `file-input` for image uploads
    -   `modal` for image cropping tool
    -   `select` for categories
    -   `toggle` for status changes
    -   `datepicker` for date selection
    -   `timepicker` for time selection
    -   `input input-bordered` for title, location, and capacity fields

-   Image Management:

    -   `card` for image previews
    -   `modal` for cropping tool
    -   `carousel` for multiple images
    -   `progress` for uploads
    -   `badge` for image status

-   Actions:

    -   `btn-group` for save/cancel actions
    -   `alert` for notifications
    -   `loading` for submission states
    -   `toast` for success/error feedback

**Form Structure**:

-   Title:
    -   Required field
    -   Maximum 100 characters
    -   Alphanumeric with basic punctuation
-   Description:
    -   Required field
    -   Large text area with rich text editor
    -   Supports all writing formats (bold, italic, lists, links, etc.)
    -   Minimum 50 characters
-   Type/Category:
    -   Required field
    -   Select from predefined list
-   Date & Time:
    -   Required fields
    -   Calendar picker for date
    -   Time picker for time
-   Location:
    -   Required field
    -   Text input with address validation
-   Maximum Participant Capacity:
    -   Required field
    -   Numeric input
    -   Range: 1-1000
-   Image Upload:
    -   Multiple file selection
    -   Maximum 5 images
    -   Supported formats: JPG, PNG
    -   Maximum size: 5MB per image
-   Image Cropping:
    -   Modal with cropping tool
    -   Aspect ratio options
    -   Save cropped image
-   Image Preview:
    -   Grid layout
    -   Thumbnail view
    -   Delete option
-   Image Order:
    -   Drag and drop reordering
    -   Set primary image

**Validation Requirements**:

1. **Field Validations**

    - Title:
        - Required
        - 5-100 characters
        - Alphanumeric with basic punctuation
    - Description:
        - Required
        - Minimum 50 characters
        - Rich text allowed
    - Type/Category:
        - Required
        - From predefined list
    - Date & Time:
        - Required
        - Future date/time only
    - Location:
        - Required
        - Valid address format
    - Capacity:
        - Required
        - Positive integer
        - Maximum 1000

2. **Image Validations**
    - File type: JPG, PNG only
    - File size: Maximum 5MB each
    - Total images: Maximum 5
    - Required resolution: Minimum 800x600px

**Acceptance Criteria**:

-   [x] Single-page form for activity creation
-   [x] Large description box with rich text editor supporting all writing formats
-   [x] Image upload functionality with cropping tool
-   [ ] Drag-and-drop image reordering
-   [x] Form validation for all fields (title, description, date, time, location, capacity)
-   [x] Success/error notifications for form submission
-   [x] Mobile-responsive design for all form elements
-   [x] Save as draft option to preserve progress
-   [x] Cancel and save actions with confirmation dialogs
-   [x] Preview option before final submission
-   [ ] Export functionality for activity data
-   [ ] Accessibility compliance for all form elements
-   [ ] Data caching for improved performance
-   [x] "Create Activity" button on the activity screen that navigates to the activity creation page

---

### Story #A4: Edit Activity Page & Permissions

**Title**: Edit existing activity with full field and image management  
**Description**: Build an interface for editing existing activities, allowing admins to update all activity details, manage images, and validate changes before saving.  
**Scope**:

-   Edit all activity fields (title, description, type, date, time, location, capacity, status)
-   Manage images (add, remove, crop, reorder, set primary)
-   Save as draft and cancel actions
-   Audit fields (created/updated by, timestamps)
-   Responsive and accessible design
-   **User Permissions**:
    -   Only authorized admins (based on role/permissions) can edit activities
    -   Some admins may only edit activities they created
    -   Edit button and page access restricted by permissions
    -   All edit actions logged with user and timestamp

**DaisyUI Components**:

-   Activity Form:
    -   `form-control` for all inputs
    -   `textarea` with rich text editor for description
    -   `file-input` for image uploads
    -   `modal` for image cropping tool
    -   `select` for categories
    -   `toggle` for status changes
    -   `datepicker` for date selection
    -   `timepicker` for time selection
    -   `input input-bordered` for title, location, and capacity fields
-   Image Management:
    -   `card` for image previews
    -   `modal` for cropping tool
    -   `carousel` for multiple images
    -   `progress` for uploads
    -   `badge` for image status
-   Actions:
    -   `btn-group` for save/cancel actions
    -   `alert` for notifications
    -   `loading` for submission states
    -   `toast` for success/error feedback

**Fields to be Covered**:

-   Title (editable, required, 5–100 chars, alphanumeric/punctuation)
-   Description (editable, required, min 50 chars, rich text)
-   Type/Category (editable, required, select)
-   Date & Time (editable, required, future only)
-   Location (editable, required, address validation)
-   Maximum Participant Capacity (editable, required, 1–1000)
-   Status (editable, toggle: active/inactive/draft)
-   Images (add, remove, crop, reorder, set primary, validations)
-   Audit Fields (created/updated by, timestamps, read-only)
-   Save as Draft

**Validation Requirements**:

-   All field and image validations as per creation story
-   Permissions enforced on both frontend and backend

**Acceptance Criteria**:

-   [x] Only authorized users can access the edit activity page
-   [x] All fields are pre-filled and editable with validation
-   [x] Rich text editor for description
-   [x] Date/time pickers prevent past selection
-   [x] Location input validates address
-   [x] Capacity input restricts to 1–1000
-   [x] Images can be added, removed, cropped, reordered, set as primary
-   [x] Image validations enforced (type, size, resolution, count)
-   [x] Drag-and-drop image reordering works
-   [x] Save as draft option available
-   [x] Cancel prompts confirmation before discarding changes
-   [x] Success/error notifications after save/error
-   [x] All changes reflected after saving
-   [x] Audit fields visible (now editable)
-   [x] Form is responsive and accessible
-   [x] Loading and error states handled
-   [x] Accessibility compliance for all elements
-   [x] Only users with edit permissions see the edit button and can access the page
-   [x] Unauthorized users are redirected or shown an error
-   [x] All edit actions are logged with user and timestamp
-   [x] Permissions are configurable by admin role

**Current Status**: Done  
**Notes**: "Edit Activity" page fully implemented, including all validations, image management, permissions, accessibility, and editable audit fields.

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
