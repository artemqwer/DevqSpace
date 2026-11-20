export const RESCUE_PATH = "/shadowrescue";
export const MAX_ISO_BYTES = 4 * 1024 ** 3;
export const ISO_CONTENT_TYPE = "application/octet-stream";
export const RELEASE_VERSION = /^\d{1,4}\.\d{1,4}\.\d{1,4}(?:-[a-z0-9]+(?:[.-][a-z0-9]+)*)?$/;
export const RELEASE_ID = /^\d{1,4}\.\d{1,4}\.\d{1,4}(?:-[a-z0-9]+(?:[.-][a-z0-9]+)*)?-(?:x86-64|x86)$/;

export type ReleaseArch = "x86-64" | "x86";
export type Release = {
  id: string;
  version: string;
  arch: ReleaseArch;
  size: number;
  sha256: string;
  commit: string;
  notes: string;
  checks: string;
  pathname: string;
  createdAt: string;
} & (
  | { status: "draft" }
  | { status: "published"; publishedAt: string; etag: string }
  | { status: "withdrawn"; publishedAt: string; reason: string }
);

export type PublishedRelease = Extract<Release, { status: "published" }>;
export type PublicRelease = Extract<Release, { status: "published" | "withdrawn" }>;

export function releaseUrl(id: string) {
  return RESCUE_PATH + "/releases/" + id;
}

export function isoName(release: Pick<Release, "id">) {
  return "ShadxwRescue-" + release.id + ".iso";
}

export function isoSize(bytes: number) {
  return bytes >= 1024 ** 3
    ? (bytes / 1024 ** 3).toLocaleString("ru-RU", { maximumFractionDigits: 2 }) + " ГиБ"
    : (bytes / 1024 ** 2).toLocaleString("ru-RU", { maximumFractionDigits: 2 }) + " МиБ";
}

export function isRescuePath(pathname: string | null) {
  return pathname === RESCUE_PATH || Boolean(pathname?.startsWith(RESCUE_PATH + "/"));
}
