import { listPromoCodes, getAllProducts } from "@/lib/store";
import PromosManager from "@/components/admin/PromosManager";

export const dynamic = "force-dynamic";

export default async function AdminPromosPage() {
  const [promos, products] = await Promise.all([
    listPromoCodes(),
    getAllProducts(),
  ]);

  const productOptions = products.map((p) => ({
    slug: p.slug,
    title: p.title,
    price: p.price,
  }));

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
          Створюй промокоди на знижку (відсоток/фіксована) або послугу (безкоштовне налаштування/хостинг), вибирай період дії, ліміт використань та обмеження за товарами.
        </p>
      </div>

      <PromosManager initialPromos={promos} availableProducts={productOptions} />
    </div>
  );
}
