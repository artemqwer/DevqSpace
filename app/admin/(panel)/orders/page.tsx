import { getAllOrders } from "@/lib/store";
import OrdersBoard from "@/components/admin/OrdersBoard";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const orders = await getAllOrders();
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

      <OrdersBoard initialOrders={orders} />
    </div>
  );
}
