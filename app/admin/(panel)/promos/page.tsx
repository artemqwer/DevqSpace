import { listPromoCodes } from "@/lib/store";
import PromosManager from "@/components/admin/PromosManager";

export const dynamic = "force-dynamic";

export default async function AdminPromosPage() {
  const promos = await listPromoCodes();

  return (
    <div className="space-y-6">
      <div>
        <div className="text-[10px] md:text-xs font-mono text-neon-blue tracking-widest uppercase mb-1">
          {"// PROMOTIONS & DISCOUNTS"}
        </div>
        <h1 className="text-2xl md:text-3xl font-display font-bold text-white">
          Промокоди та знижки
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Створюй промокоди у відсотках або фіксованій сумі. Користувачі вводять їх під час замовлення товару — ціна миттєво перераховується.
        </p>
      </div>

      <PromosManager initialPromos={promos} />
    </div>
  );
}
