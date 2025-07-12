# Axios Integration & API Hooks Story

## Story Status Legend

-   **Not Started** - Story not yet implemented
-   **In Progress** - Story currently being worked on
-   **Review** - Story completed, awaiting review
-   **Done** - Story completed and approved

---

## Axios Setup & API Integration

### Story #AF1: Axios Setup and API Integration in Frontend

**Title**: Integrate Axios and API hooks for frontend data fetching  
**Description**: Set up Axios as the HTTP client for all API calls in the frontend, create reusable hooks for API consumption, and ensure consistent error handling and authentication. Support multiple base URLs for different app states (landing, admin, my) to enable flexible API routing. All authentication and session management must use Supabase's client and session model.

**Scope**:

- Install and configure Axios instance
- Add global interceptors for auth and error handling
- Create a centralized API utility layer
- Support dynamic base URLs for different app states (landing, admin, my)
- Integrate Supabase client for authentication and session/token retrieval
- Implement React hooks for API calls (CRUD, list, etc.)
- Replace all direct fetch calls with Axios/hooks
- Document usage and patterns

**Acceptance Criteria**:

-   [ ] Axios is installed and configured with a default base URL and headers
-   [ ] API utility supports dynamic base URLs based on app state (landing, admin, my)
-   [ ] Global request interceptor retrieves the current session/token from Supabase and adds it to all requests (if present)
-   [ ] Global response interceptor handles errors and uses Supabase methods for token refresh (if needed)
-   [ ] All API endpoints are accessible via a centralized API utility (e.g., `src/utils/api.js`)
-   [ ] Reusable React hooks are created for common API patterns (e.g., `useFetch`, `useMutation`, `useApi`)
-   [ ] Hooks support loading, error, and data states
-   [ ] All existing fetch or direct API calls in the frontend are migrated to use Axios or the new hooks
-   [ ] API utility and hooks are documented with usage examples
-   [ ] Proper error messages are displayed to users on API failure
-   [ ] Authentication and token refresh logic is handled in one place and always uses Supabase's client/session
-   [ ] All API calls use the correct base URL and environment variables for their context

**Current Status**: Not Started  
**Notes**: This story covers only the setup and integration of Axios and API hooks, including support for multiple base URLs and Supabase-based authentication/session management. Actual UI changes or new features should be tracked in separate stories.