"use client";

import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { upload } from "@vercel/blob/client";
import { sha256 } from "@noble/hashes/sha256";
import { bytesToHex } from "@noble/hashes/utils";
import { useRouter } from "next/navigation";
import { ISO_CONTENT_TYPE, MAX_ISO_BYTES, isoName, isoSize, releaseUrl, type Release, type StoredIso } from "@/lib/rescue-release-types";

const ENDPOINT = "/api/admin/shadxwrescue";
const INPUT = "w-full rounded-md border border-white/20 bg-surface2 px-3 py-2 text-white";
const BUTTON = "min-h-11 rounded-md border border-white/20 px-3 py-2 text-sm font-medium text-white hover:bg-white/10 disabled:opacity-50";
const field = (form: FormData, name: string) => String(form.get(name) ?? "");

async function action(body: Record<string, string | number>) {
  const response = await fetch(ENDPOINT, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  });
  const result = await response.json().catch(() => null) as { error?: string } | null;
  if (!response.ok) throw new Error(result?.error || "Сервер не підтвердив дію.");
  return result;
}

export function RescueReleaseManager({ initialReleases, configured, storedIsos, storageListError }: {
  initialReleases: Release[];
  configured: boolean;
  storedIsos: StoredIso[];
  storageListError: boolean;
}) {
  const router = useRouter();
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [hashing, setHashing] = useState(false);
  const [hashProgress, setHashProgress] = useState(0);
  const [size, setSize] = useState("");
  const [hash, setHash] = useState("");
  const fileSelection = useRef(0);

  async function inspectFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    const selection = ++fileSelection.current;
    setSize("");
    setHash("");
    setError("");
    setHashProgress(0);
    if (!file) { setHashing(false); return; }
    if (!file.name.toLowerCase().endsWith(".iso") || file.size <= 0 || file.size > MAX_ISO_BYTES) {
      setHashing(false);
      setError("Оберіть ISO розміром до 4 ГіБ.");
      return;
    }
    setSize(String(file.size));
    setHashing(true);
    try {
      const digest = sha256.create();
      const chunkSize = 8 * 1024 * 1024;
      for (let offset = 0; offset < file.size; offset += chunkSize) {
        const chunk = await file.slice(offset, offset + chunkSize).arrayBuffer();
        if (selection !== fileSelection.current) return;
        digest.update(new Uint8Array(chunk));
        setHashProgress(Math.round(Math.min(offset + chunkSize, file.size) / file.size * 100));
      }
      setHash(bytesToHex(digest.digest()));
    } catch {
      if (selection === fileSelection.current) setError("Не вдалося прочитати ISO. Спробуйте вибрати файл ще раз.");
    } finally {
      if (selection === fileSelection.current) setHashing(false);
    }
  }

  async function run(label: string, operation: () => Promise<void>, done: string) {
    setBusy(true);
    setError("");
    setStatus(label);
    try {
      await operation();
      setStatus(done);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не вдалося завершити дію.");
      setStatus("");
    } finally {
      setBusy(false);
    }
  }

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const data = new FormData(formElement);
    await run("Створюю чернетку…", async () => {
      await action({ action: "create", version: field(data, "version"), arch: field(data, "arch"),
        size: Number(data.get("size")), sha256: field(data, "sha256"), commit: field(data, "commit"),
        notes: field(data, "notes"), checks: field(data, "checks") });
      formElement.reset();
      setSize("");
      setHash("");
    }, "Чернетку створено. Завантажте відповідний ISO.");
  }

  async function sendFile(event: FormEvent<HTMLFormElement>, release: Release) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const file = data.get("iso");
    await run("Починаю завантаження…", async () => {
      if (!(file instanceof File) || !file.name.toLowerCase().endsWith(".iso") || file.size !== release.size) {
        throw new Error("Виберіть ISO того самого розміру, який зазначено в чернетці.");
      }
      await upload(release.pathname, file, {
        access: "private", multipart: true, contentType: ISO_CONTENT_TYPE,
        handleUploadUrl: ENDPOINT + "/upload", clientPayload: release.id,
        onUploadProgress: ({ percentage }) => setStatus("Завантажено " + Math.round(percentage) + "%"),
      });
    }, "Файл завантажено. Тепер можна перевірити SHA-256 і опублікувати.");
  }

  return (
    <section className="space-y-6 text-white">
      <header>
        <h1 className="text-2xl font-bold">Випуски ShadxwRescue</h1>
        <p className="mt-2 text-gray-300">Створіть чернетку, завантажте ISO у приватне сховище й опублікуйте після перевірки розміру та SHA-256.</p>
      </header>
      {!configured && <p role="status" className="rounded-md border border-yellow-500/40 p-3 text-yellow-200">Для керування випусками потрібні Redis і токен окремого приватного Vercel Blob.</p>}
      {storageListError && <p role="alert" className="text-rose-300">Не вдалося отримати список ISO зі сховища. Спробуйте оновити сторінку.</p>}
      {status && <p role="status">{status}</p>}
      {error && <p role="alert" className="text-rose-300">{error}</p>}
      <form onSubmit={create} className="rounded-lg border border-white/15 p-4">
        <h2 className="font-semibold">Новий випуск</h2>
        <p className="mb-4 mt-1 text-sm text-gray-300">Оберіть ISO та створіть чернетку. Далі завантажте файл і перевірте його перед публікацією.</p>
        <fieldset disabled={!configured || busy} className="grid min-w-0 grid-cols-1 gap-4 text-sm sm:grid-cols-2">
          <label className="sm:col-span-2">Файл ISO для перевірки<input type="file" accept=".iso" onChange={inspectFile} className={INPUT} /><span className="mt-1 block text-gray-300">Розмір і SHA-256 розраховуються у браузері. Файл буде завантажено на наступному кроці.</span></label>
          {hashing && <p role="status" className="sm:col-span-2">Обчислення SHA-256: {hashProgress}%</p>}
          <label>Версія<input name="version" placeholder="1.0.0-beta.1" maxLength={50} required className={INPUT} /></label>
          <label>Архітектура<select name="arch" className={INPUT}><option>x86-64</option><option>x86</option></select></label>
          <label>Розмір ISO в байтах<input name="size" type="number" min={1} max={MAX_ISO_BYTES} step={1} required value={size} onChange={(event) => setSize(event.target.value)} className={INPUT} /></label>
          <label>SHA-256 ISO<input name="sha256" minLength={64} maxLength={64} required value={hash} onChange={(event) => setHash(event.target.value)} className={INPUT} /></label>
          <label className="sm:col-span-2">Повний Git-коміт збірки <span className="text-gray-400">(необов’язково)</span><input name="commit" minLength={40} maxLength={64} placeholder="Повний хеш, якщо відомий" className={INPUT} /></label>
          <label>Що змінилося <span className="text-gray-400">(необов’язково)</span><textarea name="notes" rows={3} maxLength={8000} className={INPUT} /></label>
          <label>Результати перевірок <span className="text-gray-400">(необов’язково)</span><textarea name="checks" rows={3} maxLength={4000} className={INPUT} /></label>
          <button type="submit" disabled={hashing} className={BUTTON + " justify-self-start"}>Створити чернетку</button>
        </fieldset>
      </form>

      {initialReleases.map((release) => (
        <article key={release.id} className="space-y-3 rounded-lg border border-white/15 p-4">
          <h2 className="break-all font-semibold">{release.version} · {release.arch} · {isoSize(release.size)}</h2>
          <p className="text-sm text-gray-300">{release.status === "draft" ? "Чернетка" : release.status === "published" ? "Опубліковано" : "Відкликано"}</p>
          {release.status !== "draft" && storedIsos.some((file) => file.pathname === release.pathname) && (
            <p className="text-sm text-gray-300">ISO збережено у сховищі · {isoSize(release.size)}</p>
          )}
          {release.status !== "draft" && <a href={releaseUrl(release.id)} className="text-neon-blue underline">Сторінка випуску</a>}
          {release.status === "withdrawn" && <p>{release.reason}</p>}
          {release.status === "draft" && (
            <>
              {(() => {
                const candidates = storedIsos.filter((file) => file.pathname.split("/").at(-1) === isoName(release));
                const selected = candidates.find((file) => file.pathname === release.pathname);
                return <div className="space-y-2">
                  <p className="text-sm text-gray-300">{selected ? `ISO у сховищі: ${isoSize(selected.size)}. Файл збережено після оновлення сторінки.` : "За поточним шляхом ISO ще не знайдено."}</p>
                  {candidates.length > 0 && <form className="flex flex-wrap items-end gap-2" onSubmit={(event) => {
                    event.preventDefault();
                    const pathname = field(new FormData(event.currentTarget), "pathname");
                    void run("Обираю ISO зі сховища…", async () => {
                      await action({ action: "select-iso", id: release.id, pathname });
                    }, "ISO обрано. Перевірте його перед публікацією.");
                  }}>
                    <label className="min-w-0 text-sm">ISO у сховищі<select name="pathname" defaultValue={selected?.pathname ?? candidates[0].pathname} disabled={busy || !configured} className={INPUT}>
                      {candidates.map((file) => <option key={file.pathname} value={file.pathname}>{new Date(file.uploadedAt).toLocaleString("uk-UA")} · {isoSize(file.size)}{file.pathname === release.pathname ? " · поточний" : ""}</option>)}
                    </select></label>
                    <button type="submit" className={BUTTON} disabled={busy || !configured}>Обрати ISO</button>
                  </form>}
                  <p className="text-sm text-gray-400">Перед публікацією сервер перевірить розмір і SHA-256 обраного файлу.</p>
                </div>;
              })()}
              <form className="flex flex-wrap items-end gap-2" key={release.pathname} onSubmit={(event) => sendFile(event, release)}>
                <label className="min-w-0 text-sm">Файл ISO<input name="iso" type="file" accept=".iso" disabled={busy || !configured} required className={INPUT} /></label>
                <button type="submit" className={BUTTON} disabled={busy || !configured}>Завантажити ISO</button>
              </form>
              <div className="flex flex-wrap gap-2">
                <button type="button" className={BUTTON} disabled={busy || !configured} onClick={() => {
                  if (!window.confirm("Опублікувати цей випуск після перевірки завантаженого ISO?")) return;
                  void run("Сервер перевіряє розмір і SHA-256. Це може тривати кілька хвилин…", async () => {
                    await action({ action: "publish", id: release.id });
                  }, "Випуск опубліковано.");
                }}>Перевірити й опублікувати</button>
                <button type="button" className={BUTTON} disabled={busy || !configured} onClick={() => {
                  if (!window.confirm("Створити новий шлях для повторного завантаження цього ISO?")) return;
                  void run("Створюю новий шлях…", async () => {
                    await action({ action: "reset-upload", id: release.id });
                  }, "Новий шлях готовий. Попередній файл залишається приватним.");
                }}>Новий шлях завантаження</button>
              </div>
            </>
          )}
          {release.status === "published" && (
            <form className="flex flex-wrap items-end gap-2" onSubmit={(event) => {
              event.preventDefault();
              const reason = field(new FormData(event.currentTarget), "reason");
              if (!window.confirm("Відкликати випуск і закрити видачу нових посилань?")) return;
              void run("Відкликаю випуск…", async () => {
                await action({ action: "withdraw", id: release.id, reason });
              }, "Випуск відкликано.");
            }}>
              <label className="min-w-0 text-sm">Причина відкликання<input name="reason" maxLength={600} required className={INPUT} disabled={busy} /></label>
              <button type="submit" className={BUTTON} disabled={busy}>Відкликати</button>
            </form>
          )}
        </article>
      ))}
    </section>
  );
}
