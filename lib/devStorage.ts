import "server-only";
import {
  mkdirSync,
  readFileSync,
  writeFileSync,
  readdirSync,
  existsSync,
  rmSync,
} from "node:fs";
import { dirname, join, resolve, sep } from "node:path";

// Локальне сховище dev-заглушок: .devq-storage/ у корені проєкту.
// Замінює Vercel Blob, поштову скриньку Resend і вихідні Telegram-повідомлення,
// щоб наскрізний сценарій оплата → упаковка → лист → завантаження проганявся
// локально без жодного зовнішнього ключа.

export const DEV_ROOT = join(process.cwd(), ".devq-storage");

export const DEV_BLOB_ROUTE = "/api/dev/blob/";

function ensureDir(dir: string): void {
  mkdirSync(dir, { recursive: true });
}

// Захист від виходу за межі сховища (../../ у ключі об'єкта).
function safeJoin(root: string, relPath: string): string | null {
  const target = resolve(root, relPath);
  const rootResolved = resolve(root);
  if (target !== rootResolved && !target.startsWith(rootResolved + sep)) {
    return null;
  }
  return target;
}

// ---- Довільні файли (blob) ------------------------------------------

export function devWriteFile(sub: string, relPath: string, data: Uint8Array): boolean {
  const target = safeJoin(join(DEV_ROOT, sub), relPath);
  if (!target) return false;
  ensureDir(dirname(target));
  writeFileSync(target, data);
  return true;
}

export function devReadFile(sub: string, relPath: string): Uint8Array | null {
  const target = safeJoin(join(DEV_ROOT, sub), relPath);
  if (!target || !existsSync(target)) return null;
  return new Uint8Array(readFileSync(target));
}

export function devDeleteFile(sub: string, relPath: string): void {
  const target = safeJoin(join(DEV_ROOT, sub), relPath);
  if (target && existsSync(target)) rmSync(target, { force: true });
}

// ---- JSON-записи з міткою часу (пошта, telegram) --------------------

export type DevMessage<T> = { id: string; at: number; data: T };

export function devAppendMessage<T>(sub: string, data: T): string {
  const dir = join(DEV_ROOT, sub);
  ensureDir(dir);
  const at = Date.now();
  const id = `${at}-${Math.random().toString(36).slice(2, 8)}`;
  const record: DevMessage<T> = { id, at, data };
  writeFileSync(join(dir, `${id}.json`), JSON.stringify(record, null, 2));
  return id;
}

export function devListMessages<T>(sub: string, limit = 50): DevMessage<T>[] {
  const dir = join(DEV_ROOT, sub);
  if (!existsSync(dir)) return [];
  const files = readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .reverse()
    .slice(0, limit);
  const out: DevMessage<T>[] = [];
  for (const f of files) {
    try {
      out.push(JSON.parse(readFileSync(join(dir, f), "utf8")) as DevMessage<T>);
    } catch {
      // пошкоджений запис — просто пропускаємо
    }
  }
  return out;
}

export function devClearMessages(sub: string): void {
  const dir = join(DEV_ROOT, sub);
  if (existsSync(dir)) rmSync(dir, { recursive: true, force: true });
}

// ---- Стан бази (персист in-memory сховища) --------------------------

export function devReadState(name: string): unknown | null {
  const file = join(DEV_ROOT, name);
  if (!existsSync(file)) return null;
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

export function devWriteState(name: string, value: unknown): void {
  ensureDir(DEV_ROOT);
  const file = join(DEV_ROOT, name);
  // Запис через тимчасовий файл, щоб падіння посеред запису не залишило
  // напівзбережений JSON, який далі не розпарситься.
  const tmp = `${file}.tmp`;
  writeFileSync(tmp, JSON.stringify(value));
  writeFileSync(file, readFileSync(tmp));
  rmSync(tmp, { force: true });
}
