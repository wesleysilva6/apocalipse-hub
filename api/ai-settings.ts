import { encryptSecret, maskSecret, requireAdmin, safeMessage } from "./ai-shared";

export default async function handler(req: any, res: any) {
  try {
    const { supabase } = await requireAdmin(req);

    if (req.method === "GET") {
      const { data, error } = await supabase
        .from("ai_settings")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return res.status(200).json({
        ok: true,
        settings: data ? sanitizeSettings(data) : null
      });
    }

    if (req.method !== "POST") {
      return res.status(405).json({ ok: false, error: "Metodo nao suportado." });
    }

    const body = req.body || {};
    const provider = String(body.provider || "openai").toLowerCase();
    if (!["openai", "openrouter", "anthropic", "gemini"].includes(provider)) {
      return res.status(400).json({ ok: false, error: "Provedor de IA invalido." });
    }

    const { data: current, error: currentError } = await supabase
      .from("ai_settings")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (currentError) throw currentError;

    const rawKey = typeof body.apiKey === "string" && body.apiKey.trim() ? body.apiKey.trim() : "";
    const apiKey = rawKey ? encryptSecret(rawKey) : current?.api_key_encrypted || "";
    const row = {
      id: current?.id,
      provider,
      model: String(body.model || "gpt-4o-mini").trim(),
      api_key_encrypted: apiKey,
      is_active: Boolean(body.is_active),
      daily_limit: clampInt(body.daily_limit, 1, 10_000, 100),
      temperature: clampNumber(body.temperature, 0, 2, 0.7),
      default_language: String(body.default_language || "pt-BR").slice(0, 20),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase.from("ai_settings").upsert(row).select("*").single();
    if (error) throw error;

    return res.status(200).json({ ok: true, settings: sanitizeSettings(data) });
  } catch (error: any) {
    console.error("ai-settings error", { message: error?.message, status: error?.status });
    return res.status(error?.status || 500).json({ ok: false, error: safeMessage(error) });
  }
}

function sanitizeSettings(data: any) {
  return {
    ...data,
    api_key_encrypted: undefined,
    api_key_masked: maskSecret(data.api_key_encrypted)
  };
}

function clampInt(value: unknown, min: number, max: number, fallback: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, Math.floor(parsed)));
}

function clampNumber(value: unknown, min: number, max: number, fallback: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, parsed));
}
