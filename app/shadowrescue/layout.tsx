import type { Viewport } from "next";
import styles from "./rescue.module.css";

export const viewport: Viewport = { themeColor: "#0b0d10", colorScheme: "dark" };

export default function RescueLayout({ children }: { children: React.ReactNode }) {
  return <div lang="ru" className={styles.page}>{children}</div>;
}
