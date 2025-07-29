import { NextResponse } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('auth_token');
  const url = request.nextUrl;

  // If not logged in and visiting /my/activities/:id, redirect to /activities/:id
  if (!token && url.pathname.startsWith('/my/activities/')) {
    const newPath = url.pathname.replace(/^\/my/, '');
    return NextResponse.redirect(new URL(newPath + url.search, request.url));
  }

  // If logged in and visiting /activities/:id, redirect to /my/activities/:id
  if (token && url.pathname.startsWith('/activities/')) {
    const newPath = '/my' + url.pathname;
    return NextResponse.redirect(new URL(newPath + url.search, request.url));
  }

  if (token) {
    // If logged in and visiting landing page, redirect to /my
    if (url.pathname === '/') {
      return NextResponse.redirect(new URL('/my', request.url));
    }
  } else {
    // If not logged in and visiting /my (but not /my/activities), redirect to /auth/login
    if (url.pathname.startsWith('/my') && !url.pathname.startsWith('/my/activities/')) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/my/:path*', '/activities/:path*'],
};