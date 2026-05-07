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
    const [key, ...parts] = trimmed.split("=");
    process.env[key.trim()] ||= parts.join("=").trim().replace(/^["']|["']$/g, "");
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

const { data: product, error: productError } = await supabase
  .from("products")
  .select("id")
  .eq("status", "active")
  .limit(1)
  .maybeSingle();

if (productError) throw productError;
if (!product) throw new Error("Nenhum produto ativo para testar.");

const { error } = await supabase.from("clicks").insert({
  product_id: product.id,
  referrer: "local-check",
  user_agent: "vite-check",
  ip_hash: null
});

if (error) {
  console.error(`Public click insert blocked: ${error.message}`);
  process.exit(1);
}

console.log("Public click insert OK.");
