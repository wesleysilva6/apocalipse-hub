# Loja do Apocalipse

Aplicacao React + Vite para vitrine cinematografica de afiliados, produtos de sobrevivencia e painel administrativo com Supabase.

## Stack atual

- React
- Vite
- TypeScript
- TailwindCSS
- Supabase Auth, PostgreSQL e Storage
- Recharts

## Rodar localmente

```bash
npm install
npm run dev
```

URL local:

```txt
http://localhost:5173
```

O Vite foi configurado para aceitar as variaveis publicas antigas `NEXT_PUBLIC_*`, entao seu `.env` atual continua funcionando.

## Variaveis

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Tambem pode usar:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Nunca exponha `SUPABASE_SERVICE_ROLE_KEY` no frontend.

## Seeds

```bash
npm run seed:admin -- admin@teste.com admin123
npm run seed:catalog
```

## Supabase

Execute `supabase/schema.sql` no SQL Editor.

Se o projeto ja estava criado antes das melhorias do admin, execute novamente o arquivo para adicionar:

- `status = draft`
- `tags`
- `short_description`
- `full_description`
- `display_order`
- `story_section`
- tracking avançado em `clicks`: `source`, `campaign`, `browser`, `application`, `device`, `operating_system`, `country`, `city`

Links rastreáveis:

```txt
https://seusite.com/item/lanterna-bunker-x9?source=instagram&campaign=historia-bunker-ep3
```

Importante para o Vite: como o tracking agora acontece no client, a tabela `clicks` precisa da policy:

```sql
create policy "Public insert clicks"
on public.clicks for insert
with check (true);
```

Essa policy ja esta no arquivo `supabase/schema.sql`.
