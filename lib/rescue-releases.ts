import "server-only";
import { createHash, randomUUID, timingSafeEqual } from "node:crypto";
import { Redis } from "@upstash/redis";
import { get, head, issueSignedToken, list, presignUrl } from "@vercel/blob";
import {
  MAX_ISO_BYTES, RELEASE_ID, RELEASE_VERSION, isoName,
  type PublishedRelease, type PublicRelease, type Release, type StoredIso,
} from "./rescue-release-types";

const KEY = "shadxwrescue:releases:v1";
const SHA256 = /^[a-f0-9]{64}$/;
const COMMIT = /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/;

export class ReleaseError extends Error {
  readonly status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

function redis() {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  return url && token ? new Redis({ url, token, automaticDeserialization: false }) : null;
}

export function releaseStorageConfigured() {
  return Boolean(redis() && process.env.SHADXWRESCUE_BLOB_TOKEN);
}

function requireStore() {
  const store = redis();
  if (!store) throw new ReleaseError("Налаштуйте постійне сховище Redis.", 503);
  return store;
}

export function privateBlobToken() {
  const token = process.env.SHADXWRESCUE_BLOB_TOKEN;
  if (!token) throw new ReleaseError("Налаштуйте приватне сховище для ISO.", 503);
  return token;
}

export async function listReleases(): Promise<Release[]> {
  // With automatic deserialization disabled, Upstash returns alternating field names and values.
  const rows = await redis()?.hgetall<Record<string, string>>(KEY) as string[] | Record<string, string> | null | undefined;
  const values = Array.isArray(rows) ? rows.filter((_value, index) => index % 2 === 1) : Object.values(rows ?? {});
  return values.map((value) => JSON.parse(value) as Release);
}

export async function listPublicReleases(): Promise<PublicRelease[]> {
  return (await listReleases())
    .filter((release): release is PublicRelease => release.status !== "draft")
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt) || b.id.localeCompare(a.id));
}

export async function getRelease(id: string): Promise<Release | null> {
  if (!RELEASE_ID.test(id) || id.length > 68) return null;
  const row = await redis()?.hget<string>(KEY, id);
  return row ? JSON.parse(row) as Release : null;
}

function shortText(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max + 1) : "";
}

export async function createDraft(input: Record<string, unknown>) {
  const store = requireStore();
  privateBlobToken();
  const version = shortText(input.version, 50);
  const arch = input.arch;
  const sha256 = shortText(input.sha256, 64).toLowerCase();
  const commit = shortText(input.commit, 64).toLowerCase();
  const notes = shortText(input.notes, 8_000);
  const checks = shortText(input.checks, 4_000);
  const size = input.size;
  if (version.length > 50 || !RELEASE_VERSION.test(version)) {
    throw new ReleaseError("Вкажіть версію на кшталт 1.0.0-beta.1.");
  }
  if (arch !== "x86-64" && arch !== "x86") throw new ReleaseError("Невідома архітектура.");
  if (typeof size !== "number" || !Number.isSafeInteger(size) || size <= 0 || size > MAX_ISO_BYTES) {
    throw new ReleaseError("Розмір ISO має бути від 1 байта до 4 ГіБ.");
  }
  if (!SHA256.test(sha256) || (commit && !COMMIT.test(commit))) {
    throw new ReleaseError("Вкажіть SHA-256 образу та, за наявності, повний Git-коміт збірки.");
  }
  if (notes.length > 8_000 || checks.length > 4_000) {
    throw new ReleaseError("Список змін або результати перевірок надто довгі.");
  }
  const id = version + "-" + arch;
  const draft: Release = {
    id, version, arch, size, sha256, commit, notes, checks,
    pathname: "shadxwrescue/" + randomUUID() + "/" + isoName({ id }),
    status: "draft", createdAt: new Date().toISOString(),
  };
  const saved = await store.hsetnx(KEY, id, JSON.stringify(draft));
  if (Number(saved) !== 1) throw new ReleaseError("Ця версія для вибраної архітектури вже існує.", 409);
  return draft;
}

// Compare-and-swap: a concurrent publish, withdrawal or upload reset must not replace newer data.
const compareAndSwap = `if redis.call("HGET", KEYS[1], ARGV[1]) ~= ARGV[2] then return 0 end
redis.call("HSET", KEYS[1], ARGV[1], ARGV[3])
return 1`;

async function saveTransition(previous: Release, next: Release) {
  const stored = await requireStore().eval<string[], number>(compareAndSwap, [KEY], [
    previous.id, JSON.stringify(previous), JSON.stringify(next),
  ]);
  if (Number(stored) !== 1) throw new ReleaseError("Стан випуску змінився. Оновіть сторінку.", 409);
}

export async function resetDraftUpload(release: Release) {
  if (release.status !== "draft") throw new ReleaseError("Змінити шлях можна лише в чернетці.", 409);
  const next: Release = {
    ...release, pathname: "shadxwrescue/" + randomUUID() + "/" + isoName(release),
  };
  await saveTransition(release, next);
  return next;
}

export async function listStoredIsos(): Promise<StoredIso[]> {
  const token = privateBlobToken();
  const files: StoredIso[] = [];
  let cursor: string | undefined;
  do {
    const page = await list({ token, prefix: "shadxwrescue/", cursor });
    for (const blob of page.blobs) {
      if (/^shadxwrescue\/[0-9a-f-]{36}\/ShadxwRescue-.+\.iso$/.test(blob.pathname)) {
        files.push({ pathname: blob.pathname, size: blob.size, uploadedAt: blob.uploadedAt.toISOString() });
      }
    }
    if (page.hasMore && !page.cursor) throw new Error("Blob pagination cursor missing");
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return files.sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
}

export async function selectStoredIso(release: Release, pathname: unknown) {
  if (release.status !== "draft") throw new ReleaseError("Змінювати ISO можна лише в чернетці.", 409);
  if (typeof pathname !== "string") throw new ReleaseError("Цей ISO не належить до випуску.", 400);
  const parts = pathname.split("/");
  if (parts.length !== 3 || parts[0] !== "shadxwrescue" || !/^[0-9a-f-]{36}$/.test(parts[1]) || parts[2] !== isoName(release)) {
    throw new ReleaseError("Цей ISO не належить до випуску.", 400);
  }
  const file = await head(pathname, { token: privateBlobToken() });
  if (file.size !== release.size) throw new ReleaseError("Розмір ISO не збігається з чернеткою.", 422);
  if (pathname === release.pathname) return release;
  const next: Release = { ...release, pathname };
  await saveTransition(release, next);
  return next;
}

const normalizeEtag = (etag: string) => etag.replace(/^W\//, "").replace(/^"|"$/g, "");

async function verifyStoredIso(release: Release, abortSignal: AbortSignal) {
  const token = privateBlobToken();
  let file: Awaited<ReturnType<typeof get>>;
  const signal = AbortSignal.any([abortSignal, AbortSignal.timeout(265_000)]);
  try {
    file = await get(release.pathname, { access: "private", token, useCache: false, abortSignal: signal });
  } catch (error) {
    if (signal.aborted) throw new ReleaseError("Перевірку перервано або час минув.", 504);
    throw error;
  }
  if (!file || file.statusCode !== 200) throw new ReleaseError("ISO ще не завантажено.", 409);
  const before = await head(release.pathname, { token, abortSignal: signal });
  if (!before.etag || before.size !== release.size) {
    await file.stream.cancel();
    throw new ReleaseError("Розмір завантаженого ISO не збігається з чернеткою.", 422);
  }
  if (file.blob.etag && normalizeEtag(file.blob.etag) !== normalizeEtag(before.etag)) {
    await file.stream.cancel();
    throw new ReleaseError("Образ у сховищі змінився під час перевірки.", 409);
  }
  const hash = createHash("sha256");
  let bytes = 0;
  const reader = file.stream.getReader();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > release.size) {
        await reader.cancel();
        throw new ReleaseError("Розмір завантаженого ISO не збігається з чернеткою.", 422);
      }
      hash.update(value);
    }
  } catch (error) {
    if (signal.aborted) throw new ReleaseError("Перевірку перервано або час минув.", 504);
    throw error;
  } finally {
    reader.releaseLock();
  }
  if (bytes !== release.size) {
    throw new ReleaseError("Розмір завантаженого ISO не збігається з чернеткою.", 422);
  }
  if (!timingSafeEqual(hash.digest(), Buffer.from(release.sha256, "hex"))) {
    throw new ReleaseError("SHA-256 завантаженого ISO не збігається з чернеткою.", 422);
  }
  const after = await head(release.pathname, { token, abortSignal: signal });
  if (after.size !== before.size || normalizeEtag(after.etag) !== normalizeEtag(before.etag)) {
    throw new ReleaseError("Образ у сховищі змінився під час перевірки.", 409);
  }
  return after.etag;
}

export async function verifyAndPublish(release: Release, abortSignal: AbortSignal) {
  if (release.status !== "draft") throw new ReleaseError("Публікувати можна лише чернетку.", 409);
  const etag = await verifyStoredIso(release, abortSignal);
  const published: PublishedRelease = {
    ...release, status: "published", publishedAt: new Date().toISOString(), etag,
  };
  await saveTransition(release, published);
  return published;
}

export async function withdrawRelease(release: Release, rawReason: unknown) {
  if (release.status !== "published") throw new ReleaseError("Відкликати можна лише опублікований випуск.", 409);
  const reason = shortText(rawReason, 600);
  if (!reason || reason.length > 600) throw new ReleaseError("Вкажіть причину відкликання (до 600 символів).");
  const { etag, ...metadata } = release;
  if (!etag) throw new ReleaseError("Немає перевіреного ISO.", 409);
  const withdrawn: Release = { ...metadata, status: "withdrawn", reason };
  await saveTransition(release, withdrawn);
  return withdrawn;
}

export async function resolveIsoDownload(release: PublishedRelease, abortSignal: AbortSignal) {
  const token = privateBlobToken();
  const file = await head(release.pathname, { token });
  if (!file.etag || file.size !== release.size) {
    throw new ReleaseError("Образ у сховищі змінився після перевірки.", 503);
  }
  if (!release.etag || normalizeEtag(file.etag) !== normalizeEtag(release.etag)) {
    const etag = await verifyStoredIso(release, abortSignal);
    await saveTransition(release, { ...release, etag });
  }
  const validUntil = Date.now() + 60 * 60_000;
  const permission = await issueSignedToken({
    pathname: release.pathname, operations: ["get"], validUntil, token,
  });
  const { presignedUrl } = await presignUrl(permission, {
    pathname: release.pathname, operation: "get", access: "private",
  });
  return presignedUrl;
}
