import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function adminClient() {
  if (!supabaseUrl || !serviceKey) throw new Error("Supabase server env vars are missing.");
  return createClient(supabaseUrl, serviceKey);
}

export async function requireAdmin(req: any) {
  const token = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  if (!token) throw new Error("Sessão ausente.");
  const supabase = adminClient();
  const { data: userRes, error } = await supabase.auth.getUser(token);
  if (error || !userRes.user) throw new Error("Sessão inválida.");
  const { data: admin } = await supabase.from("admins").select("id,email,role").eq("id", userRes.user.id).maybeSingle();
  if (!admin) throw new Error("Acesso admin negado.");
  return { supabase, user: userRes.user, admin };
}

export function maskSecret(value?: string | null) {
  if (!value) return "";
  return value.length <= 4 ? "••••" : `••••••••••${value.slice(-4)}`;
}

export async function getAiSettings(supabase: ReturnType<typeof adminClient>) {
  const { data } = await supabase.from("ai_settings").select("*").eq("is_active", true).order("updated_at", { ascending: false }).limit(1).maybeSingle();
  return data;
}

export async function callProvider(settings: any, prompt: string) {
  const provider = String(settings.provider || "openai").toLowerCase();
  const key = settings.api_key_encrypted;
  if (!key) throw new Error("API Key de IA não configurada.");
  if (provider === "openai" || provider === "openrouter") {
    const endpoint = provider === "openrouter" ? "https://openrouter.ai/api/v1/chat/completions" : "https://api.openai.com/v1/chat/completions";
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model: settings.model, temperature: Number(settings.temperature ?? 0.7), messages: [{ role: "user", content: prompt }] })
    });
    const json: any = await response.json();
    if (!response.ok) throw new Error(json.error?.message || "Falha no provedor de IA.");
    return json.choices?.[0]?.message?.content || "";
  }
  throw new Error(`Provedor ${provider} ainda não implementado nesta API. Use OpenAI ou OpenRouter.`);
}

export function tryJson(text: string) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try { return JSON.parse(match[0]); } catch { return null; }
}
