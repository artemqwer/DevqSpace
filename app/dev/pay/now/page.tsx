import { notFound } from "next/navigation";
import { devRouteBlocked } from "@/lib/devStubs";
import DevPayNow from "@/components/dev/DevPayNow";

export const dynamic = "force-dynamic";

export const metadata = { title: "Dev · Оплата криптою" };

type Props = {
  searchParams: Promise<{
    o?: string;
    amount?: string;
    success?: string;
    cancel?: string;
  }>;
};

export default async function DevPayNowPage({ searchParams }: Props) {
  if (devRouteBlocked()) notFound();

  const sp = await searchParams;
  if (!sp.o) notFound();

  return (
    <DevPayNow
      orderId={sp.o}
      amount={Number(sp.amount) || 0}
      successUrl={sp.success ?? "/"}
      cancelUrl={sp.cancel ?? "/"}
    />
  );
}
