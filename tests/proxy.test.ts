import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { type ProxyContext, withRouteProxy } from '@/lib/proxy';

const originalSandboxVolunteerToken = process.env.SANDBOX_TOKEN_VOLUNTEER;
const originalSandboxLeadToken = process.env.SANDBOX_TOKEN_LEAD;

beforeEach(() => {
  process.env.SANDBOX_TOKEN_VOLUNTEER = 'sandbox-token-volunteer';
  process.env.SANDBOX_TOKEN_LEAD = 'sandbox-token-lead';
});

afterEach(() => {
  if (originalSandboxVolunteerToken === undefined) {
    delete process.env.SANDBOX_TOKEN_VOLUNTEER;
  } else {
    process.env.SANDBOX_TOKEN_VOLUNTEER = originalSandboxVolunteerToken;
  }

  if (originalSandboxLeadToken === undefined) {
    delete process.env.SANDBOX_TOKEN_LEAD;
  } else {
    process.env.SANDBOX_TOKEN_LEAD = originalSandboxLeadToken;
  }
});

describe('API Route Proxy', () => {
  it('should pass request to the handler and return response', async () => {
    const handler = withRouteProxy(async (_req) => {
      return new Response('success', { status: 200 });
    });

    const req = new Request('http://localhost/api/test', { method: 'GET' });
    const res = await handler(req);
    expect(res.status).toBe(200);
    const body = await res.text();
    expect(body).toBe('success');
  });

  it('should catch exceptions and return a 500 error payload', async () => {
    const handler = withRouteProxy(async (_req) => {
      throw new Error('Test logic crash');
    });

    const req = new Request('http://localhost/api/test', { method: 'GET' });
    const res = await handler(req);
    expect(res.status).toBe(500);

    const body = await res.json();
    expect(body.error).toBe('Internal Operational Server Error');
    expect(body.message).toBe('Test logic crash');
    expect(body.mode).toBe('PROXY_FALLBACK');
  });

  it('should parse bearer token for sandbox volunteers', async () => {
    let capturedContext: ProxyContext | null = null;
    const handler = withRouteProxy(async (_req, context) => {
      capturedContext = context;
      return new Response('ok', { status: 200 });
    });

    const req = new Request('http://localhost/api/test', {
      method: 'GET',
      headers: {
        Authorization: 'Bearer sandbox-token-volunteer',
      },
    });

    await handler(req);
    expect(capturedContext).toBeDefined();
    expect(capturedContext?.user).toBeDefined();
    expect(capturedContext?.user?.email).toBe('volunteer.gatec@fifa.com');
    expect(capturedContext?.user?.role).toBe('Field Volunteer');
    expect(capturedContext?.user?.gate).toBe('Gate C');
  });

  it('should parse bearer token for sandbox lead supervisors', async () => {
    let capturedContext: ProxyContext | null = null;
    const handler = withRouteProxy(async (_req, context) => {
      capturedContext = context;
      return new Response('ok', { status: 200 });
    });

    const req = new Request('http://localhost/api/test', {
      method: 'GET',
      headers: {
        Authorization: 'Bearer sandbox-token-lead',
      },
    });

    await handler(req);
    expect(capturedContext).toBeDefined();
    expect(capturedContext?.user).toBeDefined();
    expect(capturedContext?.user?.email).toBe('operations.lead@fifa.com');
    expect(capturedContext?.user?.role).toBe('Control Room Supervisor');
  });

  it('should not authenticate sandbox tokens when env secrets are absent', async () => {
    delete process.env.SANDBOX_TOKEN_VOLUNTEER;
    delete process.env.SANDBOX_TOKEN_LEAD;

    let capturedContext: ProxyContext | null = null;
    const handler = withRouteProxy(async (_req, context) => {
      capturedContext = context;
      return new Response('ok', { status: 200 });
    });

    const req = new Request('http://localhost/api/test', {
      method: 'GET',
      headers: {
        Authorization: 'Bearer sandbox-token-volunteer',
      },
    });

    await handler(req);
    expect(capturedContext).toBeDefined();
    expect(capturedContext?.user).toBeUndefined();
  });
});
