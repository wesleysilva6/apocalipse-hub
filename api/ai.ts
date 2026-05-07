import { callProvider, getAiSettings, requireAdmin, safeMessage, tryJson } from "./ai-shared";

const allowedFeatures = new Set([
  "admin_assistant",
  "product_description",
  "banner_copy",
  "story_ideas",
  "report",
  "test_connection"
]);

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Metodo nao suportado." });

    const { supabase, user } = await requireAdmin(req);
    const settings = await getAiSettings(supabase);
    if (!settings) return res.status(400).json({ ok: false, error: "Configuracao IA nao encontrada ou inativa." });

    const limitCheck = await enforceRateLimit(supabase, user.id, Number(settings.daily_limit ?? 100));
    if (!limitCheck.ok) return res.status(limitCheck.status).json({ ok: false, error: limitCheck.error });

    const feature = String(req.body?.feature || "admin_assistant");
    if (!allowedFeatures.has(feature)) return res.status(400).json({ ok: false, error: "Recurso de IA invalido." });

    const input = sanitizeInput(req.body?.input || {});
    const context = feature === "test_connection" ? {} : await realContext(supabase);
    const prompt = buildPrompt(feature, input, context, settings.default_language || "pt-BR");
    const text = await callProvider(settings, prompt);
    const data = tryJson(text);

    await supabase.from("ai_usage_logs").insert({
      user_id: user.id,
      feature,
      prompt: JSON.stringify({ feature, input }).slice(0, 2000),
      response_summary: text.slice(0, 1000),
      tokens_used: null,
      status: "success"
    });

    if (feature === "test_connection") {
      await supabase.from("ai_settings").update({ last_tested_at: new Date().toISOString() }).eq("id", settings.id);
    }

    return res.status(200).json({ ok: true, text, data });
  } catch (error: any) {
    console.error("ai route error", { message: error?.message, status: error?.status });
    return res.status(error?.status || 500).json({ ok: false, error: safeMessage(error) });
  }
}

async function enforceRateLimit(supabase: any, userId: string, dailyLimit: number) {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const sinceCooldown = new Date(now.getTime() - 5_000).toISOString();

  const [{ count: dailyCount }, { count: cooldownCount }] = await Promise.all([
    supabase
      .from("ai_usage_logs")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", `${today}T00:00:00.000Z`),
    supabase
      .from("ai_usage_logs")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", sinceCooldown)
  ]);

  if ((dailyCount ?? 0) >= dailyLimit) return { ok: false, status: 429, error: "Limite diario de IA atingido." };
  if ((cooldownCount ?? 0) > 0) return { ok: false, status: 429, error: "Aguarde alguns segundos antes de chamar a IA novamente." };
  return { ok: true, status: 200, error: "" };
}

async function realContext(supabase: any) {
  const [clicks, products, categories, links, collections] = await Promise.all([
    supabase.from("clicks").select("source,campaign,application,device,created_at,products(name,categories(name))").order("created_at", { ascending: false }).limit(300),
    supabase.from("products").select("name,slug,description,short_description,tags,status,is_featured,image_url,categories(name)").limit(200),
    supabase.from("categories").select("name,slug").limit(80),
    supabase.from("tracking_links").select("name,source,campaign,medium,status").limit(120),
    supabase.from("collections").select("name,slug,status,is_featured").limit(80)
  ]);

  return {
    clicks: clicks.data || [],
    products: products.data || [],
    categories: categories.data || [],
    tracking_links: links.data || [],
    collections: collections.data || []
  };
}

function buildPrompt(feature: string, input: any, context: any, language: string) {
  const noFake = "Use somente os dados reais fornecidos. Nunca invente numeros. Se nao houver dados suficientes, responda exatamente: Dados insuficientes para gerar uma analise confiavel.";
  const base = `Voce e o Oraculo do Bunker, IA admin de um Hub de Afiliados cinematografico de apocalipse, sobrevivencia, bunker, suspense e militar. Responda em ${language}. ${noFake}\nDADOS REAIS JSON:\n${JSON.stringify(context).slice(0, 12000)}\nINPUT:\n${JSON.stringify(input).slice(0, 3000)}`;
  if (feature === "product_description") return `${base}\nGere JSON valido com: title, short_description, description, full_description, cinematic_text, tags array, suggested_category.`;
  if (feature === "banner_copy") return `${base}\nGere JSON valido com: title, subtitle, cta, promotional_copy, variations array.`;
  if (feature === "story_ideas") return `${base}\nSugira produtos reais relacionados, campanha, slug, source, campaign e CTA.`;
  if (feature === "report") return `${base}\nGere relatorio executivo com desempenho geral, produtos, campanhas, origem, apps, recomendacoes praticas.`;
  if (feature === "test_connection") return "Responda apenas: Conexao IA operacional.";
  return `${base}\nResponda a pergunta do administrador com analise pratica e objetiva.`;
}

function sanitizeInput(input: any) {
  return JSON.parse(JSON.stringify(input, (_key, value) => {
    if (typeof value === "string") return value.replace(/sk-[A-Za-z0-9_-]+/g, "[redacted]").slice(0, 3000);
    return value;
  }));
}
