// Server-side only exports - these can only be imported in Server Components or API routes
export { createClient as createServerClient, getAuthenticatedUser, getSession } from './server'