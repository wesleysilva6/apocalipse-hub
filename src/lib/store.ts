import { fallbackBanners, fallbackCategories, fallbackProducts } from "@/data/fallback";
import { hasSupabase, supabase } from "@/src/lib/supabase";
import type { Banner, Category, Product } from "@/types/database";

export async function getCategories(): Promise<Category[]> {
  if (!hasSupabase) return fallbackCategories;
  const { data, error } = await supabase.from("categories").select("*").order("created_at");
  if (error) throw error;
  return data ?? [];
}

export async function getBanners(): Promise<Banner[]> {
  if (!hasSupabase) return fallbackBanners;
  const { data, error } = await supabase
    .from("banners")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getProducts(): Promise<Product[]> {
  if (!hasSupabase) return fallbackProducts;
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(*)")
    .eq("status", "active")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return attachClickCounts((data ?? []) as Product[]);
}

export async function getProduct(slug: string): Promise<Product | null> {
  if (!hasSupabase) return fallbackProducts.find((product) => product.slug === slug) ?? null;
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(*)")
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const [product] = await attachClickCounts([data as Product]);
  return product;
}

export async function trackClick(product: Product) {
  if (!hasSupabase) return;
  const tracking = buildTrackingPayload(product.id);
  const { error } = await supabase.from("clicks").insert(tracking);

  if (error) {
    await supabase.from("clicks").insert({
      product_id: product.id,
      referrer: document.referrer || null,
      user_agent: navigator.userAgent,
      ip_hash: null
    });
  }
}

function buildTrackingPayload(productId: string) {
  const userAgent = navigator.userAgent;
  const referrer = document.referrer || null;
  const params = new URLSearchParams(window.location.search);
  const detectedSource = normalizeSource(
    params.get("source") || params.get("utm_source") || referrer,
    userAgent
  );

  return {
    product_id: productId,
    source: detectedSource,
    campaign: params.get("campaign") || params.get("utm_campaign") || null,
    referrer,
    browser: detectBrowser(userAgent),
    application: detectApplication(userAgent, referrer),
    device: detectDeviceType(userAgent),
    operating_system: detectOperatingSystem(userAgent),
    country: null,
    city: null,
    user_agent: userAgent,
    ip_hash: null
  };
}

function normalizeSource(value: string | null, userAgent: string) {
  const raw = value?.toLowerCase() ?? "";
  const ua = userAgent.toLowerCase();
  if (raw.includes("instagram") || ua.includes("instagram")) return "Instagram";
  if (raw.includes("tiktok") || ua.includes("tiktok")) return "TikTok";
  if (raw.includes("youtube") || raw.includes("youtu.be")) return "YouTube";
  if (raw.includes("facebook") || raw.includes("fb_iab") || ua.includes("fb_iab")) return "Facebook";
  if (raw.includes("whatsapp") || ua.includes("whatsapp")) return "WhatsApp";
  if (raw.includes("telegram") || ua.includes("telegram")) return "Telegram";
  if (raw.includes("google")) return "Google";
  if (!raw) return "Direto";
  try {
    return new URL(value ?? "").hostname.replace(/^www\./, "");
  } catch {
    return value || "Direto";
  }
}

function detectApplication(userAgent: string, referrer: string | null) {
  const ua = userAgent.toLowerCase();
  const ref = referrer?.toLowerCase() ?? "";
  if (ua.includes("instagram") || ref.includes("instagram")) return "Instagram App";
  if (ua.includes("tiktok") || ref.includes("tiktok")) return "TikTok App";
  if (ua.includes("fb_iab") || ua.includes("fban") || ref.includes("facebook")) return "Facebook App";
  if (ua.includes("whatsapp") || ref.includes("whatsapp")) return "WhatsApp";
  if (ua.includes("telegram") || ref.includes("telegram")) return "Telegram";
  if (ref.includes("youtube") || ref.includes("youtu.be")) return "YouTube App";
  if (ua.includes("edg/")) return "Edge";
  if (ua.includes("firefox")) return "Firefox";
  if (ua.includes("crios") || ua.includes("chrome")) return /mobile|android|iphone/i.test(userAgent) ? "Chrome Mobile" : "Chrome";
  if (ua.includes("safari")) return /mobile|iphone|ipad/i.test(userAgent) ? "Safari Mobile" : "Safari";
  return "Desconhecido";
}

function detectBrowser(userAgent: string) {
  const ua = userAgent.toLowerCase();
  if (ua.includes("edg/")) return "Edge";
  if (ua.includes("firefox")) return "Firefox";
  if (ua.includes("opr/") || ua.includes("opera")) return "Opera";
  if (ua.includes("crios") || ua.includes("chrome")) return "Chrome";
  if (ua.includes("safari")) return "Safari";
  return "Desconhecido";
}

function detectDeviceType(userAgent: string) {
  const ua = userAgent.toLowerCase();
  if (/ipad|tablet/.test(ua)) return "Tablet";
  if (/mobile|android|iphone/.test(ua)) return "Mobile";
  return "Desktop";
}

function detectOperatingSystem(userAgent: string) {
  const ua = userAgent.toLowerCase();
  if (ua.includes("android")) return "Android";
  if (ua.includes("iphone") || ua.includes("ipad") || ua.includes("ios")) return "iOS";
  if (ua.includes("windows")) return "Windows";
  if (ua.includes("mac os") || ua.includes("macintosh")) return "MacOS";
  if (ua.includes("linux")) return "Linux";
  return "Desconhecido";
}

async function attachClickCounts(products: Product[]) {
  if (!products.length || !hasSupabase) return products;
  const { data } = await supabase
    .from("clicks")
    .select("product_id")
    .in(
      "product_id",
      products.map((product) => product.id)
    );
  const counts = (data ?? []).reduce<Record<string, number>>((acc, click) => {
    const id = String(click.product_id);
    acc[id] = (acc[id] ?? 0) + 1;
    return acc;
  }, {});
  return products.map((product) => ({ ...product, click_count: counts[product.id] ?? 0 }));
}
