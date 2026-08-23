import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

export type Locale = "uk" | "en";

export default getRequestConfig(async () => {
  const store = await cookies();
  const locale: Locale =
    store.get("NEXT_LOCALE")?.value === "en" ? "en" : "uk";
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
