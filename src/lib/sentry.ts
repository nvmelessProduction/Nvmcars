// Sentry wrapper safe: si attiva solo se EXPO_PUBLIC_SENTRY_DSN è in env e la dep è installata.
let sentry: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  sentry = require("@sentry/react-native");
} catch {
  sentry = null;
}

let initialized = false;

export function initSentry() {
  if (initialized || !sentry) return;
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
  if (!dsn) return;
  try {
    sentry.init({
      dsn,
      environment: process.env.EXPO_PUBLIC_ENV ?? "development",
      tracesSampleRate: 0.2,
      enableAutoSessionTracking: true,
    });
    initialized = true;
  } catch (e) {
    console.warn("Sentry init failed:", e);
  }
}

export function captureException(err: unknown, extra?: Record<string, unknown>) {
  if (!sentry || !initialized) {
    console.error("[error]", err, extra);
    return;
  }
  try {
    sentry.captureException(err, { extra });
  } catch {
    /* noop */
  }
}
