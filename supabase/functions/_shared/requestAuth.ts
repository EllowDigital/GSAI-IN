import {
  createRemoteJWKSet,
  jwtVerify,
} from 'npm:jose@5.9.6';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')?.trim() || '';

if (!SUPABASE_URL) {
  throw new Error('Missing SUPABASE_URL environment variable');
}

const EXPECTED_ISSUER = `${SUPABASE_URL}/auth/v1`;
const JWKS_URL = `${EXPECTED_ISSUER}/.well-known/jwks.json`;
const ALGORITHMS = (
  Deno.env.get('SUPABASE_JWT_ALGORITHMS') || 'ES256'
)
  .split(',')
  .map((alg) => alg.trim())
  .filter(Boolean);

const jwks = createRemoteJWKSet(new URL(JWKS_URL));

export async function verifyRequestJwt(req: Request): Promise<void> {
  const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length).trim()
    : '';

  if (!token) {
    throw new Error('Missing bearer token');
  }

  await jwtVerify(token, jwks, {
    algorithms: ALGORITHMS,
    issuer: EXPECTED_ISSUER,
  });
}
