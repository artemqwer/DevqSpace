import { listReleases, releaseStorageConfigured } from "@/lib/rescue-releases";
import { RescueReleaseManager } from "@/components/admin/RescueReleaseManager";

export default async function RescueAdminPage() {
  try {
    const releases = await listReleases();
    releases.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return <RescueReleaseManager initialReleases={releases} configured={releaseStorageConfigured()} />;
  } catch {
    return <div role="alert">Сховище випусків ShadxwRescue тимчасово недоступне.</div>;
  }
}
