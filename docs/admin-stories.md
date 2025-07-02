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
**Description**: Create interface for managing platform users  
**Scope**:

-   User listing interface
-   User profile view
-   Status management
-   Action confirmations
-   Bulk actions

**DaisyUI Components**:

-   User List:

    -   `table table-zebra` for user listing
    -   `checkbox` for bulk selection
    -   `badge` for user status
    -   `avatar` for user images
    -   `pagination` for navigation

-   Search/Filter:

    -   `input-group` for search
    -   `select` for status filter
    -   `dropdown` for bulk actions
    -   `collapse` for advanced filters

-   User Profile:

    -   `card` for profile container
    -   `tabs` for profile sections
    -   `table` for user details
    -   `timeline` for activity history
    -   `badge` for status indicators

-   Actions:

    -   `modal` for confirmations
    -   `alert` for notifications
    -   `btn-group` for action buttons
    -   `tooltip` for hints
    -   `progress` for operations

-   Forms:
    -   `form-control` for inputs
    -   `toggle` for status changes
    -   `select` for role selection
    -   `textarea` for notes
    -   `file-input` for uploads

**Acceptance Criteria**:

-   [x] User table with sorting/filtering
-   [ ] Detailed profile view
-   [x] Status management UI
-   [x] Confirmation dialogs
-   [ ] Bulk operations
-   [x] Form validation
-   [x] Success/error alerts
-   [ ] Loading states
-   [ ] Mobile responsiveness


**Current Status**: Not Started  
**Notes**: Implement proper form validation

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

**Acceptance Criteria**:

-   [x] Activity creation wizard
-   [x] Image upload/preview
-   [x] Activity list with filters
-   [x] Status management
-   [x] Participant tracking
-   [x] Form validation
-   [ ] Loading indicators
-   [x] Error handling
-   [ ] Responsive design
-   [x] Success notifications

**Current Status**: Not Started  
**Notes**: Use multi-step form for activity creation

---

## Summary

**Total Stories**: 4  
**Current Status Breakdown**:

-   Not Started: 2
-   In Progress: 1
-   Done: 1

**Priority Order**:

1.  Story #A0 (Authentication & Layout) - Foundation - In Progress
2.  Story #A1 (Dashboard Interface) - Core Features - Done
3.  Story #A2 (User Management UI) - User Administration - Not Started
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
