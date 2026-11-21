const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.devq.space";
const siteUrl = new URL(configuredUrl);

if (siteUrl.hostname === "devq.space") {
  siteUrl.hostname = "www.devq.space";
}

export const SITE_URL = siteUrl.origin;
