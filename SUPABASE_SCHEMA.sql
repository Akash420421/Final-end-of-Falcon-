-- =========================================================
-- FALCON ELECTRICS (VERMA ENTERPRISES) - SUPABASE SQL SCHEMA
-- =========================================================
-- Run this SQL in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/ywgosjrealgcbanelfei/sql

-- 1. Create store_settings table
CREATE TABLE IF NOT EXISTS public.store_settings (
    id TEXT PRIMARY KEY,
    company_details JSONB DEFAULT '{}'::jsonb,
    hero_content JSONB DEFAULT '{}'::jsonb,
    logo_image_url TEXT DEFAULT '',
    why_choose_us JSONB DEFAULT '[]'::jsonb,
    catalogue_settings JSONB DEFAULT '{}'::jsonb,
    admin_auth JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT DEFAULT '',
    description TEXT DEFAULT '',
    image TEXT DEFAULT '',
    image_url TEXT DEFAULT '',
    image_fit TEXT DEFAULT 'contain',
    bg_color TEXT DEFAULT '',
    border_color TEXT DEFAULT '',
    text_color TEXT DEFAULT '',
    icon_name TEXT DEFAULT '',
    icon TEXT DEFAULT '',
    badge TEXT DEFAULT '',
    order_index INTEGER DEFAULT 0,
    sub_categories JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Create products table
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    category_name TEXT DEFAULT '',
    sub_category TEXT DEFAULT '',
    price TEXT DEFAULT '',
    per_piece_price TEXT DEFAULT '',
    amps TEXT DEFAULT '',
    voltage TEXT DEFAULT '',
    steps TEXT DEFAULT '',
    material TEXT DEFAULT '',
    description TEXT DEFAULT '',
    features JSONB DEFAULT '[]'::jsonb,
    image TEXT DEFAULT '',
    images JSONB DEFAULT '[]'::jsonb,
    custom_specs JSONB DEFAULT '[]'::jsonb,
    is_top_pick BOOLEAN DEFAULT FALSE,
    rating NUMERIC DEFAULT 5.0,
    badge TEXT DEFAULT '',
    color_theme TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Create quotes table
CREATE TABLE IF NOT EXISTS public.quotes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT DEFAULT '',
    quantity TEXT DEFAULT '100 Units',
    notes TEXT DEFAULT '',
    product_name TEXT DEFAULT '',
    product_id TEXT DEFAULT '',
    status TEXT DEFAULT 'Pending',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Create catalogue_pages table
CREATE TABLE IF NOT EXISTS public.catalogue_pages (
    id TEXT PRIMARY KEY,
    page_number INTEGER NOT NULL,
    title TEXT DEFAULT '',
    subtitle TEXT DEFAULT '',
    description TEXT DEFAULT '',
    image_url TEXT DEFAULT '',
    image TEXT DEFAULT '',
    category_tag TEXT DEFAULT '',
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =========================================================
-- Enable Row Level Security (RLS) & Allow Anonymous Read/Write
-- =========================================================
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalogue_pages ENABLE ROW LEVEL SECURITY;

-- Allow public reads and writes via Supabase Publishable Key
CREATE POLICY "Allow public read access on store_settings" ON public.store_settings FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on store_settings" ON public.store_settings FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read access on categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read access on products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on products" ON public.products FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read access on quotes" ON public.quotes FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on quotes" ON public.quotes FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read access on catalogue_pages" ON public.catalogue_pages FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on catalogue_pages" ON public.catalogue_pages FOR ALL USING (true) WITH CHECK (true);

-- Enable Realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.store_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.categories;
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.quotes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.catalogue_pages;
