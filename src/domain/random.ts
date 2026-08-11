function hashString(input: string): number { let hash = 2166136261; for (let i = 0; i < input.length; i += 1) { hash ^= input.charCodeAt(i); hash = Math.imul(hash, 16777619); } return hash >>> 0; }
function mix32(value: number): number { let x = value >>> 0; x ^= x >>> 16; x = Math.imul(x, 0x7feb352d); x ^= x >>> 15; x = Math.imul(x, 0x846ca68b); x ^= x >>> 16; return x >>> 0; }
function keyedRandom(soul: string, key: string): number { return mix32(hashString(`${soul}:${key}`)) / 0x100000000; }
export function keyedRange(soul: string, key: string, min: number, max: number): number { return min + keyedRandom(soul, key) * (max - min); }
export function keyedPick<T>(soul: string, key: string, values: readonly T[]): T { if (values.length === 0) throw new Error("keyedPick requires at least one value"); const index = Math.min(values.length - 1, Math.floor(keyedRandom(soul, key) * values.length)); return values[index]; }
