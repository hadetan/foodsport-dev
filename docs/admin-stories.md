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
- [x] Login page with form validation
- [x] Basic responsive layout
- [x] Form with email and password inputs
- [x] Loading states during submission
- [x] Error message display
- [x] Remember me checkbox
- [ ] Protected route handling
- [x] Basic responsive navigation drawer
- [x] Breadcrumb navigation
- [ ] Profile dropdown menu
- [ ] Dark/light mode toggle
- [ ] Error pages (404, 403, 500)
- [x] Loading states
- [x] Remember me functionality
- [ ] Logout confirmation

**Current Status**: In Progress  
**Notes**: Basic login form and layout implemented. Need to implement authentication logic and protected routes.

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

-   [ ] Four main statistics cards with animations
-   [ ] Responsive data tables with sorting
-   [ ] Interactive chart displays
-   [ ] Date range selector
-   [ ] Export functionality
-   [ ] Loading states
-   [ ] Error handling
-   [ ] Mobile optimization
-   [ ] Dark/light mode
-   [ ] Manual refresh

**Current Status**: Not Started  
**Notes**: Use skeleton loaders during data fetch

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

-   [ ] User table with sorting/filtering
-   [ ] Detailed profile view
-   [ ] Status management UI
-   [ ] Confirmation dialogs
-   [ ] Bulk operations
-   [ ] Form validation
-   [ ] Success/error alerts
-   [ ] Loading states
-   [ ] Mobile responsiveness
-   [ ] Keyboard shortcuts

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

-   [ ] Activity creation wizard
-   [ ] Image upload/preview
-   [ ] Activity list with filters
-   [ ] Status management
-   [ ] Participant tracking
-   [ ] Form validation
-   [ ] Loading indicators
-   [ ] Error handling
-   [ ] Responsive design
-   [ ] Success notifications

**Current Status**: Not Started  
**Notes**: Use multi-step form for activity creation

---

## Summary

**Total Stories**: 4  
**Current Status Breakdown**:

-   Not Started: 4
-   In Progress: 0
-   Review: 0
-   Done: 0

**Priority Order**:

1.  Story #A0 (Authentication & Layout) - Foundation
2.  Story #A1 (Dashboard Interface) - Core Features
3.  Story #A2 (User Management UI) - User Administration
4.  Story #A3 (Activity Management UI) - Content Management

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
