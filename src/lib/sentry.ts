// Sentry wrapper safe: si attiva solo se EXPO_PUBLIC_SENTRY_DSN è in env
// e la dep è installata. Include scrubbing PII per non leakare email,
// telefono, IBAN, codice fiscale, indirizzo legale, push_token.

let sentry: any = null;
try {
  sentry = require("@sentry/react-native");
} catch {
  sentry = null;
}

let initialized = false;

// Campi che NON devono mai finire in Sentry.
const PII_FIELDS = new Set([
  "email",
  "phone",
  "iban",
  "tax_id",
  "vat_number",
  "legal_address",
  "push_token",
  "password",
  "token",
  "access_token",
  "refresh_token",
  "api_key",
  "stripe_account_id",
  "stripe_customer_id",
]);

// Pattern testuali sensibili (IBAN IT, codici fiscali, email)
const IBAN_RE = /\b[A-Z]{2}\d{2}[A-Z0-9]{1,30}\b/g;
const CF_RE = /\b[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]\b/g;
const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

function scrubString(s: string): string {
  return s
    .replace(IBAN_RE, "[IBAN]")
    .replace(CF_RE, "[CF]")
    .replace(EMAIL_RE, "[EMAIL]");
}

function scrub(value: unknown, depth = 0): unknown {
  if (depth > 6) return "[max_depth]";
  if (value == null) return value;
  if (typeof value === "string") return scrubString(value);
  if (typeof value === "number" || typeof value === "boolean") return value;
  if (Array.isArray(value)) return value.map((v) => scrub(v, depth + 1));
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (PII_FIELDS.has(k.toLowerCase())) {
        out[k] = "[REDACTED]";
        continue;
      }
      out[k] = scrub(v, depth + 1);
    }
    return out;
  }
  return value;
}

function beforeSend(event: any): any {
  try {
    if (event.request) {
      if (event.request.headers) {
        delete event.request.headers["Authorization"];
        delete event.request.headers["authorization"];
        delete event.request.headers["Cookie"];
        delete event.request.headers["cookie"];
      }
      // URL può contenere query con PII (es. ?email=...)
      if (typeof event.request.url === "string") {
        try {
          const u = new URL(event.request.url);
          if (u.search) u.search = "?[REDACTED]";
          event.request.url = u.toString();
        } catch {
          event.request.url = "[URL_REDACTED]";
        }
      }
      // body può contenere JSON con dati personali
      if (event.request.data) event.request.data = "[BODY_REDACTED]";
      // @ts-ignore
      if (event.request.body) event.request.body = "[BODY_REDACTED]";
      if (event.request.query_string) event.request.query_string = "[REDACTED]";
    }
    if (event.user) {
      // Tieni solo lo user id, niente email/phone/IP
      event.user = { id: event.user.id };
    }
    if (event.contexts) event.contexts = scrub(event.contexts);
    if (event.extra) event.extra = scrub(event.extra);
    if (event.tags) event.tags = scrub(event.tags);
    if (event.breadcrumbs) {
      event.breadcrumbs = event.breadcrumbs.map((b: any) => ({
        ...b,
        data: b.data ? scrub(b.data) : b.data,
        message: typeof b.message === "string" ? scrubString(b.message) : b.message,
      }));
    }
    if (event.exception?.values) {
      event.exception.values = event.exception.values.map((v: any) => ({
        ...v,
        value: typeof v.value === "string" ? scrubString(v.value) : v.value,
      }));
    }
    if (typeof event.message === "string") event.message = scrubString(event.message);
  } catch {
    // se lo scrubbing fallisce, droppiamo l'evento per sicurezza
    return null;
  }
  return event;
}

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
      sendDefaultPii: false,
      beforeSend,
      beforeBreadcrumb: (b: any) => ({
        ...b,
        data: b.data ? (scrub(b.data) as Record<string, unknown>) : b.data,
        message: typeof b.message === "string" ? scrubString(b.message) : b.message,
      }),
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
    sentry.captureException(err, { extra: extra ? scrub(extra) : extra });
  } catch {
    /* noop */
  }
}
