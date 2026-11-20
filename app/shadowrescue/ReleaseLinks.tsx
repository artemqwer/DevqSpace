import { isoSize, releaseUrl, type PublicRelease } from "@/lib/rescue-release-types";
import styles from "./rescue.module.css";

export const releaseDate = (value: string) =>
  new Intl.DateTimeFormat("ru-RU", { dateStyle: "long", timeZone: "Europe/Kyiv" }).format(new Date(value));

export function ReleaseLinks({ release }: { release: PublicRelease }) {
  if (release.status !== "published") return null;
  const url = releaseUrl(release.id);
  return (
    <div className={styles.actions}>
      <a className={styles.primary} href={url + "/iso"}>Скачать ISO <small>{isoSize(release.size)}</small></a>
      <a className={styles.textLink} href={url + "/sha256"}>Скачать SHA-256</a>
    </div>
  );
}
