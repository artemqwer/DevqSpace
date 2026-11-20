import { createHash } from "node:crypto";
import { createReadStream, openAsBlob } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import { upload } from "@vercel/blob/client";

const HELP = [
  "node scripts/shadxwrescue-release.mjs prepare <iso> <version> <arch> <commit> <notes.txt> <checks.txt>",
  "node scripts/shadxwrescue-release.mjs stage <site-url> <iso> <manifest.json>",
  "node scripts/shadxwrescue-release.mjs publish <site-url> <release-id>",
].join("\n");

async function inspect(file) {
  if (!file.toLowerCase().endsWith(".iso")) throw new Error("Expected an ISO file.");
  const before = await stat(file);
  if (!before.isFile() || before.size <= 0 || before.size > 4 * 1024 ** 3) {
    throw new Error("ISO size must be between 1 byte and 4 GiB.");
  }
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(file)) hash.update(chunk);
  const after = await stat(file);
  if (before.size !== after.size || before.mtimeMs !== after.mtimeMs || before.ino !== after.ino) {
    throw new Error("ISO changed during hashing.");
  }
  return { size: before.size, sha256: hash.digest("hex") };
}

function adminClient(address) {
  const origin = new URL(address);
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(origin.hostname);
  if ((origin.protocol !== "https:" && !(local && origin.protocol === "http:")) || origin.username || origin.password) {
    throw new Error("Use an HTTPS site URL or an HTTP loopback URL.");
  }
  const token = process.env.SHADXWRESCUE_ADMIN_KEY;
  if (!token) throw new Error("Set SHADXWRESCUE_ADMIN_KEY in the environment.");
  const endpoint = origin.origin + "/api/admin/shadxwrescue";
  const headers = { Authorization: "Bearer " + token };
  return {
    headers, endpoint,
    async request(body, conflictAllowed = false) {
      const res = await fetch(endpoint, {
        method: "POST", redirect: "error",
        headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      if (conflictAllowed && res.status === 409) return null;
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Admin API returned " + res.status);
      return result;
    },
  };
}

async function stage(address, file, manifestPath) {
  const manifest = JSON.parse((await readFile(manifestPath, "utf8")).replace(/^\uFEFF/, ""));
  const actual = await inspect(file);
  if (actual.size !== manifest.size || actual.sha256 !== manifest.sha256) {
    throw new Error("Local ISO does not match the manifest.");
  }
  const api = adminClient(address);
  const id = manifest.version + "-" + manifest.arch;
  const iso = await openAsBlob(file, { type: "application/octet-stream" });
  const draft = await api.request({ ...manifest, action: "create" }, true) ??
    await api.request({ action: "get", id });
  if (draft.status !== "draft" || draft.id !== id ||
      ["size", "sha256", "commit", "notes", "checks"].some((key) => draft[key] !== manifest[key])) {
    throw new Error("This release ID belongs to a different manifest or is already published.");
  }
  let last = 0;
  await upload(draft.pathname, iso, {
    access: "private", multipart: true, contentType: "application/octet-stream",
    handleUploadUrl: api.endpoint + "/upload", clientPayload: draft.id,
    headers: api.headers,
    onUploadProgress: ({ percentage }) => {
      const whole = Math.floor(percentage);
      if (whole >= last + 10 || whole === 100) {
        last = whole;
        console.error("Upload: " + whole + "%");
      }
    },
  });
  console.log(draft.id + " staged. Use the admin panel or an explicit publish command to verify and publish.");
}

async function run(args) {
  const [command, ...params] = args;
  if (command === "prepare" && params.length === 6) {
    const [file, version, arch, commit, notes, checks] = params;
    if (!/^\d{1,4}\.\d{1,4}\.\d{1,4}(?:-[a-z0-9]+(?:[.-][a-z0-9]+)*)?$/.test(version) || version.length > 50 ||
        !["x86-64", "x86"].includes(arch) || !/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/i.test(commit)) {
      throw new Error("Specify a valid version, architecture and full commit hash.");
    }
    const [iso, releaseNotes, releaseChecks] = await Promise.all([
      inspect(file), readFile(notes, "utf8"), readFile(checks, "utf8"),
    ]);
    console.log(JSON.stringify({ version, arch, commit: commit.toLowerCase(),
      ...iso, notes: releaseNotes.trim(), checks: releaseChecks.trim() }, null, 2));
    return;
  }
  if (command === "stage" && params.length === 3) {
    await stage(...params);
    return;
  }
  if (command === "publish" && params.length === 2) {
    const [address, id] = params;
    const release = await adminClient(address).request({ action: "publish", id });
    console.log(release.id + " verified and published.");
    return;
  }
  console.error(HELP);
  process.exitCode = 2;
}

run(process.argv.slice(2)).catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
