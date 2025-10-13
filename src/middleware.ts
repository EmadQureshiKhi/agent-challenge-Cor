import { type NextRequest, NextResponse } from 'next/server';

// Simplified middleware for hackathon - no auth required
export const config = {
  matcher: [
    /*
     * Match all request paths except those starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (website icon)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

export async function middleware(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const response = NextResponse.next();

  // Check for a `ref` query parameter in the URL and set the cookie
  const referralCode = searchParams.get('ref');
  if (referralCode) {
    response.cookies.set('referralCode', referralCode, {
      httpOnly: false,
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
  }

  // For hackathon: Allow all pages without authentication
  return response;
}
