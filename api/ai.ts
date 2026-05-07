import { callProvider, getAiSettings, requireAdmin, tryJson } from "./ai-shared";

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Método não suportado." });
    const { supabase, user } = await requireAdmin(req);
    const settings = await getAiSettings(supabase);
    if (!settings) return res.status(400).json({ ok: false, error: "IA não configurada ou inativa." });
    const today = new Date().toISOString().slice(0, 10);
    const { count } = await supabase.from("ai_usage_logs").select("id", { count: "exact", head: true }).gte("created_at", `${today}T00:00:00.000Z`);
    if ((count ?? 0) >= Number(settings.daily_limit ?? 100)) return res.status(429).json({ ok: false, error: "Limite diário de IA atingido." });

    const feature = String(req.body?.feature || "admin_assistant");
    const input = req.body?.input || {};
    const context = await realContext(supabase);
    const prompt = buildPrompt(feature, input, context, settings.default_language || "pt-BR");
    const text = await callProvider(settings, prompt);
    const data = tryJson(text);

    await supabase.from("ai_usage_logs").insert({
      user_id: user.id,
      feature,
      prompt: prompt.slice(0, 4000),
      response_summary: text.slice(0, 1000),
      tokens_used: null,
      status: "success"
    });

    return res.status(200).json({ ok: true, text, data });
  } catch (error: any) {
    return res.status(500).json({ ok: false, error: error.message || "Falha ao executar IA." });
  }
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
  const noFake = "Use somente os dados reais fornecidos. Nunca invente números. Se não houver dados suficientes, responda exatamente: Dados insuficientes para gerar uma análise confiável.";
  const base = `Você é o Oráculo do Bunker, IA admin de um Hub de Afiliados cinematográfico de apocalipse, sobrevivência, bunker, suspense e militar. Responda em ${language}. ${noFake}\nDADOS REAIS JSON:\n${JSON.stringify(context).slice(0, 12000)}\nINPUT:\n${JSON.stringify(input).slice(0, 3000)}`;
  if (feature === "product_description") return `${base}\nGere JSON válido com: title, short_description, description, full_description, cinematic_text, tags array, suggested_category.`;
  if (feature === "banner_copy") return `${base}\nGere JSON válido com: title, subtitle, cta, promotional_copy, variations array.`;
  if (feature === "story_ideas") return `${base}\nSugira produtos reais relacionados, campanha, slug, source, campaign e CTA.`;
  if (feature === "report") return `${base}\nGere relatório executivo com desempenho geral, produtos, campanhas, origem, apps, recomendações práticas.`;
  if (feature === "test_connection") return "Responda apenas: Conexão IA operacional.";
  return `${base}\nResponda a pergunta do administrador com análise prática e objetiva.`;
}
