let fallbackCounter = 0;

export function uid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  fallbackCounter += 1;
  return `id-${Date.now()}-${fallbackCounter}`;
}
