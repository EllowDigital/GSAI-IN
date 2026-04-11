import {
  createRemoteJWKSet,
  decodeProtectedHeader,
  jwtVerify,
} from 'npm:jose@5.9.6';

const JWKS_URL =
  'https://jddeuhrocglnisujixdt.supabase.co/auth/v1/.well-known/jwks.json';
const EXPECTED_KID = '1f8a09b4-f4d4-4432-bb0e-08afb5fe90de';
const EXPECTED_ALGORITHM = 'ES256';
const EXPECTED_ISSUER = 'https://jddeuhrocglnisujixdt.supabase.co/auth/v1';

const jwks = createRemoteJWKSet(new URL(JWKS_URL));

export async function verifyRequestJwt(req: Request): Promise<void> {
  const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length).trim()
    : '';

  if (!token) {
    throw new Error('Missing bearer token');
  }

  const header = decodeProtectedHeader(token);
  if (header.alg !== EXPECTED_ALGORITHM) {
    throw new Error(`Unexpected JWT algorithm: ${header.alg}`);
  }

  if (header.kid !== EXPECTED_KID) {
    throw new Error(`Unexpected JWT key id: ${header.kid}`);
  }

  await jwtVerify(token, jwks, {
    algorithms: [EXPECTED_ALGORITHM],
    issuer: EXPECTED_ISSUER,
  });
}
