import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { storageMode } from "@/lib/store";
import AdminNav from "@/components/admin/AdminNav";

export const dynamic = "force-dynamic";

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await getSession())) redirect("/admin/login");
  const mode = storageMode();

  return (
    <div className="min-h-screen bg-bg">
      <AdminNav storageMode={mode} />
      <div className="md:pl-60">
        <main className="px-4 md:px-8 py-6 md:py-10 max-w-6xl mx-auto pb-24 md:pb-10">
          {children}
        </main>
      </div>
    </div>
  );
}
