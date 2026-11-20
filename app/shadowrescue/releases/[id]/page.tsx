import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getRelease } from "@/lib/rescue-releases";
import { RESCUE_PATH, isoSize, releaseUrl } from "@/lib/rescue-release-types";
import { ReleaseLinks, releaseDate } from "../../ReleaseLinks";
import styles from "../../rescue.module.css";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const release = await getRelease(id);
  if (!release || release.status === "draft") return { robots: { index: false } };
  return { title: "ShadxwRescue " + release.version + " (" + release.arch + ")",
    alternates: { canonical: releaseUrl(id) } };
}

export default async function ReleasePage({ params }: Props) {
  const release = await getRelease((await params).id);
  if (!release || release.status === "draft") notFound();
  return (
    <main className={styles.detail}>
      <Link className={styles.textLink} href={RESCUE_PATH + "#releases"}>К выпускам ShadxwRescue</Link>
      <h1>Версия {release.version}</h1>
      <p>{release.arch} · {isoSize(release.size)} · <time dateTime={release.publishedAt}>{releaseDate(release.publishedAt)}</time></p>
      {release.status === "withdrawn" ?
        <div className={styles.withdrawn}><h2>Образ отозван</h2><p>{release.reason}</p></div>
        : <><ReleaseLinks release={release} /><h2>SHA-256</h2><code>{release.sha256}</code></>}
      <h2>Что изменилось</h2><p className={styles.multiline}>{release.notes}</p>
      <h2>Результаты проверок</h2><p className={styles.multiline}>{release.checks}</p>
      <h2>Коммит сборки</h2><code>{release.commit}</code>
    </main>
  );
}
