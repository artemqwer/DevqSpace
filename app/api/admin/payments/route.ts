import { getSession } from "@/lib/session";
import {
  getPaymentToggles,
  setPaymentToggles,
  type PaymentToggles,
} from "@/lib/store";
import { jarEnabled } from "@/lib/monojar";
import { nowPaymentsEnabled } from "@/lib/nowpayments";
import { wayForPayEnabled } from "@/lib/wayforpay";
import { lemonEnabled } from "@/lib/lemonsqueezy";
import { paddleEnabled } from "@/lib/paddle";

const KEYS: (keyof PaymentToggles)[] = [
  "jar",
  "crypto",
  "wfp",
  "lemon",
  "paddle",
];

// Які методи взагалі мають ключі в env (інакше тумблер ні на що не впливає).
function configured() {
  return {
    jar: jarEnabled(),
    crypto: nowPaymentsEnabled(),
    wfp: wayForPayEnabled(),
    lemon: lemonEnabled(),
    paddle: paddleEnabled(),
  };
}

export async function GET() {
  if (!(await getSession())) return Response.json({ ok: false }, { status: 401 });
  return Response.json({
    ok: true,
    toggles: await getPaymentToggles(),
    configured: configured(),
  });
}

export async function PUT(req: Request) {
  if (!(await getSession())) return Response.json({ ok: false }, { status: 401 });

  const body = (await req.json().catch(() => null)) as Partial<
    Record<string, unknown>
  > | null;
  if (!body) return Response.json({ ok: false }, { status: 400 });

  const patch: Partial<PaymentToggles> = {};
  for (const k of KEYS) {
    if (typeof body[k] === "boolean") patch[k] = body[k] as boolean;
  }
  if (!Object.keys(patch).length)
    return Response.json({ ok: false, error: "Немає що зберігати" }, { status: 400 });

  const toggles = await setPaymentToggles(patch);
  return Response.json({ ok: true, toggles, configured: configured() });
}
