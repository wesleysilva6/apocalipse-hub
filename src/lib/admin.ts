import { fallbackBanners, fallbackCategories, fallbackProducts } from "@/data/fallback";
import { hasSupabase, supabase } from "@/src/lib/supabase";
import type { Banner, Category, Product } from "@/types/database";

export type OverviewFilters = {
  range?: "today" | "7d" | "30d" | "custom";
  dateFrom?: string;
  dateTo?: string;
  source?: string;
  application?: string;
  campaign?: string;
  productId?: string;
  device?: string;
};

export type InsightRow = {
  name: string;
  value: number;
  percentage: number;
  growth: number;
};

export type CampaignInsight = {
  campaign: string;
  source: string;
  clicks: number;
  bestHour: string;
  device: string;
};

export type Overview = {
  totalClicks: number;
  todayClicks: number;
  yesterdayClicks: number;
  growth: number;
  products: number;
  activeProducts: number;
  inactiveProducts: number;
  featuredProducts: number;
  categories: number;
  banners: number;
  mainPlatform: string;
  mainApplication: string;
  mainDevice: string;
  bestCampaign: string;
  daily: { day: string; clicks: number }[];
  sources: { source: string; value: number }[];
  applications: { application: string; value: number }[];
  devices: { device: string; value: number }[];
  operatingSystems: { operating_system: string; value: number }[];
  campaigns: { campaign: string; value: number }[];
  categoryClicks: { category: string; clicks: number }[];
  sourceInsights: InsightRow[];
  applicationInsights: InsightRow[];
  campaignInsights: CampaignInsight[];
  topProducts: {
    id: string;
    name: string;
    slug: string;
    image_url: string;
    category: string;
    clicks: number;
    share: number;
    mainSource: string;
  }[];
  recent: {
    id: string;
    product: string;
    source: string;
    application: string;
    campaign: string;
    device: string;
    operatingSystem: string;
    created_at: string;
  }[];
  filterOptions: {
    sources: string[];
    applications: string[];
    campaigns: string[];
    devices: string[];
    products: { id: string; name: string }[];
  };
};

type ClickRow = {
  id: string;
  product_id: string;
  source: string | null;
  campaign: string | null;
  referrer: string | null;
  browser: string | null;
  application: string | null;
  device: string | null;
  operating_system: string | null;
  country: string | null;
  city: string | null;
  user_agent: string | null;
  created_at: string;
  products?: {
    id: string;
    name: string;
    slug: string;
    image_url: string;
    categories?: { name: string } | null;
  } | null;
};

export async function requireAdmin() {
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase.from("admins").select("id").eq("id", user.id).maybeSingle();
  return Boolean(data);
}

export async function getAdminProducts(): Promise<Product[]> {
  if (!hasSupabase) return fallbackProducts;
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(*)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return attachCounts((data ?? []) as Product[]);
}

export async function getAdminCategories(): Promise<Category[]> {
  if (!hasSupabase) return fallbackCategories;
  const { data, error } = await supabase.from("categories").select("*").order("created_at");
  if (error) throw error;
  return data ?? [];
}

export async function getAdminBanners(): Promise<Banner[]> {
  if (!hasSupabase) return fallbackBanners;
  const { data, error } = await supabase.from("banners").select("*").order("created_at");
  if (error) throw error;
  return data ?? [];
}

export async function getOverview(filters: OverviewFilters = {}): Promise<Overview> {
  if (!hasSupabase) return fallbackOverview();

  const { startDate, endDate, previousStartDate } = resolveRange(filters);
  const [clicks, allClicks, productsRes, categoriesRes, bannersRes] = await Promise.all([
    fetchClicks(startDate, endDate, filters),
    fetchClicks(startDate, endDate, {}),
    supabase.from("products").select("id, name, status, is_featured"),
    supabase.from("categories").select("id"),
    supabase.from("banners").select("id, status")
  ]);

  const previousClicks = await fetchClicks(previousStartDate, startDate, filters);
  const products = productsRes.data ?? [];
  const banners = bannersRes.data ?? [];
  const today = start(new Date());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const todayClicks = clicks.filter((click) => between(click.created_at, today, tomorrow)).length;
  const yesterdayClicks = clicks.filter((click) => between(click.created_at, yesterday, today)).length;
  const sources = rank(clicks.map(clickSource)).map(([source, value]) => ({ source, value }));
  const applications = rank(clicks.map(clickApplication)).map(([application, value]) => ({ application, value }));
  const devices = rank(clicks.map(clickDevice)).map(([device, value]) => ({ device, value }));
  const operatingSystems = rank(clicks.map(clickOperatingSystem)).map(([operating_system, value]) => ({ operating_system, value }));
  const campaigns = rank(clicks.map((click) => click.campaign || "Sem campanha")).map(([campaign, value]) => ({ campaign, value }));

  return {
    totalClicks: clicks.length,
    todayClicks,
    yesterdayClicks,
    growth: growth(clicks.length, previousClicks.length),
    products: products.length,
    activeProducts: products.filter((product) => product.status === "active").length,
    inactiveProducts: products.filter((product) => product.status !== "active").length,
    featuredProducts: products.filter((product) => product.is_featured).length,
    categories: categoriesRes.data?.length ?? 0,
    banners: banners.filter((banner) => banner.status === "active").length,
    mainPlatform: sources[0]?.source ?? "Sem dados",
    mainApplication: applications[0]?.application ?? "Sem dados",
    mainDevice: devices[0]?.device ?? "Sem dados",
    bestCampaign: campaigns[0]?.campaign ?? "Sem campanha",
    daily: buildTimeline(clicks, startDate, endDate),
    sources,
    applications,
    devices,
    operatingSystems,
    campaigns,
    categoryClicks: rankCategoryClicks(clicks),
    sourceInsights: buildInsights(clicks, previousClicks, clickSource),
    applicationInsights: buildInsights(clicks, previousClicks, clickApplication),
    campaignInsights: buildCampaignInsights(clicks),
    topProducts: topProducts(clicks),
    recent: clicks.slice(0, 14).map((click) => ({
      id: click.id,
      product: click.products?.name ?? "Produto removido",
      source: clickSource(click),
      application: clickApplication(click),
      campaign: click.campaign || "Sem campanha",
      device: clickDevice(click),
      operatingSystem: clickOperatingSystem(click),
      created_at: click.created_at
    })),
    filterOptions: {
      sources: unique(allClicks.map(clickSource)),
      applications: unique(allClicks.map(clickApplication)),
      campaigns: unique(allClicks.map((click) => click.campaign || "Sem campanha")),
      devices: unique(allClicks.map(clickDevice)),
      products: uniqueProducts(allClicks)
    }
  };
}

async function fetchClicks(startDate: Date, endDate: Date, filters: OverviewFilters) {
  const advancedSelect =
    "id, product_id, source, campaign, referrer, browser, application, device, operating_system, country, city, user_agent, created_at, products(id, name, slug, image_url, categories(name))";
  const legacySelect =
    "id, product_id, referrer, user_agent, created_at, products(id, name, slug, image_url, categories(name))";

  const run = (select: string, advanced: boolean) => {
    let query = supabase
      .from("clicks")
      .select(select)
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString())
      .order("created_at", { ascending: false })
      .limit(8000);

    if (filters.productId && filters.productId !== "all") query = query.eq("product_id", filters.productId);
    if (advanced) {
      if (filters.source && filters.source !== "all") query = query.eq("source", filters.source);
      if (filters.application && filters.application !== "all") query = query.eq("application", filters.application);
      if (filters.campaign && filters.campaign !== "all") {
        query = filters.campaign === "Sem campanha" ? query.is("campaign", null) : query.eq("campaign", filters.campaign);
      }
      if (filters.device && filters.device !== "all") query = query.eq("device", filters.device);
    }
    return query;
  };

  const { data, error } = await run(advancedSelect, true);
  if (!error) return (data ?? []) as unknown as ClickRow[];

  const { data: legacyData, error: legacyError } = await run(legacySelect, false);
  if (legacyError) throw legacyError;
  return ((legacyData ?? []) as unknown as ClickRow[]).map((click) => ({
    ...click,
    source: null,
    campaign: null,
    browser: null,
    application: null,
    device: null,
    operating_system: null,
    country: null,
    city: null
  }));
}

async function attachCounts(products: Product[]) {
  if (!products.length) return products;
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

function fallbackOverview(): Overview {
  return {
    totalClicks: 0,
    todayClicks: 0,
    yesterdayClicks: 0,
    growth: 0,
    products: fallbackProducts.length,
    activeProducts: fallbackProducts.length,
    inactiveProducts: 0,
    featuredProducts: fallbackProducts.filter((product) => product.is_featured).length,
    categories: fallbackCategories.length,
    banners: fallbackBanners.length,
    mainPlatform: "Sem dados",
    mainApplication: "Sem dados",
    mainDevice: "Sem dados",
    bestCampaign: "Sem campanha",
    daily: Array.from({ length: 14 }).map((_, index) => ({ day: `${index + 1}`, clicks: 0 })),
    sources: [],
    applications: [],
    devices: [],
    operatingSystems: [],
    campaigns: [],
    categoryClicks: [],
    sourceInsights: [],
    applicationInsights: [],
    campaignInsights: [],
    topProducts: [],
    recent: [],
    filterOptions: { sources: [], applications: [], campaigns: [], devices: [], products: [] }
  };
}

function resolveRange(filters: OverviewFilters) {
  const now = new Date();
  let startDate = start(now);
  const endDate = new Date(now);

  if (filters.range === "today") {
    startDate = start(now);
  } else if (filters.range === "30d") {
    startDate.setDate(startDate.getDate() - 29);
  } else if (filters.range === "custom" && filters.dateFrom && filters.dateTo) {
    startDate = new Date(`${filters.dateFrom}T00:00:00`);
    endDate.setTime(new Date(`${filters.dateTo}T23:59:59`).getTime());
  } else {
    startDate.setDate(startDate.getDate() - 6);
  }

  const previousStartDate = new Date(startDate);
  previousStartDate.setTime(startDate.getTime() - (endDate.getTime() - startDate.getTime()));
  return { startDate, endDate, previousStartDate };
}

function start(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function between(value: string, a: Date, b: Date) {
  const date = new Date(value);
  return date >= a && date < b;
}

function growth(current: number, previous: number) {
  if (!previous && current) return 100;
  if (!previous) return 0;
  return Number((((current - previous) / previous) * 100).toFixed(1));
}

function buildTimeline(clicks: ClickRow[], startDate: Date, endDate: Date) {
  const days = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000));
  return Array.from({ length: Math.min(days, 31) }).map((_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);
    const next = new Date(date);
    next.setDate(date.getDate() + 1);
    return {
      day: date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      clicks: clicks.filter((click) => between(click.created_at, date, next)).length
    };
  });
}

function rank(values: string[]) {
  const counts = values.reduce<Record<string, number>>((acc, value) => {
    const key = value || "Desconhecido";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8);
}

function buildInsights(clicks: ClickRow[], previousClicks: ClickRow[], selector: (click: ClickRow) => string) {
  const total = clicks.length || 1;
  const previousCounts = countBy(previousClicks, selector);
  return rank(clicks.map(selector)).map(([name, value]) => ({
    name,
    value,
    percentage: Number(((value / total) * 100).toFixed(1)),
    growth: growth(value, previousCounts[name] ?? 0)
  }));
}

function buildCampaignInsights(clicks: ClickRow[]) {
  return rank(clicks.map((click) => click.campaign || "Sem campanha")).map(([campaign, clicksCount]) => {
    const campaignClicks = clicks.filter((click) => (click.campaign || "Sem campanha") === campaign);
    return {
      campaign,
      source: topValue(campaignClicks, clickSource),
      clicks: clicksCount,
      bestHour: topHour(campaignClicks),
      device: topValue(campaignClicks, clickDevice)
    };
  });
}

function rankCategoryClicks(clicks: ClickRow[]) {
  return rank(clicks.map((click) => click.products?.categories?.name ?? "Sem categoria")).map(([category, clicksCount]) => ({
    category,
    clicks: clicksCount
  }));
}

function topProducts(clicks: ClickRow[]) {
  const map = new Map<string, Overview["topProducts"][number] & { sourceCounts: Record<string, number> }>();
  clicks.forEach((click) => {
    const product = click.products;
    const id = product?.id ?? click.product_id;
    const current =
      map.get(id) ??
      {
        id,
        name: product?.name ?? "Produto removido",
        slug: product?.slug ?? "",
        image_url: product?.image_url ?? "",
        category: product?.categories?.name ?? "Sem categoria",
        clicks: 0,
        share: 0,
        mainSource: "Direto",
        sourceCounts: {}
      };
    current.clicks += 1;
    const source = clickSource(click);
    current.sourceCounts[source] = (current.sourceCounts[source] ?? 0) + 1;
    map.set(id, current);
  });
  const total = clicks.length || 1;
  return [...map.values()]
    .map(({ sourceCounts, ...product }) => ({
      ...product,
      share: Number(((product.clicks / total) * 100).toFixed(1)),
      mainSource: Object.entries(sourceCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Direto"
    }))
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 8);
}

function countBy(clicks: ClickRow[], selector: (click: ClickRow) => string) {
  return clicks.reduce<Record<string, number>>((acc, click) => {
    const key = selector(click);
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
}

function topValue(clicks: ClickRow[], selector: (click: ClickRow) => string) {
  return rank(clicks.map(selector))[0]?.[0] ?? "Sem dados";
}

function topHour(clicks: ClickRow[]) {
  const hour = rank(clicks.map((click) => `${new Date(click.created_at).getHours().toString().padStart(2, "0")}:00`))[0]?.[0];
  return hour ?? "Sem dados";
}

function clickSource(click: ClickRow) {
  return click.source || normalizeSource(click.referrer, click.user_agent);
}

function clickApplication(click: ClickRow) {
  return click.application || detectApplication(click.user_agent, click.referrer);
}

function clickDevice(click: ClickRow) {
  return click.device || detectDevice(click.user_agent);
}

function clickOperatingSystem(click: ClickRow) {
  return click.operating_system || detectOperatingSystem(click.user_agent);
}

function normalizeSource(referrer: string | null, userAgent: string | null) {
  const raw = referrer?.toLowerCase() ?? "";
  const ua = userAgent?.toLowerCase() ?? "";
  if (raw.includes("instagram") || ua.includes("instagram")) return "Instagram";
  if (raw.includes("tiktok") || ua.includes("tiktok")) return "TikTok";
  if (raw.includes("youtube") || raw.includes("youtu.be")) return "YouTube";
  if (raw.includes("facebook") || ua.includes("fb_iab")) return "Facebook";
  if (raw.includes("whatsapp") || ua.includes("whatsapp")) return "WhatsApp";
  if (raw.includes("telegram") || ua.includes("telegram")) return "Telegram";
  if (raw.includes("google")) return "Google";
  if (!raw) return "Direto";
  try {
    return new URL(referrer ?? "").hostname.replace(/^www\./, "");
  } catch {
    return "Desconhecido";
  }
}

function detectApplication(userAgent: string | null, referrer: string | null) {
  const ua = userAgent?.toLowerCase() ?? "";
  const ref = referrer?.toLowerCase() ?? "";
  if (ua.includes("instagram") || ref.includes("instagram")) return "Instagram App";
  if (ua.includes("tiktok") || ref.includes("tiktok")) return "TikTok App";
  if (ua.includes("fb_iab") || ua.includes("fban") || ref.includes("facebook")) return "Facebook App";
  if (ua.includes("whatsapp") || ref.includes("whatsapp")) return "WhatsApp";
  if (ua.includes("telegram") || ref.includes("telegram")) return "Telegram";
  if (ref.includes("youtube") || ref.includes("youtu.be")) return "YouTube App";
  if (ua.includes("edg/")) return "Edge";
  if (ua.includes("firefox")) return "Firefox";
  if (ua.includes("crios") || ua.includes("chrome")) return /mobile|android|iphone/i.test(userAgent ?? "") ? "Chrome Mobile" : "Chrome";
  if (ua.includes("safari")) return /mobile|iphone|ipad/i.test(userAgent ?? "") ? "Safari Mobile" : "Safari";
  return "Desconhecido";
}

function detectDevice(userAgent: string | null) {
  const ua = userAgent?.toLowerCase() ?? "";
  if (/ipad|tablet/.test(ua)) return "Tablet";
  if (/mobile|android|iphone/.test(ua)) return "Mobile";
  if (!ua) return "Desconhecido";
  return "Desktop";
}

function detectOperatingSystem(userAgent: string | null) {
  const ua = userAgent?.toLowerCase() ?? "";
  if (ua.includes("android")) return "Android";
  if (ua.includes("iphone") || ua.includes("ipad")) return "iOS";
  if (ua.includes("windows")) return "Windows";
  if (ua.includes("mac os") || ua.includes("macintosh")) return "MacOS";
  if (ua.includes("linux")) return "Linux";
  return "Desconhecido";
}

function unique(items: string[]) {
  return [...new Set(items.filter(Boolean))].sort();
}

function uniqueProducts(clicks: ClickRow[]) {
  const map = new Map<string, string>();
  clicks.forEach((click) => {
    if (click.products?.id) map.set(click.products.id, click.products.name);
  });
  return [...map.entries()].map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
}
