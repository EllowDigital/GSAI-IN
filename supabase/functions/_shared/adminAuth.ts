import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { RequestJwtError, verifyRequestJwt } from './requestAuth.ts';

export class RequestAuthError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'RequestAuthError';
    this.status = status;
  }
}

let cachedServiceClient: ReturnType<typeof createClient> | null = null;

function getServiceClient() {
  if (cachedServiceClient) {
    return cachedServiceClient;
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')?.trim() || '';
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')?.trim() || '';

  if (!supabaseUrl || !serviceRoleKey) {
    throw new RequestAuthError(
      500,
      'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variable'
    );
  }

  cachedServiceClient = createClient(supabaseUrl, serviceRoleKey);
  return cachedServiceClient;
}

export async function requireAuthenticatedUser(req: Request): Promise<string> {
  let payload: Record<string, unknown>;

  try {
    payload = await verifyRequestJwt(req);
  } catch (error) {
    if (error instanceof RequestJwtError) {
      throw new RequestAuthError(error.status, error.message);
    }

    const message =
      error instanceof Error ? error.message : 'Auth verification failed';
    throw new RequestAuthError(500, message);
  }

  const userId =
    typeof payload.sub === 'string' && payload.sub.trim().length > 0
      ? payload.sub.trim()
      : '';

  if (!userId) {
    throw new RequestAuthError(401, 'Token subject is missing');
  }

  return userId;
}

export async function getUserRoles(userId: string): Promise<Set<string>> {
  const supabaseAdmin = getServiceClient();

  const { data, error } = await supabaseAdmin
    .from('user_roles')
    .select('role')
    .eq('user_id', userId);

  if (error) {
    throw new RequestAuthError(500, 'Failed to verify user roles');
  }

  return new Set(
    (data || [])
      .map((row: { role?: string }) => row.role || '')
      .filter((role) => role.length > 0)
  );
}

export async function requireAdminUser(req: Request): Promise<string> {
  const userId = await requireAuthenticatedUser(req);
  const roles = await getUserRoles(userId);

  if (!roles.has('admin')) {
    throw new RequestAuthError(403, 'Admin access required');
  }

  return userId;
}
