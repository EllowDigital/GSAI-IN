type AuthScope = 'admin' | 'student';

type AuthTelemetryCounters = {
  lockWaitWarnings: number;
  adminAuthCallbackCount: number;
  adminAuthCallbackDurationTotalMs: number;
  adminAuthCallbackMaxMs: number;
  studentAuthCallbackCount: number;
  studentAuthCallbackDurationTotalMs: number;
  studentAuthCallbackMaxMs: number;
  sessionRefreshCount: number;
  sessionRefreshDurationTotalMs: number;
  sessionRefreshMaxMs: number;
  updatedAt: string;
};

const TELEMETRY_STORAGE_KEY = 'gsai-auth-telemetry';

const emptyCounters = (): AuthTelemetryCounters => ({
  lockWaitWarnings: 0,
  adminAuthCallbackCount: 0,
  adminAuthCallbackDurationTotalMs: 0,
  adminAuthCallbackMaxMs: 0,
  studentAuthCallbackCount: 0,
  studentAuthCallbackDurationTotalMs: 0,
  studentAuthCallbackMaxMs: 0,
  sessionRefreshCount: 0,
  sessionRefreshDurationTotalMs: 0,
  sessionRefreshMaxMs: 0,
  updatedAt: new Date().toISOString(),
});

const readCounters = (): AuthTelemetryCounters => {
  if (typeof window === 'undefined') return emptyCounters();

  try {
    const raw = window.localStorage.getItem(TELEMETRY_STORAGE_KEY);
    if (!raw) return emptyCounters();
    const parsed = JSON.parse(raw) as Partial<AuthTelemetryCounters>;
    return {
      ...emptyCounters(),
      ...parsed,
      updatedAt: new Date().toISOString(),
    };
  } catch {
    return emptyCounters();
  }
};

const writeCounters = (counters: AuthTelemetryCounters) => {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(TELEMETRY_STORAGE_KEY, JSON.stringify(counters));
  } catch {
    // Ignore storage quota or privacy mode failures.
  }
};

const updateCounters = (updater: (draft: AuthTelemetryCounters) => void) => {
  const counters = readCounters();
  updater(counters);
  counters.updatedAt = new Date().toISOString();
  writeCounters(counters);
};

const lockWarningPattern =
  /@supabase\/gotrue-js: Lock "lock:[^"]+" was not released within 5000ms/i;

let consoleTelemetryPatched = false;

export const initializeAuthTelemetry = () => {
  if (typeof window === 'undefined' || consoleTelemetryPatched) return;

  const originalWarn = console.warn.bind(console);

  console.warn = (...args: unknown[]) => {
    try {
      const firstArg = args[0];
      const message = typeof firstArg === 'string' ? firstArg : '';
      if (lockWarningPattern.test(message)) {
        updateCounters((draft) => {
          draft.lockWaitWarnings += 1;
        });
      }
    } catch {
      // Never block the original console.warn behavior.
    }

    originalWarn(...args);
  };

  consoleTelemetryPatched = true;
};

export const recordAuthCallbackDuration = (
  scope: AuthScope,
  durationMs: number,
  event: string
) => {
  const safeDurationMs = Number.isFinite(durationMs)
    ? Math.max(0, Math.round(durationMs))
    : 0;

  updateCounters((draft) => {
    if (scope === 'admin') {
      draft.adminAuthCallbackCount += 1;
      draft.adminAuthCallbackDurationTotalMs += safeDurationMs;
      draft.adminAuthCallbackMaxMs = Math.max(
        draft.adminAuthCallbackMaxMs,
        safeDurationMs
      );
    } else {
      draft.studentAuthCallbackCount += 1;
      draft.studentAuthCallbackDurationTotalMs += safeDurationMs;
      draft.studentAuthCallbackMaxMs = Math.max(
        draft.studentAuthCallbackMaxMs,
        safeDurationMs
      );
    }

    if (event === 'TOKEN_REFRESHED') {
      draft.sessionRefreshCount += 1;
      draft.sessionRefreshDurationTotalMs += safeDurationMs;
      draft.sessionRefreshMaxMs = Math.max(
        draft.sessionRefreshMaxMs,
        safeDurationMs
      );
    }
  });
};
