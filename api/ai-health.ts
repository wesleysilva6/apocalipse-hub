import { requireAdmin, safeMessage } from "./ai-shared";

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== "GET") return res.status(405).json({ ok: false, error: "Metodo nao suportado." });
    const { supabase } = await requireAdmin(req);
    const [settings, logs] = await Promise.all([
      supabase.from("ai_settings").select("id,is_active,provider,model,last_tested_at,updated_at").order("updated_at", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("ai_usage_logs").select("id", { count: "exact", head: true }).limit(1)
    ]);
    const env = {
      supabase_url: Boolean(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL),
      service_role: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      encryption_key: Boolean(process.env.AI_SETTINGS_ENCRYPTION_KEY),
      openai_fallback: Boolean(process.env.OPENAI_API_KEY)
    };
    return res.status(200).json({
      ok: true,
      env,
      ai_settings: settings.data ?? null,
      ai_settings_error: settings.error?.message ?? null,
      ai_usage_logs_ok: !logs.error,
      runtime: "vercel-function"
    });
  } catch (error: any) {
    return res.status(error?.status || 500).json({ ok: false, error: safeMessage(error) });
  }
}
