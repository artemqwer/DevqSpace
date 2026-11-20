import type { Metadata } from "next";
import Link from "next/link";
import { RESCUE_PATH, isoName, isoSize, releaseUrl } from "@/lib/rescue-release-types";
import { listPublicReleases } from "@/lib/rescue-releases";
import { getSettings } from "@/lib/settings";
import { validateContact } from "@/lib/contact";

import { Brand } from "./Brand";
import { InfoDialog, ScreenPreview, Toolbox } from "./Interactive";
import { releaseDate } from "./ReleaseLinks";
import { workspace } from "./screens";
import styles from "./rescue.module.css";

const title = "ShadxwRescue — диагностика Windows с флешки";
const description = "Загрузочная среда для диагностики Windows и спасения файлов. Системные требования, инструкция по запуску и история выпусков.";
export const metadata: Metadata = {
  title: { absolute: title }, description,
  alternates: { canonical: RESCUE_PATH },
  openGraph: { type: "website", title, description, siteName: "ShadxwRescue", url: RESCUE_PATH,
    images: [{ url: "/shadxwrescue/workspace.png", width: 1920, height: 1080 }] },
  twitter: { card: "summary_large_image", title, description, images: ["/shadxwrescue/workspace.png"] },
};

export default async function RescuePage() {
  const [data, settings] = await Promise.allSettled([listPublicReleases(), getSettings()]);
  const releases = data.status === "fulfilled" ? data.value : [];
  const latest = releases.find((release) => release.status === "published" && release.arch === "x86-64");
  const latestUrl = latest ? releaseUrl(latest.id) : null;
  const feedback = settings.status === "fulfilled" ? validateContact("telegram", settings.value.supportTelegram) : null;

  return (
    <>
      <a href="#shadxw-main" className={styles.skip}>К содержанию</a>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Brand mascot />
          <nav aria-label="Разделы ShadxwRescue" className={styles.nav}>
            <a href="#start">Запуск</a>
            <a className={styles.desktopTools} href="#tools">Инструменты</a>
            <a href="#releases">Релизы</a>
          </nav>
          <Link href="/" className={styles.host}>DevqSpace</Link>
        </div>
      </header>
      <main id="shadxw-main" tabIndex={-1}>
        <section className={styles.hero} aria-labelledby="rescue-title">
          <div className={styles.heroInner}>
            <div>
              <h1 id="rescue-title">Windows не<br /><span>загружается?</span></h1>
              <p className={styles.pitch}>Запустите ShadxwRescue с флешки, чтобы осмотреть систему и сохранить файлы. Основные инструменты работают без интернета.</p>
              <div className={styles.actions}>
                <a className={styles.primary} href={latestUrl ? latestUrl + "/iso" : "#releases"}>
                  {latest ? "Скачать ISO" : "Статус беты"} <small>{latest ? latest.version : "x86‑64"}</small>
                </a>
                <a className={styles.textLink} href="#start">Как записать на USB</a>
              </div>
            </div>
            <figure className={styles.workspace}>
              <ScreenPreview screen={workspace} hero />
              <figcaption>{workspace.title}</figcaption>
            </figure>
          </div>
          <div className={styles.dock}>
            <div className={styles.dockInner}>
              <div className={styles.requirements}>
                <span>x86‑64</span>
                <a className={styles.textLink} href="#requirements">2 ГБ ОЗУ*</a>
                <a className={styles.textLink} href="#requirements">Режим загрузки*</a>
                <a className={styles.mobileTools} href="#tools">Инструменты</a>
              </div>
              <InfoDialog button="Проверить SHA-256" title="Как сверить SHA-256">
                <p>Откройте PowerShell в папке с ISO и подставьте имя своего файла.</p>
                <pre>{'Get-FileHash -Algorithm SHA256 .\\' + (latest ? isoName(latest) : "ShadxwRescue.iso")}</pre>
                <p>Результат должен совпасть с SHA-256 на странице выпуска.</p>
                {latestUrl && <a className={styles.textLink} href={latestUrl + "/sha256"}>Скачать SHA-256 этого образа</a>}
              </InfoDialog>
            </div>
          </div>
        </section>

        <section className={styles.guide} id="start" aria-labelledby="start-title">
          <div className={styles.sectionGrid}>
            <div>
              <h2 id="start-title">От ISO до первого запуска.</h2>
              <p>Подготовьте флешку для образа и отдельный носитель для спасённых файлов.</p>
            </div>
            <ol className={styles.steps}>
              <li><h3>Скачайте образ</h3><p>Выберите <a href="#releases">выпуск для своего ПК</a> и сверьте контрольную сумму.</p></li>
              <li><h3>Запишите на флешку</h3><p>Выберите ISO и флешку в программе записи. Запись может стереть файлы на ней.</p></li>
              <li><h3>Загрузитесь с USB</h3><p>Выберите флешку в меню загрузки компьютера. Начните с осмотра системы и накопителей.</p></li>
            </ol>
          </div>
        </section>

        <section className={styles.gallery} id="tools" aria-labelledby="tools-title">
          <div className={styles.wrap}>
            <div className={styles.galleryIntro}>
              <h2 id="tools-title">Рабочая среда</h2>
              <p>Осмотр системы, копирование файлов и сохранение читаемых областей повреждённого диска в образ.</p>
            </div>
            <Toolbox />
          </div>
        </section>

        <section className={styles.history} id="releases" aria-labelledby="releases-title">
          <div className={styles.sectionGrid}>
            <div>
              <h2 id="releases-title">Релизы</h2>
              <p>Образы, изменения и результаты проверок по каждому выпуску.</p>
            </div>
            <div className={styles.releaseList}>
              {data.status === "rejected" ? <p>Каталог выпусков временно недоступен. Попробуйте позже.</p>
                : releases.length === 0 ? <p>Публичный образ пока не опубликован. Здесь появится первый проверенный выпуск.</p>
                : releases.map((release) => (
                  <article key={release.id} className={styles.releaseRow}>
                    <h3><Link href={releaseUrl(release.id)}>Версия {release.version}</Link> <span>{release.arch}</span></h3>
                    <p><time dateTime={release.publishedAt}>{releaseDate(release.publishedAt)}</time>
                      {release.status === "withdrawn" ? " · Отозван" : " · " + isoSize(release.size)}</p>
                    {release.status === "withdrawn" && <p>{release.reason}</p>}
                    {release.status === "published" && <a className={styles.textLink} href={releaseUrl(release.id) + "/iso"}>Скачать ISO</a>}
                  </article>
                ))}
              <div className={styles.releaseRow} id="requirements">
                <h3>Требования и ограничения</h3>
                <p>* 2 ГБ ОЗУ — цель для базовых задач. Совместимость с BIOS, UEFI и Secure Boot смотрите в результатах проверок выбранного ISO.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <Brand />
          <InfoDialog button="Сообщить о проблеме" title="Сообщить о проблеме">
            <p>Укажите версию образа, модель компьютера, режим загрузки и шаг, на котором произошёл сбой.</p>
            {feedback?.ok && <a className={styles.textLink} href={"https://t.me/" + feedback.value.slice(1)}>Написать в поддержку DevqSpace</a>}
          </InfoDialog>

          <Link href="/" className={styles.host}>DevqSpace</Link>
        </div>
      </footer>
    </>
  );
}
