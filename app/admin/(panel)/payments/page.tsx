import { getPaymentToggles } from "@/lib/store";
import { jarEnabled } from "@/lib/monojar";
import { nowPaymentsEnabled } from "@/lib/nowpayments";
import { wayForPayEnabled } from "@/lib/wayforpay";
import { lemonEnabled } from "@/lib/lemonsqueezy";
import PaymentSettings from "@/components/admin/PaymentSettings";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  const toggles = await getPaymentToggles();
  const configured = {
    jar: jarEnabled(),
    crypto: nowPaymentsEnabled(),
    wfp: wayForPayEnabled(),
    lemon: lemonEnabled(),
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="text-[10px] md:text-xs font-mono text-neon-blue tracking-widest uppercase mb-1">
          {"// PAYMENTS"}
        </div>
        <h1 className="text-2xl md:text-3xl font-display font-bold text-white">
          Методи оплати
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Вмикай/вимикай способи оплати на сайті. Метод з’являється в замовленні,
          лише якщо він <b className="text-gray-400">і ввімкнений тут, і має
          ключі</b> в змінних середовища.
        </p>
      </div>

      <PaymentSettings initialToggles={toggles} configured={configured} />
    </div>
  );
}
