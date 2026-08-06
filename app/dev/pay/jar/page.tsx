import { notFound } from "next/navigation";
import { devRouteBlocked } from "@/lib/devStubs";
import { getOrder } from "@/lib/store";
import { usdToUah } from "@/lib/monojar";
import DevPayJar from "@/components/dev/DevPayJar";

export const dynamic = "force-dynamic";

export const metadata = { title: "Dev · Оплата на банку" };

type Props = { searchParams: Promise<{ o?: string }> };

export default async function DevPayJarPage({ searchParams }: Props) {
  if (devRouteBlocked()) notFound();

  const { o } = await searchParams;
  if (!o) notFound();

  const order = await getOrder(o);
  if (!order) notFound();

  const amountUah = await usdToUah(order.productPrice ?? 0);

  return (
    <DevPayJar
      orderId={order.id}
      amountUah={amountUah}
      priceUsd={order.productPrice ?? 0}
      productTitle={order.productTitle ?? "—"}
      alreadyPaid={Boolean(order.paid)}
    />
  );
}
