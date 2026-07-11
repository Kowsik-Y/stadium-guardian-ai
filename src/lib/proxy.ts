import { NextResponse } from 'next/server';

export interface ProxyContext {
  user?: {
    email: string;
    role: string;
    gate?: string;
  };
}

type RouteHandler = (req: Request, context: ProxyContext) => Promise<Response> | Response;

/**
 * Higher-Order Function to wrap API handlers with unified security logging,
 * exception tracking, and performance timing.
 */
export function withRouteProxy(handler: RouteHandler) {
  return async (req: Request) => {
    const startTime = Date.now();
    const url = new URL(req.url);
    const apiPath = url.pathname;

    console.log(`[API PROXY] Request started: ${req.method} ${apiPath}`);

    // --- SECURITY: Server-side content-type & payload size boundaries ---
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      const contentType = req.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        return NextResponse.json(
          { error: 'Unsupported Media Type', message: 'Content-Type must be application/json' },
          { status: 415 },
        );
      }

      const contentLengthStr = req.headers.get('content-length');
      if (contentLengthStr) {
        const contentLength = parseInt(contentLengthStr, 10);
        if (Number.isNaN(contentLength) || contentLength > 102400) {
          // 100KB maximum
          return NextResponse.json(
            { error: 'Payload Too Large', message: 'Request payload must not exceed 100KB' },
            { status: 413 },
          );
        }
      } else {
        // If content-length header is omitted, verify text body length
        try {
          const reqClone = req.clone();
          const bodyText = await reqClone.text();
          if (bodyText.length > 102400) {
            return NextResponse.json(
              { error: 'Payload Too Large', message: 'Request payload must not exceed 100KB' },
              { status: 413 },
            );
          }
        } catch (e) {
          console.error('[API PROXY] Error validating clone payload size:', e);
        }
      }
    }

    try {
      // Create session proxy context
      const context: ProxyContext = {};

      // Retrieve Authorization Header or Session Cookie
      const authHeader = req.headers.get('Authorization');

      // Sandbox validation or Firebase authentication check
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const volunteerToken = process.env.SANDBOX_TOKEN_VOLUNTEER;
        const leadToken = process.env.SANDBOX_TOKEN_LEAD;

        if (volunteerToken && token === volunteerToken) {
          context.user = {
            email: 'volunteer.gatec@fifa.com',
            role: 'Field Volunteer',
            gate: 'Gate C',
          };
        } else if (leadToken && token === leadToken) {
          context.user = {
            email: 'operations.lead@fifa.com',
            role: 'Control Room Supervisor',
            gate: 'All Gates',
          };
        }
      }

      // Execute target API Route handler
      const response = await handler(req, context);

      const duration = Date.now() - startTime;
      console.log(
        `[API PROXY] Request completed: ${req.method} ${apiPath} in ${duration}ms (status: ${response.status})`,
      );

      return response;
    } catch (error: unknown) {
      const duration = Date.now() - startTime;
      const message = error instanceof Error ? error.message : String(error);
      console.error(
        `[API PROXY] Request failed: ${req.method} ${apiPath} in ${duration}ms - Error: ${message}`,
      );

      return NextResponse.json(
        {
          error: 'Internal Operational Server Error',
          message: message || 'An unexpected telemetry error occurred.',
          mode: 'PROXY_FALLBACK',
        },
        { status: 500 },
      );
    }
  };
}
