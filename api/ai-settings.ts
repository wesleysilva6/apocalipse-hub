import { maskSecret, requireAdmin } from "./ai-shared";

export default async function handler(req: any, res: any) {
  try {
    const { supabase } = await requireAdmin(req);
    if (req.method === "GET") {
      const { data } = await supabase.from("ai_settings").select("*").order("updated_at", { ascending: false }).limit(1).maybeSingle();
      return res.status(200).json({ ok: true, settings: data ? { ...data, api_key_encrypted: undefined, api_key_masked: maskSecret(data.api_key_encrypted) } : null });
    }
    if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Método não suportado." });
    const body = req.body || {};
    const { data: current } = await supabase.from("ai_settings").select("*").order("updated_at", { ascending: false }).limit(1).maybeSingle();
    const apiKey = body.apiKey || current?.api_key_encrypted || "";
    const row = {
      id: current?.id,
      provider: body.provider,
      model: body.model,
      api_key_encrypted: apiKey,
      is_active: Boolean(body.is_active),
      daily_limit: Number(body.daily_limit ?? 100),
      temperature: Number(body.temperature ?? 0.7),
      default_language: body.default_language || "pt-BR",
      updated_at: new Date().toISOString()
    };
    const { data, error } = await supabase.from("ai_settings").upsert(row).select("*").single();
    if (error) throw error;
    return res.status(200).json({ ok: true, settings: { ...data, api_key_encrypted: undefined, api_key_masked: maskSecret(data.api_key_encrypted) } });
  } catch (error: any) {
    return res.status(401).json({ ok: false, error: error.message || "Falha na configuração de IA." });
  }
}
