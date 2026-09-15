/**
 * 스토리지 어댑터 — 현재 localStorage, 추후 API 백엔드로 교체 가능
 */

export interface StorageAdapter {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
}

const localStorageAdapter: StorageAdapter = {
  get<T>(key: string): T | null {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  },
  set<T>(key: string, value: T): void {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* quota exceeded 등 무시 */
    }
  },
  remove(key: string): void {
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* noop */
    }
  },
};

/** 현재: localStorage / 추후: API 기반 어댑터로 교체 */
export const storage: StorageAdapter = localStorageAdapter;
