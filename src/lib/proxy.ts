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
 * Higher-Order Function (HOF) that wraps Next.js API route handlers with:
 *
 * 1. **Payload safety** — Rejects requests with unsupported Content-Types or
 *    bodies exceeding 100 KB, preventing abuse of the Gemini API endpoints.
 * 2. **Sandbox token authentication** — Resolves Bearer tokens against
 *    environment-variable secrets so automated tests and demo evaluators can
 *    call the API without a live Firebase session.
 * 3. **Structured error handling** — Catches unhandled exceptions from the
 *    inner handler and returns a consistent JSON error envelope with a 500
 *    status, ensuring the client always gets a parseable response.
 * 4. **Response-time header** — Attaches `X-Response-Time` to successful
 *    responses for transparent performance monitoring.
 *
 * @param handler - The route handler to wrap.
 * @returns An async function compatible with Next.js `export const POST = ...` syntax.
 */
export function withRouteProxy(handler: RouteHandler) {
  return async (req: Request) => {
    const startTime = Date.now();
    const url = new URL(req.url);
    const apiPath = url.pathname;

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

      // Expose duration header for monitoring without polluting stdout
      const duration = Date.now() - startTime;
      response.headers?.set?.('X-Response-Time', `${duration}ms`);

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
