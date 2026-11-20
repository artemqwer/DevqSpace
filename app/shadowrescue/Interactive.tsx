"use client";

import Image from "next/image";
import { useId, useRef, useState, type ReactNode } from "react";
import { tools, type Screen } from "./screens";
import styles from "./rescue.module.css";

export function SkipLink({ targetId }: { targetId: string }) {
  return (
    <a
      href={`#${targetId}`}
      className={styles.skip}
      onClick={(event) => {
        const target = document.getElementById(targetId);
        if (!target) return;
        event.preventDefault();
        target.focus({ preventScroll: true });
        target.scrollIntoView({ block: "start", behavior: "instant" });
      }}
    >
      К содержанию
    </a>
  );
}

export function ScreenPreview({ screen, hero = false }: { screen: Screen; hero?: boolean }) {
  const zoomDialog = useRef<HTMLDialogElement>(null);
  const scroll = useRef<HTMLDivElement>(null);
  const label = useId();
  const [zoom, setZoom] = useState(false);
  const [opened, setOpened] = useState(false);

  return (
    <>
      <div className={styles.screen}>
        <div className={styles.toolbar}>
          <span>{hero ? "ShadxwRescue Live" : screen.title}</span>
          <button className={styles.textLink} onClick={() => {
            setOpened(true);
            setZoom(false);
            zoomDialog.current?.showModal();
          }}>Увеличить</button>
        </div>
        <div className={hero ? styles.heroImage : styles.toolsImage}>
          <Image src={screen.src} alt={screen.alt} width={screen.width} height={screen.height}
            unoptimized loading={hero ? "eager" : "lazy"} fetchPriority={hero ? "high" : undefined} />
        </div>
      </div>
      <dialog ref={zoomDialog} className={styles.viewer} aria-labelledby={label}
        onClose={() => { setZoom(false); setOpened(false); }}>
        <div className={styles.dialogHeader}>
          <h2 id={label}>{screen.title}</h2>
          <div className={styles.dialogActions}>
            <button className={styles.dialogButton} aria-pressed={zoom} onClick={() => {
              if (zoom) scroll.current?.scrollTo(0, 0);
              setZoom(!zoom);
            }}>{zoom ? "Вписать" : "100%"}</button>
            <form method="dialog"><button className={styles.dialogButton}>Закрыть</button></form>
          </div>
        </div>
        <div ref={scroll} className={zoom ? styles.zoomed : styles.viewerImage}
          role="region" aria-label="Просмотр скриншота" tabIndex={0}>
          {opened && <Image src={screen.src} alt={screen.alt} width={screen.width} height={screen.height} unoptimized />}
        </div>
      </dialog>
    </>
  );
}

export function Toolbox() {
  const [index, select] = useState(0);
  return (
    <div className={styles.toolbox}>
      <ScreenPreview screen={tools[index]} />
      <div className={styles.toolSelect} role="group" aria-label="Выбрать скриншот">
        {tools.map((tool, i) => (
          <button key={tool.src} aria-pressed={index === i} onClick={() => select(i)}>
            <strong>{tool.label}</strong>
            <small>{tool.description}</small>
          </button>
        ))}
      </div>
    </div>
  );
}

export function InfoDialog({ button, title, children }: {
  button: string;
  title: string;
  children: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const label = useId();
  return (
    <>
      <button className={styles.textLink} onClick={() => dialog.current?.showModal()}>{button}</button>
      <dialog ref={dialog} className={styles.dialog} aria-labelledby={label}>
        <div className={styles.dialogHeader}>
          <h2 id={label}>{title}</h2>
          <form method="dialog"><button className={styles.dialogButton}>Закрыть</button></form>
        </div>
        {children}
      </dialog>
    </>
  );
}
