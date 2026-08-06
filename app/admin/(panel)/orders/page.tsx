import { getAllOrders, purgeStaleEnvData, type StoredOrder } from "@/lib/store";
import { decryptJson, maskSecret } from "@/lib/crypto";
import type { EnvValues } from "@/lib/envFields";
import OrdersBoard from "@/components/admin/OrdersBoard";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const orders = await getAllOrders();

  // Крона немає — чистимо протерміновані дані клієнтів звідси, сторінка й так
  // рендериться на кожен запит.
  await purgeStaleEnvData(orders);

  // Значення .env клієнта в адмінку йдуть лише замаскованими: адмінові треба
  // бачити, що саме введено, а не самі токени.
  const maskedEnv: Record<string, [string, string][]> = {};
  for (const order of orders) {
    const values = decryptJson<EnvValues>(order.envData);
    if (!values) continue;
    maskedEnv[order.id] = Object.entries(values).map(([k, v]) => [
      k,
      maskSecret(v),
    ]);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="text-[10px] md:text-xs font-mono text-neon-blue tracking-widest uppercase mb-1">
            // ORDERS
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-white">
            Замовлення
          </h1>
        </div>
        <a
          href="/api/admin/orders/export"
          className="shrink-0 flex items-center gap-2 bg-surface2 border border-white/10 text-white text-xs font-mono px-3 py-2 rounded-lg hover:border-neon-blue/50 transition-colors"
        >
          <i className="ph-bold ph-download-simple" /> CSV
        </a>
      </div>

      <OrdersBoard initialOrders={stripSecrets(orders)} maskedEnv={maskedEnv} />
    </div>
  );
}

// Зашифроване поле клієнтському бандлу ні до чого — прибираємо перед
// серіалізацією в Client Component.
function stripSecrets(orders: StoredOrder[]): StoredOrder[] {
  return orders.map((o) => ({ ...o, envData: undefined }));
}
