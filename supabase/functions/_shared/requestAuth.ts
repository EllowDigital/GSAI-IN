import {
  createRemoteJWKSet,
  jwtVerify,
} from 'npm:jose@5.9.6';

const DEFAULT_ALGORITHMS = ['ES256'];
const VALID_JWA_ALGORITHMS = new Set([
  'RS256',
  'RS384',
  'RS512',
  'PS256',
  'PS384',
  'PS512',
  'ES256',
  'ES384',
  'ES512',
  'EdDSA',
]);

let cachedIssuer: string | null = null;
let cachedJwks: ReturnType<typeof createRemoteJWKSet> | null = null;

export class RequestJwtError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'RequestJwtError';
    this.status = status;
  }
}

function normalizeSupabaseUrl(url: string): string {
  return url.replace(/\/+$/, '');
}

function getAlgorithmsFromEnv(): string[] {
  const configuredAlgorithms = (Deno.env.get('SUPABASE_JWT_ALGORITHMS') || '')
    .split(',')
    .map((alg) => alg.trim())
    .filter(Boolean);

  const algorithms = configuredAlgorithms.length > 0
    ? configuredAlgorithms
    : DEFAULT_ALGORITHMS;

  const invalidAlgorithms = algorithms.filter(
    (alg) => !VALID_JWA_ALGORITHMS.has(alg)
  );

  if (invalidAlgorithms.length > 0) {
    throw new Error(
      `Invalid SUPABASE_JWT_ALGORITHMS value: ${invalidAlgorithms.join(', ')}`
    );
  }

  return algorithms;
}

function getVerifierConfig(): {
  issuer: string;
  jwks: ReturnType<typeof createRemoteJWKSet>;
  algorithms: string[];
} {
  const rawSupabaseUrl = Deno.env.get('SUPABASE_URL')?.trim() || '';
  if (!rawSupabaseUrl) {
    throw new Error('Missing SUPABASE_URL environment variable');
  }

  const normalizedSupabaseUrl = normalizeSupabaseUrl(rawSupabaseUrl);
  const issuer = `${normalizedSupabaseUrl}/auth/v1`;
  const jwksUrl = `${issuer}/.well-known/jwks.json`;

  if (cachedIssuer !== issuer || !cachedJwks) {
    cachedIssuer = issuer;
    cachedJwks = createRemoteJWKSet(new URL(jwksUrl));
  }

  return {
    issuer,
    jwks: cachedJwks,
    algorithms: getAlgorithmsFromEnv(),
  };
}

export async function verifyRequestJwt(
  req: Request
): Promise<Record<string, unknown>> {
  const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length).trim()
    : '';

  if (!token) {
    throw new RequestJwtError(401, 'Missing bearer token');
  }

  let issuer = '';
  let jwks: ReturnType<typeof createRemoteJWKSet>;
  let algorithms: string[] = [];

  try {
    ({ issuer, jwks, algorithms } = getVerifierConfig());
  } catch (error) {
    const message = error instanceof Error
      ? error.message
      : 'JWT verifier is misconfigured';
    throw new RequestJwtError(500, message);
  }

  const unauthorizedErrorNames = new Set([
    'JWTExpired',
    'JWTClaimValidationFailed',
    'JWTInvalid',
    'JWSInvalid',
    'JWSSignatureVerificationFailed',
  ]);

  let payload: Record<string, unknown>;

  try {
    const result = await jwtVerify(token, jwks, {
      algorithms,
      issuer,
    });
    payload = result.payload as Record<string, unknown>;
  } catch (error) {
    const name = error instanceof Error ? error.name : '';

    if (unauthorizedErrorNames.has(name)) {
      throw new RequestJwtError(401, 'Invalid or expired bearer token');
    }

    throw new RequestJwtError(500, 'Token verification unavailable');
  }

  return payload;
}
