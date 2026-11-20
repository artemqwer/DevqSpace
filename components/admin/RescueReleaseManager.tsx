"use client";

import { useState, type FormEvent } from "react";
import { upload } from "@vercel/blob/client";
import { useRouter } from "next/navigation";
import { ISO_CONTENT_TYPE, MAX_ISO_BYTES, isoSize, releaseUrl, type Release } from "@/lib/rescue-release-types";

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

export function RescueReleaseManager({ initialReleases, configured }: {
  initialReleases: Release[];
  configured: boolean;
}) {
  const router = useRouter();
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

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
      {status && <p role="status">{status}</p>}
      {error && <p role="alert" className="text-rose-300">{error}</p>}
      <form onSubmit={create} className="rounded-lg border border-white/15 p-4">
        <h2 className="mb-4 font-semibold">Нова чернетка</h2>
        <fieldset disabled={!configured || busy} className="grid min-w-0 grid-cols-1 gap-4 text-sm sm:grid-cols-2">
          <label>Версія<input name="version" placeholder="1.0.0-beta.1" maxLength={50} required className={INPUT} /></label>
          <label>Архітектура<select name="arch" className={INPUT}><option>x86-64</option><option>x86</option></select></label>
          <label>Розмір ISO в байтах<input name="size" type="number" min={1} max={MAX_ISO_BYTES} step={1} required className={INPUT} /></label>
          <label>SHA-256 ISO<input name="sha256" minLength={64} maxLength={64} required className={INPUT} /></label>
          <label className="sm:col-span-2">Повний Git-коміт збірки<input name="commit" minLength={40} maxLength={64} required className={INPUT} /></label>
          <label>Що змінилося<textarea name="notes" rows={3} maxLength={8000} required className={INPUT} /></label>
          <label>Результати перевірок<textarea name="checks" rows={3} maxLength={4000} required className={INPUT} /></label>
          <button type="submit" className={BUTTON + " justify-self-start"}>Створити чернетку</button>
        </fieldset>
      </form>

      {initialReleases.map((release) => (
        <article key={release.id} className="space-y-3 rounded-lg border border-white/15 p-4">
          <h2 className="break-all font-semibold">{release.version} · {release.arch} · {isoSize(release.size)}</h2>
          <p className="text-sm text-gray-300">{release.status === "draft" ? "Чернетка" : release.status === "published" ? "Опубліковано" : "Відкликано"}</p>
          {release.status !== "draft" && <a href={releaseUrl(release.id)} className="text-neon-blue underline">Сторінка випуску</a>}
          {release.status === "withdrawn" && <p>{release.reason}</p>}
          {release.status === "draft" && (
            <>
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
