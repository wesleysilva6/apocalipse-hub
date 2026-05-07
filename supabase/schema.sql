create extension if not exists pgcrypto;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  icon text default 'Shield',
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null,
  image_url text not null,
  affiliate_url text not null,
  category_id uuid references public.categories(id) on delete set null,
  is_featured boolean not null default false,
  status text not null default 'active' check (status in ('active', 'inactive', 'draft')),
  created_at timestamptz not null default now()
);

alter table public.products add column if not exists short_description text;
alter table public.products add column if not exists full_description text;
alter table public.products add column if not exists tags text[] not null default '{}';
alter table public.products add column if not exists display_order integer not null default 0;
alter table public.products add column if not exists story_section text check (story_section in ('most_used', 'forbidden', 'survivor_choice'));

do $$
begin
  if exists (
    select 1
    from information_schema.constraint_column_usage
    where table_schema = 'public'
      and table_name = 'products'
      and constraint_name like '%status%'
  ) then
    alter table public.products drop constraint if exists products_status_check;
  end if;
end $$;

alter table public.products
  add constraint products_status_check check (status in ('active', 'inactive', 'draft'));

create table if not exists public.clicks (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  source text,
  campaign text,
  referrer text,
  browser text,
  application text,
  device text,
  operating_system text,
  country text,
  city text,
  user_agent text,
  ip_hash text,
  created_at timestamptz not null default now()
);

alter table public.clicks add column if not exists source text;
alter table public.clicks add column if not exists campaign text;
alter table public.clicks add column if not exists browser text;
alter table public.clicks add column if not exists application text;
alter table public.clicks add column if not exists device text;
alter table public.clicks add column if not exists operating_system text;
alter table public.clicks add column if not exists country text;
alter table public.clicks add column if not exists city text;

create table if not exists public.banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  image_url text not null,
  button_text text,
  button_link text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now()
);

create table if not exists public.admins (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  role text not null default 'admin' check (role in ('admin', 'editor', 'analyst')),
  created_at timestamptz not null default now()
);

create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  status text not null default 'active' check (status in ('active', 'inactive', 'draft')),
  is_featured boolean not null default false,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.collection_products (
  collection_id uuid not null references public.collections(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (collection_id, product_id)
);

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text,
  discount_type text not null default 'percent' check (discount_type in ('percent', 'fixed')),
  percent numeric,
  fixed_value numeric,
  expires_at date,
  usage_limit integer,
  used_count integer not null default 0,
  status text not null default 'active' check (status in ('active', 'expired', 'paused')),
  created_at timestamptz not null default now()
);

create table if not exists public.admin_profiles (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text not null unique,
  avatar_url text,
  role text not null default 'analyst' check (role in ('admin', 'editor', 'analyst')),
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now()
);

create table if not exists public.admin_activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_email text,
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.tracking_links (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  destination_url text not null,
  source text not null,
  campaign text not null,
  medium text,
  tags text[] not null default '{}',
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now()
);

create table if not exists public.integrations (
  id text primary key,
  platform text not null unique,
  description text,
  status text not null default 'disconnected' check (status in ('connected', 'disconnected', 'paused')),
  token_hint text,
  settings jsonb not null default '{}'::jsonb,
  last_sync_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.integrations add column if not exists name text;
alter table public.integrations add column if not exists provider text;
alter table public.integrations add column if not exists config jsonb not null default '{}'::jsonb;
alter table public.integrations add column if not exists last_tested_at timestamptz;

create table if not exists public.settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value jsonb,
  "group" text not null default 'general',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.integration_events (
  id uuid primary key default gen_random_uuid(),
  integration_id text references public.integrations(id) on delete set null,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending', 'success', 'error')),
  response text,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_insights (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  title text not null,
  description text,
  metric_value numeric,
  period text,
  source_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_settings (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'openai',
  model text not null default 'gpt-4o-mini',
  api_key_encrypted text,
  is_active boolean not null default false,
  daily_limit integer not null default 100,
  temperature numeric not null default 0.7,
  default_language text not null default 'pt-BR',
  last_tested_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_usage_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  feature text not null,
  prompt text,
  response_summary text,
  tokens_used integer,
  status text not null default 'success' check (status in ('success', 'error')),
  created_at timestamptz not null default now()
);

create table if not exists public.story_campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  origin text,
  platform text,
  description text,
  status text not null default 'active' check (status in ('active', 'inactive', 'draft')),
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  cover_url text,
  status text not null default 'active' check (status in ('active', 'inactive', 'draft')),
  created_at timestamptz not null default now()
);

create table if not exists public.story_episodes (
  id uuid primary key default gen_random_uuid(),
  story_id uuid references public.stories(id) on delete cascade,
  campaign_id uuid references public.story_campaigns(id) on delete set null,
  title text not null,
  slug text not null,
  description text,
  episode_number integer not null default 1,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  unique (story_id, slug)
);

create table if not exists public.story_products (
  story_id uuid not null references public.stories(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  context text,
  created_at timestamptz not null default now(),
  primary key (story_id, product_id)
);

create table if not exists public.short_links (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  destination_url text not null,
  source text,
  campaign text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  clicks integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.pixel_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  event_name text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now()
);

create table if not exists public.internal_ads (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  image_url text,
  target_url text,
  placement text not null default 'home',
  campaign text,
  starts_at timestamptz,
  ends_at timestamptz,
  status text not null default 'active' check (status in ('active', 'inactive', 'draft')),
  created_at timestamptz not null default now()
);

create table if not exists public.admin_notifications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text not null,
  severity text not null default 'info' check (severity in ('info', 'success', 'warning', 'critical')),
  read_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists products_slug_idx on public.products(slug);
create index if not exists products_status_idx on public.products(status);
create index if not exists products_category_idx on public.products(category_id);
create index if not exists clicks_product_idx on public.clicks(product_id);
create index if not exists clicks_created_at_idx on public.clicks(created_at);
create index if not exists clicks_source_idx on public.clicks(source);
create index if not exists clicks_campaign_idx on public.clicks(campaign);
create index if not exists clicks_application_idx on public.clicks(application);
create index if not exists clicks_device_idx on public.clicks(device);
create index if not exists banners_status_idx on public.banners(status);
create index if not exists collections_slug_idx on public.collections(slug);
create index if not exists collections_status_idx on public.collections(status);
create index if not exists collection_products_collection_idx on public.collection_products(collection_id);
create index if not exists collection_products_product_idx on public.collection_products(product_id);
create index if not exists coupons_code_idx on public.coupons(code);
create index if not exists coupons_status_idx on public.coupons(status);
create index if not exists tracking_links_campaign_idx on public.tracking_links(campaign);
create index if not exists tracking_links_source_idx on public.tracking_links(source);
create index if not exists settings_key_idx on public.settings(key);
create index if not exists settings_group_idx on public.settings("group");
create index if not exists integrations_provider_idx on public.integrations(provider);
create index if not exists integration_events_created_at_idx on public.integration_events(created_at);
create index if not exists ai_insights_created_at_idx on public.ai_insights(created_at);
create index if not exists ai_usage_logs_created_at_idx on public.ai_usage_logs(created_at);
create index if not exists ai_usage_logs_feature_idx on public.ai_usage_logs(feature);
create index if not exists ai_usage_logs_user_created_idx on public.ai_usage_logs(user_id, created_at);
create index if not exists admin_profiles_email_idx on public.admin_profiles(email);
create index if not exists admin_activity_logs_created_at_idx on public.admin_activity_logs(created_at);
create index if not exists story_campaigns_slug_idx on public.story_campaigns(slug);
create index if not exists stories_slug_idx on public.stories(slug);
create index if not exists story_episodes_story_idx on public.story_episodes(story_id);
create index if not exists short_links_code_idx on public.short_links(code);
create index if not exists pixel_events_provider_idx on public.pixel_events(provider);
create index if not exists internal_ads_status_idx on public.internal_ads(status);
create index if not exists admin_notifications_created_at_idx on public.admin_notifications(created_at);

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.clicks enable row level security;
alter table public.banners enable row level security;
alter table public.admins enable row level security;
alter table public.collections enable row level security;
alter table public.collection_products enable row level security;
alter table public.coupons enable row level security;
alter table public.admin_profiles enable row level security;
alter table public.admin_activity_logs enable row level security;
alter table public.tracking_links enable row level security;
alter table public.integrations enable row level security;
alter table public.settings enable row level security;
alter table public.integration_events enable row level security;
alter table public.ai_insights enable row level security;
alter table public.ai_settings enable row level security;
alter table public.ai_usage_logs enable row level security;
alter table public.story_campaigns enable row level security;
alter table public.stories enable row level security;
alter table public.story_episodes enable row level security;
alter table public.story_products enable row level security;
alter table public.short_links enable row level security;
alter table public.pixel_events enable row level security;
alter table public.internal_ads enable row level security;
alter table public.admin_notifications enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins
    where id = auth.uid()
    and role in ('admin', 'editor')
  );
$$;

drop policy if exists "Public read categories" on public.categories;
create policy "Public read categories"
on public.categories for select
using (true);

drop policy if exists "Public read active products" on public.products;
create policy "Public read active products"
on public.products for select
using (status = 'active' or public.is_admin());

drop policy if exists "Public read active banners" on public.banners;
create policy "Public read active banners"
on public.banners for select
using (status = 'active' or public.is_admin());

drop policy if exists "Public read active collections" on public.collections;
create policy "Public read active collections"
on public.collections for select
using (status = 'active' or public.is_admin());

drop policy if exists "Public read collection products" on public.collection_products;
create policy "Public read collection products"
on public.collection_products for select
using (true);

drop policy if exists "Public read active stories" on public.stories;
create policy "Public read active stories"
on public.stories for select
using (status = 'active' or public.is_admin());

drop policy if exists "Public read story episodes" on public.story_episodes;
create policy "Public read story episodes"
on public.story_episodes for select
using (true);

drop policy if exists "Public read story products" on public.story_products;
create policy "Public read story products"
on public.story_products for select
using (true);

drop policy if exists "Public read active ads" on public.internal_ads;
create policy "Public read active ads"
on public.internal_ads for select
using (status = 'active' or public.is_admin());

drop policy if exists "Public read active short links" on public.short_links;
create policy "Public read active short links"
on public.short_links for select
using (status = 'active' or public.is_admin());

drop policy if exists "Admins manage categories" on public.categories;
create policy "Admins manage categories"
on public.categories for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins manage products" on public.products;
create policy "Admins manage products"
on public.products for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins manage banners" on public.banners;
create policy "Admins manage banners"
on public.banners for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins manage collections" on public.collections;
create policy "Admins manage collections"
on public.collections for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins manage collection products" on public.collection_products;
create policy "Admins manage collection products"
on public.collection_products for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins manage coupons" on public.coupons;
create policy "Admins manage coupons"
on public.coupons for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins manage admin profiles" on public.admin_profiles;
create policy "Admins manage admin profiles"
on public.admin_profiles for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins manage activity logs" on public.admin_activity_logs;
create policy "Admins manage activity logs"
on public.admin_activity_logs for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins manage tracking links" on public.tracking_links;
create policy "Admins manage tracking links"
on public.tracking_links for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins manage integrations" on public.integrations;
create policy "Admins manage integrations"
on public.integrations for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins manage settings" on public.settings;
create policy "Admins manage settings"
on public.settings for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins manage integration events" on public.integration_events;
create policy "Admins manage integration events"
on public.integration_events for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins manage ai insights" on public.ai_insights;
create policy "Admins manage ai insights"
on public.ai_insights for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins manage ai settings" on public.ai_settings;
create policy "Admins manage ai settings"
on public.ai_settings for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins manage ai usage logs" on public.ai_usage_logs;
create policy "Admins manage ai usage logs"
on public.ai_usage_logs for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins manage story campaigns" on public.story_campaigns;
create policy "Admins manage story campaigns"
on public.story_campaigns for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins manage stories" on public.stories;
create policy "Admins manage stories"
on public.stories for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins manage story episodes" on public.story_episodes;
create policy "Admins manage story episodes"
on public.story_episodes for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins manage story products" on public.story_products;
create policy "Admins manage story products"
on public.story_products for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins manage short links" on public.short_links;
create policy "Admins manage short links"
on public.short_links for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins manage pixel events" on public.pixel_events;
create policy "Admins manage pixel events"
on public.pixel_events for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins manage internal ads" on public.internal_ads;
create policy "Admins manage internal ads"
on public.internal_ads for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins manage notifications" on public.admin_notifications;
create policy "Admins manage notifications"
on public.admin_notifications for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins read clicks" on public.clicks;
create policy "Admins read clicks"
on public.clicks for select
using (public.is_admin());

drop policy if exists "Public insert clicks" on public.clicks;
create policy "Public insert clicks"
on public.clicks for insert
with check (true);

drop policy if exists "Admins read admins" on public.admins;
create policy "Admins read admins"
on public.admins for select
using (public.is_admin());

drop policy if exists "Admins manage admins" on public.admins;
create policy "Admins manage admins"
on public.admins for all
using (public.is_admin())
with check (public.is_admin());

insert into public.categories (name, slug, description, icon)
values
  ('Sobrevivencia', 'sobrevivencia', 'Kits, ferramentas e suprimentos para atravessar o colapso.', 'Shield'),
  ('Militar', 'militar', 'Equipamentos taticos inspirados em operacoes de bunker.', 'Crosshair'),
  ('Comunicacao', 'comunicacao', 'Radios, antenas e sinais para quando a rede cair.', 'Radio'),
  ('Energia', 'energia', 'Fontes, baterias e solucoes para manter sistemas vivos.', 'BatteryCharging'),
  ('Lanternas', 'lanternas', 'Luz fria para corredores escuros, tuneis e ruinas.', 'Flashlight'),
  ('Mochilas', 'mochilas', 'Carga modular para evacuacao, patrulha e exploracao.', 'Briefcase'),
  ('Gadgets', 'gadgets', 'Tecnologia compacta para cenarios hostis.', 'Cpu'),
  ('Itens Misteriosos', 'itens-misteriosos', 'Objetos de laboratorio, arquivos selados e anomalias.', 'Fingerprint')
on conflict (slug) do nothing;

insert into public.banners (title, subtitle, image_url, button_text, button_link, status)
values (
  'Equipamentos para sobreviver ao fim do mundo',
  'Os itens utilizados pelos sobreviventes das historias.',
  'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=2200&q=85',
  'Explorar Arsenal',
  '/arsenal',
  'active'
)
on conflict do nothing;
