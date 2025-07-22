import { NextResponse } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('auth_token');
  const url = request.nextUrl;

  if (token) {
    // If logged in and visiting landing page, redirect to /my
    if (url.pathname === '/') {
      return NextResponse.redirect(new URL('/my', request.url));
    }
  } else {
    // If not logged in and visiting /my, redirect to /login
    if (url.pathname.startsWith('/my')) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/my/:path*'],
};