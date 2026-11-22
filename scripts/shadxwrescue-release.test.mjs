import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { registerHooks } from "node:module";
import test from "node:test";

const stateKey = Symbol.for("shadxwrescue.release-test");
const rows = new Map();
const blobs = new Map();
const signedUrl = "https://example.invalid/private-iso";
let authorized = false;
let issuedFor;
let verifyOptions;

function getBlob(pathname) {
  const file = blobs.get(pathname);
  if (!file) return null;
  const { bytes, etag } = file;
  return {
    statusCode: 200,
    blob: { size: file.reportedSize ?? bytes.length, etag },
    stream: new ReadableStream({
      start(controller) {
        controller.enqueue(bytes.subarray(0, 2));
        controller.enqueue(bytes.subarray(2));
        controller.close();
      },
    }),
  };
}

globalThis[stateKey] = {
  Redis: class {
    async hgetall() { return [...rows].flat(); }
    async hget(_key, id) { return rows.get(id) ?? null; }
    async hsetnx(_key, id, payload) {
      if (rows.has(id)) return 0;
      rows.set(id, payload);
      return 1;
    }
    async eval(_script, _keys, [id, previous, next]) {
      if (rows.get(id) !== previous) return 0;
      rows.set(id, next);
      return 1;
    }
  },
  async get(path, options) {
    verifyOptions = options;
    return getBlob(path);
  },
  async head(path) {
    const file = blobs.get(path);
    return file ? { size: file.bytes.length, etag: file.etag } : null;
  },
  async list() {
    return { blobs: [...blobs].map(([pathname, file]) => ({ pathname, size: file.bytes.length, uploadedAt: new Date("2026-01-01T00:00:00Z") })), hasMore: false };
  },
  async issueSignedToken(options) {
    issuedFor = options;
    return { delegationToken: "fixture", clientSigningToken: "fixture" };
  },
  async presignUrl(_token, options) {
    assert.equal(options.pathname, issuedFor.pathname);
    assert.equal(options.operation, "get");
    assert.equal(options.access, "private");
    return { presignedUrl: signedUrl };
  },
  async handleUpload({ body, onBeforeGenerateToken }) {
    return onBeforeGenerateToken(body.payload.pathname, body.payload.clientPayload, body.payload.multipart);
  },
  getSession: async () => authorized,
};

const mockedModule = (names) =>
  "data:text/javascript," + encodeURIComponent(
    "const m = globalThis[Symbol.for('shadxwrescue.release-test')]; export const { " + names + " } = m;",
  );

const mocks = {
  "server-only": "data:text/javascript,export%20%7B%7D",
  "@upstash/redis": mockedModule("Redis"),
  "@vercel/blob": mockedModule("get, head, list, issueSignedToken, presignUrl"),
  "@vercel/blob/client": mockedModule("handleUpload"),
  "@/lib/session": mockedModule("getSession"),
};

const hooks = registerHooks({
  resolve(specifier, context, nextResolve) {
    if (Object.hasOwn(mocks, specifier)) return { url: mocks[specifier], shortCircuit: true };
    if (specifier.startsWith("@/")) {
      return nextResolve(new URL("../" + specifier.slice(2) + ".ts", import.meta.url).href, context);
    }
    if (specifier === "./rescue-release-types") return nextResolve(specifier + ".ts", context);
    return nextResolve(specifier, context);
  },
});

const admin = await import("../app/api/admin/shadxwrescue/route.ts");
const upload = await import("../app/api/admin/shadxwrescue/upload/route.ts");
const download = await import("../app/shadowrescue/releases/[id]/[file]/route.ts");
const { listPublicReleases, listStoredIsos } = await import("../lib/rescue-releases.ts");
hooks.deregister();

process.env.UPSTASH_REDIS_REST_URL = "http://127.0.0.1:1";
process.env.UPSTASH_REDIS_REST_TOKEN = "fixture";
process.env.SHADXWRESCUE_BLOB_TOKEN = "fixture";

const body = Buffer.from("release fixture");
const checksum = createHash("sha256").update(body).digest("hex");
const draftFields = {
  version: "1.0.0-beta.1", arch: "x86-64", size: body.length, sha256: checksum,
  commit: "a".repeat(40), notes: "Fixture notes", checks: "Fixture checks",
};
const id = draftFields.version + "-" + draftFields.arch;
const base = "http://localhost";
const endpoint = "/api/admin/shadxwrescue";

function post(path, json) {
  return new Request(base + path, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(json),
  });
}

function adminAction(action, data = {}) {
  return admin.POST(post(endpoint, { action, id, ...data }));
}

function isoRequest(file = "iso") {
  return download.GET(new Request(base + "/shadowrescue/releases/" + id + "/" + file), {
    params: Promise.resolve({ id, file }),
  });
}

function uploadToken(pathname, multipart = true) {
  return upload.POST(post(endpoint + "/upload", {
    type: "blob.generate-client-token", payload: { pathname, clientPayload: id, multipart },
  }));
}

test("release lifecycle from API to public download", async (t) => {
  let draft;
  await t.test("rejects unauthenticated writes and invalid draft data", async () => {
    assert.equal((await adminAction("create", draftFields)).status, 401);
    authorized = true;
    assert.equal((await adminAction("create", { ...draftFields, sha256: "invalid" })).status, 400);
    assert.equal((await adminAction("create", { ...draftFields, commit: "bad" })).status, 400);
  });

  await t.test("accepts a draft without optional build details", async () => {
    const created = await adminAction("create", { ...draftFields, version: "1.0.0-beta.2", commit: "", notes: "", checks: "" });
    assert.equal(created.status, 201);
    const result = await created.json();
    assert.equal(result.commit, "");
    assert.equal(result.notes, "");
    assert.equal(result.checks, "");
  });

  await t.test("keeps a new draft private and prevents duplicates", async () => {
    const created = await adminAction("create", draftFields);
    assert.equal(created.status, 201);
    draft = await created.json();
    assert.equal(draft.status, "draft");
    assert.equal((await adminAction("create", draftFields)).status, 409);
    assert.equal((await isoRequest()).status, 404);
    assert.equal((await isoRequest("sha256")).status, 404);
    assert.deepEqual(await listPublicReleases(), []);
  });

  await t.test("scopes upload authorization to the draft path and size", async () => {
    authorized = false;
    assert.equal((await uploadToken(draft.pathname)).status, 401);
    authorized = true;
    assert.equal((await uploadToken(draft.pathname + ".other")).status, 409);
    assert.equal((await uploadToken(draft.pathname, false)).status, 409);
    const response = await uploadToken(draft.pathname);
    assert.equal(response.status, 200);
    const scope = await response.json();
    assert.deepEqual(scope.allowedContentTypes, ["application/octet-stream"]);
    assert.equal(scope.allowOverwrite, false);
    assert.equal(scope.addRandomSuffix, false);
    assert.equal(scope.maximumSizeInBytes, body.length);
  });

  await t.test("rejects missing data, a wrong size and a wrong checksum", async () => {
    assert.equal((await adminAction("publish")).status, 409);
    blobs.set(draft.pathname, { bytes: Buffer.from("wrong size"), etag: "size" });
    assert.equal((await adminAction("publish")).status, 422);
    blobs.set(draft.pathname, { bytes: Buffer.alloc(body.length, 1), etag: "hash" });
    assert.equal((await adminAction("publish")).status, 422);
    assert.equal((await isoRequest()).status, 404);
  });

  await t.test("publishes one verified immutable object", async () => {
    const previous = draft;
    const reset = await adminAction("reset-upload");
    assert.equal(reset.status, 200);
    draft = await reset.json();
    assert.notEqual(draft.pathname, previous.pathname);
    assert.equal((await uploadToken(previous.pathname)).status, 409);

    blobs.set(previous.pathname, { bytes: body, etag: "old" });
    assert.equal((await listStoredIsos()).some((file) => file.pathname === previous.pathname), true);
    assert.equal((await adminAction("select-iso", { pathname: "other/path.iso" })).status, 400);
    const selected = await adminAction("select-iso", { pathname: previous.pathname });
    assert.equal(selected.status, 200);
    draft = await selected.json();
    assert.equal(draft.pathname, previous.pathname);

    // Some Blob responses have no Content-Length, which the SDK represents as zero.
    blobs.set(draft.pathname, { bytes: body, etag: "verified", reportedSize: 0 });
    const attempts = await Promise.all([adminAction("publish"), adminAction("publish")]);
    assert.deepEqual(attempts.map((res) => res.status).sort(), [200, 409]);
    assert.equal(verifyOptions.access, "private");
    assert.equal(verifyOptions.useCache, false);
    assert.equal((await uploadToken(draft.pathname)).status, 409);
    assert.equal((await listPublicReleases())[0].status, "published");

    const iso = await isoRequest();
    assert.equal(iso.status, 307);
    assert.equal(iso.headers.get("Location"), signedUrl);
    assert.equal(iso.headers.get("Cache-Control"), "no-store");
    assert.deepEqual(issuedFor.operations, ["get"]);
    const sum = await isoRequest("sha256");
    assert.equal(sum.status, 200);
    assert.equal(await sum.text(), checksum + "  ShadxwRescue-" + id + ".iso\n");
  });

  await t.test("rejects a changed blob and stops issuing URLs after withdrawal", async () => {
    blobs.set(draft.pathname, { bytes: body, etag: "new-etag" });
    assert.equal((await isoRequest()).status, 307);
    blobs.set(draft.pathname, { bytes: Buffer.alloc(body.length, 1), etag: "changed" });
    assert.equal((await isoRequest()).status, 422);
    assert.equal((await adminAction("withdraw", { reason: "  " })).status, 400);
    const result = await adminAction("withdraw", { reason: "Fixture withdrawal" });
    assert.equal(result.status, 200);
    assert.equal((await result.json()).reason, "Fixture withdrawal");
    assert.equal((await isoRequest()).status, 410);
    assert.equal((await isoRequest("sha256")).status, 410);
    assert.equal((await listPublicReleases())[0].status, "withdrawn");
  });
});
