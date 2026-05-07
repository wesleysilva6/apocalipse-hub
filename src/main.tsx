import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  Bookmark,
  Boxes,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Cpu,
  Database,
  Edit3,
  Eye,
  FileBarChart,
  Filter,
  Grid3X3,
  Image as ImageIcon,
  Info,
  LayoutDashboard,
  Layers3,
  Link2,
  List,
  LogOut,
  Menu,
  MousePointerClick,
  PackagePlus,
  Plug,
  QrCode,
  Search,
  Settings as SettingsIcon,
  Shield,
  Sparkles,
  Tags,
  TicketPercent,
  TrendingUp,
  Trash2,
  Users,
  Zap,
  Radio,
  Flashlight,
  Backpack,
  Skull,
  Terminal,
  ShieldCheck,
  AlertTriangle,
  ImageOff,
  ExternalLink,
  LockKeyhole,
  Radar,
  Clock3,
  Smartphone,
  Megaphone,
  Globe2,
  AppWindow,
  Trophy,
  Webhook
} from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { fallbackBanners } from "@/data/fallback";
import { getBanners, getCategories, getProduct, getProducts, trackClick } from "@/src/lib/store";
import {
  getAdminBanners,
  getAdminCategories,
  getAdminProducts,
  getOverview,
  requireAdmin,
  type Overview,
  type OverviewFilters
} from "@/src/lib/admin";
import { supabase } from "@/src/lib/supabase";
import type { Banner, Category, Product } from "@/types/database";
import "./index.css";

const adminNavSections = [
  {
    label: "Operação",
    items: [
      ["/admin/dashboard", "Dashboard", LayoutDashboard],
      ["/admin/produtos", "Produtos", Boxes],
      ["/admin/categorias", "Categorias", Tags],
      ["/admin/colecoes", "Coleções", Layers3],
      ["/admin/cupons", "Cupons", TicketPercent],
      ["/admin/banners", "Banners", ImageIcon]
    ]
  },
  {
    label: "Inteligência",
    items: [
      ["/admin/analytics", "Analytics", BarChart3],
      ["/admin/inteligencia", "Inteligência IA", Sparkles],
      ["/admin/relatorios", "Relatórios", FileBarChart],
      ["/admin/links", "Links Rastreáveis", Link2],
      ["/admin/historias", "Arquivo das Histórias", BookOpen],
      ["/admin/ia", "Assistente IA", Cpu]
    ]
  },
  {
    label: "Sistema",
    items: [
      ["/admin/usuarios", "Usuários", Users],
      ["/admin/integracoes", "Integrações", Plug],
      ["/admin/configuracoes", "Configurações", SettingsIcon],
      ["/admin/central-ajuda", "Central de Ajuda", BookOpen]
    ]
  }
] as const;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/arsenal" element={<Catalog />} />
        <Route path="/arsenal/:code" element={<ShortLinkPage />} />
        <Route path="/sobrevivencia" element={<Catalog categorySlug="sobrevivencia" />} />
        <Route path="/categoria/:slug" element={<CategoryPage />} />
        <Route path="/produto/:slug" element={<ProductPage />} />
        <Route path="/item/:slug" element={<TrackPage />} />
        <Route path="/go/:code" element={<ShortLinkPage />} />
        <Route path="/ap/:code" element={<ShortLinkPage />} />
        <Route path="/arsenal-zumbi" element={<ThematicPage theme="zumbi" />} />
        <Route path="/kit-sobrevivencia" element={<ThematicPage theme="kit" />} />
        <Route path="/equipamentos-secretos" element={<ThematicPage theme="secretos" />} />
        <Route path="/arquivo-bunker" element={<ThematicPage theme="bunker" />} />
        <Route path="/itens-proibidos" element={<ThematicPage theme="proibidos" />} />
        <Route path="/arquivo-das-historias" element={<StoriesArchivePage />} />
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/dashboard" element={<Protected><Dashboard /></Protected>} />
        <Route path="/admin/analytics" element={<Protected><Analytics /></Protected>} />
        <Route path="/admin/inteligencia" element={<Protected><IntelligenceAdmin /></Protected>} />
        <Route path="/admin/ia" element={<Protected><AiAssistantAdmin /></Protected>} />
        <Route path="/admin/produtos" element={<Protected><ProductsAdmin /></Protected>} />
        <Route path="/admin/categorias" element={<Protected><CategoriesAdmin /></Protected>} />
        <Route path="/admin/colecoes" element={<Protected><CollectionsAdmin /></Protected>} />
        <Route path="/admin/cupons" element={<Protected><CouponsAdmin /></Protected>} />
        <Route path="/admin/banners" element={<Protected><BannersAdmin /></Protected>} />
        <Route path="/admin/configuracoes" element={<Protected><Settings /></Protected>} />
        <Route path="/admin/relatorios" element={<Protected><ReportsAdmin /></Protected>} />
        <Route path="/admin/usuarios" element={<Protected><UsersAdmin /></Protected>} />
        <Route path="/admin/links" element={<Protected><TrackingLinksAdmin /></Protected>} />
        <Route path="/admin/integracoes" element={<Protected><IntegrationsAdmin /></Protected>} />
        <Route path="/admin/historias" element={<Protected><StoriesAdmin /></Protected>} />
        <Route path="/admin/central-ajuda" element={<Protected><HelpCenterAdmin /></Protected>} />
        <Route path="/admin/ajuda" element={<Navigate to="/admin/central-ajuda" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

function PublicLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const navSections = [
    {
      label: "Operação",
      items: [
        ["/admin/dashboard", "Dashboard", LayoutDashboard],
        ["/admin/produtos", "Produtos", Boxes],
        ["/admin/categorias", "Categorias", Tags],
        ["/admin/colecoes", "Coleções", Layers3],
        ["/admin/cupons", "Cupons", TicketPercent],
        ["/admin/banners", "Banners", ImageIcon]
      ]
    },
    {
      label: "Inteligência",
      items: [
        ["/admin/analytics", "Analytics", BarChart3],
        ["/admin/inteligencia", "Inteligência IA", Sparkles],
        ["/admin/relatorios", "Relatórios", FileBarChart],
        ["/admin/links", "Links Rastreáveis", Link2]
      ]
    },
    {
      label: "Sistema",
      items: [
        ["/admin/usuarios", "Usuários", Users],
        ["/admin/integracoes", "Integrações", Plug],
        ["/admin/ajuda", "Central de Ajuda", BookOpen],
        ["/admin/configuracoes", "Configurações", SettingsIcon]
      ]
    }
  ] as const;
  const nav = [
    ["Arsenal", "/arsenal"],
    ["Sobrevivência", "/sobrevivencia"],
    ["Arquivos", "/categoria/itens-misteriosos"]
  ];

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-[#050807]/70 backdrop-blur-2xl">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="group flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl border border-primary/20 bg-primary/10 text-primary shadow-[0_0_28px_rgba(74,222,128,0.16)] transition group-hover:border-primary/50 group-hover:bg-primary/15">
              <Skull className="h-5 w-5" />
            </span>
            <span>
              <span className="font-display block text-sm font-extrabold uppercase tracking-[0.18em] text-[#F8FAFC] sm:text-base">Loja do Apocalipse</span>
              <span className="hidden font-mono text-[10px] uppercase tracking-[0.22em] text-primary/70 sm:block">Survival affiliate hub</span>
            </span>
          </Link>
          <nav className="hidden items-center rounded-full border border-white/10 bg-white/[0.035] p-1 md:flex">
            {nav.map(([label, to]) => (
              <Link key={to} className="rounded-full px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/7 hover:text-white" to={to}>
                {label}
              </Link>
            ))}
          </nav>
          <div className="hidden gap-2 sm:flex">
            <Button asChild size="sm"><Link to="/arsenal">Explorar <ArrowUpRight className="h-4 w-4" /></Link></Button>
          </div>
          <Button variant="outline" size="icon" className="sm:hidden" onClick={() => setOpen(!open)}>
            <Menu className="h-4 w-4" />
          </Button>
        </div>
        {open ? (
          <div className="border-t border-white/10 bg-[#050807]/95 px-4 py-4 sm:hidden">
            <div className="grid gap-2">
              {nav.map(([label, to]) => <Link key={to} onClick={() => setOpen(false)} to={to} className="rounded-lg border border-white/10 bg-white/[0.035] px-4 py-3 text-sm text-slate-200">{label}</Link>)}
            </div>
          </div>
        ) : null}
      </header>
      {children}
      <Footer />
    </>
  );
}

function Home() {
  const { data, loading } = useStore();
  const hero = data.banners[0] ?? fallbackBanners[0];
  const featured = data.products.filter((product) => product.is_featured).slice(0, 4);
  const mostUsed = data.products.filter((product) => product.story_section === "most_used").slice(0, 3);
  const forbidden = data.products.filter((product) => product.story_section === "forbidden").slice(0, 3);
  const survivorChoice = data.products.filter((product) => product.story_section === "survivor_choice").slice(0, 4);

  return (
    <PublicLayout>
      <main className="public-surface pt-16">
        <section className="relative min-h-[92vh] overflow-hidden">
          <ImageWithFallback src={hero.image_url} alt={hero.title} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,#050807_0%,rgba(5,8,7,0.92)_28%,rgba(5,8,7,0.55)_62%,rgba(5,8,7,0.86)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_30%,rgba(74,222,128,0.16),transparent_30%),radial-gradient(circle_at_78%_18%,rgba(127,29,29,0.20),transparent_28%)]" />
          <div className="terminal-grid absolute inset-x-0 bottom-0 h-2/3 opacity-25" />
          <div className="relative z-10 mx-auto grid min-h-[92vh] max-w-7xl items-center gap-10 px-4 py-24 sm:px-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.22em] text-primary shadow-[0_0_32px_rgba(74,222,128,0.12)]">
                <Terminal className="h-3.5 w-3.5" />
                Protocolo bunker ativo
              </p>
              <h1 className="font-display max-w-4xl text-5xl font-extrabold leading-[0.95] tracking-tight text-[#F8FAFC] md:text-7xl xl:text-8xl">
                Equipamentos para sobreviver ao fim do mundo
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 md:text-xl">
                Uma curadoria de itens inspirados nas histórias de apocalipse, sobrevivência e colapso mundial.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="h-13 rounded-xl px-7 text-base"><Link to="/arsenal">Explorar Arsenal <ArrowUpRight className="h-5 w-5" /></Link></Button>
                <Button asChild size="lg" variant="outline" className="h-13 rounded-xl px-7 text-base"><a href="#mais-usados">Ver Mais Usados</a></Button>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="absolute -inset-8 rounded-full bg-primary/10 blur-3xl" />
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                <div className="relative aspect-[4/5] overflow-hidden rounded-xl">
                  <ImageWithFallback src={hero.image_url} alt="Arquivo visual bunker" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 grid gap-3">
                    <HeroSignal icon={ShieldCheck} label="Zona segura" value="42%" />
                    <HeroSignal icon={AlertTriangle} label="Arquivo 07" value="Restrito" danger />
                    <HeroSignal icon={Terminal} label="Protocolo" value="Ativo" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Section title="Setores da Loja do Apocalipse" eyebrow="Categorias principais" description="Navegue por áreas táticas pensadas para fuga, abrigo, energia, comunicação e exploração.">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {data.categories.map((category) => (
              <Link key={category.id} to={`/categoria/${category.slug}`} className="group rounded-2xl border border-primary/10 bg-[rgba(10,18,15,0.72)] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.18)] backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-primary/35 hover:bg-primary/[0.075] hover:shadow-[0_0_34px_rgba(74,222,128,0.10)]">
                <span className="mb-5 grid h-11 w-11 place-items-center rounded-xl border border-primary/15 bg-primary/10 text-primary transition group-hover:scale-105">
                  <CategoryIcon slug={category.slug} />
                </span>
                <h3 className="font-display text-lg font-bold text-[#F8FAFC]">{category.name}</h3>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">{category.description}</p>
              </Link>
            ))}
          </div>
        </Section>

        <Section title="Arsenal em destaque" eyebrow="Arquivo premium" description="Itens principais para transformar curiosidade em clique afiliado com visual de catálogo cinematográfico.">
          {loading ? <SkeletonGrid /> : <ProductGrid products={featured.length ? featured : data.products.slice(0, 4)} />}
        </Section>

        <Section id="mais-usados" title="Mais usados nas histórias" eyebrow="Arquivo de campo" description="Itens que aparecem nos cenários de sobrevivência, fuga e exploração das histórias.">
          <StoryStrip products={(mostUsed.length ? mostUsed : data.products.slice(0, 3))} />
        </Section>

        <section className="relative overflow-hidden px-4 py-20 sm:px-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(127,29,29,0.22),transparent_32%)]" />
          <div className="relative mx-auto max-w-7xl rounded-3xl border border-red-900/30 bg-[rgba(16,8,8,0.72)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur md:p-10">
            <PublicHeading eyebrow="Setor vermelho" title="Equipamentos proibidos" description="Tecnologias e itens misteriosos catalogados em arquivos que poucos sobreviventes deveriam acessar." />
            <ProductGrid products={(forbidden.length ? forbidden : data.products.slice(3, 6))} danger />
          </div>
        </section>

        <Section title="Escolha dos sobreviventes" eyebrow="Recomendação do bunker" description="Uma seleção compacta para visitantes vindos do Instagram encontrarem rapidamente os itens de maior apelo.">
          <ProductGrid products={(survivorChoice.length ? survivorChoice : data.products.slice(0, 4))} />
        </Section>
      </main>
    </PublicLayout>
  );
}

function Catalog({ categorySlug }: { categorySlug?: string }) {
  const { data, loading } = useStore();
  const products = categorySlug
    ? data.products.filter((product) => product.categories?.slug === categorySlug)
    : data.products;
  return (
    <PublicLayout>
      <main className="public-surface min-h-screen px-4 pb-20 pt-32 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <PublicHeading eyebrow="Arsenal" title={categorySlug ? "Sobrevivência para rotas hostis" : "Todos os equipamentos catalogados"} description="Explore a vitrine completa com produtos afiliados prontos para cenários de colapso, bunker e sobrevivência." />
          {loading ? <SkeletonGrid /> : <ProductGrid products={products} />}
        </div>
      </main>
    </PublicLayout>
  );
}

function CategoryPage() {
  const { slug } = useParams();
  const { data, loading } = useStore();
  const category = data.categories.find((item) => item.slug === slug);
  const products = data.products.filter((product) => product.categories?.slug === slug);
  return (
    <PublicLayout>
      <main className="public-surface min-h-screen px-4 pb-20 pt-32 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <PublicHeading eyebrow="Categoria" title={category?.name ?? "Categoria"} description={category?.description ?? undefined} />
          {loading ? <SkeletonGrid /> : <ProductGrid products={products} />}
        </div>
      </main>
    </PublicLayout>
  );
}

function ThematicPage({ theme }: { theme: "zumbi" | "kit" | "secretos" | "bunker" | "proibidos" }) {
  const { data, loading } = useStore();
  const config = thematicConfig[theme];
  useSeo(config.title, config.description, config.image);
  const products = useMemo(() => {
    const terms = config.terms.map((term) => term.toLowerCase());
    const ranked = data.products
      .map((product) => ({ product, score: smartProductScore(product, terms) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.product);
    return ranked.length ? ranked : data.products.slice(0, 8);
  }, [config.terms, data.products]);

  return (
    <PublicLayout>
      <main className="public-surface min-h-screen pt-24">
        <section className="relative overflow-hidden px-4 py-16 sm:px-6 lg:py-24">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_12%,rgba(74,222,128,0.15),transparent_30%),radial-gradient(circle_at_78%_8%,rgba(127,29,29,0.22),transparent_34%)]" />
          <div className="terminal-grid absolute inset-x-0 top-10 h-96 opacity-15" />
          <div className="relative mx-auto max-w-7xl">
            <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-primary">{config.eyebrow}</p>
                <h1 className="mt-5 font-display text-4xl font-extrabold tracking-tight text-bunker-ice md:text-7xl">{config.title}</h1>
                <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">{config.description}</p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button asChild size="lg"><Link to="#catalogo">Explorar arquivo <ArrowUpRight className="h-4 w-4" /></Link></Button>
                  <Button asChild size="lg" variant="outline"><Link to="/arquivo-das-historias">Ver histórias</Link></Button>
                </div>
              </div>
              <div className="rounded-2xl border border-primary/15 bg-primary/[0.055] p-5 shadow-glow">
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary">Coleção automática</p>
                <div className="mt-4 grid gap-3">
                  {config.terms.slice(0, 4).map((term) => <MiniMetric key={term} label="tag inteligente" value={term} />)}
                </div>
              </div>
            </div>
          </div>
        </section>
        <Section id="catalogo" eyebrow="Arsenal filtrado" title={config.sectionTitle} description="Produtos selecionados automaticamente por tags, categoria e narrativa.">
          {loading ? <SkeletonGrid /> : <ProductGrid products={products} danger={theme === "proibidos"} />}
        </Section>
      </main>
    </PublicLayout>
  );
}

function StoriesArchivePage() {
  const { data, loading } = useStore();
  const campaigns = storyCampaigns(data.products);
  useSeo("Arquivo das Histórias", "Histórias, episódios, campanhas e produtos relacionados da Loja do Apocalipse.");
  return (
    <PublicLayout>
      <main className="public-surface min-h-screen px-4 pb-20 pt-32 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <PublicHeading eyebrow="Arquivo narrativo" title="Arquivo das Histórias" description="Conecte episódios, campanhas, links rastreáveis e equipamentos usados em cada narrativa." />
          <div className="grid gap-6 lg:grid-cols-3">
            {campaigns.map((campaign) => (
              <article key={campaign.slug} className="rounded-2xl border border-white/10 bg-card/70 p-5 transition hover:-translate-y-1 hover:border-primary/35">
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary">{campaign.platform}</p>
                <h2 className="mt-3 text-2xl font-black text-bunker-ice">{campaign.name}</h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{campaign.description}</p>
                <div className="mt-5 grid gap-2">
                  {campaign.products.slice(0, 3).map((product) => (
                    <Link key={product.id} to={`/produto/${product.slug}`} className="flex items-center justify-between rounded-lg border border-white/10 bg-black/25 px-3 py-2 text-sm transition hover:border-primary/35">
                      <span className="text-bunker-ice">{product.name}</span>
                      <ArrowUpRight className="h-4 w-4 text-primary" />
                    </Link>
                  ))}
                </div>
                <Button asChild className="mt-5 w-full" variant="outline"><Link to={`/arsenal?source=${campaign.platform.toLowerCase()}&campaign=${campaign.slug}`}>Abrir arsenal da história</Link></Button>
              </article>
            ))}
          </div>
          {loading ? <div className="mt-8"><LoadingBlock /></div> : null}
        </div>
      </main>
    </PublicLayout>
  );
}

function ShortLinkPage() {
  const { code } = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    if (!code) return;
    getProducts().then((products) => {
      const normalized = slugify(code);
      const product = products.find((item) => item.slug === normalized || item.slug.includes(normalized) || item.tags?.some((tag) => slugify(tag).includes(normalized)));
      navigate(product ? `/item/${product.slug}?source=short-link&campaign=${normalized}` : "/arsenal", { replace: true });
    });
  }, [code, navigate]);
  return <main className="grid min-h-screen place-items-center bg-bunker-black"><LoadingBlock label="Abrindo short link" /></main>;
}

function ProductPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { isSaved, toggle } = useSavedArsenal();

  useEffect(() => {
    if (!slug) return;

    Promise.all([getProduct(slug), getProducts()])
      .then(([productData, productList]) => {
        setProduct(productData);
        setProducts(productList);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  useSeo(
    product?.name || "Equipamento",
    product?.short_description || product?.description || "",
    product?.image_url || ""
  );

  if (loading)
    return (
      <PublicLayout>
        <main className="public-surface min-h-screen pt-32">
          <LoadingBlock />
        </main>
      </PublicLayout>
    );

  if (!product) return <NotFound />;

const related = product
  ? autoRelatedProducts(product, products)
  : [];

  return (
    <PublicLayout>
      <main className="public-surface min-h-screen pt-16">
        <section className="relative overflow-hidden px-4 py-12 sm:px-6 lg:py-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,rgba(74,222,128,0.13),transparent_28%),radial-gradient(circle_at_80%_12%,rgba(127,29,29,0.18),transparent_28%)]" />
          <div className="terminal-grid absolute inset-x-0 top-10 h-96 opacity-20" />
          <div className="relative mx-auto max-w-7xl">
            <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
              <Link to="/arsenal" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-primary/35 hover:text-primary">
                <ChevronLeft className="h-4 w-4" />
                Voltar ao Arsenal
              </Link>
              <div className="flex items-center gap-2 rounded-full border border-primary/15 bg-primary/[0.055] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                <Radar className="h-3.5 w-3.5" />
                Item monitorado
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
              <div className="group relative overflow-hidden rounded-[2rem] border border-primary/12 bg-[rgba(10,18,15,0.82)] p-3 shadow-[0_30px_100px_rgba(0,0,0,0.42)] backdrop-blur">
                <div className="absolute -left-24 top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute -right-24 bottom-12 h-72 w-72 rounded-full bg-red-900/15 blur-3xl" />
                <div className="relative aspect-[4/3] overflow-hidden rounded-[1.55rem] bg-[#0B1110] lg:aspect-[5/4]">
                  <ImageWithFallback src={product.image_url} alt={product.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.035]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050807] via-black/10 to-transparent" />
                  <div className="absolute left-5 top-5 rounded-full border border-primary/25 bg-black/55 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-primary backdrop-blur">
                    {product.categories?.name ?? "Equipamento"}
                  </div>
                  <div className="absolute bottom-5 left-5 right-5 hidden gap-3 sm:grid sm:grid-cols-3">
                    <ProductSignal icon={ShieldCheck} label="Status" value={product.status === "active" ? "Ativo" : product.status} />
                    <ProductSignal icon={LockKeyhole} label="Arquivo" value={product.is_featured ? "Destaque" : "Padrão"} />
                    <ProductSignal icon={Clock3} label="Registro" value={formatDate(product.created_at)} />
                  </div>
                </div>
                <div className="relative mt-3 grid gap-3 sm:hidden">
                  <ProductSignal icon={ShieldCheck} label="Status" value={product.status === "active" ? "Ativo" : product.status} />
                  <ProductSignal icon={LockKeyhole} label="Arquivo" value={product.is_featured ? "Destaque" : "Padrão"} />
                  <ProductSignal icon={Clock3} label="Registro" value={formatDate(product.created_at)} />
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-[rgba(10,18,15,0.70)] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.32)] backdrop-blur-xl md:p-8">
                <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.22em] text-primary">
                  <Terminal className="h-3.5 w-3.5" />
                  {product.categories?.name ?? "Equipamento"}
                </p>
                <h1 className="font-display text-4xl font-extrabold leading-[0.96] tracking-tight text-[#F8FAFC] md:text-6xl xl:text-7xl">{product.name}</h1>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">{product.full_description || product.description}</p>

                <div className="mt-7 flex flex-wrap gap-2">
                  {(product.tags?.length ? product.tags : ["apocalipse", "sobrevivência", product.categories?.slug ?? "arsenal"]).slice(0, 5).map((tag) => (
                    <span key={tag} className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-xs font-medium text-slate-300">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  <InfoTile label="Protocolo" value="Compra externa" icon={ExternalLink} />
                  <InfoTile label="Origem" value="Vitrine" icon={Radar} />
                  <InfoTile label="Setor" value={product.categories?.name ?? "Arsenal"} icon={Shield} />
                </div>

                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                  <Button asChild size="lg" className="h-13 flex-1 rounded-xl px-7 text-base"><Link to={`/item/${product.slug}`}>Ver Equipamento <ArrowUpRight className="h-5 w-5" /></Link></Button>
                  <Button type="button" size="lg" variant="outline" className="h-13 rounded-xl px-7 text-base" onClick={() => toggle(product.id)}>
                    <Bookmark className="h-5 w-5" />
                    {isSaved(product.id) ? "Salvo" : "Salvar"}
                  </Button>
                  <Button asChild size="lg" variant="outline" className="h-13 rounded-xl px-7 text-base"><Link to="/arsenal">Explorar mais</Link></Button>
                </div>

                <p className="mt-5 text-xs leading-5 text-slate-500">
                  Ao clicar, você será redirecionado para o parceiro afiliado. O item permanece catalogado no protocolo da Loja do Apocalipse.
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <ProductContextCard title="Uso narrativo" text={product.story_section ? storySectionLabel(product.story_section) : "Equipamento indicado para cenas de fuga, exploração e preparação."} />
              <ProductContextCard title="Classe operacional" text={product.categories?.description ?? "Item catalogado para sobreviventes em ambiente hostil."} />
              <ProductContextCard title="Condição do arquivo" text={product.is_featured ? "Marcado como destaque na vitrine pública." : "Produto disponível no arsenal geral."} />
            </div>
            <div className="mt-12">
              <PublicHeading eyebrow="Recomendação automática" title="Produtos relacionados" description="Sugestões calculadas por tags, categoria e contexto de campanha." />
              <ProductGrid products={related} />
            </div>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}

function TrackPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!slug) return;

    const handleTracking = async () => {
      try {
        const product = await getProduct(slug);

        if (!product) {
          navigate("/arsenal", { replace: true });
          return;
        }

        // verifica link afiliado
        if (!product.affiliate_url) {
          console.error("Produto sem affiliate_url");
          navigate(`/produto/${slug}`, { replace: true });
          return;
        }

        // tracking silencioso
        try {
          await trackClick(product);
        } catch (err) {
          console.error("Erro tracking:", err);
        }

        // redireciona
        window.location.href = product.affiliate_url;

      } catch (err) {
        console.error(err);
        navigate("/arsenal", { replace: true });
      }
    };

    handleTracking();
  }, [slug, navigate]);

  return (
    <main className="grid min-h-screen place-items-center bg-bunker-black">
      <LoadingBlock label="Redirecionando..." />
    </main>
  );
}

function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: String(form.get("email")),
      password: String(form.get("password"))
    });
    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }
    const allowed = await requireAdmin();
    if (!allowed) {
      await supabase.auth.signOut();
      setError("Acesso negado. Este usuário não está autorizado como administrador.");
      setLoading(false);
      return;
    }
    setLoading(false);
    navigate("/admin/dashboard");
  }

  return (
    <main className="grid min-h-screen place-items-center px-4">
      <form onSubmit={submit} className="w-full max-w-md rounded-lg border border-white/10 bg-card/75 p-6 shadow-glow">
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-primary">Acesso protegido</p>
        <h1 className="mt-2 text-3xl font-black text-bunker-ice">Painel Administrativo</h1>
        <div className="mt-8 space-y-4">
          <div><Label>E-mail</Label><Input name="email" type="email" required className="mt-2" /></div>
          <div><Label>Senha</Label><Input name="password" type="password" required className="mt-2" /></div>
          {error ? <p className="text-sm text-red-300">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Verificando acesso..." : "Entrar"}
          </Button>
        </div>
      </form>
    </main>
  );
}

function Protected({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<"loading" | "ok" | "no">("loading");
  useEffect(() => {
    requireAdmin().then((ok) => setState(ok ? "ok" : "no"));
  }, []);
  if (state === "loading") return <main className="grid min-h-screen place-items-center"><LoadingBlock /></main>;
  if (state === "no") return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}

function AdminLayout({
  children,
  title = "Comando Central",
  description,
  action
}: {
  children: React.ReactNode;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [email, setEmail] = useState("admin");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? "admin"));
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    navigate("/admin/login");
  }
  const nav = [
    ["/admin/dashboard", "Dashboard", LayoutDashboard],
    ["/admin/produtos", "Produtos", Boxes],
    ["/admin/categorias", "Categorias", Tags],
    ["/admin/banners", "Banners", ImageIcon],
    ["/admin/analytics", "Analytics", BarChart3],
    ["/admin/configuracoes", "Configurações", SettingsIcon]
  ] as const;

  const sidebar = (
    <aside className="flex h-full w-72 flex-col border-r border-white/10 bg-[#050705]/95 p-5 shadow-[0_0_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
      <Link to="/admin/dashboard" onClick={() => setMobileOpen(false)} className="block">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">Admin bunker</p>
        <h1 className="mt-2 text-2xl font-black tracking-tight text-bunker-ice">Comando Central</h1>
      </Link>
      <nav className="mt-8 flex-1 space-y-6 overflow-y-auto pr-1">
        {adminNavSections.map((section) => (
          <div key={section.label}>
            <p className="mb-2 px-3 font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">{section.label}</p>
            <div className="space-y-1">
              {section.items.map(([href, label, Icon]) => {
                const active = location.pathname === href;
                return (
                  <Link
                    key={href}
                    to={href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 rounded-md px-3 py-3 text-sm transition-all ${
                      active
                        ? "border border-primary/30 bg-primary/12 text-primary shadow-glow"
                        : "text-muted-foreground hover:bg-white/5 hover:text-bunker-ice"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="mt-auto rounded-lg border border-white/10 bg-white/[0.035] p-4">
        <p className="truncate text-sm font-semibold text-bunker-ice">{email}</p>
        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-primary/70">Sessão autenticada</p>
        <Button onClick={logout} variant="outline" size="sm" className="mt-4 w-full">
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>
    </aside>
  );

  return (
    <main className="min-h-screen bg-bunker-black">
      <div className="fixed inset-y-0 left-0 z-30 hidden lg:block">{sidebar}</div>
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)}>
          <div onClick={(event) => event.stopPropagation()}>{sidebar}</div>
        </div>
      ) : null}
      <section className="lg:pl-72">
        <div className="sticky top-0 z-20 border-b border-white/10 bg-[#050705]/80 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)}>
                <Menu className="h-4 w-4" />
              </Button>
              <div>
                <h2 className="text-2xl font-black tracking-tight text-bunker-ice">{title}</h2>
                {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {action}
              <div className="hidden rounded-md border border-white/10 bg-white/[0.035] px-3 py-2 text-right md:block">
                <p className="max-w-44 truncate text-xs font-medium text-bunker-ice">{email}</p>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary/70">admin</p>
              </div>
              <Button onClick={logout} variant="outline" size="sm">
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </div>
          </div>
        </div>
        <div className="px-4 py-8 sm:px-6 lg:px-10">{children}</div>
      </section>
    </main>
  );
}

function Dashboard() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [filters, setFilters] = useState<OverviewFilters>({ range: "7d" });

  useEffect(() => {
    setOverview(null);
    getOverview(filters).then(setOverview);
  }, [filters]);

  if (!overview) return <AdminLayout title="Dashboard" description="Carregando inteligência operacional..."><LoadingBlock /></AdminLayout>;

  return (
    <AdminLayout
      title="Dashboard"
      description="Central de inteligência de tráfego orgânico, campanhas e produtos afiliados."
      action={<Button asChild><Link to="/admin/produtos"><PackagePlus className="h-4 w-4" />Novo produto</Link></Button>}
    >
      <TrafficFilters overview={overview} filters={filters} onChange={setFilters} />

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Kpi icon={MousePointerClick} label="Total de cliques" value={overview.totalClicks} helper={`${overview.todayClicks} hoje`} />
        <Kpi icon={TrendingUp} label="Cliques hoje" value={overview.todayClicks} helper={`${overview.growth}% no período`} />
        <Kpi icon={Boxes} label="Produtos ativos" value={overview.activeProducts} helper={`${overview.inactiveProducts} inativos/rascunhos`} />
        <Kpi icon={Sparkles} label="Em destaque" value={overview.featuredProducts} helper="homepage e vitrines" />
        <Kpi icon={Globe2} label="Plataforma principal" value={overview.mainPlatform} helper="origem dominante" />
        <Kpi icon={AppWindow} label="Aplicação mais usada" value={overview.mainApplication} helper="app/browser" />
        <Kpi icon={Smartphone} label="Dispositivo principal" value={overview.mainDevice} helper="tipo predominante" />
        <Kpi icon={Megaphone} label="Melhor campanha" value={overview.bestCampaign} helper="UTM/campaign" />
      </div>

      <div className="mt-8 grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <Panel title="Cliques ao longo do tempo"><AreaBox data={overview.daily} /></Panel>
        <Panel title="Origem dos acessos"><BarBox data={overview.sources} keyName="source" color="#7e1319" /></Panel>
      </div>

      <div className="mt-8 grid gap-5 xl:grid-cols-2">
        <Panel title="Aplicações utilizadas"><BarBox data={overview.applications} keyName="application" color="#4ADE80" /></Panel>
        <Panel title="Dispositivos e sistemas"><BarBox data={overview.operatingSystems} keyName="operating_system" color="#D6A84F" /></Panel>
      </div>

      <div className="mt-8 grid gap-5 xl:grid-cols-2">
        <InsightPanel title="Origem dos acessos" rows={overview.sourceInsights} />
        <InsightPanel title="Aplicações mais utilizadas" rows={overview.applicationInsights} />
      </div>

      <div className="mt-8 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <TopProductsPanel products={overview.topProducts} />
        <CampaignPanel campaigns={overview.campaignInsights} />
      </div>

      <div className="mt-8 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <RecentActivityPanel overview={overview} />
        <Panel title="Cliques por categoria"><BarBox data={overview.categoryClicks} keyName="category" valueKey="clicks" color="#4ADE80" /></Panel>
      </div>
    </AdminLayout>
  );
}
function TrafficFilters({
  overview,
  filters,
  onChange
}: {
  overview: Overview;
  filters: OverviewFilters;
  onChange: (filters: OverviewFilters) => void;
}) {
  const update = (patch: Partial<OverviewFilters>) => onChange({ ...filters, ...patch });
  return (
    <section className="rounded-lg border border-white/10 bg-card/70 p-5 shadow-insetPanel">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-bunker-ice">Filtros globais</h2>
          <p className="mt-1 text-sm text-muted-foreground">Refine o tráfego por período, plataforma, aplicação, campanha, produto e dispositivo.</p>
        </div>
        <Button variant="outline" onClick={() => onChange({ range: "7d" })}>Limpar filtros</Button>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        <Select value={filters.range ?? "7d"} onChange={(value) => update({ range: value as OverviewFilters["range"] })} options={[["today", "Hoje"], ["7d", "7 dias"], ["30d", "30 dias"], ["custom", "Personalizado"]]} />
        <Select value={filters.source ?? "all"} onChange={(value) => update({ source: value })} options={[["all", "Todas origens"], ...overview.filterOptions.sources.map((item) => [item, item] as [string, string])]} />
        <Select value={filters.application ?? "all"} onChange={(value) => update({ application: value })} options={[["all", "Todas aplicações"], ...overview.filterOptions.applications.map((item) => [item, item] as [string, string])]} />
        <Select value={filters.campaign ?? "all"} onChange={(value) => update({ campaign: value })} options={[["all", "Todas campanhas"], ...overview.filterOptions.campaigns.map((item) => [item, item] as [string, string])]} />
        <Select value={filters.productId ?? "all"} onChange={(value) => update({ productId: value })} options={[["all", "Todos produtos"], ...overview.filterOptions.products.map((item) => [item.id, item.name] as [string, string])]} />
        <Select value={filters.device ?? "all"} onChange={(value) => update({ device: value })} options={[["all", "Todos dispositivos"], ...overview.filterOptions.devices.map((item) => [item, item] as [string, string])]} />
      </div>
      {filters.range === "custom" ? (
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <Input type="date" value={filters.dateFrom ?? ""} onChange={(event) => update({ dateFrom: event.target.value })} />
          <Input type="date" value={filters.dateTo ?? ""} onChange={(event) => update({ dateTo: event.target.value })} />
        </div>
      ) : null}
    </section>
  );
}

function InsightPanel({ title, rows }: { title: string; rows: { name: string; value: number; percentage: number; growth: number }[] }) {
  return (
    <Panel title={title}>
      <div className="space-y-3">
        {rows.length ? rows.map((row) => (
          <div key={row.name} className="rounded-lg border border-white/10 bg-black/25 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-bunker-ice">{row.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{row.value} acessos • {row.percentage}%</p>
              </div>
              <span className={`font-mono text-xs ${row.growth >= 0 ? "text-primary" : "text-red-300"}`}>{row.growth >= 0 ? "+" : ""}{row.growth}%</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(row.percentage, 100)}%` }} />
            </div>
          </div>
        )) : <Empty text="Sem dados suficientes para esta dimensão." />}
      </div>
    </Panel>
  );
}

function TopProductsPanel({ products }: { products: Overview["topProducts"] }) {
  return (
    <Panel title="Produtos mais acessados">
      <div className="space-y-3">
        {products.length ? products.map((product, index) => (
          <Link key={product.id} to={product.slug ? `/produto/${product.slug}` : "/admin/produtos"} className="grid gap-4 rounded-lg border border-white/10 bg-black/25 p-3 transition hover:border-primary/40 md:grid-cols-[56px_1fr_auto]">
            <img src={product.image_url} alt={product.name} className="h-14 w-14 rounded-md object-cover" />
            <div>
              <p className="font-semibold text-bunker-ice">#{index + 1} {product.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">{product.category} • origem principal: {product.mainSource}</p>
            </div>
            <div className="text-left md:text-right">
              <p className="font-mono text-primary">{product.clicks}</p>
              <p className="text-xs text-muted-foreground">{product.share}%</p>
            </div>
          </Link>
        )) : <Empty text="Sem produtos acessados no período." />}
      </div>
    </Panel>
  );
}

function CampaignPanel({ campaigns }: { campaigns: Overview["campaignInsights"] }) {
  return (
    <Panel title="Campanhas">
      <div className="space-y-3">
        {campaigns.length ? campaigns.map((campaign) => (
          <div key={campaign.campaign} className="rounded-lg border border-white/10 bg-black/25 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-bunker-ice">{campaign.campaign}</p>
                <p className="mt-1 text-xs text-muted-foreground">{campaign.source} • {campaign.device}</p>
              </div>
              <span className="font-mono text-primary">{campaign.clicks}</span>
            </div>
            <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Melhor horário: {campaign.bestHour}</p>
          </div>
        )) : <Empty text="Nenhuma campanha identificada. Use ?source=instagram&campaign=historia-bunker-ep3 nos links." />}
      </div>
    </Panel>
  );
}

function RecentActivityPanel({ overview }: { overview: Overview }) {
  const feed = [
    ...overview.recent.slice(0, 8).map((click) => ({
      id: click.id,
      title: `Clique em ${click.product}`,
      meta: `${click.source} • ${click.application} • ${click.device}`,
      time: new Date(click.created_at).toLocaleString("pt-BR")
    })),
    ...(overview.growth > 50 ? [{ id: "growth", title: "Pico de tráfego detectado", meta: `${overview.growth}% acima do período anterior`, time: "Agora" }] : []),
    ...(overview.bestCampaign !== "Sem campanha" ? [{ id: "campaign", title: "Campanha em destaque", meta: overview.bestCampaign, time: "Período atual" }] : [])
  ];

  return (
    <Panel title="Atividade recente">
      <div className="divide-y divide-white/10 overflow-hidden rounded-lg border border-white/10">
        {feed.length ? feed.map((item) => (
          <div key={item.id} className="grid gap-2 p-4 text-sm md:grid-cols-[1fr_1fr_150px]">
            <span className="font-medium text-bunker-ice">{item.title}</span>
            <span className="text-muted-foreground">{item.meta}</span>
            <span className="font-mono text-xs text-primary">{item.time}</span>
          </div>
        )) : <Empty text="Nenhuma atividade recente no período." />}
      </div>
    </Panel>
  );
}

function Analytics() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    getOverview().then(setOverview);
    getAdminProducts().then(setProducts);
  }, []);

  if (!overview) {
    return <AdminLayout title="Analytics" description="Carregando gráficos dinâmicos..."><LoadingBlock /></AdminLayout>;
  }

  const statusData = [
    { name: "Ativos", value: products.filter((product) => product.status === "active").length },
    { name: "Inativos", value: products.filter((product) => product.status === "inactive").length },
    { name: "Rascunhos", value: products.filter((product) => product.status === "draft").length }
  ].filter((item) => item.value > 0);

  const categoryData = Object.values(
    products.reduce<Record<string, { category: string; clicks: number }>>((acc, product) => {
      const name = product.categories?.name ?? "Sem categoria";
      acc[name] ??= { category: name, clicks: 0 };
      acc[name].clicks += product.click_count ?? 0;
      return acc;
    }, {})
  ).sort((a, b) => b.clicks - a.clicks);

  return (
    <AdminLayout title="Analytics" description="Gráficos dinâmicos de cliques, origem, dispositivos e catálogo.">
      <div className="grid gap-4 md:grid-cols-4">
        <Kpi icon={MousePointerClick} label="Cliques totais" value={overview.totalClicks} helper={`${overview.todayClicks} hoje`} />
        <Kpi icon={TrendingUp} label="Variação" value={`${overview.growth}%`} helper="vs ontem" />
        <Kpi icon={Boxes} label="Produtos" value={products.length} helper="catálogo" />
        <Kpi icon={Sparkles} label="Mais clicado" value={overview.topProducts[0]?.name ?? "Sem dados"} helper="produto líder" />
      </div>

      <div className="mt-8 grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <Panel title="Cliques por dia">
          <AreaBox data={overview.daily} />
        </Panel>
        <Panel title="Status do catálogo">
          <PieBox data={statusData} />
        </Panel>
      </div>

      <div className="mt-8 grid gap-5 xl:grid-cols-2">
        <Panel title="Origem do tráfego">
          <BarBox data={overview.sources} keyName="source" color="#7e1319" />
        </Panel>
        <Panel title="Dispositivos">
          <BarBox data={overview.devices} keyName="device" color="#4ADE80" />
        </Panel>
      </div>

      <div className="mt-8 grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
        <Panel title="Cliques por categoria">
          <BarBox data={categoryData.length ? categoryData : [{ category: "Sem dados", clicks: 0 }]} keyName="category" valueKey="clicks" color="#4ADE80" />
        </Panel>
        <Panel title="Produtos mais clicados">
          <div className="space-y-3">
            {overview.topProducts.length ? overview.topProducts.map((product, index) => (
              <div key={product.id} className="grid items-center gap-4 rounded-lg border border-white/10 bg-black/25 p-3 md:grid-cols-[40px_1fr_120px]">
                <span className="font-mono text-sm text-primary">#{index + 1}</span>
                <div>
                  <p className="font-semibold text-bunker-ice">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.category}</p>
                </div>
                <p className="text-right font-mono text-primary">{product.clicks} cliques</p>
              </div>
            )) : <Empty text="Sem cliques registrados." />}
          </div>
        </Panel>
      </div>
    </AdminLayout>
  );
}

function ProductsAdmin() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Product | null>(null);
  const [view, setView] = useState<"table" | "grid">("table");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [featured, setFeatured] = useState("all");
  const [tag, setTag] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [quality, setQuality] = useState("all");
  const [sort, setSort] = useState("created_desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    refreshProducts();
    getAdminCategories().then(setCategories);
  }, []);

  async function refreshProducts() {
    setLoading(true);
    try {
      setProducts(await getAdminProducts());
    } finally {
      setLoading(false);
    }
  }

  const tags = useMemo(
    () => [...new Set(products.flatMap((product) => product.tags ?? []))].sort(),
    [products]
  );

  const filtered = useMemo(() => {
    const text = query.toLowerCase().trim();
    const result = products.filter((product) => {
      const matchesText =
        !text ||
        product.name.toLowerCase().includes(text) ||
        product.slug.toLowerCase().includes(text) ||
        product.description.toLowerCase().includes(text);
      const matchesCategory = category === "all" || product.category_id === category;
      const matchesStatus = status === "all" || product.status === status;
      const matchesFeatured =
        featured === "all" ||
        (featured === "yes" && product.is_featured) ||
        (featured === "no" && !product.is_featured);
      const matchesTag = !tag || (product.tags ?? []).includes(tag);
      const created = new Date(product.created_at);
      const matchesDateFrom = !dateFrom || created >= new Date(`${dateFrom}T00:00:00`);
      const matchesDateTo = !dateTo || created <= new Date(`${dateTo}T23:59:59`);
      const matchesQuality =
        quality === "all" ||
        (quality === "no_image" && !product.image_url) ||
        (quality === "no_link" && !product.affiliate_url) ||
        (quality === "most_clicked" && (product.click_count ?? 0) > 0) ||
        (quality === "less_clicked" && (product.click_count ?? 0) === 0);

      return (
        matchesText &&
        matchesCategory &&
        matchesStatus &&
        matchesFeatured &&
        matchesTag &&
        matchesDateFrom &&
        matchesDateTo &&
        matchesQuality
      );
    });

    return result.sort((a, b) => compareProducts(a, b, sort));
  }, [category, dateFrom, dateTo, featured, products, quality, query, sort, status, tag]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    setPage(1);
  }, [category, dateFrom, dateTo, featured, pageSize, quality, query, sort, status, tag, view]);

  function openNewProduct() {
    setEditing(null);
    setDrawerOpen(true);
  }

  function openEdit(product: Product) {
    setEditing(product);
    setDrawerOpen(true);
  }

  async function saveProduct(payload: ProductFormPayload) {
    setFeedback("");
    const dbPayload = {
      name: payload.name,
      slug: payload.slug,
      description: payload.description,
      short_description: payload.short_description,
      full_description: payload.full_description,
      image_url: payload.image_url,
      affiliate_url: payload.affiliate_url,
      category_id: payload.category_id || null,
      status: payload.status,
      is_featured: payload.is_featured,
      tags: payload.tags,
      display_order: payload.display_order,
      story_section: payload.story_section || null
    };

    const request = editing
      ? supabase.from("products").update(dbPayload).eq("id", editing.id)
      : supabase.from("products").insert(dbPayload);
    const { error } = await request;
    if (error) {
      const legacyPayload = {
        name: payload.name,
        slug: payload.slug,
        description: payload.description,
        image_url: payload.image_url,
        affiliate_url: payload.affiliate_url,
        category_id: payload.category_id || null,
        status: payload.status === "draft" ? "inactive" : payload.status,
        is_featured: payload.is_featured
      };
      const legacyRequest = editing
        ? supabase.from("products").update(legacyPayload).eq("id", editing.id)
        : supabase.from("products").insert(legacyPayload);
      const { error: legacyError } = await legacyRequest;
      if (legacyError) {
        setFeedback(`Erro ao salvar: ${legacyError.message}`);
        return false;
      }
      setFeedback("Produto salvo. Campos avançados exigem aplicar a migração do schema.sql no Supabase.");
      setDrawerOpen(false);
      await refreshProducts();
      return true;
    }
    setFeedback(editing ? "Produto atualizado com sucesso." : "Produto criado com sucesso.");
    setDrawerOpen(false);
    await refreshProducts();
    return true;
  }

  async function updateProduct(id: string, patch: Partial<Product>, message: string) {
    const { error } = await supabase.from("products").update(patch).eq("id", id);
    if (error) {
      setFeedback(`Erro: ${error.message}`);
      return;
    }
    setFeedback(message);
    await refreshProducts();
  }

  async function duplicateProduct(product: Product) {
    const duplicate = {
      name: `${product.name} copia`,
      slug: `${product.slug}-copia-${Date.now().toString().slice(-4)}`,
      description: product.description,
      short_description: product.short_description ?? null,
      full_description: product.full_description ?? null,
      image_url: product.image_url,
      affiliate_url: product.affiliate_url,
      category_id: product.category_id,
      is_featured: false,
      status: "draft",
      tags: product.tags ?? [],
      display_order: product.display_order ?? 0,
      story_section: product.story_section ?? null
    };
    const { error } = await supabase.from("products").insert(duplicate);
    if (error) setFeedback(`Erro ao duplicar: ${error.message}`);
    else {
      setFeedback("Produto duplicado como rascunho.");
      await refreshProducts();
    }
  }

  async function deleteProduct(product: Product) {
    setPendingDelete(product);
  }

  async function confirmDeleteProduct() {
    if (!pendingDelete) return;
    const { error } = await supabase.from("products").delete().eq("id", pendingDelete.id);
    if (error) setFeedback(`Erro ao excluir: ${error.message}`);
    else {
      setFeedback("Produto excluído.");
      setPendingDelete(null);
      await refreshProducts();
    }
  }

  function clearFilters() {
    setQuery("");
    setCategory("all");
    setStatus("all");
    setFeatured("all");
    setTag("");
    setDateFrom("");
    setDateTo("");
    setQuality("all");
    setSort("created_desc");
  }

  return (
    <AdminLayout
      title="Produtos"
      description="Controle completo do catálogo afiliado, status, destaque, links e performance."
      action={<Button onClick={openNewProduct}><PackagePlus className="h-4 w-4" />Novo Produto</Button>}
    >
      <div className="grid gap-4 md:grid-cols-4">
        <Kpi icon={Boxes} label="Total" value={products.length} helper="produtos cadastrados" />
        <Kpi icon={CheckCircle2} label="Ativos" value={products.filter((product) => product.status === "active").length} helper="visíveis na vitrine" />
        <Kpi icon={Sparkles} label="Destaques" value={products.filter((product) => product.is_featured).length} helper="homepage" />
        <Kpi icon={MousePointerClick} label="Cliques" value={products.reduce((sum, product) => sum + (product.click_count ?? 0), 0)} helper="eventos registrados" />
      </div>

      {feedback ? (
        <div className="mt-6 rounded-lg border border-primary/25 bg-primary/10 px-4 py-3 text-sm text-primary">
          {feedback}
        </div>
      ) : null}

      <section className="mt-6 rounded-lg border border-white/10 bg-card/70 p-5 shadow-insetPanel">
        <div className="mb-5 flex items-center gap-2">
          <Filter className="h-4 w-4 text-primary" />
          <h2 className="text-lg font-bold text-bunker-ice">Filtros e organização</h2>
        </div>
        <div className="grid gap-3 lg:grid-cols-[1.25fr_repeat(4,0.75fr)]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nome, slug ou descrição" className="pl-9" />
          </div>
          <Select value={category} onChange={setCategory} options={[["all", "Todas categorias"], ...categories.map((item) => [item.id, item.name] as [string, string])]} />
          <Select value={status} onChange={setStatus} options={[["all", "Todos status"], ["active", "Ativo"], ["inactive", "Inativo"], ["draft", "Rascunho"]]} />
          <Select value={featured} onChange={setFeatured} options={[["all", "Destaque"], ["yes", "Somente destaque"], ["no", "Sem destaque"]]} />
          <Select value={quality} onChange={setQuality} options={[["all", "Qualidade"], ["no_image", "Sem imagem"], ["no_link", "Sem link"], ["most_clicked", "Com cliques"], ["less_clicked", "Sem cliques"]]} />
        </div>
        <div className="mt-3 grid gap-3 lg:grid-cols-[0.7fr_0.7fr_0.8fr_0.9fr_auto_auto]">
          <Input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} />
          <Input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} />
          <Select value={tag} onChange={setTag} options={[["", "Todas tags"], ...tags.map((item) => [item, item] as [string, string])]} />
          <Select value={sort} onChange={setSort} options={[
            ["created_desc", "Mais recentes"],
            ["created_asc", "Mais antigos"],
            ["name_asc", "Nome A-Z"],
            ["clicks_desc", "Mais clicados"],
            ["clicks_asc", "Menos clicados"],
            ["status_asc", "Status"],
            ["category_asc", "Categoria"]
          ]} />
          <div className="flex rounded-md border border-white/10 bg-black/30 p-1">
            <Button variant={view === "table" ? "default" : "ghost"} size="sm" onClick={() => setView("table")}><List className="h-4 w-4" /></Button>
            <Button variant={view === "grid" ? "default" : "ghost"} size="sm" onClick={() => setView("grid")}><Grid3X3 className="h-4 w-4" /></Button>
          </div>
          <Button variant="outline" onClick={clearFilters}>Limpar</Button>
        </div>
      </section>

      <div className="mt-5 flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>Exibindo <span className="text-bunker-ice">{visible.length}</span> de <span className="text-bunker-ice">{filtered.length}</span> produtos filtrados ({products.length} total)</p>
        <div className="flex items-center gap-2">
          <span>Itens por página</span>
          <Select value={String(pageSize)} onChange={(value) => setPageSize(Number(value))} options={[["8", "8"], ["10", "10"], ["20", "20"], ["50", "50"]]} />
        </div>
      </div>

      {loading ? <div className="mt-8"><LoadingBlock /></div> : view === "table" ? (
        <ProductsTable products={visible} onEdit={openEdit} onDuplicate={duplicateProduct} onDelete={deleteProduct} onPatch={updateProduct} />
      ) : (
        <ProductsGrid products={visible} onEdit={openEdit} onDuplicate={duplicateProduct} onDelete={deleteProduct} onPatch={updateProduct} />
      )}

      <Pagination page={currentPage} totalPages={totalPages} onPage={setPage} />

      <ProductDrawer
        open={drawerOpen}
        product={editing}
        categories={categories}
        onClose={() => setDrawerOpen(false)}
        onSave={saveProduct}
      />
      <ConfirmModal
        open={Boolean(pendingDelete)}
        title="Excluir produto"
        description={`Você está prestes a excluir "${pendingDelete?.name ?? ""}". Essa ação não pode ser desfeita.`}
        confirmLabel="Excluir produto"
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDeleteProduct}
      />
    </AdminLayout>
  );
}

type ProductFormPayload = {
  name: string;
  slug: string;
  description: string;
  short_description: string | null;
  full_description: string | null;
  image_url: string;
  affiliate_url: string;
  category_id: string;
  status: Product["status"];
  is_featured: boolean;
  tags: string[];
  display_order: number;
  story_section: Product["story_section"];
};

function ProductsTable({
  products,
  onEdit,
  onDuplicate,
  onDelete,
  onPatch
}: ProductActionsProps) {
  return (
    <div className="mt-6 overflow-x-auto rounded-lg border border-white/10 bg-card/70 shadow-insetPanel">
      <table className="w-full min-w-[980px] border-collapse text-sm">
        <thead className="sticky top-0 bg-[#0a0f0c] text-left font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          <tr>
            <th className="px-4 py-4">Imagem</th>
            <th className="px-4 py-4">Produto</th>
            <th className="px-4 py-4">Categoria</th>
            <th className="px-4 py-4">Status</th>
            <th className="px-4 py-4">Destaque</th>
            <th className="px-4 py-4">Cliques</th>
            <th className="px-4 py-4">Criado em</th>
            <th className="px-4 py-4 text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-t border-white/10 transition-colors hover:bg-primary/[0.045]">
              <td className="px-4 py-4">
                <img src={product.image_url || "/placeholder.png"} alt={product.name} className="h-14 w-20 rounded-md object-cover" />
              </td>
              <td className="px-4 py-4">
                <p className="font-semibold text-bunker-ice">{product.name}</p>
                <p className="mt-1 font-mono text-xs text-muted-foreground">/{product.slug}</p>
                <TagLine tags={product.tags ?? []} />
              </td>
              <td className="px-4 py-4 text-muted-foreground">{product.categories?.name ?? "Sem categoria"}</td>
              <td className="px-4 py-4"><StatusBadge status={product.status} /></td>
              <td className="px-4 py-4"><FeaturedBadge featured={product.is_featured} /></td>
              <td className="px-4 py-4 font-mono text-primary">{product.click_count ?? 0}</td>
              <td className="px-4 py-4 text-muted-foreground">{formatDate(product.created_at)}</td>
              <td className="px-4 py-4">
                <ProductActionBar product={product} onEdit={onEdit} onDuplicate={onDuplicate} onDelete={onDelete} onPatch={onPatch} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!products.length ? <Empty text="Nenhum produto encontrado com os filtros atuais." /> : null}
    </div>
  );
}

function ProductsGrid({ products, onEdit, onDuplicate, onDelete, onPatch }: ProductActionsProps) {
  if (!products.length) return <div className="mt-6"><Empty text="Nenhum produto encontrado com os filtros atuais." /></div>;
  return (
    <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {products.map((product) => (
        <article key={product.id} className="group overflow-hidden rounded-lg border border-white/10 bg-card/70 shadow-insetPanel transition-all hover:-translate-y-1 hover:border-primary/45 hover:shadow-glow">
          <div className="relative aspect-video overflow-hidden bg-bunker-steel">
            <img src={product.image_url || "/placeholder.png"} alt={product.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
            <div className="absolute left-3 top-3 flex gap-2">
              <StatusBadge status={product.status} />
              {product.is_featured ? <FeaturedBadge featured /> : null}
            </div>
          </div>
          <div className="space-y-4 p-4">
            <div>
              <h3 className="line-clamp-1 text-lg font-bold text-bunker-ice">{product.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{product.categories?.name ?? "Sem categoria"}</p>
            </div>
            <div className="flex items-center justify-between rounded-md border border-white/10 bg-black/25 px-3 py-2">
              <span className="text-xs text-muted-foreground">Cliques</span>
              <span className="font-mono text-primary">{product.click_count ?? 0}</span>
            </div>
            <TagLine tags={product.tags ?? []} />
            <ProductActionBar product={product} onEdit={onEdit} onDuplicate={onDuplicate} onDelete={onDelete} onPatch={onPatch} />
          </div>
        </article>
      ))}
    </div>
  );
}

type ProductActionsProps = {
  products: Product[];
  onEdit: (product: Product) => void;
  onDuplicate: (product: Product) => void;
  onDelete: (product: Product) => void;
  onPatch: (id: string, patch: Partial<Product>, message: string) => void;
};

function ProductActionBar({
  product,
  onEdit,
  onDuplicate,
  onDelete,
  onPatch
}: Omit<ProductActionsProps, "products"> & { product: Product }) {
  return (
    <div className="flex flex-wrap justify-end gap-2">
      <IconButton title="Visualizar" to={`/produto/${product.slug}`} icon={Eye} />
      <IconButton title="Editar" onClick={() => onEdit(product)} icon={Edit3} />
      <IconButton title="Copiar link público" onClick={() => copyText(`${window.location.origin}/produto/${product.slug}`)} icon={Copy} />
      <IconButton title="Duplicar" onClick={() => onDuplicate(product)} icon={PackagePlus} />
      <IconButton
        title={product.status === "active" ? "Desativar" : "Ativar"}
        onClick={() => onPatch(product.id, { status: product.status === "active" ? "inactive" : "active" }, "Status atualizado.")}
        icon={CheckCircle2}
      />
      <IconButton
        title={product.is_featured ? "Remover destaque" : "Destacar"}
        onClick={() => onPatch(product.id, { is_featured: !product.is_featured }, "Destaque atualizado.")}
        icon={Sparkles}
      />
      <IconButton title="Excluir" onClick={() => onDelete(product)} icon={Trash2} danger />
    </div>
  );
}

function ProductDrawer({
  open,
  product,
  categories,
  onClose,
  onSave
}: {
  open: boolean;
  product: Product | null;
  categories: Category[];
  onClose: () => void;
  onSave: (payload: ProductFormPayload) => Promise<boolean>;
}) {
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [fullDescription, setFullDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [affiliateUrl, setAffiliateUrl] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState<Product["status"]>("active");
  const [featured, setFeatured] = useState(false);
  const [tags, setTags] = useState("");
  const [displayOrder, setDisplayOrder] = useState(0);
  const [storySection, setStorySection] = useState("");
  const [error, setError] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(product?.name ?? "");
    setSlug(product?.slug ?? "");
    setDescription(product?.description ?? "");
    setShortDescription(product?.short_description ?? "");
    setFullDescription(product?.full_description ?? "");
    setImageUrl(product?.image_url ?? "");
    setAffiliateUrl(product?.affiliate_url ?? "");
    setCategoryId(product?.category_id ?? categories[0]?.id ?? "");
    setStatus(product?.status ?? "active");
    setFeatured(product?.is_featured ?? false);
    setTags((product?.tags ?? []).join(", "));
    setDisplayOrder(product?.display_order ?? 0);
    setStorySection(product?.story_section ?? "");
    setError("");
  }, [categories, open, product]);

  function handleName(value: string) {
    setName(value);
    if (!product) setSlug(slugify(value));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || !slug.trim() || !description.trim() || !affiliateUrl.trim()) {
      setError("Preencha nome, slug, descrição e link afiliado.");
      return;
    }
    setSaving(true);
    const ok = await onSave({
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim(),
      short_description: shortDescription.trim() || null,
      full_description: fullDescription.trim() || null,
      image_url: imageUrl.trim(),
      affiliate_url: affiliateUrl.trim(),
      category_id: categoryId,
      status,
      is_featured: featured,
      tags: tags.split(",").map((item) => item.trim()).filter(Boolean),
      display_order: Number(displayOrder) || 0,
      story_section: (storySection || null) as Product["story_section"]
    });
    setSaving(false);
    if (!ok) setError("Não foi possível salvar. Verifique se o schema do Supabase foi atualizado.");
  }

  async function generateProductAi() {
    setAiLoading(true);
    const result = await callAi("product_description", { name, description, category: categories.find((item) => item.id === categoryId)?.name, tags });
    setAiLoading(false);
    if (!result.ok) return setError(result.error ?? "Não foi possível gerar com IA.");
    const data = result.data ?? {};
    if (data.short_description) setShortDescription(data.short_description);
    if (data.description) setDescription(data.description);
    if (data.full_description) setFullDescription(data.full_description);
    if (Array.isArray(data.tags)) setTags(data.tags.join(", "));
    if (data.title && !name) handleName(data.title);
    setError("Sugestão de IA aplicada. Revise antes de salvar.");
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <aside className="ml-auto flex h-full w-full max-w-2xl flex-col border-l border-white/10 bg-[#050705] shadow-[0_0_80px_rgba(0,0,0,0.65)]" onClick={(event) => event.stopPropagation()}>
        <div className="border-b border-white/10 p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">{product ? "Editar produto" : "Novo produto"}</p>
          <h2 className="mt-2 text-2xl font-black text-bunker-ice">{product ? product.name : "Adicionar equipamento"}</h2>
          <Button type="button" variant="outline" size="sm" className="mt-4" onClick={generateProductAi} disabled={aiLoading}><Sparkles className="h-4 w-4" /> {aiLoading ? "Gerando..." : "Gerar com IA"}</Button>
        </div>
        <form onSubmit={submit} className="flex-1 overflow-y-auto p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div><Label>Nome do produto</Label><Input value={name} onChange={(event) => handleName(event.target.value)} className="mt-2" /></div>
            <div><Label>Slug automático</Label><Input value={slug} onChange={(event) => setSlug(slugify(event.target.value))} className="mt-2" /></div>
            <div className="md:col-span-2"><Label>Descrição curta</Label><Input value={shortDescription} onChange={(event) => setShortDescription(event.target.value)} className="mt-2" /></div>
            <div className="md:col-span-2"><Label>Descrição principal</Label><Textarea value={description} onChange={(event) => setDescription(event.target.value)} className="mt-2" /></div>
            <div className="md:col-span-2"><Label>Descrição completa</Label><Textarea value={fullDescription} onChange={(event) => setFullDescription(event.target.value)} className="mt-2 min-h-36" /></div>
            <div><Label>Categoria</Label><Select value={categoryId} onChange={setCategoryId} options={categories.map((category) => [category.id, category.name])} /></div>
            <div><Label>Status</Label><Select value={status} onChange={(value) => setStatus(value as Product["status"])} options={[["active", "Ativo"], ["inactive", "Inativo"], ["draft", "Rascunho"]]} /></div>
            <div className="md:col-span-2"><Label>Imagem</Label><Input value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} placeholder="URL ou Supabase Storage" className="mt-2" /></div>
            {imageUrl ? <img src={imageUrl} alt="Preview" className="h-48 w-full rounded-lg border border-white/10 object-cover md:col-span-2" /> : null}
            <div className="md:col-span-2"><Label>Link afiliado</Label><Input value={affiliateUrl} onChange={(event) => setAffiliateUrl(event.target.value)} className="mt-2" /></div>
            <div><Label>Tags</Label><Input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="apocalipse, bunker, militar" className="mt-2" /></div>
            <div><Label>Ordem de exibição</Label><Input type="number" value={displayOrder} onChange={(event) => setDisplayOrder(Number(event.target.value))} className="mt-2" /></div>
            <div><Label>Seção narrativa</Label><Select value={storySection} onChange={setStorySection} options={[["", "Nenhuma"], ["most_used", "Mais usado nas histórias"], ["forbidden", "Equipamento proibido"], ["survivor_choice", "Escolha dos sobreviventes"]]} /></div>
            <label className="mt-7 flex items-center gap-3 text-sm text-muted-foreground"><input type="checkbox" checked={featured} onChange={(event) => setFeatured(event.target.checked)} /> Produto em destaque</label>
          </div>
          {error ? <p className="mt-4 rounded-md border border-red-400/20 bg-red-950/30 p-3 text-sm text-red-200">{error}</p> : null}
          <div className="sticky bottom-0 -mx-5 mt-6 flex justify-end gap-3 border-t border-white/10 bg-[#050705]/95 p-5 backdrop-blur">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={saving}>{saving ? "Salvando..." : "Salvar produto"}</Button>
          </div>
        </form>
      </aside>
    </div>
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: [string, string][] }) {
  return (
    <select value={value} onChange={(event) => onChange(event.target.value)} className="h-11 w-full rounded-md border border-border bg-black/30 px-3 text-sm text-bunker-ice outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/20">
      {options.map(([optionValue, label]) => <option key={optionValue} value={optionValue}>{label}</option>)}
    </select>
  );
}

function StatusBadge({ status }: { status: Product["status"] }) {
  const styles = {
    active: "border-primary/30 bg-primary/10 text-primary",
    inactive: "border-red-400/30 bg-red-950/35 text-red-200",
    draft: "border-bunker-amber/30 bg-bunker-amber/10 text-bunker-amber"
  };
  const labels = { active: "Ativo", inactive: "Inativo", draft: "Rascunho" };
  return <span className={`rounded-md border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] ${styles[status]}`}>{labels[status]}</span>;
}

function FeaturedBadge({ featured }: { featured: boolean }) {
  return <span className={`rounded-md border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] ${featured ? "border-primary/30 bg-primary/10 text-primary" : "border-white/10 bg-white/5 text-muted-foreground"}`}>{featured ? "Sim" : "Não"}</span>;
}

function TagLine({ tags }: { tags: string[] }) {
  if (!tags.length) return null;
  return <div className="mt-2 flex flex-wrap gap-1">{tags.slice(0, 4).map((tag) => <span key={tag} className="rounded border border-white/10 bg-white/[0.035] px-2 py-0.5 text-[11px] text-muted-foreground">{tag}</span>)}</div>;
}

function IconButton({ title, icon: Icon, onClick, to, danger }: { title: string; icon: typeof Eye; onClick?: () => void; to?: string; danger?: boolean }) {
  const className = `grid h-8 w-8 place-items-center rounded-md border transition-all ${danger ? "border-red-400/20 text-red-200 hover:bg-red-950/40" : "border-white/10 text-muted-foreground hover:border-primary/40 hover:bg-primary/10 hover:text-primary"}`;
  if (to) return <Link to={to} title={title} className={className}><Icon className="h-4 w-4" /></Link>;
  return <button type="button" title={title} onClick={onClick} className={className}><Icon className="h-4 w-4" /></button>;
}

function Pagination({ page, totalPages, onPage }: { page: number; totalPages: number; onPage: (page: number) => void }) {
  return (
    <div className="mt-6 flex items-center justify-between rounded-lg border border-white/10 bg-card/70 p-4">
      <p className="text-sm text-muted-foreground">Página <span className="text-bunker-ice">{page}</span> de <span className="text-bunker-ice">{totalPages}</span></p>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPage(page - 1)}><ChevronLeft className="h-4 w-4" />Anterior</Button>
        <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onPage(page + 1)}>Próxima<ChevronRight className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}

function compareProducts(a: Product, b: Product, sort: string) {
  if (sort === "name_asc") return a.name.localeCompare(b.name);
  if (sort === "created_asc") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  if (sort === "clicks_desc") return (b.click_count ?? 0) - (a.click_count ?? 0);
  if (sort === "clicks_asc") return (a.click_count ?? 0) - (b.click_count ?? 0);
  if (sort === "status_asc") return a.status.localeCompare(b.status);
  if (sort === "category_asc") return (a.categories?.name ?? "").localeCompare(b.categories?.name ?? "");
  return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR");
}

function copyText(value: string) {
  navigator.clipboard?.writeText(value);
}

function CategoriesAdmin() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Category | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Category | null>(null);
  const [query, setQuery] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    refreshCategories();
    getAdminProducts().then(setProducts);
  }, []);

  async function refreshCategories() {
    setCategories(await getAdminCategories());
  }

  function openCategory(category?: Category) {
    setEditing(category ?? null);
    setModalOpen(true);
  }

  async function saveCategory(payload: Partial<Category>) {
    const request = editing
      ? supabase.from("categories").update(payload).eq("id", editing.id)
      : supabase.from("categories").insert(payload);
    const { error } = await request;
    if (error) {
      setFeedback(`Erro: ${error.message}`);
      return false;
    }
    setFeedback(editing ? "Categoria atualizada." : "Categoria criada.");
    setModalOpen(false);
    await refreshCategories();
    return true;
  }

  async function confirmDeleteCategory() {
    if (!pendingDelete) return;
    const { error } = await supabase.from("categories").delete().eq("id", pendingDelete.id);
    if (error) setFeedback(`Erro ao excluir: ${error.message}`);
    else {
      setFeedback("Categoria excluída.");
      setPendingDelete(null);
      await refreshCategories();
    }
  }

  const filtered = categories.filter((category) =>
    `${category.name} ${category.slug} ${category.description ?? ""}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <AdminLayout
      title="Categorias"
      description="Organize os setores narrativos e comerciais da vitrine."
      action={<Button onClick={() => openCategory()}><PackagePlus className="h-4 w-4" />Nova categoria</Button>}
    >
      <div className="grid gap-4 md:grid-cols-3">
        <Kpi icon={Tags} label="Categorias" value={categories.length} helper="setores cadastrados" />
        <Kpi icon={Boxes} label="Produtos vinculados" value={products.filter((product) => product.category_id).length} helper="com categoria" />
        <Kpi icon={AlertTriangle} label="Sem categoria" value={products.filter((product) => !product.category_id).length} helper="revisar cadastro" />
      </div>

      {feedback ? <Feedback text={feedback} /> : null}

      <section className="mt-6 rounded-lg border border-white/10 bg-card/70 p-5 shadow-insetPanel">
        <div className="relative max-w-xl">
          <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar categoria por nome, slug ou descrição" className="pl-9" />
        </div>
      </section>

      <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((category) => {
          const count = products.filter((product) => product.category_id === category.id).length;
          return (
            <article key={category.id} className="rounded-lg border border-white/10 bg-card/70 p-5 shadow-insetPanel transition-all hover:-translate-y-1 hover:border-primary/40 hover:bg-primary/[0.045]">
              <div className="flex items-start justify-between gap-4">
                <span className="grid h-12 w-12 place-items-center rounded-md border border-primary/20 bg-primary/10 text-primary">
                  <CategoryIcon slug={category.slug} />
                </span>
                <div className="flex gap-2">
                  <IconButton title="Editar" icon={Edit3} onClick={() => openCategory(category)} />
                  <IconButton title="Excluir" icon={Trash2} danger onClick={() => setPendingDelete(category)} />
                </div>
              </div>
              <h3 className="mt-5 text-xl font-bold text-bunker-ice">{category.name}</h3>
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{category.description}</p>
              <div className="mt-5 flex items-center justify-between rounded-md border border-white/10 bg-black/25 px-3 py-2">
                <span className="font-mono text-xs text-primary">/{category.slug}</span>
                <span className="text-sm text-muted-foreground">{count} produtos</span>
              </div>
            </article>
          );
        })}
      </div>

      <CategoryModal open={modalOpen} category={editing} onClose={() => setModalOpen(false)} onSave={saveCategory} />
      <ConfirmModal
        open={Boolean(pendingDelete)}
        title="Excluir categoria"
        description={`Excluir "${pendingDelete?.name ?? ""}"? Produtos vinculados ficarão sem categoria.`}
        confirmLabel="Excluir categoria"
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDeleteCategory}
      />
    </AdminLayout>
  );
}

function BannersAdmin() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Banner | null>(null);
  const [feedback, setFeedback] = useState("");

  useEffect(() => { refreshBanners(); }, []);

  async function refreshBanners() {
    setBanners(await getAdminBanners());
  }

  function openBanner(banner?: Banner) {
    setEditing(banner ?? null);
    setModalOpen(true);
  }

  async function saveBanner(payload: Partial<Banner>) {
    const request = editing
      ? supabase.from("banners").update(payload).eq("id", editing.id)
      : supabase.from("banners").insert(payload);
    const { error } = await request;
    if (error) {
      setFeedback(`Erro: ${error.message}`);
      return false;
    }
    setFeedback(editing ? "Banner atualizado." : "Banner criado.");
    setModalOpen(false);
    await refreshBanners();
    return true;
  }

  async function confirmDeleteBanner() {
    if (!pendingDelete) return;
    const { error } = await supabase.from("banners").delete().eq("id", pendingDelete.id);
    if (error) setFeedback(`Erro ao excluir: ${error.message}`);
    else {
      setFeedback("Banner excluído.");
      setPendingDelete(null);
      await refreshBanners();
    }
  }

  return (
    <AdminLayout
      title="Banners"
      description="Gerencie os destaques cinematográficos da homepage."
      action={<Button onClick={() => openBanner()}><PackagePlus className="h-4 w-4" />Novo banner</Button>}
    >
      <div className="grid gap-4 md:grid-cols-3">
        <Kpi icon={ImageIcon} label="Total" value={banners.length} helper="banners cadastrados" />
        <Kpi icon={CheckCircle2} label="Ativos" value={banners.filter((banner) => banner.status === "active").length} helper="visíveis" />
        <Kpi icon={AlertTriangle} label="Inativos" value={banners.filter((banner) => banner.status !== "active").length} helper="pausados" />
      </div>

      {feedback ? <Feedback text={feedback} /> : null}

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        {banners.map((banner) => (
          <article key={banner.id} className="overflow-hidden rounded-lg border border-white/10 bg-card/70 shadow-insetPanel transition-all hover:-translate-y-1 hover:border-primary/40">
            <div className="relative aspect-video bg-bunker-steel">
              <ImageWithFallback src={banner.image_url} alt={banner.title} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
              <div className="absolute left-4 top-4"><StatusBadge status={banner.status === "active" ? "active" : "inactive"} /></div>
            </div>
            <div className="p-5">
              <h3 className="text-xl font-bold text-bunker-ice">{banner.title}</h3>
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{banner.subtitle}</p>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <span className="font-mono text-xs text-primary">{banner.button_text ?? "Sem botão"}</span>
                <div className="flex gap-2">
                  <IconButton title="Editar" icon={Edit3} onClick={() => openBanner(banner)} />
                  <IconButton title={banner.status === "active" ? "Desativar" : "Ativar"} icon={CheckCircle2} onClick={async () => {
                    await supabase.from("banners").update({ status: banner.status === "active" ? "inactive" : "active" }).eq("id", banner.id);
                    await refreshBanners();
                  }} />
                  <IconButton title="Excluir" icon={Trash2} danger onClick={() => setPendingDelete(banner)} />
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      <BannerModal open={modalOpen} banner={editing} onClose={() => setModalOpen(false)} onSave={saveBanner} />
      <ConfirmModal
        open={Boolean(pendingDelete)}
        title="Excluir banner"
        description={`Excluir "${pendingDelete?.title ?? ""}"? Essa ação remove o destaque da homepage.`}
        confirmLabel="Excluir banner"
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDeleteBanner}
      />
    </AdminLayout>
  );
}

function CenterModal({
  open,
  title,
  description,
  children,
  onClose
}: {
  open: boolean;
  title: string;
  description?: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#050705] shadow-[0_30px_100px_rgba(0,0,0,0.65)]" onClick={(event) => event.stopPropagation()}>
        <div className="border-b border-white/10 p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">Edição rápida</p>
          <h2 className="mt-2 text-2xl font-black text-bunker-ice">{title}</h2>
          {description ? <p className="mt-2 text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {children}
      </div>
    </div>
  );
}

function ConfirmModal({
  open,
  title,
  description,
  confirmLabel,
  onCancel,
  onConfirm
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
}) {
  return (
    <CenterModal open={open} title={title} description={description} onClose={onCancel}>
      <div className="p-5">
        <div className="rounded-lg border border-red-400/20 bg-red-950/25 p-4 text-sm leading-6 text-red-100">
          Essa ação exige confirmação e pode afetar a organização da vitrine.
        </div>
        <div className="mt-5 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
          <Button type="button" variant="destructive" onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </CenterModal>
  );
}

function CategoryModal({
  open,
  category,
  onClose,
  onSave
}: {
  open: boolean;
  category: Category | null;
  onClose: () => void;
  onSave: (payload: Partial<Category>) => Promise<boolean>;
}) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("Shield");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(category?.name ?? "");
    setSlug(category?.slug ?? "");
    setDescription(category?.description ?? "");
    setIcon(category?.icon ?? "Shield");
  }, [category, open]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    await onSave({ name, slug: slug || slugify(name), description, icon });
    setSaving(false);
  }

  return (
    <CenterModal open={open} title={category ? "Editar categoria" : "Nova categoria"} description="Defina o setor, ícone e descrição usados na vitrine pública." onClose={onClose}>
      <form onSubmit={submit} className="grid gap-4 p-5 md:grid-cols-2">
        <div><Label>Nome</Label><Input value={name} onChange={(event) => { setName(event.target.value); if (!category) setSlug(slugify(event.target.value)); }} className="mt-2" required /></div>
        <div><Label>Slug</Label><Input value={slug} onChange={(event) => setSlug(slugify(event.target.value))} className="mt-2" required /></div>
        <div><Label>Ícone</Label><Input value={icon} onChange={(event) => setIcon(event.target.value)} className="mt-2" placeholder="Shield, Radio, Flashlight..." /></div>
        <div className="md:col-span-2"><Label>Descrição</Label><Textarea value={description} onChange={(event) => setDescription(event.target.value)} className="mt-2" /></div>
        <div className="flex justify-end gap-3 md:col-span-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={saving}>{saving ? "Salvando..." : "Salvar categoria"}</Button>
        </div>
      </form>
    </CenterModal>
  );
}

function BannerModal({
  open,
  banner,
  onClose,
  onSave
}: {
  open: boolean;
  banner: Banner | null;
  onClose: () => void;
  onSave: (payload: Partial<Banner>) => Promise<boolean>;
}) {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [buttonText, setButtonText] = useState("");
  const [buttonLink, setButtonLink] = useState("");
  const [status, setStatus] = useState<Banner["status"]>("active");
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTitle(banner?.title ?? "");
    setSubtitle(banner?.subtitle ?? "");
    setImageUrl(banner?.image_url ?? "");
    setButtonText(banner?.button_text ?? "");
    setButtonLink(banner?.button_link ?? "");
    setStatus(banner?.status ?? "active");
  }, [banner, open]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    await onSave({
      title,
      subtitle,
      image_url: imageUrl,
      button_text: buttonText,
      button_link: buttonLink,
      status
    });
    setSaving(false);
  }

  async function generateBannerAi() {
    setAiLoading(true);
    const result = await callAi("banner_copy", { title, subtitle, buttonText, buttonLink });
    setAiLoading(false);
    if (!result.ok) return;
    const data = result.data ?? {};
    if (data.title) setTitle(data.title);
    if (data.subtitle) setSubtitle(data.subtitle);
    if (data.cta) setButtonText(data.cta);
  }

  return (
    <CenterModal open={open} title={banner ? "Editar banner" : "Novo banner"} description="Configure o destaque visual da homepage com imagem, CTA e status." onClose={onClose}>
      <form onSubmit={submit} className="grid gap-4 p-5 md:grid-cols-2">
        <div className="md:col-span-2"><Button type="button" variant="outline" onClick={generateBannerAi} disabled={aiLoading}><Sparkles className="h-4 w-4" /> {aiLoading ? "Gerando..." : "Gerar copy com IA"}</Button></div>
        <div><Label>Título</Label><Input value={title} onChange={(event) => setTitle(event.target.value)} className="mt-2" required /></div>
        <div><Label>Status</Label><Select value={status} onChange={(value) => setStatus(value as Banner["status"])} options={[["active", "Ativo"], ["inactive", "Inativo"]]} /></div>
        <div className="md:col-span-2"><Label>Subtítulo</Label><Textarea value={subtitle} onChange={(event) => setSubtitle(event.target.value)} className="mt-2" /></div>
        <div className="md:col-span-2"><Label>Imagem</Label><Input value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} className="mt-2" required /></div>
        {imageUrl ? <img src={imageUrl} alt="Preview" className="h-56 w-full rounded-lg border border-white/10 object-cover md:col-span-2" /> : null}
        <div><Label>Texto do botão</Label><Input value={buttonText} onChange={(event) => setButtonText(event.target.value)} className="mt-2" /></div>
        <div><Label>Link do botão</Label><Input value={buttonLink} onChange={(event) => setButtonLink(event.target.value)} className="mt-2" /></div>
        <div className="flex justify-end gap-3 md:col-span-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={saving}>{saving ? "Salvando..." : "Salvar banner"}</Button>
        </div>
      </form>
    </CenterModal>
  );
}

function Feedback({ text }: { text: string }) {
  return <div className="mt-6 rounded-lg border border-primary/25 bg-primary/10 px-4 py-3 text-sm text-primary">{text}</div>;
}

type CollectionRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  status: "active" | "inactive" | "draft";
  is_featured: boolean;
  display_order: number;
  product_count?: number;
  created_at: string;
};

type CouponRow = {
  id: string;
  code: string;
  description: string | null;
  discount_type: "percent" | "fixed";
  percent: number | null;
  fixed_value: number | null;
  expires_at: string | null;
  usage_limit: number | null;
  used_count: number;
  status: "active" | "expired" | "paused";
  created_at: string;
};

type TrackingLinkRow = {
  id: string;
  name: string;
  destination_url: string;
  source: string;
  campaign: string;
  medium: string | null;
  tags: string[] | null;
  access_count?: number;
  status: "active" | "inactive";
  created_at: string;
};

type AdminProfileRow = {
  id: string;
  name: string | null;
  email: string;
  avatar_url: string | null;
  role: "admin" | "editor" | "analyst";
  status: "active" | "inactive";
  created_at: string;
};

type IntegrationRow = {
  id: string;
  name?: string | null;
  provider?: string | null;
  platform: string;
  description: string;
  status: "connected" | "disconnected" | "paused";
  config?: Record<string, string>;
  last_tested_at?: string | null;
  last_sync_at: string | null;
};

type SettingRow = {
  id?: string;
  key: string;
  value: string | number | boolean | null;
  group: string;
};

type IntelligenceClick = {
  id: string;
  product_id: string | null;
  source: string | null;
  campaign: string | null;
  referrer: string | null;
  application: string | null;
  device: string | null;
  browser: string | null;
  country: string | null;
  city: string | null;
  created_at: string;
  products?: {
    id: string;
    name: string;
    slug: string;
    categories?: { name: string; slug: string } | null;
  } | null;
};

const fallbackCollections: CollectionRow[] = [
  { id: "c1", name: "Equipamentos Proibidos", slug: "equipamentos-proibidos", description: "Itens restritos para cenas de risco, fuga e laboratório.", image_url: "https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?auto=format&fit=crop&w=1200&q=80", status: "active", is_featured: true, display_order: 1, product_count: 8, created_at: new Date().toISOString() },
  { id: "c2", name: "Kit Sobrevivência", slug: "kit-sobrevivencia", description: "Seleção essencial para os primeiros dias do colapso.", image_url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80", status: "draft", is_featured: false, display_order: 2, product_count: 5, created_at: new Date().toISOString() }
];

const fallbackCoupons: CouponRow[] = [
  { id: "p1", code: "BUNKER10", description: "Desconto temático para campanha Instagram.", discount_type: "percent", percent: 10, fixed_value: null, expires_at: null, usage_limit: 500, used_count: 73, status: "active", created_at: new Date().toISOString() },
  { id: "p2", code: "ZONA-SEGURA", description: "Cupom de lançamento para kits de emergência.", discount_type: "fixed", percent: null, fixed_value: 25, expires_at: null, usage_limit: 120, used_count: 18, status: "paused", created_at: new Date().toISOString() }
];

const fallbackLinks: TrackingLinkRow[] = [
  { id: "l1", name: "Reel Bunker EP3", destination_url: "/item/lanterna-bunker", source: "instagram", campaign: "historia-bunker-ep3", medium: "reels", tags: ["bunker", "viral"], access_count: 0, status: "active", created_at: new Date().toISOString() },
  { id: "l2", name: "TikTok Laboratório", destination_url: "/item/radio-militar", source: "tiktok", campaign: "laboratorio-secreto", medium: "bio", tags: ["terror"], access_count: 0, status: "active", created_at: new Date().toISOString() }
];

const fallbackUsers: AdminProfileRow[] = [
  { id: "u1", name: "Operador Admin", email: "admin@teste.com", avatar_url: null, role: "admin", status: "active", created_at: new Date().toISOString() },
  { id: "u2", name: "Analista de Tráfego", email: "analista@bunker.local", avatar_url: null, role: "analyst", status: "active", created_at: new Date().toISOString() }
];

const defaultIntegrations: IntegrationRow[] = [
  { id: "instagram", platform: "Instagram", description: "Origem principal para Reels, Stories e links de bio.", status: "disconnected", last_sync_at: null },
  { id: "tiktok", platform: "TikTok", description: "Campanhas virais e tráfego mobile.", status: "disconnected", last_sync_at: null },
  { id: "youtube", platform: "YouTube", description: "Shorts, descrições e vídeos longos.", status: "disconnected", last_sync_at: null },
  { id: "ga", platform: "Google Analytics", description: "Eventos, funis e comportamento de navegação.", status: "disconnected", last_sync_at: null },
  { id: "pixel", platform: "Meta Pixel", description: "Audiências e retargeting para campanhas.", status: "disconnected", last_sync_at: null },
  { id: "telegram", platform: "Telegram", description: "Alertas de campanhas e cliques relevantes.", status: "disconnected", last_sync_at: null },
  { id: "discord", platform: "Discord", description: "Webhooks para equipe e comunidade.", status: "disconnected", last_sync_at: null },
  { id: "webhooks", platform: "Webhooks", description: "Envio de eventos para ferramentas externas.", status: "disconnected", last_sync_at: null },
  { id: "supabase", platform: "Supabase", description: "Banco, Auth, Storage e políticas RLS.", status: "connected", last_sync_at: new Date().toISOString() },
  { id: "vercel", platform: "Vercel", description: "Deploy, preview e hospedagem da vitrine.", status: "connected", last_sync_at: new Date().toISOString() }
];

function CollectionsAdmin() {
  const [collections, setCollections] = useState<CollectionRow[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [editing, setEditing] = useState<CollectionRow | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<CollectionRow | null>(null);
  const [feedback, setFeedback] = useState("");

  async function load() {
    setLoading(true);
    const [{ data, error }, productList] = await Promise.all([
      supabase.from("collections").select("*").order("display_order", { ascending: true }).order("created_at", { ascending: false }),
      getAdminProducts()
    ]);
    setCollections(error ? fallbackCollections : (data as CollectionRow[] ?? fallbackCollections));
    setProducts(productList);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const filtered = collections.filter((item) => {
    const matchesQuery = `${item.name} ${item.slug}`.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = status === "all" || item.status === status;
    return matchesQuery && matchesStatus;
  });

  async function saveCollection(payload: Partial<CollectionRow>) {
    const row = {
      name: payload.name,
      slug: payload.slug || slugify(payload.name ?? ""),
      description: payload.description ?? null,
      image_url: payload.image_url ?? null,
      status: payload.status ?? "active",
      is_featured: Boolean(payload.is_featured),
      display_order: Number(payload.display_order ?? 0)
    };
    const result = editing
      ? await supabase.from("collections").update(row).eq("id", editing.id)
      : await supabase.from("collections").insert(row);
    if (result.error) {
      setFeedback("A tabela de coleções ainda não está disponível no Supabase. Aplique o schema atualizado.");
      return false;
    }
    setModalOpen(false);
    setEditing(null);
    setFeedback("Coleção salva com sucesso.");
    await load();
    return true;
  }

  async function deleteCollection() {
    if (!pendingDelete) return;
    const { error } = await supabase.from("collections").delete().eq("id", pendingDelete.id);
    setPendingDelete(null);
    if (error) {
      setFeedback("Não foi possível excluir. Verifique o schema e permissões do Supabase.");
      return;
    }
    setFeedback("Coleção excluída.");
    await load();
  }

  return (
    <AdminLayout title="Coleções" description="Agrupe produtos em arquivos temáticos para a vitrine." action={<Button onClick={() => { setEditing(null); setModalOpen(true); }}><Layers3 className="h-4 w-4" /> Nova coleção</Button>}>
      <div className="grid gap-4 md:grid-cols-4">
        <Kpi icon={Layers3} label="Coleções" value={collections.length} helper="arquivos criados" />
        <Kpi icon={CheckCircle2} label="Ativas" value={collections.filter((item) => item.status === "active").length} helper="visíveis" />
        <Kpi icon={Sparkles} label="Destaques" value={collections.filter((item) => item.is_featured).length} helper="home" />
        <Kpi icon={Boxes} label="Produtos" value={products.length} helper="disponíveis" />
      </div>
      <section className="mt-8 rounded-lg border border-white/10 bg-card/70 p-5">
        <div className="grid gap-3 md:grid-cols-[1fr_220px_auto]">
          <div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar coleção..." className="pl-10" /></div>
          <Select value={status} onChange={setStatus} options={[["all", "Todos status"], ["active", "Ativo"], ["inactive", "Inativo"], ["draft", "Rascunho"]]} />
          <Button variant="outline" onClick={() => { setQuery(""); setStatus("all"); }}>Limpar</Button>
        </div>
        {loading ? <LoadingBlock /> : (
          <div className="mt-6 grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
            {filtered.map((collection) => (
              <article key={collection.id} className="overflow-hidden rounded-xl border border-white/10 bg-black/25 transition hover:-translate-y-1 hover:border-primary/35">
                <div className="relative h-44 bg-[#0B1110]">
                  {collection.image_url ? <img src={collection.image_url} alt={collection.name} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-muted-foreground"><ImageOff className="h-8 w-8" /></div>}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 to-transparent" />
                  <span className="absolute left-4 top-4"><ModuleStatus status={collection.status} /></span>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-black text-bunker-ice">{collection.name}</h3>
                      <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-primary">/{collection.slug}</p>
                    </div>
                    <FeaturedBadge featured={collection.is_featured} />
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">{collection.description}</p>
                  <div className="mt-5 flex items-center justify-between">
                    <span className="font-mono text-xs text-primary">{collection.product_count ?? 0} produtos</span>
                    <div className="flex gap-2">
                      <IconButton title="Visualizar" to={`/categoria/${collection.slug}`} icon={Eye} />
                      <IconButton title="Editar" onClick={() => { setEditing(collection); setModalOpen(true); }} icon={Edit3} />
                      <IconButton title="Excluir" onClick={() => setPendingDelete(collection)} icon={Trash2} danger />
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
        {!loading && !filtered.length ? <div className="mt-6"><Empty text="Nenhuma coleção encontrada com os filtros atuais." /></div> : null}
      </section>
      {feedback ? <Feedback text={feedback} /> : null}
      <CollectionModal open={modalOpen} collection={editing} onClose={() => setModalOpen(false)} onSave={saveCollection} />
      <ConfirmModal open={Boolean(pendingDelete)} title="Excluir coleção" description={`Deseja excluir ${pendingDelete?.name ?? "esta coleção"}? Os produtos não serão removidos.`} confirmLabel="Excluir coleção" onCancel={() => setPendingDelete(null)} onConfirm={deleteCollection} />
    </AdminLayout>
  );
}

function CouponsAdmin() {
  const [coupons, setCoupons] = useState<CouponRow[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [editing, setEditing] = useState<CouponRow | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<CouponRow | null>(null);
  const [feedback, setFeedback] = useState("");

  async function load() {
    const { data, error } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
    setCoupons(error ? fallbackCoupons : (data as CouponRow[] ?? fallbackCoupons));
  }
  useEffect(() => { load(); }, []);

  const filtered = coupons.filter((coupon) => {
    const matchesQuery = `${coupon.code} ${coupon.description ?? ""}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (status === "all" || coupon.status === status);
  });

  async function saveCoupon(payload: Partial<CouponRow>) {
    const row = {
      code: payload.code?.toUpperCase(),
      description: payload.description ?? null,
      discount_type: payload.discount_type ?? "percent",
      percent: payload.discount_type === "percent" ? Number(payload.percent ?? 0) : null,
      fixed_value: payload.discount_type === "fixed" ? Number(payload.fixed_value ?? 0) : null,
      expires_at: payload.expires_at || null,
      usage_limit: Number(payload.usage_limit ?? 0) || null,
      used_count: Number(payload.used_count ?? 0),
      status: payload.status ?? "active"
    };
    const result = editing ? await supabase.from("coupons").update(row).eq("id", editing.id) : await supabase.from("coupons").insert(row);
    if (result.error) {
      setFeedback("A tabela de cupons ainda não está disponível no Supabase.");
      return false;
    }
    setModalOpen(false);
    setEditing(null);
    setFeedback("Cupom salvo com sucesso.");
    await load();
    return true;
  }

  async function deleteCoupon() {
    if (!pendingDelete) return;
    const { error } = await supabase.from("coupons").delete().eq("id", pendingDelete.id);
    setPendingDelete(null);
    if (error) return setFeedback("Não foi possível excluir o cupom.");
    setFeedback("Cupom excluído.");
    await load();
  }

  return (
    <AdminLayout title="Cupons" description="Controle códigos promocionais para campanhas e parceiros." action={<Button onClick={() => { setEditing(null); setModalOpen(true); }}><TicketPercent className="h-4 w-4" /> Novo cupom</Button>}>
      <div className="grid gap-4 md:grid-cols-4">
        <Kpi icon={TicketPercent} label="Cupons" value={coupons.length} helper="total" />
        <Kpi icon={CheckCircle2} label="Ativos" value={coupons.filter((coupon) => coupon.status === "active").length} helper="em uso" />
        <Kpi icon={MousePointerClick} label="Usos" value={coupons.reduce((sum, coupon) => sum + (coupon.used_count ?? 0), 0)} helper="registrados" />
        <Kpi icon={Clock3} label="Expirados" value={coupons.filter((coupon) => coupon.status === "expired").length} helper="encerrados" />
      </div>
      <section className="mt-8 rounded-lg border border-white/10 bg-card/70 p-5">
        <div className="grid gap-3 md:grid-cols-[1fr_220px_auto]">
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por código ou descrição..." />
          <Select value={status} onChange={setStatus} options={[["all", "Todos status"], ["active", "Ativo"], ["paused", "Pausado"], ["expired", "Expirado"]]} />
          <Button variant="outline" onClick={() => { setQuery(""); setStatus("all"); }}>Limpar</Button>
        </div>
        <div className="mt-6 grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {filtered.map((coupon) => (
            <article key={coupon.id} className="rounded-xl border border-white/10 bg-black/25 p-5 transition hover:-translate-y-1 hover:border-primary/35">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-2xl font-black tracking-[0.12em] text-bunker-ice">{coupon.code}</p>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{coupon.description}</p>
                </div>
                <ModuleStatus status={coupon.status} />
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
                <MiniMetric label="Desconto" value={coupon.discount_type === "percent" ? `${coupon.percent ?? 0}%` : formatMoney(coupon.fixed_value ?? 0)} />
                <MiniMetric label="Usado" value={coupon.used_count ?? 0} />
                <MiniMetric label="Limite" value={coupon.usage_limit ?? "Livre"} />
              </div>
              <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Validade: {coupon.expires_at ? formatDate(coupon.expires_at) : "sem expiração"}</p>
              <div className="mt-5 flex justify-end gap-2">
                <IconButton title="Copiar código" onClick={() => copyText(coupon.code)} icon={Copy} />
                <IconButton title="Editar" onClick={() => { setEditing(coupon); setModalOpen(true); }} icon={Edit3} />
                <IconButton title="Excluir" onClick={() => setPendingDelete(coupon)} icon={Trash2} danger />
              </div>
            </article>
          ))}
        </div>
        {!filtered.length ? <div className="mt-6"><Empty text="Nenhum cupom encontrado." /></div> : null}
      </section>
      {feedback ? <Feedback text={feedback} /> : null}
      <CouponModal open={modalOpen} coupon={editing} onClose={() => setModalOpen(false)} onSave={saveCoupon} />
      <ConfirmModal open={Boolean(pendingDelete)} title="Excluir cupom" description={`Deseja excluir o cupom ${pendingDelete?.code ?? ""}?`} confirmLabel="Excluir cupom" onCancel={() => setPendingDelete(null)} onConfirm={deleteCoupon} />
    </AdminLayout>
  );
}

function ReportsAdmin() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [filters, setFilters] = useState<OverviewFilters>({ range: "30d" });
  const [aiReport, setAiReport] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => { getOverview(filters).then(setOverview); }, [filters]);

  function exportCsv() {
    if (!overview) return;
    const rows = [
      ["relatorio", "nome", "valor"],
      ...overview.topProducts.map((item) => ["produtos_mais_acessados", item.name, item.clicks]),
      ...overview.campaignInsights.map((item) => ["campanhas", item.campaign, item.clicks]),
      ...overview.sourceInsights.map((item) => ["origens", item.name, item.value]),
      ...overview.applicationInsights.map((item) => ["aplicacoes", item.name, item.value]),
      ...overview.devices.map((item) => ["dispositivos", item.device, item.value])
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `relatorio-hub-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function generateAiReport() {
    setAiLoading(true);
    const result = await callAi("report", { filters });
    setAiLoading(false);
    setAiReport(result.ok ? result.text : (result.error ?? "Não foi possível gerar relatório com IA."));
  }

  if (!overview) return <AdminLayout title="Relatórios" description="Preparando inteligência de tráfego..."><LoadingBlock /></AdminLayout>;

  return (
    <AdminLayout title="Relatórios" description="Relatórios executivos para tráfego, produtos, campanhas e crescimento." action={<div className="flex gap-2"><Button variant="outline" onClick={generateAiReport} disabled={aiLoading}><Sparkles className="h-4 w-4" /> {aiLoading ? "Gerando..." : "Gerar relatório com IA"}</Button><Button onClick={exportCsv}><FileBarChart className="h-4 w-4" /> Exportar CSV</Button></div>}>
      <TrafficFilters filters={filters} overview={overview} onChange={setFilters} />
      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <Kpi icon={MousePointerClick} label="Cliques" value={overview.totalClicks} helper="período filtrado" />
        <Kpi icon={Megaphone} label="Melhor campanha" value={overview.bestCampaign} helper="campanha líder" />
        <Kpi icon={Globe2} label="Origem" value={overview.mainPlatform} helper="principal" />
        <Kpi icon={Smartphone} label="Dispositivo" value={overview.mainDevice} helper="predominante" />
      </div>
      <div className="mt-8 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel title="Crescimento diário">
          <AreaBox data={overview.daily} />
        </Panel>
        <Panel title="Dispositivos">
          <PieBox data={overview.devices.map((item) => ({ name: item.device, value: item.value }))} />
        </Panel>
      </div>
      <div className="mt-8 grid gap-5 xl:grid-cols-2">
        <Panel title="Produtos mais acessados">
          <ReportTable rows={overview.topProducts.map((item) => [item.name, item.category, `${item.clicks} cliques`, item.mainSource])} headers={["Produto", "Categoria", "Total", "Origem"]} />
        </Panel>
        <Panel title="Campanhas com mais cliques">
          <ReportTable rows={overview.campaignInsights.map((item) => [item.campaign, item.source, `${item.clicks}`, item.bestHour])} headers={["Campanha", "Origem", "Cliques", "Melhor horário"]} />
        </Panel>
      </div>
      <div className="mt-8 grid gap-5 xl:grid-cols-2">
        <Panel title="Exportações">
          <div className="grid gap-3 md:grid-cols-3">
            <Button onClick={exportCsv} variant="outline">CSV</Button>
            <Button variant="outline" onClick={exportCsv}>Excel</Button>
            <Button variant="outline" disabled>PDF futuramente</Button>
          </div>
        </Panel>
        <Panel title="Coleções populares">
          <Empty text="Após aplicar o schema de coleções, este bloco pode receber ranking por coleção." />
        </Panel>
      </div>
      {aiReport ? <Panel title="Relatório gerado com IA"><p className="whitespace-pre-wrap text-sm leading-7 text-slate-300">{aiReport}</p><Button variant="outline" size="sm" className="mt-4" onClick={() => copyText(aiReport)}><Copy className="h-4 w-4" /> Copiar relatório</Button></Panel> : null}
    </AdminLayout>
  );
}

function UsersAdmin() {
  const [users, setUsers] = useState<AdminProfileRow[]>([]);
  const [editing, setEditing] = useState<AdminProfileRow | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<AdminProfileRow | null>(null);
  const [feedback, setFeedback] = useState("");

  async function load() {
    const { data, error } = await supabase.from("admin_profiles").select("*").order("created_at", { ascending: false });
    if (!error) return setUsers(data as AdminProfileRow[]);
    const admins = await supabase.from("admins").select("*").order("created_at", { ascending: false });
    setUsers(admins.error ? fallbackUsers : ((admins.data ?? []).map((admin) => ({
      id: admin.id,
      name: admin.email,
      email: admin.email,
      avatar_url: null,
      role: admin.role === "editor" ? "editor" : "admin",
      status: "active",
      created_at: admin.created_at
    })) as AdminProfileRow[]));
  }
  useEffect(() => { load(); }, []);

  async function saveUser(payload: Partial<AdminProfileRow>) {
    const row = {
      name: payload.name ?? null,
      email: payload.email,
      avatar_url: payload.avatar_url ?? null,
      role: payload.role ?? "analyst",
      status: payload.status ?? "active"
    };
    const result = editing ? await supabase.from("admin_profiles").update(row).eq("id", editing.id) : await supabase.from("admin_profiles").insert(row);
    if (result.error) {
      setFeedback("A tabela admin_profiles ainda não está disponível. A autenticação real continua sendo Supabase Auth + admins.");
      return false;
    }
    setModalOpen(false);
    setEditing(null);
    setFeedback("Usuário salvo.");
    await load();
    return true;
  }

  async function removeUser() {
    if (!pendingDelete) return;
    const { error } = await supabase.from("admin_profiles").delete().eq("id", pendingDelete.id);
    setPendingDelete(null);
    if (error) return setFeedback("Não foi possível remover o perfil administrativo.");
    setFeedback("Acesso removido do módulo de usuários.");
    await load();
  }

  return (
    <AdminLayout title="Usuários" description="Gerencie permissões, status e atividades do time." action={<Button onClick={() => { setEditing(null); setModalOpen(true); }}><Users className="h-4 w-4" /> Novo usuário</Button>}>
      <div className="grid gap-4 md:grid-cols-3">
        <Kpi icon={ShieldCheck} label="Admins" value={users.filter((user) => user.role === "admin").length} helper="controle total" />
        <Kpi icon={Edit3} label="Editores" value={users.filter((user) => user.role === "editor").length} helper="conteúdo" />
        <Kpi icon={BarChart3} label="Analistas" value={users.filter((user) => user.role === "analyst").length} helper="relatórios" />
      </div>
      <section className="mt-8 overflow-hidden rounded-lg border border-white/10 bg-card/70">
        <div className="grid border-b border-white/10 px-5 py-3 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground md:grid-cols-[1.2fr_1fr_120px_120px_130px]">
          <span>Usuário</span><span>Email</span><span>Função</span><span>Status</span><span className="text-right">Ações</span>
        </div>
        {users.map((user) => (
          <div key={user.id} className="grid items-center gap-3 border-b border-white/10 px-5 py-4 text-sm md:grid-cols-[1.2fr_1fr_120px_120px_130px]">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full border border-primary/20 bg-primary/10 text-primary">{user.avatar_url ? <img src={user.avatar_url} alt={user.name ?? user.email} className="h-full w-full rounded-full object-cover" /> : <Users className="h-4 w-4" />}</div>
              <span className="font-semibold text-bunker-ice">{user.name ?? "Sem nome"}</span>
            </div>
            <span className="text-muted-foreground">{user.email}</span>
            <RoleBadge role={user.role} />
            <ModuleStatus status={user.status} />
            <div className="flex justify-end gap-2">
              <IconButton title="Editar" onClick={() => { setEditing(user); setModalOpen(true); }} icon={Edit3} />
              <IconButton title="Redefinir senha" onClick={() => setFeedback("A redefinição de senha deve ser enviada pelo Supabase Auth.")} icon={LockKeyhole} />
              <IconButton title="Remover acesso" onClick={() => setPendingDelete(user)} icon={Trash2} danger />
            </div>
          </div>
        ))}
      </section>
      <div className="mt-8">
        <RecentUserActivity />
      </div>
      {feedback ? <Feedback text={feedback} /> : null}
      <UserModal open={modalOpen} user={editing} onClose={() => setModalOpen(false)} onSave={saveUser} />
      <ConfirmModal open={Boolean(pendingDelete)} title="Remover acesso" description={`Deseja remover ${pendingDelete?.email ?? "este usuário"} do painel?`} confirmLabel="Remover acesso" onCancel={() => setPendingDelete(null)} onConfirm={removeUser} />
    </AdminLayout>
  );
}

function TrackingLinksAdmin() {
  const [links, setLinks] = useState<TrackingLinkRow[]>([]);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TrackingLinkRow | null>(null);
  const [pendingDelete, setPendingDelete] = useState<TrackingLinkRow | null>(null);
  const [feedback, setFeedback] = useState("");

  async function load() {
    const [{ data, error }, overviewData] = await Promise.all([
      supabase.from("tracking_links").select("*").order("created_at", { ascending: false }),
      getOverview()
    ]);
    const rows = (error ? fallbackLinks : (data as TrackingLinkRow[] ?? fallbackLinks)).map((link) => ({
      ...link,
      access_count: overviewData.campaignInsights.find((campaign) => campaign.campaign === link.campaign)?.clicks ?? link.access_count ?? 0
    }));
    setLinks(rows);
    setOverview(overviewData);
  }
  useEffect(() => { load(); }, []);

  async function saveLink(payload: Partial<TrackingLinkRow>) {
    const row = {
      name: payload.name,
      destination_url: payload.destination_url,
      source: payload.source,
      campaign: payload.campaign,
      medium: payload.medium ?? null,
      tags: payload.tags ?? [],
      status: payload.status ?? "active"
    };
    const result = editing ? await supabase.from("tracking_links").update(row).eq("id", editing.id) : await supabase.from("tracking_links").insert(row);
    if (result.error) {
      setFeedback("A tabela tracking_links ainda não está disponível no Supabase.");
      return false;
    }
    setModalOpen(false);
    setEditing(null);
    setFeedback("Link rastreável salvo.");
    await load();
    return true;
  }

  async function deleteLink() {
    if (!pendingDelete) return;
    const { error } = await supabase.from("tracking_links").delete().eq("id", pendingDelete.id);
    setPendingDelete(null);
    if (error) return setFeedback("Não foi possível excluir o link.");
    setFeedback("Link excluído.");
    await load();
  }

  return (
    <AdminLayout title="Links Rastreáveis" description="Crie URLs com source, campaign e medium para medir cada história." action={<Button onClick={() => { setEditing(null); setModalOpen(true); }}><Link2 className="h-4 w-4" /> Novo link</Button>}>
      <div className="grid gap-4 md:grid-cols-4">
        <Kpi icon={Link2} label="Links" value={links.length} helper="criados" />
        <Kpi icon={MousePointerClick} label="Acessos" value={links.reduce((sum, link) => sum + (link.access_count ?? 0), 0)} helper="por campanha" />
        <Kpi icon={Megaphone} label="Campanha líder" value={overview?.bestCampaign ?? "Sem dados"} helper="tracking" />
        <Kpi icon={Clock3} label="Melhor horário" value={overview?.campaignInsights[0]?.bestHour ?? "--"} helper="principal" />
      </div>
      <section className="mt-8 overflow-hidden rounded-lg border border-white/10 bg-card/70">
        <div className="grid border-b border-white/10 px-5 py-3 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground md:grid-cols-[1.1fr_1fr_1fr_110px_150px]">
          <span>Nome</span><span>Origem</span><span>Campanha</span><span>Acessos</span><span className="text-right">Ações</span>
        </div>
        {links.map((link) => {
          const full = buildTrackedUrl(link);
          return (
            <div key={link.id} className="grid items-center gap-3 border-b border-white/10 px-5 py-4 text-sm md:grid-cols-[1.1fr_1fr_1fr_110px_150px]">
              <div>
                <p className="font-semibold text-bunker-ice">{link.name}</p>
                <p className="mt-1 truncate font-mono text-xs text-muted-foreground">{full}</p>
              </div>
              <span className="capitalize text-muted-foreground">{link.source}</span>
              <span className="font-mono text-primary">{link.campaign}</span>
              <span className="font-mono text-bunker-ice">{link.access_count ?? 0}</span>
              <div className="flex justify-end gap-2">
                <IconButton title="Copiar link" onClick={() => copyText(full)} icon={Copy} />
                <IconButton title="QR Code" onClick={() => setFeedback(`QR Code pronto para: ${link.name}`)} icon={QrCode} />
                <IconButton title="Editar" onClick={() => { setEditing(link); setModalOpen(true); }} icon={Edit3} />
                <IconButton title="Excluir" onClick={() => setPendingDelete(link)} icon={Trash2} danger />
              </div>
            </div>
          );
        })}
      </section>
      <div className="mt-8 grid gap-5 xl:grid-cols-2">
        <CampaignPanel campaigns={overview?.campaignInsights ?? []} />
        <Panel title="QR Code e encurtador">
          <div className="grid gap-4 md:grid-cols-[160px_1fr]">
            <div className="grid aspect-square place-items-center rounded-xl border border-primary/20 bg-primary/10 text-primary"><QrCode className="h-16 w-16" /></div>
            <div>
              <p className="text-sm leading-6 text-muted-foreground">Cada link já é gerado com parâmetros rastreáveis. A tela deixa a base pronta para acoplar um encurtador próprio e QR Code real quando você quiser adicionar essa dependência.</p>
              <Button variant="outline" className="mt-4" onClick={() => copyText(`${window.location.origin}/item/slug-do-produto?source=instagram&campaign=historia-bunker-ep3`)}>Copiar exemplo</Button>
            </div>
          </div>
        </Panel>
      </div>
      {feedback ? <Feedback text={feedback} /> : null}
      <TrackingLinkModal open={modalOpen} link={editing} onClose={() => setModalOpen(false)} onSave={saveLink} />
      <ConfirmModal open={Boolean(pendingDelete)} title="Excluir link rastreável" description={`Deseja excluir ${pendingDelete?.name ?? "este link"}?`} confirmLabel="Excluir link" onCancel={() => setPendingDelete(null)} onConfirm={deleteLink} />
    </AdminLayout>
  );
}

function IntegrationsAdmin() {
  const [integrations, setIntegrations] = useState<IntegrationRow[]>(defaultIntegrations);
  const [editing, setEditing] = useState<IntegrationRow | null>(null);
  const [feedback, setFeedback] = useState("");

async function load() {
  const { data, error } = await supabase
    .from("integrations")
    .select("*")
    .order("platform");

  if (error) {
    console.error(error);
    return;
  }

  const merged = defaultIntegrations.map((defaultItem) => {
    const saved = data?.find((item) => {
      return (
        item.id === defaultItem.id ||
        item.provider === defaultItem.provider ||
        item.platform === defaultItem.platform
      );
    });

    if (!saved) {
      return defaultItem;
    }

    return {
      ...defaultItem,
      id: saved.id ?? defaultItem.id,
      name: saved.name ?? saved.platform ?? defaultItem.platform,
      provider: saved.provider ?? defaultItem.provider ?? defaultItem.id,
      platform: saved.platform ?? defaultItem.platform,
      description: saved.description ?? defaultItem.description,
      status: saved.status ?? defaultItem.status,
      config: normalizeConfig(saved.config),
      last_tested_at: saved.last_tested_at ?? null,
      last_sync_at: saved.last_sync_at ?? defaultItem.last_sync_at,
    };
  });

  setIntegrations(merged as IntegrationRow[]);
}

  async function saveIntegration(integration: IntegrationRow, patch: Partial<IntegrationRow> = {}) {
    const next: IntegrationRow = { ...integration, ...patch };
    const { error } = await supabase.from("integrations").upsert({
      id: next.id,
      name: next.name ?? next.platform,
      provider: next.provider ?? next.id,
      platform: next.platform,
      description: next.description,
      config: next.config ?? {},
      status: next.status,
      last_tested_at: next.last_tested_at ?? null,
      last_sync_at: next.status === "connected" ? (next.last_sync_at ?? new Date().toISOString()) : next.last_sync_at
    });
    if (error) {
      setFeedback("Não foi possível salvar a integração. Aplique o schema atualizado e verifique as policies.");
      return false;
    }
    setFeedback("Integração salva com segurança.");
    setEditing(null);
    await load();
    return true;
  }

  async function testIntegration(integration: IntegrationRow) {
    const ok = integrationStatusReady(integration);
    const payload = {
      integration_id: integration.id,
      event_type: "connection.test",
      payload: { provider: integration.provider ?? integration.id, masked_config: maskConfig(integration.config ?? {}) },
      status: ok ? "success" : "error",
      response: ok ? "Configuração mínima encontrada." : "Dados obrigatórios ausentes."
    };
    await supabase.from("integration_events").insert(payload);
    await saveIntegration(integration, { last_tested_at: new Date().toISOString(), status: ok ? "connected" : "disconnected" });
    setFeedback(ok ? `Teste de ${integration.platform} registrado com sucesso.` : `Configure os campos obrigatórios de ${integration.platform}.`);
  }

  return (
    <AdminLayout title="Integrações" description="Configure pixels, analytics, bots, webhooks, Supabase e Vercel com persistência no Supabase." action={<Button variant="outline" onClick={() => integrations.forEach((integration) => testIntegration(integration))}><Webhook className="h-4 w-4" /> Testar todas</Button>}>
      <div className="grid gap-4 md:grid-cols-3">
        <Kpi icon={Plug} label="Integrações" value={integrations.length} helper="disponíveis" />
        <Kpi icon={CheckCircle2} label="Conectadas" value={integrations.filter((item) => item.status === "connected").length} helper="ativas" />
        <Kpi icon={Database} label="Infra" value="Supabase + Vercel" helper="base operacional" />
      </div>
      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {integrations.map((integration) => (
          <article key={integration.id} className="rounded-xl border border-white/10 bg-card/70 p-5 transition hover:-translate-y-1 hover:border-primary/35">
            <div className="flex items-start justify-between gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-xl border border-primary/20 bg-primary/10 text-primary">{integrationIcon(integration.platform)}</div>
              <ModuleStatus status={integration.status} />
            </div>
            <h3 className="mt-5 text-xl font-black text-bunker-ice">{integration.platform}</h3>
            <p className="mt-2 min-h-12 text-sm leading-6 text-muted-foreground">{integration.description}</p>
            <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Última sincronização: {integration.last_sync_at ? formatDate(integration.last_sync_at) : "nunca"}</p>
            <IntegrationConfigPreview config={integration.config ?? {}} />
            <div className="mt-5 flex gap-2">
              <Button className="flex-1" variant={integration.status === "connected" ? "outline" : "default"} onClick={() => saveIntegration(integration, { status: integration.status === "connected" ? "disconnected" : "connected" })}>
                {integration.status === "connected" ? "Desconectar" : "Conectar"}
              </Button>
              <Button variant="outline" onClick={() => setEditing(integration)}>Configurar</Button>
              <Button variant="outline" onClick={() => testIntegration(integration)}>Testar</Button>
            </div>
          </article>
        ))}
      </div>
      {feedback ? <Feedback text={feedback} /> : null}
      <IntegrationModal open={Boolean(editing)} integration={editing} onClose={() => setEditing(null)} onSave={saveIntegration} />
    </AdminLayout>
  );
}

function IntegrationConfigPreview({ config }: { config: Record<string, string> }) {
  const entries = Object.entries(config).filter(([, value]) => value);
  if (!entries.length) return <p className="mt-4 text-xs text-muted-foreground">Nenhuma configuração salva.</p>;
  return (
    <div className="mt-4 space-y-1">
      {entries.slice(0, 3).map(([key, value]) => (
        <p key={key} className="truncate font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">{key}: {maskSecret(value)}</p>
      ))}
    </div>
  );
}

function IntegrationModal({ open, integration, onClose, onSave }: { open: boolean; integration: IntegrationRow | null; onClose: () => void; onSave: (integration: IntegrationRow, patch?: Partial<IntegrationRow>) => Promise<boolean> }) {
  const [config, setConfig] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<IntegrationRow["status"]>("disconnected");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!integration || !open) return;
    setConfig(integration.config ?? {});
    setStatus(integration.status);
  }, [integration, open]);

  if (!open || !integration) return null;
  const fields = integrationFields(integration);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!integration) return;
    setSaving(true);
    await onSave(integration, { config, status, last_sync_at: status === "connected" ? new Date().toISOString() : integration.last_sync_at });
    setSaving(false);
  }

  return (
    <CenterModal open={open} title={`Configurar ${integration.platform}`} description="Tokens ficam restritos ao painel protegido. Use variáveis de ambiente para produção quando o provedor exigir segredo de servidor." onClose={onClose}>
      <form onSubmit={submit} className="grid gap-4 p-5 md:grid-cols-2">
        <div><Label>Status</Label><Select value={status} onChange={(value) => setStatus(value as IntegrationRow["status"])} options={[["connected", "Conectado"], ["disconnected", "Desconectado"], ["paused", "Pausado"]]} /></div>
        <div><Label>Provider</Label><Input value={integration.provider ?? integration.id} disabled className="mt-2" /></div>
        {fields.map((field) => (
          <div key={field.key} className={field.secret ? "" : "md:col-span-2"}>
            <Label>{field.label}</Label>
            <Input type={field.secret ? "password" : "text"} value={config[field.key] ?? ""} onChange={(event) => setConfig({ ...config, [field.key]: event.target.value })} placeholder={field.placeholder} className="mt-2" />
          </div>
        ))}
        <div className="rounded-lg border border-primary/20 bg-primary/10 p-4 text-xs leading-6 text-primary md:col-span-2">
          Eventos suportados: PageView, ViewContent, ClickAffiliateProduct, product.clicked, campaign.spike, report.generated.
        </div>
        <div className="flex justify-end gap-3 md:col-span-2"><Button type="button" variant="outline" onClick={onClose}>Cancelar</Button><Button type="submit" disabled={saving}>{saving ? "Salvando..." : "Salvar integração"}</Button></div>
      </form>
    </CenterModal>
  );
}

function integrationFields(integration: IntegrationRow) {
  const id = (integration.provider ?? integration.id).toLowerCase();
  if (id.includes("ga")) return [{ key: "measurement_id", label: "Measurement ID", placeholder: "G-XXXXXXXXXX" }, { key: "api_secret", label: "API Secret", placeholder: "Opcional", secret: true }];
  if (id.includes("pixel") || id.includes("meta")) return [{ key: "pixel_id", label: "Pixel ID", placeholder: "123456789" }, { key: "access_token", label: "Access Token", placeholder: "Opcional", secret: true }];
  if (id.includes("tiktok")) return [{ key: "pixel_id", label: "Pixel ID", placeholder: "CXXXXXXXX" }, { key: "access_token", label: "Access Token", placeholder: "Opcional", secret: true }];
  if (id.includes("telegram")) return [{ key: "bot_token", label: "Bot Token", placeholder: "000:token", secret: true }, { key: "chat_id", label: "Chat ID", placeholder: "-100..." }];
  if (id.includes("discord")) return [{ key: "webhook_url", label: "Webhook URL", placeholder: "https://discord.com/api/webhooks/...", secret: true }];
  if (id.includes("webhook")) return [{ key: "webhook_url", label: "URL", placeholder: "https://..." }, { key: "event", label: "Evento", placeholder: "product.clicked" }, { key: "secret", label: "Secret/Token", placeholder: "Opcional", secret: true }];
  if (id.includes("vercel")) return [{ key: "domain", label: "Domínio público", placeholder: "https://site.com" }, { key: "environment", label: "Ambiente", placeholder: "production" }];
  if (id.includes("supabase")) return [{ key: "project_url", label: "URL do projeto", placeholder: "https://..." }, { key: "environment", label: "Ambiente", placeholder: "production" }];
  return [{ key: "public_id", label: "ID público", placeholder: "Identificador" }, { key: "token", label: "Token", placeholder: "Opcional", secret: true }];
}

function normalizeConfig(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object") return {};
  return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, String(item ?? "")]));
}

function maskConfig(config: Record<string, string>) {
  return Object.fromEntries(Object.entries(config).map(([key, value]) => [key, maskSecret(value)]));
}

function maskSecret(value: string) {
  if (!value) return "";
  if (value.length <= 4) return "••••";
  return `••••••••••${value.slice(-4)}`;
}

function integrationStatusReady(integration: IntegrationRow) {
  const config = integration.config ?? {};
  const fields = integrationFields(integration);
  return fields.filter((field) => !field.placeholder?.includes("Opcional")).every((field) => Boolean(config[field.key]));
}

function IntelligenceAdmin() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [clicks, setClicks] = useState<IntelligenceClick[]>([]);
  const [trackingLinks, setTrackingLinks] = useState<TrackingLinkRow[]>([]);
  const [mode, setMode] = useState("bunker");

  useEffect(() => {
    Promise.all([getOverview({ range: "30d" }), getAdminProducts(), getIntelligenceClicks(), getTrackingLinksForIntelligence()]).then(([overviewData, productList, clickRows, links]) => {
      setOverview(overviewData);
      setProducts(productList);
      setClicks(clickRows);
      setTrackingLinks(links);
    });
  }, []);

  if (!overview) return <AdminLayout title="Inteligência IA" description="Inicializando central estratégica..."><LoadingBlock /></AdminLayout>;

  const hasRealData = clicks.length > 0;
  const campaigns = buildRealCampaigns(clicks, trackingLinks);
  const insights = buildAiInsights(overview, products, clicks);
  const peakHour = peakHourFromClicks(clicks);

  return (
    <AdminLayout title="Inteligência IA" description="Campanhas por história, heatmap, rankings, feed em tempo real e recomendações automáticas." action={<Select value={mode} onChange={setMode} options={[["normal", "Normal"], ["bunker", "Bunker"], ["terminal", "Terminal hacker"], ["militar", "Militar"]]} />}>
      {!hasRealData ? <div className="mb-6 rounded-lg border border-bunker-amber/25 bg-bunker-amber/10 p-4 text-sm text-bunker-amber">Dados insuficientes para gerar insights reais.</div> : null}
      <section className={`rounded-2xl border p-6 shadow-[0_0_70px_rgba(74,222,128,0.08)] ${mode === "terminal" ? "border-primary/30 bg-black" : "border-white/10 bg-card/70"}`}>
        <div className="grid gap-5 md:grid-cols-4">
          <Kpi icon={Sparkles} label="Insight principal" value={insights[0]?.title ?? "Sem dados"} helper="IA operacional" />
          <Kpi icon={Megaphone} label="Campanha líder" value={overview.bestCampaign} helper="história em destaque" />
          <Kpi icon={Clock3} label="Horário forte" value={peakHour ?? "--"} helper="pico detectado" />
          <Kpi icon={Globe2} label="Plataforma" value={overview.mainPlatform} helper="origem principal" />
        </div>
      </section>

      <div className="mt-8 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <Panel title="Campanhas por história">
          <div className="grid gap-4 lg:grid-cols-2">
            {campaigns.length ? campaigns.map((campaign) => (
              <article key={campaign.slug} className="rounded-xl border border-white/10 bg-black/25 p-4 transition hover:border-primary/35">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">{campaign.platform}</p>
                    <h3 className="mt-2 text-xl font-black text-bunker-ice">{campaign.name}</h3>
                  </div>
                  <span className="font-mono text-primary">{campaign.clicks} cliques</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{campaign.description}</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <MiniMetric label="Pico" value={campaign.bestHour} />
                  <MiniMetric label="Dispositivo" value={campaign.device} />
                  <MiniMetric label="Links" value={campaign.links} />
                </div>
              </article>
            )) : <Empty text="Nenhuma campanha real detectada em clicks ou links rastreáveis." />}
          </div>
        </Panel>
        <Panel title="Painel de inteligência IA">
          <div className="space-y-3">
            {insights.map((insight) => (
              <div key={insight.title} className="rounded-lg border border-primary/15 bg-primary/[0.055] p-4">
                <p className="font-semibold text-bunker-ice">{insight.title}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{insight.text}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="mt-8 grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <Panel title="Heatmap de horários">
          <HeatmapGrid clicks={clicks} />
        </Panel>
        <Panel title="Mapa mundial de acessos">
          <WorldAccessMap clicks={clicks} />
        </Panel>
      </div>

      <div className="mt-8 grid gap-5 xl:grid-cols-3">
        <Panel title="Rankings">
          <RankingList title="Produtos" rows={overview.topProducts.map((item) => [item.name, item.clicks])} />
          <RankingList title="Campanhas" rows={overview.campaignInsights.map((item) => [item.campaign, item.clicks])} />
        </Panel>
        <Panel title="Analytics individual de produto">
          <div className="space-y-3">
            {overview.topProducts.slice(0, 5).map((product) => (
              <div key={product.id} className="rounded-lg border border-white/10 bg-black/25 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-bunker-ice">{product.name}</p>
                  <span className="font-mono text-primary">{product.clicks}</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-primary" style={{ width: `${Math.min(product.share, 100)}%` }} /></div>
                <p className="mt-2 text-xs text-muted-foreground">Origem principal: {product.mainSource} • Categoria: {product.category}</p>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Feed em tempo real">
          <RealtimeTerminal overview={overview} clicks={clicks} />
        </Panel>
      </div>

      <div className="mt-8 grid gap-5 xl:grid-cols-2">
        <Panel title="Banners dinâmicos e anúncios internos">
          <div className="grid gap-3 sm:grid-cols-2">
            {["Banner por horário", "Banner por campanha", "Banner por coleção", "Promoção interna"].map((item) => (
              <div key={item} className="rounded-lg border border-white/10 bg-black/25 p-4">
                <p className="font-semibold text-bunker-ice">{item}</p>
                <p className="mt-2 text-sm text-muted-foreground">Regra pronta para segmentar chamadas visuais no painel de banners.</p>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Pixels e eventos">
          <div className="grid gap-3 sm:grid-cols-3">
            {["Meta Pixel", "TikTok Pixel", "Google Analytics"].map((pixel) => (
              <div key={pixel} className="rounded-lg border border-primary/15 bg-primary/[0.055] p-4">
                <p className="font-semibold text-bunker-ice">{pixel}</p>
                <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.16em] text-primary">evento: affiliate_click</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="mt-8 grid gap-5 xl:grid-cols-2">
        <Panel title="Tags inteligentes">
          <BarBox data={tagAnalytics(products)} keyName="tag" valueKey="value" color="#4ADE80" />
        </Panel>
        <Panel title="Coleções automáticas">
          <div className="grid gap-3 sm:grid-cols-2">
            {automaticCollections(products).map((collection) => (
              <div key={collection.name} className="rounded-lg border border-white/10 bg-black/25 p-4">
                <p className="font-semibold text-bunker-ice">{collection.name}</p>
                <p className="mt-2 text-sm text-muted-foreground">{collection.count} produtos detectados por tags e categoria.</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </AdminLayout>
  );
}

function StoriesAdmin() {
  const [stories, setStories] = useState<Array<{ id: string; title: string; slug: string; description: string | null; status: string; created_at: string }>>([]);
  const [campaigns, setCampaigns] = useState<Array<{ id: string; name: string; slug: string; platform: string | null; status: string; created_at: string }>>([]);
  const [feedback, setFeedback] = useState("");
  const [storyPrompt, setStoryPrompt] = useState("Homem preso em bunker após colapso mundial");
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      supabase.from("stories").select("id,title,slug,description,status,created_at").order("created_at", { ascending: false }),
      supabase.from("story_campaigns").select("id,name,slug,platform,status,created_at").order("created_at", { ascending: false })
    ]).then(([storyRes, campaignRes]) => {
      if (!storyRes.error) setStories(storyRes.data ?? []);
      if (!campaignRes.error) setCampaigns(campaignRes.data ?? []);
      if (storyRes.error || campaignRes.error) setFeedback("Aplique o schema de histórias para gerenciar este módulo.");
    });
  }, []);

  return (
    <AdminLayout title="Arquivo das Histórias" description="Conecte histórias, episódios, campanhas e produtos relacionados.">
      <div className="grid gap-4 md:grid-cols-4">
        <Kpi icon={BookOpen} label="Histórias" value={stories.length} helper="arquivos" />
        <Kpi icon={Megaphone} label="Campanhas" value={campaigns.length} helper="storytelling" />
        <Kpi icon={CheckCircle2} label="Ativas" value={stories.filter((story) => story.status === "active").length} helper="publicadas" />
        <Kpi icon={Link2} label="Rota pública" value="/arquivo-das-historias" helper="vitrine" />
      </div>
      <div className="mt-8 grid gap-5 xl:grid-cols-2">
        <Panel title="Histórias">
          <div className="space-y-3">
            {stories.length ? stories.map((story) => (
              <div key={story.id} className="rounded-lg border border-white/10 bg-black/25 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div><p className="font-semibold text-bunker-ice">{story.title}</p><p className="mt-1 font-mono text-xs text-primary">/{story.slug}</p></div>
                  <ModuleStatus status={story.status} />
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{story.description ?? "Sem descrição."}</p>
              </div>
            )) : <Empty text="Nenhuma história cadastrada ainda." />}
          </div>
        </Panel>
        <Panel title="Campanhas por história">
          <div className="space-y-3">
            {campaigns.length ? campaigns.map((campaign) => (
              <div key={campaign.id} className="rounded-lg border border-white/10 bg-black/25 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div><p className="font-semibold text-bunker-ice">{campaign.name}</p><p className="mt-1 font-mono text-xs text-primary">{campaign.slug}</p></div>
                  <span className="text-sm text-muted-foreground">{campaign.platform ?? "Sem plataforma"}</span>
                </div>
              </div>
            )) : <Empty text="Nenhuma campanha de história cadastrada." />}
          </div>
        </Panel>
      </div>
      <Panel title="Sugestões de IA para histórias">
        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <Input value={storyPrompt} onChange={(event) => setStoryPrompt(event.target.value)} />
          <Button onClick={async () => { setAiLoading(true); const result = await callAi("story_ideas", { story: storyPrompt }); setAiLoading(false); setAiSuggestion(result.ok ? result.text : (result.error ?? "Falha ao gerar sugestão.")); }} disabled={aiLoading}><Sparkles className="h-4 w-4" /> {aiLoading ? "Gerando..." : "Sugerir produtos e campanha"}</Button>
        </div>
        {aiSuggestion ? <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-slate-300">{aiSuggestion}</p> : null}
      </Panel>
      {feedback ? <Feedback text={feedback} /> : null}
    </AdminLayout>
  );
}

function AiAssistantAdmin() {
  const [question, setQuestion] = useState("Qual produto performou melhor esta semana?");
  const [history, setHistory] = useState<{ prompt: string; answer: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");

  async function ask() {
    if (!question.trim()) return;
    setLoading(true);
    const result = await callAi("admin_assistant", { question });
    setLoading(false);
    if (!result.ok) return setFeedback(result.error ?? "Não foi possível consultar a IA.");
    setHistory((current) => [{ prompt: question, answer: result.text }, ...current]);
    setQuestion("");
  }

  return (
    <AdminLayout title="Oráculo do Bunker" description="Assistente IA protegido para conteúdo, campanhas, produtos e analytics reais.">
      <section className="relative overflow-hidden rounded-2xl border border-primary/20 bg-[#030504] p-6 shadow-glow">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(74,222,128,0.18),transparent_30%)]" />
        <div className="relative grid gap-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-primary">Protocolo IA</p>
          <Textarea value={question} onChange={(event) => setQuestion(event.target.value)} className="min-h-32" placeholder="Pergunte: qual produto devo destacar? qual campanha está fraca? gere ideias de história..." />
          <div className="flex flex-wrap gap-3">
            <Button onClick={ask} disabled={loading}><Sparkles className="h-4 w-4" /> {loading ? "Consultando..." : "Perguntar à IA"}</Button>
            <Button variant="outline" onClick={() => setQuestion("Gere ideias de histórias com base nos produtos cadastrados.")}>Ideias de histórias</Button>
            <Button variant="outline" onClick={() => setQuestion("Analise os dados reais e recomende próximas ações.")}>Analisar dados</Button>
          </div>
        </div>
      </section>
      <div className="mt-8 grid gap-4">
        {history.map((item, index) => (
          <article key={`${item.prompt}-${index}`} className="rounded-xl border border-white/10 bg-card/70 p-5">
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-primary">{item.prompt}</p>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-300">{item.answer}</p>
            <div className="mt-4 flex gap-2"><Button variant="outline" size="sm" onClick={() => copyText(item.answer)}><Copy className="h-4 w-4" /> Copiar</Button><Button variant="outline" size="sm" onClick={() => setQuestion(item.prompt)}>Regenerar</Button></div>
          </article>
        ))}
      </div>
      {feedback ? <Feedback text={feedback} /> : null}
    </AdminLayout>
  );
}

function HelpCenterAdmin() {
  const [query, setQuery] = useState("");
  const modules = [
    {
      icon: LayoutDashboard,
      title: "Dashboard",
      label: "Comando central",
      description: "Mostra a saúde geral da operação: cliques, produtos ativos, campanhas, aplicações, dispositivos e sinais de crescimento.",
      bullets: ["Acompanhe métricas principais", "Veja campanhas e produtos líderes", "Identifique picos de tráfego"]
    },
    {
      icon: Boxes,
      title: "Produtos",
      label: "Arsenal da vitrine",
      description: "Central para cadastrar, editar e organizar os itens afiliados exibidos na loja pública.",
      bullets: ["Defina link afiliado e imagem", "Ative, pause ou destaque produtos", "Use tags e seções narrativas"]
    },
    {
      icon: Tags,
      title: "Categorias",
      label: "Navegação",
      description: "Agrupa os produtos por setores como sobrevivência, energia, comunicação, lanternas e gadgets.",
      bullets: ["Melhora a organização visual", "Ajuda o visitante a explorar", "Mantém a vitrine escalável"]
    },
    {
      icon: Layers3,
      title: "Coleções",
      label: "Arquivos temáticos",
      description: "Cria agrupamentos cinematográficos, como Equipamentos Proibidos, Kit Sobrevivência ou Tecnologia Perdida.",
      bullets: ["Monte coleções especiais", "Destaque narrativas na home", "Ordene produtos manualmente"]
    },
    {
      icon: TicketPercent,
      title: "Cupons",
      label: "Promoções",
      description: "Gerencia códigos promocionais para campanhas, lançamentos e ativações com parceiros.",
      bullets: ["Crie percentual ou valor fixo", "Defina validade e limite", "Copie códigos rapidamente"]
    },
    {
      icon: ImageIcon,
      title: "Banners",
      label: "Campanhas visuais",
      description: "Controla os destaques da homepage, chamadas promocionais e blocos de impacto visual.",
      bullets: ["Troque imagem e CTA", "Ative campanhas sazonais", "Direcione para arsenal ou produto"]
    },
    {
      icon: BarChart3,
      title: "Analytics",
      label: "Inteligência de tráfego",
      description: "Revela de onde vêm os acessos, quais aplicações são usadas e quais campanhas convertem melhor.",
      bullets: ["Analise origem e campanha", "Veja browser e dispositivo", "Compare crescimento por período"]
    },
    {
      icon: Link2,
      title: "Links Rastreáveis",
      label: "UTM e campanhas",
      description: "Gera links personalizados para Reels, Stories, TikTok e Shorts com source, campaign e medium.",
      bullets: ["Use ?source=instagram", "Use ?campaign=historia-bunker-ep3", "Copie links por campanha"]
    },
    {
      icon: FileBarChart,
      title: "Relatórios",
      label: "Exportação",
      description: "Transforma dados do painel em relatórios visuais e arquivos CSV para análise externa.",
      bullets: ["Exporte dados", "Compare campanhas", "Acompanhe crescimento"]
    },
    {
      icon: Users,
      title: "Usuários",
      label: "Permissões",
      description: "Organiza perfis administrativos, funções e níveis de acesso para proteger a operação.",
      bullets: ["Admin controla tudo", "Editor gerencia conteúdo", "Analista acompanha dados"]
    },
    {
      icon: Plug,
      title: "Integrações",
      label: "Ecossistema",
      description: "Prepara conexões com Instagram, TikTok, Meta Pixel, Google Analytics, Webhooks, Supabase e Vercel.",
      bullets: ["Conecte plataformas", "Teste webhooks", "Planeje automações futuras"]
    },
    {
      icon: BookOpen,
      title: "Arquivo das Histórias",
      label: "Storytelling",
      description: "Conecta histórias, episódios, campanhas, links rastreáveis e produtos utilizados em cada narrativa.",
      bullets: ["Organize episódios", "Relacione produtos", "Acompanhe campanhas por história"]
    },
    {
      icon: Sparkles,
      title: "Inteligência IA",
      label: "Insights reais",
      description: "Gera interpretações usando clicks, produtos, categorias, campanhas, links rastreáveis e coleções existentes.",
      bullets: ["Não inventa métricas", "Exibe dados insuficientes quando necessário", "Mostra heatmap, mapa, rankings e feed"]
    },
    {
      icon: SettingsIcon,
      title: "Configurações",
      label: "Controle geral",
      description: "Central para ajustar comportamento da vitrine, tracking, analytics, aparência, segurança, integrações e sistema.",
      bullets: ["Configure tracking invisível", "Defina tema e glow", "Teste banco e limpe cache"]
    },
    {
      icon: Globe2,
      title: "Mapa e Heatmap",
      label: "Leitura operacional",
      description: "Mapa de acessos e heatmap só aparecem com dados reais de localização e horários salvos nos cliques.",
      bullets: ["Países e cidades", "Horários de pico", "Dias mais fortes"]
    },
    {
      icon: Bookmark,
      title: "Favoritos e Short Links",
      label: "Vitrine pública",
      description: "Visitantes podem salvar arsenal localmente e acessar rotas curtas como /go/x9 ou /ap/radio.",
      bullets: ["Arsenal salvo", "URLs curtas", "SEO automático por página"]
    },
    {
      icon: Cpu,
      title: "Oráculo do Bunker",
      label: "IA segura",
      description: "Assistente IA protegido por API serverless, com chave configurada em Configurações e logs de uso.",
      bullets: ["Configure API Key mascarada", "Gere produtos, banners e relatórios", "Analise apenas dados reais"]
    }
  ];
  const filteredModules = modules.filter((module) => `${module.title} ${module.description} ${module.bullets.join(" ")}`.toLowerCase().includes(query.toLowerCase()));

  const faqs = [
    ["Como funciona o tracking?", "Quando o visitante clica em um item, o sistema registra produto, origem, campanha, aplicação, dispositivo, navegador e data, depois redireciona para o link afiliado."],
    ["O usuário vê os cliques?", "Não. O tracking é silencioso e não exibe mensagem pública de clique registrado."],
    ["Como identificar de onde veio o acesso?", "Use links com parâmetros como source e campaign. O painel também tenta detectar referrer, aplicativo, navegador e dispositivo."],
    ["Como criar campanhas?", "Crie um link rastreável para cada Reel, Story, TikTok ou Short. Assim cada conteúdo ganha uma campanha própria no dashboard."],
    ["Como destacar produtos?", "No módulo Produtos, marque o item como destaque ou use uma seção narrativa como Mais usados nas histórias, Equipamento proibido ou Escolha dos sobreviventes."],
    ["Como funcionam as coleções?", "Coleções agrupam produtos por tema e ajudam a criar blocos cinematográficos para páginas, campanhas e vitrines futuras."],
    ["Como analisar os dados?", "Observe origem, campanha, produto mais clicado, dispositivo principal e horários. Esses sinais mostram quais histórias e canais geram tráfego de melhor qualidade."]
  ];

  const tips = [
    ["Campanhas separadas", "Use uma campaign diferente para cada Reel, Story ou Shorts."],
    ["Coleções temáticas", "Crie arquivos como Kit Bunker, Zona Segura e Laboratório Secreto."],
    ["Rotina semanal", "Compare 7 e 30 dias para entender tendências reais."],
    ["Links de bio", "Use source=instagram e medium=bio para separar bio de Stories."],
    ["Produtos narrativos", "Priorize itens que aparecem nas histórias e cenas de sobrevivência."],
    ["UTM consistente", "Mantenha nomes curtos e padronizados, como ep5-radio-militar."]
  ];

  const flow = [
    ["Instagram Reel", "O conteúdo desperta interesse e leva o público até o link."],
    ["Usuário acessa", "A vitrine abre com parâmetros de campanha na URL."],
    ["Sistema identifica", "São detectados source, campaign, referrer, application, device e browser."],
    ["Clique registrado", "O clique no equipamento é salvo na tabela clicks."],
    ["Dashboard atualiza", "Os dados aparecem nos gráficos e relatórios administrativos."]
  ];

  return (
    <AdminLayout title="Central de Ajuda" description="Documentação interna para operar a plataforma com clareza.">
      <section className="relative overflow-hidden rounded-2xl border border-primary/20 bg-[#050807] p-6 shadow-[0_0_70px_rgba(74,222,128,0.08)] md:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(74,222,128,0.16),transparent_28%),radial-gradient(circle_at_84%_18%,rgba(127,29,29,0.18),transparent_34%)]" />
        <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,.35)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.35)_1px,transparent_1px)] [background-size:38px_38px]" />
        <div className="relative grid gap-8 lg:grid-cols-[1fr_360px] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.22em] text-primary">
              <BookOpen className="h-4 w-4" /> Manual do Bunker
            </div>
            <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-tight text-bunker-ice md:text-6xl">Central de Controle do Sistema</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">Entenda como funciona cada funcionalidade da plataforma de afiliados e analytics.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/35 p-5 backdrop-blur">
            <div className="grid h-16 w-16 place-items-center rounded-2xl border border-primary/25 bg-primary/10 text-primary shadow-glow"><Info className="h-7 w-7" /></div>
            <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.22em] text-primary">Sistema operacional</p>
            <p className="mt-2 text-2xl font-black text-bunker-ice">Afiliados + tráfego + inteligência</p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">Use esta página como onboarding do administrador e como mapa de decisão para campanhas.</p>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
        <Panel title="Resumo do sistema">
          <p className="text-sm leading-7 text-muted-foreground">O sistema funciona como uma plataforma de afiliados e inteligência de tráfego, permitindo gerenciar produtos, rastrear acessos, criar campanhas e analisar o comportamento dos visitantes vindos das redes sociais.</p>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <MiniMetric label="Vitrine" value="Produtos afiliados" />
            <MiniMetric label="Tracking" value="Cliques e origem" />
            <MiniMetric label="Admin" value="Gestão premium" />
          </div>
        </Panel>
        <Panel title="Fluxo do sistema">
          <div className="grid gap-3 md:grid-cols-5">
            {flow.map(([title, text], index) => (
              <div key={title} className="relative rounded-lg border border-white/10 bg-black/25 p-4">
                <span className="font-mono text-xs text-primary">0{index + 1}</span>
                <h3 className="mt-3 font-bold text-bunker-ice">{title}</h3>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </Panel>
      </section>

      <section className="mt-8">
        <Heading eyebrow="Módulos" title="Como cada área funciona" description="Cards rápidos para entender o propósito de cada módulo administrativo." />
        <div className="mb-6 max-w-xl">
          <div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar na Central de Ajuda..." className="pl-10" /></div>
        </div>
        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredModules.map((module) => <HelpModuleCard key={module.title} {...module} />)}
        </div>
      </section>

      <section className="mt-8 grid gap-5 xl:grid-cols-[1fr_0.85fr]">
        <Panel title="Como o tracking funciona">
          <div className="space-y-4">
            {["source: identifica a plataforma, como instagram ou tiktok.", "campaign: separa cada Reel, Story, Short ou episódio.", "referrer: mostra a página ou aplicativo de origem quando disponível.", "application: tenta detectar Instagram App, TikTok, Chrome, Safari e outros.", "device e browser: ajudam a entender o comportamento por celular, desktop e navegador."].map((item) => (
              <div key={item} className="rounded-lg border border-primary/15 bg-primary/[0.055] p-4 font-mono text-xs leading-6 text-primary">{item}</div>
            ))}
          </div>
        </Panel>
        <Panel title="Como usar campanhas">
          <p className="text-sm leading-7 text-muted-foreground">Crie um link diferente para cada conteúdo publicado. Assim você descobre qual história, plataforma e formato gera mais cliques afiliados.</p>
          <div className="mt-5 rounded-lg border border-white/10 bg-black/35 p-4 font-mono text-xs leading-6 text-primary">https://site.com/item/radio?source=instagram&campaign=ep5</div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <MiniMetric label="Reels" value="source=instagram" />
            <MiniMetric label="Stories" value="medium=stories" />
            <MiniMetric label="TikTok" value="source=tiktok" />
            <MiniMetric label="Shorts" value="source=youtube" />
          </div>
        </Panel>
      </section>

      <section className="mt-8 grid gap-5 xl:grid-cols-3">
        <Panel title="Primeiros passos">
          <div className="space-y-3 text-sm leading-6 text-muted-foreground">
            <p>1. Cadastre categorias e produtos com imagem, tags e link afiliado.</p>
            <p>2. Crie links rastreáveis para cada Reel, Story ou Short.</p>
            <p>3. Publique a URL curta ou rastreável nas redes sociais.</p>
            <p>4. Analise Analytics e Inteligência IA após acumular cliques reais.</p>
          </div>
        </Panel>
        <Panel title="Como conectar integrações">
          <div className="space-y-3 text-sm leading-6 text-muted-foreground">
            <p>Acesse Integrações, abra Configurar, informe os IDs públicos e tokens quando necessário.</p>
            <p>Tokens sensíveis aparecem mascarados no painel e só são visíveis para administradores autenticados.</p>
            <p>Use Testar para registrar um evento em integration_events.</p>
          </div>
        </Panel>
        <Panel title="Como interpretar a Inteligência IA">
          <div className="space-y-3 text-sm leading-6 text-muted-foreground">
            <p>Os insights só usam dados reais de clicks, products, categories, tracking_links e campanhas.</p>
            <p>Sem volume suficiente, o painel mostra dados insuficientes em vez de inventar números.</p>
            <p>Use origem, horário, campanha e produto líder para decidir próximos conteúdos.</p>
          </div>
        </Panel>
      </section>

      <section className="mt-8 grid gap-5 xl:grid-cols-3">
        <Panel title="Como configurar a IA">
          <p className="text-sm leading-7 text-muted-foreground">Acesse Configurações, abra Inteligência IA, escolha OpenAI ou OpenRouter, informe modelo, API Key, limite diário, temperatura e idioma. A chave é mascarada e as chamadas passam por `/api/ai`.</p>
        </Panel>
        <Panel title="Onde usar IA">
          <p className="text-sm leading-7 text-muted-foreground">Produtos geram descrições e tags, Banners geram copy, Relatórios resumem dados, Histórias recebem ideias e o Oráculo responde perguntas do admin.</p>
        </Panel>
        <Panel title="Cuidados com custos">
          <p className="text-sm leading-7 text-muted-foreground">Defina limite diário, teste conexão antes de usar e revise respostas antes de aplicar. A IA nunca deve inventar métricas quando os dados reais forem insuficientes.</p>
        </Panel>
      </section>

      <section className="mt-8 grid gap-5 xl:grid-cols-2">
        <Panel title="Perguntas frequentes">
          <div className="space-y-3">
            {faqs.map(([question, answer]) => (
              <details key={question} className="group rounded-lg border border-white/10 bg-black/25 p-4">
                <summary className="cursor-pointer font-semibold text-bunker-ice transition group-open:text-primary">{question}</summary>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{answer}</p>
              </details>
            ))}
          </div>
        </Panel>
        <Panel title="Dicas de uso">
          <div className="grid gap-3 sm:grid-cols-2">
            {tips.map(([title, text]) => (
              <div key={title} className="rounded-lg border border-white/10 bg-black/25 p-4 transition hover:border-primary/35 hover:bg-primary/[0.055]">
                <p className="font-semibold text-bunker-ice">{title}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </Panel>
      </section>

      <section className="mt-8 rounded-xl border border-white/10 bg-card/70 p-5">
        <Heading eyebrow="Futuro" title="Tutoriais e evolução" description="Espaço reservado para vídeos, onboarding guiado, changelog e documentação técnica." />
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {["Vídeos tutoriais", "Onboarding", "Documentação futura", "Changelog"].map((item) => (
            <div key={item} className="grid min-h-32 place-items-center rounded-lg border border-dashed border-white/15 bg-black/25 p-5 text-center">
              <div><BookOpen className="mx-auto h-6 w-6 text-primary" /><p className="mt-3 text-sm font-semibold text-bunker-ice">{item}</p></div>
            </div>
          ))}
        </div>
      </section>
    </AdminLayout>
  );
}

function HelpModuleCard({ icon: Icon, title, label, description, bullets }: { icon: typeof Activity; title: string; label: string; description: string; bullets: string[] }) {
  return (
    <article className="group rounded-xl border border-white/10 bg-card/70 p-5 shadow-insetPanel transition-all hover:-translate-y-1 hover:border-primary/35 hover:bg-primary/[0.055]">
      <div className="flex items-start justify-between gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-xl border border-primary/20 bg-primary/10 text-primary transition group-hover:shadow-glow"><Icon className="h-5 w-5" /></div>
        <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
      </div>
      <h3 className="mt-5 text-xl font-black text-bunker-ice">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
      <div className="mt-5 space-y-2">
        {bullets.map((bullet) => (
          <p key={bullet} className="flex gap-2 text-sm text-slate-300"><span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary" />{bullet}</p>
        ))}
      </div>
    </article>
  );
}

const thematicConfig = {
  zumbi: {
    eyebrow: "Zona contaminada",
    title: "Arsenal Zumbi",
    sectionTitle: "Equipamentos para travessia hostil",
    description: "Itens para fuga, patrulha, sinalização e sobrevivência em áreas de colapso biológico.",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
    terms: ["zumbi", "sobrevivência", "militar", "emergência", "lanterna"]
  },
  kit: {
    eyebrow: "Protocolo essencial",
    title: "Kit Sobrevivência",
    sectionTitle: "Primeiros itens do sobrevivente",
    description: "Curadoria automática para abrigo, energia, comunicação, iluminação e evacuação.",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=80",
    terms: ["sobrevivência", "emergência", "mochila", "energia", "comunicação"]
  },
  secretos: {
    eyebrow: "Laboratório selado",
    title: "Equipamentos Secretos",
    sectionTitle: "Tecnologia perdida e arquivos restritos",
    description: "Gadgets, itens misteriosos e equipamentos de laboratório para narrativas de suspense.",
    image: "https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?auto=format&fit=crop&w=1600&q=80",
    terms: ["gadget", "tecnologia", "laboratório", "misterioso", "secreto"]
  },
  bunker: {
    eyebrow: "Arquivo subterrâneo",
    title: "Arquivo Bunker",
    sectionTitle: "Itens para abrigo e comunicação",
    description: "Produtos para manter um bunker operacional durante o colapso mundial.",
    image: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1600&q=80",
    terms: ["bunker", "rádio", "energia", "comunicação", "militar"]
  },
  proibidos: {
    eyebrow: "Acesso restrito",
    title: "Itens Proibidos",
    sectionTitle: "Equipamentos de alto risco",
    description: "Itens agressivos, raros ou suspeitos para campanhas de maior tensão narrativa.",
    image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1600&q=80",
    terms: ["proibido", "militar", "secreto", "terror", "misterioso"]
  }
};

function useSeo(title: string, description: string, image?: string | null) {
  useEffect(() => {
    document.title = `${title} | Loja do Apocalipse`;
    setMeta("description", description);
    setMeta("og:title", title, "property");
    setMeta("og:description", description, "property");
    if (image) setMeta("og:image", image, "property");
    setMeta("twitter:card", "summary_large_image");
  }, [description, image, title]);
}

function setMeta(name: string, content: string, attr: "name" | "property" = "name") {
  let element = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attr, name);
    document.head.appendChild(element);
  }
  element.content = content;
}

function useSavedArsenal() {
  const [saved, setSaved] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("saved-arsenal") ?? "[]") as string[];
    } catch {
      return [];
    }
  });
  function toggle(id: string) {
    setSaved((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
      localStorage.setItem("saved-arsenal", JSON.stringify(next));
      return next;
    });
  }
  return { saved, isSaved: (id: string) => saved.includes(id), toggle };
}

function smartProductScore(product: Product, terms: string[]) {
  const haystack = [
    product.name,
    product.description,
    product.short_description,
    product.categories?.name,
    product.categories?.slug,
    ...(product.tags ?? [])
  ].filter(Boolean).join(" ").toLowerCase();
  return terms.reduce((score, term) => score + (haystack.includes(term.toLowerCase()) ? 1 : 0), 0) + (product.is_featured ? 0.25 : 0);
}

function autoRelatedProducts(product: Product, products: Product[]) {
  const terms = [product.categories?.slug, product.categories?.name, ...(product.tags ?? [])].filter(Boolean).map(String);
  const related = products
    .filter((item) => item.id !== product.id)
    .map((item) => ({ item, score: smartProductScore(item, terms) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.item);
  return (related.length ? related : products.filter((item) => item.id !== product.id)).slice(0, 4);
}

function storyCampaigns(products: Product[]) {
  const groups = [
    { name: "Bunker EP1", slug: "bunker-ep1", platform: "Instagram", description: "Primeiro contato com o abrigo subterrâneo e os protocolos de emergência.", terms: ["bunker", "energia", "lanterna"] },
    { name: "Laboratório Final", slug: "laboratorio-final", platform: "TikTok", description: "Exploração de laboratório secreto, tecnologia perdida e arquivos restritos.", terms: ["laboratório", "secreto", "gadget", "misterioso"] },
    { name: "Sobrevivente Último Dia", slug: "sobrevivente-ultimo-dia", platform: "YouTube", description: "Rota de fuga, mochila, rádio e decisões finais antes do colapso.", terms: ["sobrevivência", "mochila", "rádio", "emergência"] }
  ];
  return groups.map((group) => ({
    ...group,
    products: products
      .map((product) => ({ product, score: smartProductScore(product, group.terms) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.product)
  }));
}

async function getIntelligenceClicks() {
  const { data, error } = await supabase
    .from("clicks")
    .select("id, product_id, source, campaign, referrer, application, device, browser, country, city, created_at, products(id, name, slug, categories(name, slug))")
    .order("created_at", { ascending: false })
    .limit(600);
  return error ? [] : (data as unknown as IntelligenceClick[]);
}

async function getTrackingLinksForIntelligence() {
  const { data, error } = await supabase.from("tracking_links").select("*").order("created_at", { ascending: false });
  return error ? [] : (data as TrackingLinkRow[]);
}

function buildRealCampaigns(clicks: IntelligenceClick[], links: TrackingLinkRow[]) {
  const byCampaign = rank(clicks.map((click) => click.campaign || "Sem campanha")).filter(([name]) => name !== "Sem campanha");
  return byCampaign.map(([campaign, count]) => {
    const campaignClicks = clicks.filter((click) => click.campaign === campaign);
    const linkCount = links.filter((link) => link.campaign === campaign).length;
    return {
      slug: campaign,
      name: campaign,
      platform: rank(campaignClicks.map((click) => click.source || "Direto"))[0]?.[0] ?? "Direto",
      description: `${count} cliques reais registrados para esta campanha.`,
      clicks: count,
      bestHour: peakHourFromClicks(campaignClicks) ?? "--",
      device: rank(campaignClicks.map((click) => click.device || "Desconhecido"))[0]?.[0] ?? "Desconhecido",
      links: linkCount
    };
  });
}

function peakHourFromClicks(clicks: IntelligenceClick[]) {
  return rank(clicks.map((click) => `${new Date(click.created_at).getHours().toString().padStart(2, "0")}:00`))[0]?.[0] ?? null;
}

function rank(values: string[]) {
  const counts = values.reduce<Record<string, number>>((acc, value) => {
    const key = value || "Sem dados";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts).sort((a, b) => b[1] - a[1]);
}

function buildAiInsights(overview: Overview, products: Product[], clicks: IntelligenceClick[]) {
  if (!clicks.length) return [{ title: "Dados insuficientes", text: "Dados insuficientes para gerar insights reais." }];
  const topSource = rank(clicks.map((click) => click.source || "Direto"))[0];
  const topCampaign = rank(clicks.map((click) => click.campaign || "Sem campanha"))[0];
  const topDevice = rank(clicks.map((click) => click.device || "Desconhecido"))[0];
  const topCategory = rank(clicks.map((click) => click.products?.categories?.name || "Sem categoria"))[0];
  const hour = peakHourFromClicks(clicks);
  const total = clicks.length || 1;
  const staleProduct = products.find((product) => !clicks.some((click) => click.product_id === product.id));
  return [
    topSource ? { title: `${topSource[0]} gerou ${Math.round((topSource[1] / total) * 100)}% dos acessos`, text: `Foram ${topSource[1]} cliques reais registrados para esta origem no período consultado.` } : null,
    topCampaign && topCampaign[0] !== "Sem campanha" ? { title: `Campanha líder: ${topCampaign[0]}`, text: `A campanha acumulou ${topCampaign[1]} cliques reais. Compare com links rastreáveis antes de ampliar mídia.` } : null,
    topCategory ? { title: `${topCategory[0]} foi a categoria com melhor desempenho`, text: `A categoria concentrou ${topCategory[1]} cliques associados a produtos.` } : null,
    topDevice ? { title: `Dispositivo predominante: ${topDevice[0]}`, text: `${topDevice[1]} acessos vieram desse tipo de dispositivo.` } : null,
    hour ? { title: `Horário de pico: ${hour}`, text: "Use esse intervalo para publicar Stories, Reels e chamadas de campanha." } : null,
    overview.growth < 0 ? { title: `Queda de tráfego de ${Math.abs(overview.growth)}%`, text: "Revise campanhas recentes, links de bio e produtos sem acesso." } : null,
    staleProduct ? { title: `Produto sem acesso recente: ${staleProduct.name}`, text: "Considere trocar imagem, título, categoria ou removê-lo de campanhas principais." } : null
  ].filter(Boolean) as { title: string; text: string }[];
}

function HeatmapGrid({ clicks }: { clicks: IntelligenceClick[] }) {
  if (!clicks.length) return <Empty text="Dados insuficientes para montar heatmap real." />;
  const days = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
  const hours = ["00", "04", "08", "12", "16", "20", "23"];
  const counts = clicks.reduce<Record<string, number>>((acc, click) => {
    const date = new Date(click.created_at);
    const day = (date.getDay() + 6) % 7;
    const hour = date.getHours();
    const bucket = hour >= 23 ? "23" : String(Math.floor(hour / 4) * 4).padStart(2, "0");
    const key = `${day}-${bucket}`;
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
  const max = Math.max(...Object.values(counts), 1);
  return (
    <div className="grid gap-2">
      {days.map((day, dayIndex) => (
        <div key={day} className="grid grid-cols-[44px_repeat(7,1fr)] gap-2">
          <span className="py-2 font-mono text-xs text-muted-foreground">{day}</span>
          {hours.map((hour, hourIndex) => {
            const value = counts[`${dayIndex}-${hour}`] ?? 0;
            const opacity = value ? Math.max(value / max, 0.18) : 0.06;
            return <div key={`${day}-${hour}`} title={`${day} ${hour}:00 - ${value} cliques`} className="h-10 rounded-md border border-primary/10 bg-primary/80" style={{ opacity }} />;
          })}
        </div>
      ))}
      <div className="mt-3 flex justify-between font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground"><span>Baixo</span><span>Pico de acesso</span></div>
    </div>
  );
}

function WorldAccessMap({ clicks }: { clicks: IntelligenceClick[] }) {
  const locations = rank(clicks.map((click) => click.country || click.city || "Não identificado")).filter(([name]) => name !== "Não identificado");
  if (!locations.length) return <Empty text="Sem dados reais de país ou cidade nos cliques." />;
  const positions = ["left-[48%] top-[62%]", "left-[26%] top-[38%]", "left-[48%] top-[36%]", "left-[22%] top-[50%]", "left-[82%] top-[45%]"];
  return (
    <div className="relative min-h-80 overflow-hidden rounded-xl border border-primary/15 bg-[#030504] p-5">
      <div className="absolute inset-0 opacity-[0.14] [background-image:linear-gradient(rgba(74,222,128,.45)_1px,transparent_1px),linear-gradient(90deg,rgba(74,222,128,.45)_1px,transparent_1px)] [background-size:28px_28px]" />
      <Globe2 className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 text-primary/10" />
      {locations.slice(0, 5).map(([country, value], index) => (
        <div key={country} className={`absolute ${positions[index % positions.length]}`}>
          <span className="block h-3 w-3 rounded-full bg-primary shadow-glow" />
          <span className="mt-2 block rounded border border-white/10 bg-black/60 px-2 py-1 font-mono text-[10px] text-primary">{country} {value}</span>
        </div>
      ))}
      <p className="absolute bottom-4 left-5 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Acessos com localização • total {locations.reduce((sum, [, value]) => sum + value, 0)}</p>
    </div>
  );
}

function RankingList({ title, rows }: { title: string; rows: [string, number][] }) {
  return (
    <div className="mb-5">
      <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-primary">{title}</p>
      <div className="space-y-2">
        {rows.slice(0, 4).map(([name, value], index) => (
          <div key={`${title}-${name}`} className="flex items-center justify-between rounded-lg border border-white/10 bg-black/25 px-3 py-2 text-sm">
            <span className="text-bunker-ice">#{index + 1} {name}</span>
            <span className="font-mono text-primary">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RealtimeTerminal({ overview, clicks }: { overview: Overview; clicks: IntelligenceClick[] }) {
  const rows = clicks.slice(0, 5).map((click) => {
    const time = new Date(click.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    return `[${time}] ${click.products?.name ?? "Produto"} clicado via ${click.source || "Direto"}`;
  });
  if (!rows.length && overview.totalClicks > 0) rows.push("Clique registrado no período, mas sem feed detalhado disponível.");
  return (
    <div className="space-y-2 rounded-xl border border-primary/15 bg-black p-4 font-mono text-xs text-primary">
      {rows.length ? rows.map((row) => <p key={row}>{row}</p>) : <p>Dados insuficientes para feed em tempo real.</p>}
    </div>
  );
}

function tagAnalytics(products: Product[]) {
  const counts = products.reduce<Record<string, number>>((acc, product) => {
    (product.tags ?? [product.categories?.slug ?? "arsenal"]).forEach((tag) => {
      const key = tag || "arsenal";
      acc[key] = (acc[key] ?? 0) + 1;
    });
    return acc;
  }, {});
  return Object.entries(counts).map(([tag, value]) => ({ tag, value })).sort((a, b) => b.value - a.value).slice(0, 8);
}

function automaticCollections(products: Product[]) {
  return [
    { name: "Militar em alta", count: products.filter((product) => smartProductScore(product, ["militar", "tático"]) > 0).length },
    { name: "Energia e comunicação", count: products.filter((product) => smartProductScore(product, ["energia", "comunicação", "rádio"]) > 0).length },
    { name: "Arquivo bunker", count: products.filter((product) => smartProductScore(product, ["bunker", "sobrevivência"]) > 0).length },
    { name: "Itens misteriosos", count: products.filter((product) => smartProductScore(product, ["misterioso", "secreto", "gadget"]) > 0).length }
  ];
}

function CollectionModal({ open, collection, onClose, onSave }: { open: boolean; collection: CollectionRow | null; onClose: () => void; onSave: (payload: Partial<CollectionRow>) => Promise<boolean> }) {
  const [form, setForm] = useState<Partial<CollectionRow>>({});
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (!open) return;
    setForm(collection ?? { name: "", slug: "", description: "", image_url: "", status: "active", is_featured: false, display_order: 0 });
  }, [collection, open]);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    await onSave({ ...form, slug: form.slug || slugify(form.name ?? "") });
    setSaving(false);
  }
  return (
    <CenterModal open={open} title={collection ? "Editar coleção" : "Nova coleção"} description="Crie arquivos temáticos para agrupar produtos e destacar narrativas." onClose={onClose}>
      <form onSubmit={submit} className="grid gap-4 p-5 md:grid-cols-2">
        <div><Label>Nome</Label><Input value={form.name ?? ""} onChange={(event) => setForm({ ...form, name: event.target.value, slug: collection ? form.slug : slugify(event.target.value) })} className="mt-2" required /></div>
        <div><Label>Slug</Label><Input value={form.slug ?? ""} onChange={(event) => setForm({ ...form, slug: slugify(event.target.value) })} className="mt-2" required /></div>
        <div className="md:col-span-2"><Label>Descrição</Label><Textarea value={form.description ?? ""} onChange={(event) => setForm({ ...form, description: event.target.value })} className="mt-2" /></div>
        <div className="md:col-span-2"><Label>Imagem/banner</Label><Input value={form.image_url ?? ""} onChange={(event) => setForm({ ...form, image_url: event.target.value })} className="mt-2" /></div>
        <div><Label>Status</Label><Select value={form.status ?? "active"} onChange={(value) => setForm({ ...form, status: value as CollectionRow["status"] })} options={[["active", "Ativo"], ["inactive", "Inativo"], ["draft", "Rascunho"]]} /></div>
        <div><Label>Ordem</Label><Input type="number" value={form.display_order ?? 0} onChange={(event) => setForm({ ...form, display_order: Number(event.target.value) })} className="mt-2" /></div>
        <label className="flex items-center gap-3 text-sm text-muted-foreground md:col-span-2"><input type="checkbox" checked={Boolean(form.is_featured)} onChange={(event) => setForm({ ...form, is_featured: event.target.checked })} /> Destacar coleção na home</label>
        <div className="flex justify-end gap-3 md:col-span-2"><Button type="button" variant="outline" onClick={onClose}>Cancelar</Button><Button type="submit" disabled={saving}>{saving ? "Salvando..." : "Salvar coleção"}</Button></div>
      </form>
    </CenterModal>
  );
}

function CouponModal({ open, coupon, onClose, onSave }: { open: boolean; coupon: CouponRow | null; onClose: () => void; onSave: (payload: Partial<CouponRow>) => Promise<boolean> }) {
  const [form, setForm] = useState<Partial<CouponRow>>({});
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (!open) return;
    setForm(coupon ?? { code: "", description: "", discount_type: "percent", percent: 10, fixed_value: 0, expires_at: null, usage_limit: null, used_count: 0, status: "active" });
  }, [coupon, open]);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    await onSave(form);
    setSaving(false);
  }
  return (
    <CenterModal open={open} title={coupon ? "Editar cupom" : "Novo cupom"} description="Configure descontos por campanha, validade e limite de uso." onClose={onClose}>
      <form onSubmit={submit} className="grid gap-4 p-5 md:grid-cols-2">
        <div><Label>Código</Label><Input value={form.code ?? ""} onChange={(event) => setForm({ ...form, code: event.target.value.toUpperCase() })} className="mt-2" required /></div>
        <div><Label>Status</Label><Select value={form.status ?? "active"} onChange={(value) => setForm({ ...form, status: value as CouponRow["status"] })} options={[["active", "Ativo"], ["paused", "Pausado"], ["expired", "Expirado"]]} /></div>
        <div><Label>Tipo</Label><Select value={form.discount_type ?? "percent"} onChange={(value) => setForm({ ...form, discount_type: value as CouponRow["discount_type"] })} options={[["percent", "Percentual"], ["fixed", "Valor fixo"]]} /></div>
        <div><Label>{form.discount_type === "fixed" ? "Valor fixo" : "Porcentagem"}</Label><Input type="number" value={form.discount_type === "fixed" ? form.fixed_value ?? 0 : form.percent ?? 0} onChange={(event) => setForm(form.discount_type === "fixed" ? { ...form, fixed_value: Number(event.target.value) } : { ...form, percent: Number(event.target.value) })} className="mt-2" /></div>
        <div className="md:col-span-2"><Label>Descrição</Label><Textarea value={form.description ?? ""} onChange={(event) => setForm({ ...form, description: event.target.value })} className="mt-2" /></div>
        <div><Label>Validade</Label><Input type="date" value={form.expires_at ?? ""} onChange={(event) => setForm({ ...form, expires_at: event.target.value })} className="mt-2" /></div>
        <div><Label>Limite de uso</Label><Input type="number" value={form.usage_limit ?? ""} onChange={(event) => setForm({ ...form, usage_limit: Number(event.target.value) })} className="mt-2" /></div>
        <div className="flex justify-end gap-3 md:col-span-2"><Button type="button" variant="outline" onClick={onClose}>Cancelar</Button><Button type="submit" disabled={saving}>{saving ? "Salvando..." : "Salvar cupom"}</Button></div>
      </form>
    </CenterModal>
  );
}

function UserModal({ open, user, onClose, onSave }: { open: boolean; user: AdminProfileRow | null; onClose: () => void; onSave: (payload: Partial<AdminProfileRow>) => Promise<boolean> }) {
  const [form, setForm] = useState<Partial<AdminProfileRow>>({});
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (!open) return;
    setForm(user ?? { name: "", email: "", avatar_url: "", role: "analyst", status: "active" });
  }, [open, user]);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    await onSave(form);
    setSaving(false);
  }
  return (
    <CenterModal open={open} title={user ? "Editar usuário" : "Novo usuário"} description="Gerencie perfil, função e status administrativo." onClose={onClose}>
      <form onSubmit={submit} className="grid gap-4 p-5 md:grid-cols-2">
        <div><Label>Nome</Label><Input value={form.name ?? ""} onChange={(event) => setForm({ ...form, name: event.target.value })} className="mt-2" /></div>
        <div><Label>Email</Label><Input type="email" value={form.email ?? ""} onChange={(event) => setForm({ ...form, email: event.target.value })} className="mt-2" required /></div>
        <div className="md:col-span-2"><Label>Avatar</Label><Input value={form.avatar_url ?? ""} onChange={(event) => setForm({ ...form, avatar_url: event.target.value })} className="mt-2" /></div>
        <div><Label>Função</Label><Select value={form.role ?? "analyst"} onChange={(value) => setForm({ ...form, role: value as AdminProfileRow["role"] })} options={[["admin", "Admin"], ["editor", "Editor"], ["analyst", "Analista"]]} /></div>
        <div><Label>Status</Label><Select value={form.status ?? "active"} onChange={(value) => setForm({ ...form, status: value as AdminProfileRow["status"] })} options={[["active", "Ativo"], ["inactive", "Inativo"]]} /></div>
        <div className="flex justify-end gap-3 md:col-span-2"><Button type="button" variant="outline" onClick={onClose}>Cancelar</Button><Button type="submit" disabled={saving}>{saving ? "Salvando..." : "Salvar usuário"}</Button></div>
      </form>
    </CenterModal>
  );
}

function TrackingLinkModal({ open, link, onClose, onSave }: { open: boolean; link: TrackingLinkRow | null; onClose: () => void; onSave: (payload: Partial<TrackingLinkRow>) => Promise<boolean> }) {
  const [form, setForm] = useState<Partial<TrackingLinkRow>>({});
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (!open) return;
    setForm(link ?? { name: "", destination_url: "/item/slug-do-produto", source: "instagram", campaign: "", medium: "reels", tags: [], status: "active" });
  }, [link, open]);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    await onSave({ ...form, tags: typeof form.tags === "string" ? String(form.tags).split(",").map((item) => item.trim()).filter(Boolean) : form.tags });
    setSaving(false);
  }
  const preview = buildTrackedUrl({
    id: link?.id ?? "preview",
    name: form.name ?? "",
    destination_url: form.destination_url ?? "",
    source: form.source ?? "",
    campaign: form.campaign ?? "",
    medium: form.medium ?? "",
    tags: form.tags ?? [],
    status: form.status ?? "active",
    created_at: new Date().toISOString()
  });
  return (
    <CenterModal open={open} title={link ? "Editar link rastreável" : "Novo link rastreável"} description="Gere URLs com UTM para Stories, Reels, Shorts e campanhas." onClose={onClose}>
      <form onSubmit={submit} className="grid gap-4 p-5 md:grid-cols-2">
        <div><Label>Nome</Label><Input value={form.name ?? ""} onChange={(event) => setForm({ ...form, name: event.target.value })} className="mt-2" required /></div>
        <div><Label>Source</Label><Input value={form.source ?? ""} onChange={(event) => setForm({ ...form, source: slugify(event.target.value) })} className="mt-2" required /></div>
        <div className="md:col-span-2"><Label>URL destino</Label><Input value={form.destination_url ?? ""} onChange={(event) => setForm({ ...form, destination_url: event.target.value })} className="mt-2" required /></div>
        <div><Label>Campaign</Label><Input value={form.campaign ?? ""} onChange={(event) => setForm({ ...form, campaign: slugify(event.target.value) })} className="mt-2" required /></div>
        <div><Label>Medium</Label><Input value={form.medium ?? ""} onChange={(event) => setForm({ ...form, medium: slugify(event.target.value) })} className="mt-2" /></div>
        <div className="md:col-span-2"><Label>Tags</Label><Input value={Array.isArray(form.tags) ? form.tags.join(", ") : form.tags ?? ""} onChange={(event) => setForm({ ...form, tags: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) })} className="mt-2" /></div>
        <div className="rounded-lg border border-primary/20 bg-primary/10 p-3 font-mono text-xs text-primary md:col-span-2">{preview}</div>
        <div className="flex justify-end gap-3 md:col-span-2"><Button type="button" variant="outline" onClick={onClose}>Cancelar</Button><Button type="submit" disabled={saving}>{saving ? "Salvando..." : "Salvar link"}</Button></div>
      </form>
    </CenterModal>
  );
}

function ReportTable({ headers, rows }: { headers: string[]; rows: (string | number)[][] }) {
  if (!rows.length) return <Empty text="Sem dados para este relatório." />;
  return (
    <div className="overflow-x-auto rounded-lg border border-white/10">
      <table className="w-full min-w-[520px] text-sm">
        <thead className="bg-white/[0.035] text-left font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          <tr>{headers.map((header) => <th key={header} className="px-4 py-3">{header}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {rows.map((row, index) => <tr key={index} className="hover:bg-white/[0.035]">{row.map((cell, cellIndex) => <td key={`${index}-${cellIndex}`} className="px-4 py-3 text-bunker-ice">{cell}</td>)}</tr>)}
        </tbody>
      </table>
    </div>
  );
}

function RecentUserActivity() {
  const items = [
    ["Login administrativo", "Sessão autenticada pelo Supabase Auth"],
    ["Produto editado", "Registro salvo no catálogo"],
    ["Banner atualizado", "Destaque visual alterado"],
    ["Coleção criada", "Novo arquivo temático disponível"],
    ["Cupom criado", "Campanha promocional preparada"]
  ];
  return (
    <Panel title="Atividades dos usuários">
      <div className="space-y-3">
        {items.map(([title, meta]) => (
          <div key={title} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/25 p-4">
            <span className="font-semibold text-bunker-ice">{title}</span>
            <span className="text-sm text-muted-foreground">{meta}</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function MiniMetric({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-lg border border-white/10 bg-white/[0.035] p-3"><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{label}</p><p className="mt-1 font-bold text-bunker-ice">{value}</p></div>;
}

function ModuleStatus({ status }: { status: string }) {
  const green = ["active", "connected"];
  const red = ["inactive", "expired", "disconnected"];
  const cls = green.includes(status)
    ? "border-primary/30 bg-primary/10 text-primary"
    : red.includes(status)
      ? "border-red-400/30 bg-red-950/35 text-red-200"
      : "border-bunker-amber/30 bg-bunker-amber/10 text-bunker-amber";
  const labels: Record<string, string> = { active: "Ativo", inactive: "Inativo", draft: "Rascunho", expired: "Expirado", paused: "Pausado", connected: "Conectado", disconnected: "Desconectado" };
  return <span className={`inline-flex rounded-md border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] ${cls}`}>{labels[status] ?? status}</span>;
}

function RoleBadge({ role }: { role: AdminProfileRow["role"] }) {
  const labels = { admin: "Admin", editor: "Editor", analyst: "Analista" };
  return <span className="rounded-md border border-primary/25 bg-primary/10 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-primary">{labels[role]}</span>;
}

function buildTrackedUrl(link: TrackingLinkRow) {
  const base = link.destination_url?.startsWith("http") ? link.destination_url : `${window.location.origin}${link.destination_url || "/arsenal"}`;
  const url = new URL(base);
  if (link.source) url.searchParams.set("source", link.source);
  if (link.campaign) url.searchParams.set("campaign", link.campaign);
  if (link.medium) url.searchParams.set("medium", link.medium);
  return url.toString();
}

function formatMoney(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function integrationIcon(platform: string) {
  const lower = platform.toLowerCase();
  if (lower.includes("supabase")) return <Database className="h-5 w-5" />;
  if (lower.includes("vercel")) return <Zap className="h-5 w-5" />;
  if (lower.includes("webhook")) return <Webhook className="h-5 w-5" />;
  if (lower.includes("analytics")) return <BarChart3 className="h-5 w-5" />;
  if (lower.includes("telegram") || lower.includes("discord")) return <Radio className="h-5 w-5" />;
  if (lower.includes("instagram") || lower.includes("tiktok") || lower.includes("youtube") || lower.includes("meta")) return <Megaphone className="h-5 w-5" />;
  return <Plug className="h-5 w-5" />;
}

function Settings() {
  const tabs = ["Geral", "Vitrine", "Tracking", "Analytics", "Aparência", "Segurança", "Integrações", "Inteligência IA", "Sistema"];
  const [active, setActive] = useState("Geral");
  const [values, setValues] = useState<Record<string, string | boolean>>({});
  const [feedback, setFeedback] = useState("");
  const [dbStatus, setDbStatus] = useState("Não testado");

  useEffect(() => {
    supabase.from("settings").select("key,value,group").then(({ data }) => {
      if (data?.length) {
        setValues(Object.fromEntries(data.map((item) => [item.key, item.value as string | boolean])));
      } else {
        setValues(defaultSettingsValues());
      }
    });
  }, []);

  function setValue(key: string, value: string | boolean) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function save() {
    const rows = settingsFields.flatMap((group) => group.fields.map((field) => ({
      key: field.key,
      group: group.name,
      value: values[field.key] ?? field.defaultValue ?? null
    })));
    const { error } = await supabase.from("settings").upsert(rows, { onConflict: "key" });
    setFeedback(error ? "Não foi possível salvar. Aplique o schema atualizado da tabela settings." : "Configurações salvas com sucesso.");
  }

  async function testDatabase() {
    const { error } = await supabase.from("products").select("id", { count: "exact", head: true });
    setDbStatus(error ? "Falha na conexão" : `Conectado em ${new Date().toLocaleTimeString("pt-BR")}`);
  }

  const group = settingsFields.find((item) => item.name === active) ?? settingsFields[0];

  return (
    <AdminLayout title="Configurações" description="Controle comportamento geral, vitrine, tracking, analytics, aparência, segurança e sistema." action={<Button onClick={save}><SettingsIcon className="h-4 w-4" /> Salvar alterações</Button>}>
      <div className="grid gap-6 xl:grid-cols-[260px_1fr]">
        <aside className="rounded-xl border border-white/10 bg-card/70 p-3">
          {tabs.map((tab) => (
            <button key={tab} type="button" onClick={() => setActive(tab)} className={`mb-1 flex w-full items-center justify-between rounded-lg px-4 py-3 text-left text-sm transition ${active === tab ? "border border-primary/30 bg-primary/10 text-primary shadow-glow" : "text-muted-foreground hover:bg-white/5 hover:text-bunker-ice"}`}>
              {tab}
              <ChevronRight className="h-4 w-4" />
            </button>
          ))}
        </aside>
        <section className="rounded-xl border border-white/10 bg-card/70 p-5">
          {active === "Inteligência IA" ? <AiSettingsPanel /> : (
            <>
              <Heading eyebrow="Painel de controle" title={group.name} description={group.description} />
              <div className="grid gap-4 md:grid-cols-2">
                {group.fields.map((field) => (
                  <SettingsField key={field.key} field={field} value={values[field.key] ?? field.defaultValue ?? ""} onChange={setValue} />
                ))}
              </div>
            </>
          )}
          {active === "Sistema" ? (
            <div className="mt-8 grid gap-4 md:grid-cols-4">
              <MiniMetric label="Versão" value="1.0.0" />
              <MiniMetric label="Ambiente" value={import.meta.env.MODE} />
              <MiniMetric label="Supabase" value={dbStatus} />
              <MiniMetric label="Última atualização" value={new Date().toLocaleDateString("pt-BR")} />
              <Button variant="outline" onClick={() => { localStorage.clear(); setFeedback("Cache local limpo."); }}>Limpar cache</Button>
              <Button variant="outline" onClick={testDatabase}>Testar banco</Button>
            </div>
          ) : null}
        </section>
      </div>
      {feedback ? <Feedback text={feedback} /> : null}
    </AdminLayout>
  );
}

const settingsFields = [
  {
    name: "Geral",
    description: "Identidade básica, domínio, idioma e suporte.",
    fields: [
      { key: "system_name", label: "Nome do sistema", type: "text", defaultValue: "Loja do Apocalipse" },
      { key: "short_description", label: "Descrição curta", type: "text", defaultValue: "Hub de afiliados cinematográfico" },
      { key: "logo_url", label: "Logo", type: "text", defaultValue: "" },
      { key: "favicon_url", label: "Favicon", type: "text", defaultValue: "" },
      { key: "primary_domain", label: "Domínio principal", type: "text", defaultValue: window.location.origin },
      { key: "language", label: "Idioma", type: "text", defaultValue: "pt-BR" },
      { key: "timezone", label: "Timezone", type: "text", defaultValue: "America/Sao_Paulo" },
      { key: "support_email", label: "Email de suporte", type: "text", defaultValue: "suporte@dominio.com" }
    ]
  },
  {
    name: "Vitrine",
    description: "Textos da home e recursos públicos.",
    fields: [
      { key: "home_title", label: "Título principal da home", type: "text", defaultValue: "Equipamentos para sobreviver ao fim do mundo" },
      { key: "home_subtitle", label: "Subtítulo da home", type: "text", defaultValue: "Uma curadoria de itens inspirados nas histórias." },
      { key: "home_button", label: "Texto do botão principal", type: "text", defaultValue: "Explorar Arsenal" },
      { key: "default_product_section", label: "Seção padrão de produtos", type: "text", defaultValue: "featured" },
      { key: "enable_collections", label: "Ativar coleções", type: "boolean", defaultValue: true },
      { key: "enable_coupons", label: "Ativar cupons", type: "boolean", defaultValue: true },
      { key: "enable_favorites", label: "Ativar favoritos", type: "boolean", defaultValue: true },
      { key: "enable_special_pages", label: "Ativar páginas especiais", type: "boolean", defaultValue: true }
    ]
  },
  {
    name: "Tracking",
    description: "Regras invisíveis de rastreamento público.",
    fields: [
      { key: "tracking_enabled", label: "Ativar tracking", type: "boolean", defaultValue: true },
      { key: "save_referrer", label: "Salvar referrer", type: "boolean", defaultValue: true },
      { key: "save_user_agent", label: "Salvar user-agent", type: "boolean", defaultValue: true },
      { key: "save_source", label: "Salvar source", type: "boolean", defaultValue: true },
      { key: "save_campaign", label: "Salvar campaign", type: "boolean", defaultValue: true },
      { key: "save_application", label: "Salvar application", type: "boolean", defaultValue: true },
      { key: "save_device", label: "Salvar device", type: "boolean", defaultValue: true },
      { key: "save_location", label: "Salvar localização aproximada", type: "boolean", defaultValue: false },
      { key: "min_click_interval", label: "Tempo mínimo entre cliques repetidos", type: "number", defaultValue: "30" },
      { key: "ignore_bots", label: "Ignorar bots", type: "boolean", defaultValue: true }
    ]
  },
  {
    name: "Analytics",
    description: "Preferências de visualização do dashboard.",
    fields: [
      { key: "default_dashboard_range", label: "Período padrão", type: "text", defaultValue: "7d" },
      { key: "show_main_cards", label: "Exibir cards principais", type: "boolean", defaultValue: true },
      { key: "show_sources", label: "Exibir origem dos acessos", type: "boolean", defaultValue: true },
      { key: "show_applications", label: "Exibir aplicações", type: "boolean", defaultValue: true },
      { key: "show_devices", label: "Exibir dispositivos", type: "boolean", defaultValue: true },
      { key: "show_campaigns", label: "Exibir campanhas", type: "boolean", defaultValue: true },
      { key: "show_access_map", label: "Exibir mapa de acessos", type: "boolean", defaultValue: true },
      { key: "show_heatmap", label: "Exibir heatmap", type: "boolean", defaultValue: true },
      { key: "show_rankings", label: "Exibir rankings", type: "boolean", defaultValue: true }
    ]
  },
  {
    name: "Aparência",
    description: "Tema visual, glow, animações e fonte.",
    fields: [
      { key: "default_theme", label: "Tema padrão", type: "text", defaultValue: "bunker" },
      { key: "mode_bunker", label: "Modo bunker", type: "boolean", defaultValue: true },
      { key: "mode_terminal", label: "Modo terminal hacker", type: "boolean", defaultValue: true },
      { key: "mode_military", label: "Modo militar", type: "boolean", defaultValue: true },
      { key: "primary_color", label: "Cor principal", type: "text", defaultValue: "#4ADE80" },
      { key: "glow_intensity", label: "Intensidade do glow", type: "number", defaultValue: "60" },
      { key: "animations_enabled", label: "Animações ativadas", type: "boolean", defaultValue: true },
      { key: "main_font", label: "Fonte principal", type: "text", defaultValue: "Inter" }
    ]
  },
  {
    name: "Segurança",
    description: "Sessão, permissões e controle de acesso.",
    fields: [
      { key: "session_management", label: "Gerenciamento de sessão", type: "boolean", defaultValue: true },
      { key: "session_timeout", label: "Timeout de sessão em minutos", type: "number", defaultValue: "120" },
      { key: "role_permissions", label: "Permissões por função", type: "boolean", defaultValue: true },
      { key: "access_logs", label: "Logs de acesso", type: "boolean", defaultValue: true },
      { key: "multiple_admins", label: "Permitir múltiplos admins", type: "boolean", defaultValue: true },
      { key: "active_user_control", label: "Controle de usuários ativos/inativos", type: "boolean", defaultValue: true }
    ]
  },
  {
    name: "Integrações",
    description: "Status e referência dos conectores principais.",
    fields: [
      { key: "meta_pixel_status", label: "Meta Pixel", type: "text", defaultValue: "inactive" },
      { key: "ga_status", label: "Google Analytics", type: "text", defaultValue: "inactive" },
      { key: "tiktok_pixel_status", label: "TikTok Pixel", type: "text", defaultValue: "inactive" },
      { key: "telegram_status", label: "Telegram Bot", type: "text", defaultValue: "inactive" },
      { key: "discord_status", label: "Discord Webhook", type: "text", defaultValue: "inactive" },
      { key: "custom_webhooks_status", label: "Webhooks personalizados", type: "text", defaultValue: "inactive" },
      { key: "supabase_status", label: "Supabase", type: "text", defaultValue: "connected" },
      { key: "vercel_status", label: "Vercel", type: "text", defaultValue: "connected" }
    ]
  },
  {
    name: "Sistema",
    description: "Versão, ambiente, conexão, logs e manutenção.",
    fields: [
      { key: "system_version", label: "Versão do sistema", type: "text", defaultValue: "1.0.0" },
      { key: "environment", label: "Ambiente atual", type: "text", defaultValue: import.meta.env.MODE },
      { key: "vercel_domain", label: "Domínio Vercel", type: "text", defaultValue: window.location.origin },
      { key: "recent_logs_enabled", label: "Logs recentes", type: "boolean", defaultValue: true }
    ]
  }
] as const;

function SettingsField({ field, value, onChange }: { field: typeof settingsFields[number]["fields"][number]; value: string | boolean | number | null; onChange: (key: string, value: string | boolean) => void }) {
  if (field.type === "boolean") {
    return (
      <label className="flex min-h-20 items-center justify-between gap-4 rounded-lg border border-white/10 bg-black/25 p-4">
        <span className="text-sm font-medium text-bunker-ice">{field.label}</span>
        <input type="checkbox" checked={Boolean(value)} onChange={(event) => onChange(field.key, event.target.checked)} />
      </label>
    );
  }
  return (
    <div>
      <Label>{field.label}</Label>
      <Input type={field.type === "number" ? "number" : "text"} value={String(value ?? "")} onChange={(event) => onChange(field.key, event.target.value)} className="mt-2" />
    </div>
  );
}

function AiSettingsPanel() {
  const [provider, setProvider] = useState("openai");
  const [model, setModel] = useState("gpt-4o-mini");
  const [apiKey, setApiKey] = useState("");
  const [maskedKey, setMaskedKey] = useState("");
  const [active, setActive] = useState(false);
  const [dailyLimit, setDailyLimit] = useState("100");
  const [temperature, setTemperature] = useState("0.7");
  const [language, setLanguage] = useState("pt-BR");
  const [lastTested, setLastTested] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    aiSettingsRequest("GET").then((result) => {
      if (!result.ok || !result.settings) return;
      setProvider(result.settings.provider ?? "openai");
      setModel(result.settings.model ?? "gpt-4o-mini");
      setMaskedKey(result.settings.api_key_masked ?? "");
      setActive(Boolean(result.settings.is_active));
      setDailyLimit(String(result.settings.daily_limit ?? 100));
      setTemperature(String(result.settings.temperature ?? 0.7));
      setLanguage(result.settings.default_language ?? "pt-BR");
      setLastTested(result.settings.last_tested_at ?? null);
    });
  }, []);

  async function save() {
    setLoading(true);
    const result = await aiSettingsRequest("POST", { provider, model, apiKey, is_active: active, daily_limit: Number(dailyLimit), temperature: Number(temperature), default_language: language });
    setLoading(false);
    if (!result.ok) return setFeedback(result.error ?? "Falha ao salvar IA.");
    setMaskedKey(result.settings?.api_key_masked ?? maskedKey);
    setApiKey("");
    setFeedback("Configuração de IA salva com segurança.");
  }

  async function test() {
    setLoading(true);
    const result = await callAi("test_connection", { ping: true });
    setLoading(false);
    setFeedback(result.ok ? "Conexão com IA testada com sucesso." : (result.error ?? "Falha no teste da IA."));
    if (result.ok) setLastTested(new Date().toISOString());
  }

  return (
    <div>
      <Heading eyebrow="Configuração segura" title="Inteligência IA" description="A chave é usada apenas por API protegida no servidor. O frontend público nunca recebe a API Key." />
      <div className="grid gap-4 md:grid-cols-2">
        <div><Label>Provedor de IA</Label><Select value={provider} onChange={setProvider} options={[["openai", "OpenAI"], ["anthropic", "Anthropic"], ["gemini", "Gemini"], ["openrouter", "OpenRouter"]]} /></div>
        <div><Label>Modelo</Label><Input value={model} onChange={(event) => setModel(event.target.value)} className="mt-2" /></div>
        <div><Label>API Key</Label><Input type="password" value={apiKey} onChange={(event) => setApiKey(event.target.value)} placeholder={maskedKey || "Cole a chave para atualizar"} className="mt-2" /></div>
        <div><Label>Status da integração</Label><Select value={active ? "active" : "inactive"} onChange={(value) => setActive(value === "active")} options={[["active", "Ativa"], ["inactive", "Inativa"]]} /></div>
        <div><Label>Limite de uso diário</Label><Input type="number" value={dailyLimit} onChange={(event) => setDailyLimit(event.target.value)} className="mt-2" /></div>
        <div><Label>Temperatura/criatividade</Label><Input type="number" step="0.1" min="0" max="2" value={temperature} onChange={(event) => setTemperature(event.target.value)} className="mt-2" /></div>
        <div><Label>Idioma padrão</Label><Input value={language} onChange={(event) => setLanguage(event.target.value)} className="mt-2" /></div>
        <div className="rounded-lg border border-white/10 bg-black/25 p-4 text-sm text-muted-foreground">Último teste: {lastTested ? new Date(lastTested).toLocaleString("pt-BR") : "nunca"}</div>
      </div>
      <div className="mt-5 flex flex-wrap gap-3"><Button onClick={save} disabled={loading}>{loading ? "Salvando..." : "Salvar IA"}</Button><Button variant="outline" onClick={test} disabled={loading}>Testar conexão</Button></div>
      {feedback ? <Feedback text={feedback} /> : null}
    </div>
  );
}

function defaultSettingsValues() {
  return Object.fromEntries(settingsFields.flatMap((group) => group.fields.map((field) => [field.key, field.defaultValue ?? ""])));
}

async function getAuthToken() {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? "";
}

async function aiSettingsRequest(method: "GET" | "POST", body?: Record<string, unknown>) {
  const token = await getAuthToken();
  try {
    const response = await fetch("/api/ai-settings", {
      method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: body ? JSON.stringify(body) : undefined
    });
    return await parseApiJson(response) as { ok: boolean; error?: string; settings?: Record<string, any> };
  } catch {
    return { ok: false, error: "API segura indisponível. Use o deploy da Vercel ou rode com Vercel Functions para testar IA." };
  }
}

async function callAi(feature: string, input: Record<string, unknown>) {
  const token = await getAuthToken();
  try {
    const response = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ feature, input })
    });
    return await parseApiJson(response) as { ok: boolean; text: string; data?: any; error?: string };
  } catch {
    return { ok: false, text: "", error: "API de IA indisponível. Use o deploy da Vercel ou rode com Vercel Functions para testar IA." };
  }
}

async function parseApiJson(response: Response) {
  const text = await response.text();
  if (text.trim().startsWith("<!doctype") || text.trim().startsWith("<html")) {
    throw new Error("API route served HTML instead of JSON.");
  }
  return JSON.parse(text);
}

function useStore() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{ products: Product[]; categories: Category[]; banners: Banner[] }>({ products: [], categories: [], banners: [] });
  useEffect(() => {
    Promise.all([getProducts(), getCategories(), getBanners()])
      .then(([products, categories, banners]) => setData({ products, categories, banners }))
      .finally(() => setLoading(false));
  }, []);
  return { data, loading };
}

function ProductGrid({ products, danger = false }: { products: Product[]; danger?: boolean }) {
  if (!products.length) return <PublicEmpty text="Nenhum equipamento disponível neste setor." />;
  return <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">{products.map((product) => <ProductCard key={product.id} product={product} danger={danger} />)}</div>;
}

function ProductCard({ product, danger = false }: { product: Product; danger?: boolean }) {
  return (
    <article className={`group flex h-full flex-col overflow-hidden rounded-2xl border bg-[rgba(10,18,15,0.85)] shadow-[0_18px_70px_rgba(0,0,0,0.28)] backdrop-blur transition-all duration-300 hover:-translate-y-1 ${danger ? "border-red-900/30 hover:border-red-700/55 hover:shadow-[0_0_42px_rgba(127,29,29,0.18)]" : "border-primary/12 hover:border-primary/38 hover:shadow-[0_0_42px_rgba(74,222,128,0.12)]"}`}>
      <Link to={`/produto/${product.slug}`}>
        <div className="relative h-72 overflow-hidden bg-[#0B1110] sm:h-80 xl:h-72">
          <ImageWithFallback src={product.image_url} alt={product.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050807] via-black/20 to-transparent" />
          <span className={`absolute left-4 top-4 rounded-full border bg-black/55 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] backdrop-blur ${danger ? "border-red-500/25 text-red-200" : "border-primary/25 text-primary"}`}>{product.categories?.name ?? "Equipamento"}</span>
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display line-clamp-2 text-xl font-bold leading-tight text-[#F8FAFC]">{product.name}</h3>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-400">{product.short_description || product.description}</p>
        <div className="mt-auto pt-5">
          <Button asChild size="lg" className="h-11 w-full rounded-xl"><Link to={`/produto/${product.slug}`}>Ver Equipamento <ArrowUpRight className="h-4 w-4" /></Link></Button>
        </div>
      </div>
    </article>
  );
}

function StoryStrip({ products }: { products: Product[] }) {
  if (!products.length) return <PublicEmpty text="Nenhum item classificado como usado nas histórias." />;
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {products.map((product, index) => (
        <Link key={product.id} to={`/produto/${product.slug}`} className="group relative min-h-72 overflow-hidden rounded-2xl border border-primary/12 bg-[#0B1110] shadow-[0_18px_70px_rgba(0,0,0,0.28)] transition-all hover:-translate-y-1 hover:border-primary/40">
          <ImageWithFallback src={product.image_url} alt={product.name} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-110" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050807] via-black/45 to-black/10" />
          <div className="absolute inset-x-0 bottom-0 p-5">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-primary">Arquivo {String(index + 1).padStart(2, "0")}</p>
            <h3 className="font-display text-2xl font-bold text-[#F8FAFC]">{product.name}</h3>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-300">{product.description}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

function Section({ id, title, eyebrow, description, children }: { id?: string; title: string; eyebrow: string; description?: string; children: React.ReactNode }) {
  return <section id={id} className="px-4 py-20 sm:px-6 lg:py-24"><div className="mx-auto max-w-7xl"><PublicHeading eyebrow={eyebrow} title={title} description={description} />{children}</div></section>;
}

function Heading({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return <div className="mb-8 max-w-3xl"><p className="mb-3 font-mono text-xs uppercase tracking-[0.32em] text-primary">{eyebrow}</p><h2 className="text-3xl font-black tracking-tight text-bunker-ice md:text-5xl">{title}</h2>{description ? <p className="mt-4 text-sm leading-6 text-muted-foreground">{description}</p> : null}</div>;
}

function PublicHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <div className="mb-10 max-w-3xl">
      <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.28em] text-primary">{eyebrow}</p>
      <h2 className="font-display text-3xl font-extrabold tracking-tight text-[#F8FAFC] md:text-5xl">{title}</h2>
      {description ? <p className="mt-4 text-base leading-7 text-slate-400">{description}</p> : null}
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-primary/12 bg-[#030504] px-4 py-12 sm:px-6">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1.4fr_0.6fr_0.8fr]">
        <div>
          <p className="font-display text-2xl font-extrabold text-[#F8FAFC]">Loja do Apocalipse</p>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">Uma vitrine cinematográfica de equipamentos afiliados para histórias de colapso, bunker, sobrevivência e tecnologia proibida.</p>
        </div>
        <div className="space-y-2 text-sm">
          <Link className="block text-slate-400 transition hover:text-primary" to="/arsenal">Arsenal</Link>
          <Link className="block text-slate-400 transition hover:text-primary" to="/sobrevivencia">Sobrevivência</Link>
        </div>
        <div className="rounded-2xl border border-primary/12 bg-primary/[0.045] p-4 font-mono text-[11px] uppercase tracking-[0.18em] text-primary/80">
          Sistema secreto online<br />Protocolo ativo<br />Tráfego Instagram
        </div>
      </div>
    </footer>
  );
}

function LoadingBlock({ label = "Carregando" }: { label?: string }) {
  return <div className="mx-auto w-fit rounded-md border border-primary/30 bg-primary/10 px-6 py-4 font-mono text-xs uppercase tracking-[0.3em] text-primary shadow-glow">{label}</div>;
}

function ImageWithFallback({ src, alt, className }: { src?: string | null; alt: string; className?: string }) {
  const [failed, setFailed] = useState(!src);
  if (failed) {
    return (
      <div className={`grid place-items-center bg-[#0B1110] ${className ?? ""}`}>
        <div className="text-center text-slate-500">
          <ImageOff className="mx-auto mb-3 h-8 w-8 text-primary/60" />
          <p className="font-mono text-[10px] uppercase tracking-[0.2em]">Imagem indisponível</p>
        </div>
      </div>
    );
  }
  return <img src={src ?? ""} alt={alt} className={className} loading="lazy" onError={() => setFailed(true)} />;
}

function CategoryIcon({ slug }: { slug: string }) {
  const icons: Record<string, typeof Shield> = {
    sobrevivencia: ShieldCheck,
    lanternas: Flashlight,
    comunicacao: Radio,
    energia: Zap,
    mochilas: Backpack,
    gadgets: Cpu,
    "itens-misteriosos": Skull,
    militar: Shield
  };
  const Icon = icons[slug] ?? Cpu;
  return <Icon className="h-5 w-5" />;
}

function HeroSignal({ icon: Icon, label, value, danger }: { icon: typeof Shield; label: string; value: string; danger?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/55 px-4 py-3 backdrop-blur">
      <div className="flex items-center gap-3">
        <span className={`grid h-9 w-9 place-items-center rounded-lg ${danger ? "bg-red-900/35 text-red-200" : "bg-primary/10 text-primary"}`}>
          <Icon className="h-4 w-4" />
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">{label}</span>
      </div>
      <span className={`font-mono text-xs uppercase tracking-[0.16em] ${danger ? "text-red-200" : "text-primary"}`}>{value}</span>
    </div>
  );
}

function ProductSignal({ icon: Icon, label, value }: { icon: typeof Shield; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/55 p-3 backdrop-blur">
      <Icon className="mb-2 h-4 w-4 text-primary" />
      <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-1 truncate text-xs font-semibold text-slate-100">{value}</p>
    </div>
  );
}

function InfoTile({ icon: Icon, label, value }: { icon: typeof Shield; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
      <Icon className="mb-3 h-4 w-4 text-primary" />
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-1 line-clamp-1 text-sm font-semibold text-slate-100">{value}</p>
    </div>
  );
}

function ProductContextCard({ title, text }: { title: string; text: string }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-[rgba(10,18,15,0.66)] p-5 shadow-[0_18px_70px_rgba(0,0,0,0.18)] backdrop-blur">
      <p className="font-display text-lg font-bold text-[#F8FAFC]">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-400">{text}</p>
    </article>
  );
}

function storySectionLabel(section: Product["story_section"]) {
  if (section === "most_used") return "Classificado como mais usado nas histórias.";
  if (section === "forbidden") return "Classificado como equipamento proibido.";
  if (section === "survivor_choice") return "Classificado como escolha dos sobreviventes.";
  return "Equipamento indicado para narrativa de sobrevivência.";
}

function PublicEmpty({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-primary/18 bg-[rgba(10,18,15,0.65)] p-8 text-center shadow-[0_18px_70px_rgba(0,0,0,0.18)]">
      <ImageOff className="mx-auto mb-4 h-8 w-8 text-primary/70" />
      <p className="text-sm text-slate-400">{text}</p>
    </div>
  );
}

function SkeletonGrid() {
  return <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-[420px] animate-pulse rounded-2xl border border-white/10 bg-white/[0.045]" />)}</div>;
}

function Kpi({ icon: Icon, label, value, helper }: { icon: typeof Activity; label: string; value: string | number; helper: string }) {
  return <div className="rounded-lg border border-white/10 bg-card/70 p-5 shadow-insetPanel transition-all hover:border-primary/35 hover:bg-primary/[0.055]"><Icon className="mb-5 h-5 w-5 text-primary" /><p className="line-clamp-1 text-2xl font-black text-bunker-ice">{value}</p><p className="mt-2 text-sm text-muted-foreground">{label}</p><p className="mt-3 font-mono text-[11px] uppercase tracking-[0.16em] text-primary/70">{helper}</p></div>;
}

function QuickAction({ to, icon: Icon, label }: { to: string; icon: typeof Activity; label: string }) {
  return (
    <Link to={to} className="flex items-center gap-3 rounded-lg border border-white/10 bg-black/25 p-4 text-sm font-semibold text-bunker-ice transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/10">
      <span className="grid h-10 w-10 place-items-center rounded-md bg-primary/10 text-primary"><Icon className="h-4 w-4" /></span>
      {label}
    </Link>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-lg border border-white/10 bg-card/70 p-5"><h2 className="mb-5 text-xl font-bold text-bunker-ice">{title}</h2>{children}</section>;
}

function LineBox({ data }: { data: { day: string; clicks: number }[] }) {
  return <div className="h-72"><ResponsiveContainer width="100%" height="100%"><LineChart data={data}><XAxis dataKey="day" stroke="rgba(231,242,238,0.55)" /><YAxis stroke="rgba(231,242,238,0.55)" /><Tooltip contentStyle={{ background: "#080b09", border: "1px solid rgba(115,255,154,0.25)" }} /><Line type="monotone" dataKey="clicks" stroke="#73ff9a" strokeWidth={3} dot={false} /></LineChart></ResponsiveContainer></div>;
}

function AreaBox({ data }: { data: { day: string; clicks: number }[] }) {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="clickGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4ADE80" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#4ADE80" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.07)" />
          <XAxis dataKey="day" stroke="rgba(231,242,238,0.55)" />
          <YAxis stroke="rgba(231,242,238,0.55)" />
          <Tooltip contentStyle={{ background: "#080b09", border: "1px solid rgba(74,222,128,0.25)", borderRadius: 12 }} />
          <Area type="monotone" dataKey="clicks" stroke="#4ADE80" strokeWidth={3} fill="url(#clickGradient)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function BarBox({ data, keyName, color, valueKey = "value" }: { data: Record<string, string | number>[]; keyName: string; color: string; valueKey?: string }) {
  return <div className="h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={data}><CartesianGrid stroke="rgba(255,255,255,0.07)" /><XAxis dataKey={keyName} stroke="rgba(231,242,238,0.55)" /><YAxis stroke="rgba(231,242,238,0.55)" /><Tooltip contentStyle={{ background: "#080b09", border: "1px solid rgba(115,255,154,0.25)", borderRadius: 12 }} /><Bar dataKey={valueKey} fill={color} radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div>;
}

function PieBox({ data }: { data: { name: string; value: number }[] }) {
  const colors = ["#4ADE80", "#7F1D1D", "#D6A84F"];
  if (!data.length) return <Empty text="Sem dados para exibir." />;
  return (
    <div className="grid items-center gap-4 md:grid-cols-[1fr_0.8fr]">
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={58} outerRadius={92} paddingAngle={4}>
              {data.map((entry, index) => <Cell key={entry.name} fill={colors[index % colors.length]} />)}
            </Pie>
            <Tooltip contentStyle={{ background: "#080b09", border: "1px solid rgba(115,255,154,0.25)", borderRadius: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={item.name} className="flex items-center justify-between rounded-lg border border-white/10 bg-black/25 px-3 py-2 text-sm">
            <span className="flex items-center gap-2 text-muted-foreground"><span className="h-2.5 w-2.5 rounded-full" style={{ background: colors[index % colors.length] }} />{item.name}</span>
            <span className="font-mono text-bunker-ice">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminList({ items }: { items: { id: string; title: string; meta: string }[] }) {
  return <div className="mt-8 overflow-hidden rounded-lg border border-white/10 bg-card/70">{items.map((item) => <div key={item.id} className="flex items-center justify-between border-b border-white/10 p-4"><span className="font-semibold text-bunker-ice">{item.title}</span><span className="font-mono text-xs text-primary">{item.meta}</span></div>)}</div>;
}

function Field({ name, label }: { name: string; label: string }) {
  return <div><Label>{label}</Label><Input name={name} className="mt-2" /></div>;
}

function Empty({ text }: { text: string }) {
  return <div className="rounded-lg border border-dashed border-white/15 bg-black/20 p-5 text-sm text-muted-foreground">{text}</div>;
}

function NotFound() {
  return <PublicLayout><main className="grid min-h-screen place-items-center px-4 text-center"><div><p className="font-mono text-xs uppercase tracking-[0.32em] text-primary">404</p><h1 className="mt-4 text-5xl font-black text-bunker-ice">Arquivo nao encontrado</h1><Button asChild className="mt-8"><Link to="/arsenal">Voltar ao Arsenal</Link></Button></div></main></PublicLayout>;
}

createRoot(document.getElementById("root")!).render(<App />);
