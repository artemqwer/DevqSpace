import { listReleases, listStoredIsos, releaseStorageConfigured } from "@/lib/rescue-releases";
import { RescueReleaseManager } from "@/components/admin/RescueReleaseManager";

export default async function RescueAdminPage() {
  const releasesResult = await listReleases().then((releases) => ({ releases })).catch(() => null);
  if (!releasesResult) {
    return <div role="alert">Сховище випусків ShadxwRescue тимчасово недоступне.</div>;
  }
  const releases = releasesResult.releases.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const configured = releaseStorageConfigured();
  const stored = configured
    ? await listStoredIsos().then((files) => ({ files, error: false })).catch(() => ({ files: [], error: true }))
    : { files: [], error: false };
  return <RescueReleaseManager initialReleases={releases} configured={configured} storedIsos={stored.files} storageListError={stored.error} />;
}
