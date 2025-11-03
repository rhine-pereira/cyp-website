const memStore = new Map<string, string>();

function getLS() {
  try {
    if (typeof window === 'undefined') return null;
    const ls = window.localStorage;
    const testKey = '__test__';
    ls.setItem(testKey, '1');
    ls.removeItem(testKey);
    return ls;
  } catch {
    return null;
  }
}

export function getItem(key: string): string | null {
  const ls = getLS();
  if (ls) {
    try { return ls.getItem(key); } catch { return null; }
  }
  return memStore.get(key) ?? null;
}

export function setItem(key: string, value: string): void {
  const ls = getLS();
  if (ls) {
    try { ls.setItem(key, value); return; } catch {}
  }
  memStore.set(key, value);
}

export function removeItem(key: string): void {
  const ls = getLS();
  if (ls) {
    try { ls.removeItem(key); return; } catch {}
  }
  memStore.delete(key);
}
