import type { Banner, Category, Product } from "@/types/database";

const now = new Date().toISOString();

export const fallbackCategories: Category[] = [
  {
    id: "survival",
    name: "Sobrevivência",
    slug: "sobrevivencia",
    description: "Kits, ferramentas e suprimentos para atravessar o colapso.",
    icon: "Shield",
    created_at: now
  },
  {
    id: "military",
    name: "Militar",
    slug: "militar",
    description: "Equipamentos táticos inspirados em operações de bunker.",
    icon: "Crosshair",
    created_at: now
  },
  {
    id: "communication",
    name: "Comunicação",
    slug: "comunicacao",
    description: "Rádios, antenas e sinais para quando a rede cair.",
    icon: "Radio",
    created_at: now
  },
  {
    id: "energy",
    name: "Energia",
    slug: "energia",
    description: "Fontes, baterias e soluções para manter sistemas vivos.",
    icon: "BatteryCharging",
    created_at: now
  },
  {
    id: "flashlights",
    name: "Lanternas",
    slug: "lanternas",
    description: "Luz fria para corredores escuros, túneis e ruínas.",
    icon: "Flashlight",
    created_at: now
  },
  {
    id: "backpacks",
    name: "Mochilas",
    slug: "mochilas",
    description: "Carga modular para evacuação, patrulha e exploração.",
    icon: "Briefcase",
    created_at: now
  },
  {
    id: "gadgets",
    name: "Gadgets",
    slug: "gadgets",
    description: "Tecnologia compacta para cenários hostis.",
    icon: "Cpu",
    created_at: now
  },
  {
    id: "mysterious",
    name: "Itens Misteriosos",
    slug: "itens-misteriosos",
    description: "Objetos de laboratório, arquivos selados e anomalias.",
    icon: "Fingerprint",
    created_at: now
  }
];

export const fallbackProducts: Product[] = [
  {
    id: "p1",
    name: "Lanterna Bunker X9",
    slug: "lanterna-bunker-x9",
    description:
      "Lanterna utilizada em operações de sobrevivência durante apagões, invasões e evacuações subterrâneas.",
    image_url:
      "https://images.unsplash.com/photo-1516173531407-0d5b2e0a616b?auto=format&fit=crop&w=1200&q=80",
    affiliate_url: "https://example.com/lanterna-bunker-x9",
    category_id: "flashlights",
    is_featured: true,
    status: "active",
    created_at: now,
    categories: fallbackCategories[4],
    click_count: 284
  },
  {
    id: "p2",
    name: "Radio Militar Orion",
    slug: "radio-militar-orion",
    description:
      "Radio de comunicação para coordenar grupos quando satélites, torres e internet deixam de responder.",
    image_url:
      "https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?auto=format&fit=crop&w=1200&q=80",
    affiliate_url: "https://example.com/radio-militar-orion",
    category_id: "communication",
    is_featured: true,
    status: "active",
    created_at: now,
    categories: fallbackCategories[2],
    click_count: 197
  },
  {
    id: "p3",
    name: "Mochila Evacuacao Atlas",
    slug: "mochila-evacuacao-atlas",
    description:
      "Mochila modular para jornadas longas em zonas contaminadas, cidades vazias e rotas de fuga.",
    image_url:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
    affiliate_url: "https://example.com/mochila-evacuacao-atlas",
    category_id: "backpacks",
    is_featured: true,
    status: "active",
    created_at: now,
    categories: fallbackCategories[5],
    click_count: 165
  },
  {
    id: "p4",
    name: "Kit Sobrevivencia Omega",
    slug: "kit-sobrevivencia-omega",
    description:
      "Kit compacto para abrigo, corte, fogo, sinalizacao e primeiros movimentos apos o colapso.",
    image_url:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    affiliate_url: "https://example.com/kit-sobrevivencia-omega",
    category_id: "survival",
    is_featured: true,
    status: "active",
    created_at: now,
    categories: fallbackCategories[0],
    click_count: 238
  },
  {
    id: "p5",
    name: "Modulo Energia Helios",
    slug: "modulo-energia-helios",
    description:
      "Banco de energia para manter radios, lanternas e sensores ligados em bases improvisadas.",
    image_url:
      "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1200&q=80",
    affiliate_url: "https://example.com/modulo-energia-helios",
    category_id: "energy",
    is_featured: false,
    status: "active",
    created_at: now,
    categories: fallbackCategories[3],
    click_count: 121
  },
  {
    id: "p6",
    name: "Scanner Secreto Vektor",
    slug: "scanner-secreto-vektor",
    description:
      "Gadget misterioso para exploradores de laboratorios abandonados e instalacoes subterraneas.",
    image_url:
      "https://images.unsplash.com/photo-1518709268805-4e9042af2176?auto=format&fit=crop&w=1200&q=80",
    affiliate_url: "https://example.com/scanner-secreto-vektor",
    category_id: "mysterious",
    is_featured: false,
    status: "active",
    created_at: now,
    categories: fallbackCategories[7],
    click_count: 89
  }
];

export const fallbackBanners: Banner[] = [
  {
    id: "b1",
    title: "Equipamentos para sobreviver ao fim do mundo",
    subtitle: "Os itens utilizados pelos sobreviventes das historias.",
    image_url:
      "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=2200&q=85",
    button_text: "Explorar Arsenal",
    button_link: "/arsenal",
    status: "active",
    created_at: now
  }
];

export const analyticsFallback = {
  totalClicks: 21842,
  todayAccess: 1367,
  ctr: 18.6,
  growth: 32.4,
  dailyClicks: [
    { day: "Seg", clicks: 340 },
    { day: "Ter", clicks: 490 },
    { day: "Qua", clicks: 620 },
    { day: "Qui", clicks: 810 },
    { day: "Sex", clicks: 1080 },
    { day: "Sab", clicks: 1260 },
    { day: "Dom", clicks: 1510 }
  ],
  sources: [
    { source: "Instagram", value: 68 },
    { source: "Google", value: 14 },
    { source: "Direto", value: 11 },
    { source: "Outros", value: 7 }
  ]
};
