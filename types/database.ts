export type ProductStatus = "active" | "inactive" | "draft";
export type BannerStatus = "active" | "inactive";
export type AdminRole = "admin" | "editor" | "analyst";
export type ModuleStatus = "active" | "inactive" | "draft";

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  created_at: string;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description?: string | null;
  full_description?: string | null;
  image_url: string;
  affiliate_url: string;
  category_id: string | null;
  is_featured: boolean;
  tags?: string[] | null;
  display_order?: number | null;
  story_section?: "most_used" | "forbidden" | "survivor_choice" | null;
  status: ProductStatus;
  created_at: string;
  categories?: Category | null;
  click_count?: number;
};

export type Click = {
  id: string;
  product_id: string;
  source?: string | null;
  campaign?: string | null;
  referrer: string | null;
  browser?: string | null;
  application?: string | null;
  device?: string | null;
  operating_system?: string | null;
  country?: string | null;
  city?: string | null;
  user_agent: string | null;
  ip_hash: string | null;
  created_at: string;
};

export type Banner = {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  button_text: string | null;
  button_link: string | null;
  status: BannerStatus;
  created_at: string;
};

export type Admin = {
  id: string;
  email: string;
  role: AdminRole;
  created_at: string;
};

export type Collection = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  status: ModuleStatus;
  is_featured: boolean;
  display_order: number;
  created_at: string;
};

export type CollectionProduct = {
  collection_id: string;
  product_id: string;
  position: number;
  created_at: string;
};

export type Coupon = {
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

export type AdminProfile = {
  id: string;
  name: string | null;
  email: string;
  avatar_url: string | null;
  role: AdminRole;
  status: "active" | "inactive";
  created_at: string;
};

export type TrackingLink = {
  id: string;
  name: string;
  destination_url: string;
  source: string;
  campaign: string;
  medium: string | null;
  tags: string[];
  status: "active" | "inactive";
  created_at: string;
};

export type Integration = {
  id: string;
  platform: string;
  description: string | null;
  status: "connected" | "disconnected" | "paused";
  token_hint: string | null;
  settings: Record<string, unknown>;
  last_sync_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      products: {
        Row: Product;
        Insert: Partial<Product>;
        Update: Partial<Product>;
      };
      categories: {
        Row: Category;
        Insert: Partial<Category>;
        Update: Partial<Category>;
      };
      clicks: {
        Row: Click;
        Insert: Partial<Click>;
        Update: Partial<Click>;
      };
      banners: {
        Row: Banner;
        Insert: Partial<Banner>;
        Update: Partial<Banner>;
      };
      admins: {
        Row: Admin;
        Insert: Partial<Admin>;
        Update: Partial<Admin>;
      };
      collections: {
        Row: Collection;
        Insert: Partial<Collection>;
        Update: Partial<Collection>;
      };
      collection_products: {
        Row: CollectionProduct;
        Insert: Partial<CollectionProduct>;
        Update: Partial<CollectionProduct>;
      };
      coupons: {
        Row: Coupon;
        Insert: Partial<Coupon>;
        Update: Partial<Coupon>;
      };
      admin_profiles: {
        Row: AdminProfile;
        Insert: Partial<AdminProfile>;
        Update: Partial<AdminProfile>;
      };
      tracking_links: {
        Row: TrackingLink;
        Insert: Partial<TrackingLink>;
        Update: Partial<TrackingLink>;
      };
      integrations: {
        Row: Integration;
        Insert: Partial<Integration>;
        Update: Partial<Integration>;
      };
    };
  };
};
