import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import WebSocket from "ws";

if (!globalThis.WebSocket) {
  globalThis.WebSocket = WebSocket;
}

function loadEnvFile(file) {
  const path = resolve(process.cwd(), file);
  if (!existsSync(path)) return;

  const content = readFileSync(path, "utf8");
  for (const line of content.split(/\r?\n/)) {
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
  throw new Error(
    "Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY em .env ou .env.local."
  );
}

const email = process.argv[2] ?? "admin@teste.com";
const password = process.argv[3] ?? "admin123";

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function findUserByEmail(targetEmail) {
  let page = 1;
  const perPage = 1000;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;

    const found = data.users.find(
      (user) => user.email?.toLowerCase() === targetEmail.toLowerCase()
    );
    if (found) return found;
    if (data.users.length < perPage) return null;
    page += 1;
  }
}

async function main() {
  let user = null;
  const created = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });

  if (created.error) {
    if (!created.error.message.toLowerCase().includes("already")) {
      throw created.error;
    }

    user = await findUserByEmail(email);
    if (!user) throw new Error(`Usuario ${email} ja existe, mas nao foi localizado.`);

    const updated = await supabase.auth.admin.updateUserById(user.id, {
      password,
      email_confirm: true
    });
    if (updated.error) throw updated.error;
    user = updated.data.user;
  } else {
    user = created.data.user;
  }

  if (!user?.id) throw new Error("Nao foi possivel obter o ID do usuario admin.");

  const { error: adminError } = await supabase.from("admins").upsert(
    {
      id: user.id,
      email,
      role: "admin"
    },
    { onConflict: "id" }
  );

  if (adminError) throw adminError;

  console.log(`Admin pronto: ${email}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
