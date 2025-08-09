# Copilot Instructions for FoodSport

## Overview
This project is a frontend application for the FoodSport platform, built using Next.js. It integrates with Supabase for authentication, storage, and database operations. The application is structured into multiple modules, including user, admin, and shared components, with a focus on modularity and reusability.

## Architecture
- **Next.js Pages and Layouts**: The application uses Next.js' app directory structure for routing and layouts. Key directories include:
  - `src/app/(landing)`: Handles the landing page and public-facing components.
  - `src/app/admin`: Admin-specific pages and components.
  - `src/app/my`: User-specific pages and components.
- **API Routes**: Located under `src/app/api`, these routes handle server-side logic for activities, authentication, and admin operations.
- **Prisma ORM**: Used for database interactions. The schema is defined in `prisma/schema.prisma`.
- **Supabase Integration**: Used for authentication (`auth`), storage (`storage`), and server-side operations (`createServerClient`).

## Developer Workflows
### Setting Up the Project
1. Install dependencies:
   ```bash
   npm install
   ```
2. Set up the environment variables by copying `env.example` to `.env.local` and filling in the required values.
3. Run the development server:
   ```bash
   npm run dev
   ```

### Database Management
- To apply migrations:
  ```bash
  npx prisma migrate dev
  ```
- To seed the database:
  ```bash
  node scripts/seed-database.js
  ```

### Testing
- No explicit testing framework is set up. Add tests under a `tests/` directory if needed.

### Debugging
- Use `console.log` for debugging server-side code.
- For frontend debugging, use browser developer tools.

## Project-Specific Conventions
- **API Responses**: Always return JSON with a consistent structure for success and error cases.
- **Error Handling**: Use `formatDbError` for database-related errors.
- **Validation**: Use `validateRequiredFields` for input validation in API routes.
- **Styling**: Tailwind CSS is used for styling. Global styles are defined in `src/app/globals.css`.

## Key Files and Directories
- `src/app/api`: Contains all API routes.
- `prisma/schema.prisma`: Defines the database schema.
- `scripts/`: Utility scripts for database setup and seeding.
- `src/lib/prisma`: Contains database utility functions.
- `src/lib/supabase`: Contains Supabase client configurations.

## Integration Points
- **Supabase**: Ensure proper configuration in `.env.local` for Supabase keys.
- **Prisma**: Update `schema.prisma` and run migrations for any database changes.

## Guidelines for AI Agents
- Follow the stories and acceptance criteria in the `docs/` directory.
- Ensure code reusability and avoid clutter.
- Update the Prisma schema and run migrations if new tables are introduced.
- Mark completed acceptance criteria in the relevant documentation.

## Examples
- **API Route Example**:
  ```javascript
  export async function POST(req) {
    const supabase = await createServerClient();
    const { error } = await requireAdmin(supabase, NextResponse);
    if (error) return error;

    // Handle request logic
  }
  ```
- **Validation Example**:
  ```javascript
  const validation = validateRequiredFields(body, ['field1', 'field2']);
  if (!validation.isValid) {
    return Response.json({ error: validation.error }, { status: 400 });
  }
  ```
