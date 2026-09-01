import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";
import { getMessages, type Locale } from "@/lib/content";

export default getRequestConfig(async () => {
  const store = await cookies();
  const locale: Locale = store.get("NEXT_LOCALE")?.value === "en" ? "en" : "uk";
  return {
    locale,
    // Файл + правки з адмінки. Див. lib/content.ts.
    messages: await getMessages(locale),
  };
});
