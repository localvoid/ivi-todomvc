export class CachedQuery<T> {
  private v: T | undefined;
  private f: () => T;

  constructor(f: () => T) {
    this.v = void 0;
    this.f = f;
  }

  get(): T {
    if (this.v === void 0) {
      this.v = this.f();
    }
    return this.v;
  }

  reset() { this.v = void 0; }
}

export function cachedQuery<T>(f: () => T): CachedQuery<T> {
  return new CachedQuery(f);
}
