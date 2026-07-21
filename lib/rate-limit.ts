// Rate limiting básico en memoria, por IP. Suficiente para frenar spam y
// abuso automatizado casual, pero NO es un rate limiter distribuido: cada
// instancia serverless de Vercel tiene su propio Map, y se resetea en cada
// cold start. Para protección robusta contra un atacante persistente hace
// falta un store compartido (ej. Upstash Redis) — queda como mejora futura.

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
const MAX_TRACKED_KEYS = 5000;

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

function pruneExpired(now: number) {
  for (const [key, bucket] of buckets) {
    if (now > bucket.resetAt) {
      buckets.delete(key);
    }
  }
}

/**
 * Devuelve true si `key` superó `limit` peticiones dentro de `windowMs`.
 * Como efecto secundario, registra la petición actual si no está limitada.
 */
export function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();

  if (buckets.size > MAX_TRACKED_KEYS) {
    pruneExpired(now);
  }

  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  if (bucket.count >= limit) {
    return true;
  }

  bucket.count += 1;
  return false;
}
