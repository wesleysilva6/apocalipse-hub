import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import WebSocket from "ws";

if (!globalThis.WebSocket) globalThis.WebSocket = WebSocket;

function loadEnvFile(file) {
  const path = resolve(process.cwd(), file);
  if (!existsSync(path)) return;

  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const [rawKey, ...rawValue] = trimmed.split("=");
    const key = rawKey.trim();
    const value = rawValue.join("=").trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const categories = [
  ["Sobrevivencia", "sobrevivencia", "Kits, ferramentas e suprimentos para atravessar o colapso.", "Shield"],
  ["Militar", "militar", "Equipamentos taticos inspirados em operacoes de bunker.", "Crosshair"],
  ["Comunicacao", "comunicacao", "Radios, antenas e sinais para quando a rede cair.", "Radio"],
  ["Energia", "energia", "Fontes, baterias e solucoes para manter sistemas vivos.", "BatteryCharging"],
  ["Lanternas", "lanternas", "Luz fria para corredores escuros, tuneis e ruinas.", "Flashlight"],
  ["Mochilas", "mochilas", "Carga modular para evacuacao, patrulha e exploracao.", "Briefcase"],
  ["Gadgets", "gadgets", "Tecnologia compacta para cenarios hostis.", "Cpu"],
  ["Itens Misteriosos", "itens-misteriosos", "Objetos de laboratorio, arquivos selados e anomalias.", "Fingerprint"]
].map(([name, slug, description, icon]) => ({ name, slug, description, icon }));

const products = [
  {
    name: "Lanterna Bunker X9",
    slug: "lanterna-bunker-x9",
    description: "Lanterna utilizada em operacoes de sobrevivencia durante apagões, invasoes e evacuacoes subterraneas.",
    image_url: "https://images.unsplash.com/photo-1516173531407-0d5b2e0a616b?auto=format&fit=crop&w=1200&q=80",
    affiliate_url: "https://example.com/lanterna-bunker-x9",
    category_slug: "lanternas",
    is_featured: true,
    status: "active"
  },
  {
    name: "Radio Militar Orion",
    slug: "radio-militar-orion",
    description: "Radio de comunicacao para coordenar grupos quando satelites, torres e internet deixam de responder.",
    image_url: "https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?auto=format&fit=crop&w=1200&q=80",
    affiliate_url: "https://example.com/radio-militar-orion",
    category_slug: "comunicacao",
    is_featured: true,
    status: "active"
  },
  {
    name: "Mochila Evacuacao Atlas",
    slug: "mochila-evacuacao-atlas",
    description: "Mochila modular para jornadas longas em zonas contaminadas, cidades vazias e rotas de fuga.",
    image_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
    affiliate_url: "https://example.com/mochila-evacuacao-atlas",
    category_slug: "mochilas",
    is_featured: true,
    status: "active"
  },
  {
    name: "Kit Sobrevivencia Omega",
    slug: "kit-sobrevivencia-omega",
    description: "Kit compacto para abrigo, corte, fogo, sinalizacao e primeiros movimentos apos o colapso.",
    image_url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    affiliate_url: "https://example.com/kit-sobrevivencia-omega",
    category_slug: "sobrevivencia",
    is_featured: true,
    status: "active"
  },
  {
    name: "Modulo Energia Helios",
    slug: "modulo-energia-helios",
    description: "Banco de energia para manter radios, lanternas e sensores ligados em bases improvisadas.",
    image_url: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1200&q=80",
    affiliate_url: "https://example.com/modulo-energia-helios",
    category_slug: "energia",
    is_featured: false,
    status: "active"
  },
  {
    name: "Scanner Secreto Vektor",
    slug: "scanner-secreto-vektor",
    description: "Gadget misterioso para exploradores de laboratorios abandonados e instalacoes subterraneas.",
    image_url: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?auto=format&fit=crop&w=1200&q=80",
    affiliate_url: "https://example.com/scanner-secreto-vektor",
    category_slug: "itens-misteriosos",
    is_featured: false,
    status: "active"
  }
];

async function main() {
  const { error: categoryError } = await supabase
    .from("categories")
    .upsert(categories, { onConflict: "slug" });
  if (categoryError) throw categoryError;

  const { data: dbCategories, error: readError } = await supabase
    .from("categories")
    .select("id, slug");
  if (readError) throw readError;

  const categoryBySlug = new Map(dbCategories.map((category) => [category.slug, category.id]));
  const productPayload = products.map(({ category_slug, ...product }) => ({
    ...product,
    category_id: categoryBySlug.get(category_slug) ?? null
  }));

  const { error: productError } = await supabase
    .from("products")
    .upsert(productPayload, { onConflict: "slug" });
  if (productError) throw productError;

  const banner = {
      title: "Equipamentos para sobreviver ao fim do mundo",
      subtitle: "Os itens utilizados pelos sobreviventes das historias.",
      image_url: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=2200&q=85",
      button_text: "Explorar Arsenal",
      button_link: "/arsenal",
      status: "active"
    };
  const { data: existingBanner, error: existingBannerError } = await supabase
    .from("banners")
    .select("id")
    .eq("title", banner.title)
    .maybeSingle();
  if (existingBannerError) throw existingBannerError;

  const bannerResult = existingBanner
    ? await supabase.from("banners").update(banner).eq("id", existingBanner.id)
    : await supabase.from("banners").insert(banner);
  if (bannerResult.error) throw bannerResult.error;

  console.log(`Catalogo pronto: ${categories.length} categorias, ${products.length} produtos.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
