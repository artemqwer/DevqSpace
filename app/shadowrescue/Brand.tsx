import Image from "next/image";
import Link from "next/link";
import { RESCUE_PATH } from "@/lib/rescue-release-types";
import styles from "./rescue.module.css";

export function Brand({ mascot = false }: { mascot?: boolean }) {
  return (
    <Link href={RESCUE_PATH} className={styles.brand} translate="no">
      {mascot && <Image className={styles.mascot} src="/shadxwrescue/mascot.webp"
        width={134} height={144} alt="" unoptimized loading="eager" />}
      <span>Shadxw<b>Rescue</b></span>
    </Link>
  );
}
