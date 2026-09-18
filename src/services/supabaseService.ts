import { supabase } from '../supabase';
import { Product, Category, QuoteRequest, CatalogueSettings, CataloguePage, CompanyDetails } from '../types';
import { HeroContent, WhyChooseItem, AdminCredentials } from '../context/StoreContext';

/**
 * Normalizes a category row from Supabase (handles both camelCase and snake_case column names)
 */
export function mapCategoryFromSupabase(row: any): Category {
  return {
    id: row.id,
    title: row.title || '',
    subtitle: row.subtitle || '',
    description: row.description || '',
    image: row.image || row.image_url || row.imageUrl || '',
    imageUrl: row.imageUrl || row.image_url || row.image || '',
    imageFit: row.imageFit || row.image_fit || 'contain',
    bgColor: row.bgColor || row.bg_color || '',
    borderColor: row.borderColor || row.border_color || '',
    textColor: row.textColor || row.text_color || '',
    iconName: row.iconName || row.icon_name || '',
    icon: row.icon || '',
    badge: row.badge || '',
    order: typeof row.order === 'number' ? row.order : (typeof row.order_index === 'number' ? row.order_index : 0),
    subCategories: Array.isArray(row.subCategories) ? row.subCategories : (Array.isArray(row.sub_categories) ? row.sub_categories : []),
  };
}

/**
 * Normalizes a product row from Supabase (handles both camelCase and snake_case column names)
 */
export function mapProductFromSupabase(row: any): Product {
  return {
    id: row.id,
    name: row.name || '',
    category: row.category || '',
    categoryName: row.categoryName || row.category_name || '',
    subCategory: row.subCategory || row.sub_category || '',
    price: row.price || '',
    perPiecePrice: row.perPiecePrice || row.per_piece_price || '',
    amps: row.amps || '',
    voltage: row.voltage || '',
    steps: row.steps || '',
    material: row.material || '',
    description: row.description || '',
    features: Array.isArray(row.features) ? row.features : [],
    image: row.image || '',
    images: Array.isArray(row.images) ? row.images : [],
    customSpecs: Array.isArray(row.customSpecs) ? row.customSpecs : (Array.isArray(row.custom_specs) ? row.custom_specs : []),
    isTopPick: Boolean(row.isTopPick ?? row.is_top_pick),
    rating: typeof row.rating === 'number' ? row.rating : Number(row.rating) || 5.0,
    badge: row.badge || '',
    colorTheme: row.colorTheme || row.color_theme || '',
  };
}

/**
 * Normalizes a quote row from Supabase
 */
export function mapQuoteFromSupabase(row: any): QuoteRequest {
  return {
    id: row.id,
    name: row.name || '',
    phone: row.phone || '',
    email: row.email || '',
    quantity: row.quantity || '100 Units',
    notes: row.notes || '',
    productName: row.productName || row.product_name || '',
    productId: row.productId || row.product_id || '',
    status: row.status || 'Pending',
    createdAt: row.createdAt || row.created_at || new Date().toISOString(),
  };
}

/**
 * Normalizes a catalogue page row from Supabase
 */
export function mapCataloguePageFromSupabase(row: any): CataloguePage {
  return {
    id: row.id,
    pageNumber: typeof row.pageNumber === 'number' ? row.pageNumber : (typeof row.page_number === 'number' ? row.page_number : 1),
    title: row.title || '',
    subtitle: row.subtitle || '',
    description: row.description || '',
    imageUrl: row.imageUrl || row.image_url || row.image || '',
    image: row.image || row.image_url || row.imageUrl || '',
    categoryTag: row.categoryTag || row.category_tag || '',
  };
}

/**
 * Fetches all store settings from Supabase
 */
export async function fetchSupabaseStoreSettings(): Promise<{
  companyDetails?: CompanyDetails;
  heroContent?: HeroContent;
  logoImageUrl?: string;
  whyChooseUs?: WhyChooseItem[];
  catalogueSettings?: CatalogueSettings;
  adminAuth?: AdminCredentials;
} | null> {
  try {
    const { data, error } = await supabase
      .from('store_settings')
      .select('*')
      .eq('id', 'company_branding')
      .maybeSingle();

    if (error) {
      console.warn('[SupabaseService] fetchStoreSettings notice:', error?.message || error);
      return null;
    }

    if (!data) {
      return null;
    }

    return {
      companyDetails: data.company_details || data.companyDetails,
      heroContent: data.hero_content || data.heroContent,
      logoImageUrl: data.logo_image_url || data.logoImageUrl,
      whyChooseUs: data.why_choose_us || data.whyChooseUs,
      catalogueSettings: data.catalogue_settings || data.catalogueSettings,
      adminAuth: data.admin_auth || data.adminAuth,
    };
  } catch (err: any) {
    console.warn('[SupabaseService] fetchStoreSettings network notice:', err?.message || err);
    return null;
  }
}

/**
 * Saves store settings to Supabase
 */
export async function saveSupabaseStoreSettings(payload: {
  companyDetails?: CompanyDetails;
  heroContent?: HeroContent;
  logoImageUrl?: string;
  whyChooseUs?: WhyChooseItem[];
  catalogueSettings?: CatalogueSettings;
  adminAuth?: AdminCredentials;
}) {
  const rowData: Record<string, any> = {
    id: 'company_branding',
    updated_at: new Date().toISOString(),
  };

  if (payload.companyDetails !== undefined) {
    rowData.company_details = payload.companyDetails;
  }
  if (payload.heroContent !== undefined) {
    rowData.hero_content = payload.heroContent;
  }
  if (payload.logoImageUrl !== undefined) {
    rowData.logo_image_url = payload.logoImageUrl;
  }
  if (payload.whyChooseUs !== undefined) {
    rowData.why_choose_us = payload.whyChooseUs;
  }
  if (payload.catalogueSettings !== undefined) {
    rowData.catalogue_settings = payload.catalogueSettings;
  }
  if (payload.adminAuth !== undefined) {
    rowData.admin_auth = payload.adminAuth;
  }

  try {
    const { error } = await supabase
      .from('store_settings')
      .upsert(rowData, { onConflict: 'id' });

    if (error) {
      console.warn('[SupabaseService] saveSupabaseStoreSettings notice:', error?.message || error);
    }
  } catch (err: any) {
    console.warn('[SupabaseService] saveSupabaseStoreSettings network notice:', err?.message || err);
  }
}

/**
 * Fetches all categories from Supabase
 */
export async function fetchSupabaseCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('order_index', { ascending: true });

    if (error) {
      console.warn('[SupabaseService] fetchCategories notice:', error?.message || error);
      return [];
    }

    return (data || []).map(mapCategoryFromSupabase);
  } catch (err: any) {
    console.warn('[SupabaseService] fetchCategories network notice:', err?.message || err);
    return [];
  }
}

/**
 * Saves or updates a category in Supabase
 */
export async function upsertSupabaseCategory(category: Category) {
  const rowData = {
    id: category.id,
    title: category.title,
    subtitle: category.subtitle || '',
    description: category.description || '',
    image: category.image || category.imageUrl || '',
    image_url: category.imageUrl || category.image || '',
    image_fit: category.imageFit || 'contain',
    bg_color: category.bgColor || '',
    border_color: category.borderColor || '',
    text_color: category.textColor || '',
    icon_name: category.iconName || '',
    icon: category.icon || '',
    badge: category.badge || '',
    order_index: category.order ?? 0,
    sub_categories: category.subCategories || [],
    updated_at: new Date().toISOString(),
  };

  try {
    const { error } = await supabase
      .from('categories')
      .upsert(rowData, { onConflict: 'id' });

    if (error) {
      console.warn('[SupabaseService] upsertSupabaseCategory notice:', error?.message || error);
    }
  } catch (err: any) {
    console.warn('[SupabaseService] upsertSupabaseCategory network notice:', err?.message || err);
  }
}

/**
 * Deletes a category from Supabase
 */
export async function deleteSupabaseCategory(id: string) {
  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      console.warn('[SupabaseService] deleteSupabaseCategory notice:', error?.message || error);
    }
  } catch (err: any) {
    console.warn('[SupabaseService] deleteSupabaseCategory network notice:', err?.message || err);
  }
}

/**
 * Fetches all products from Supabase
 */
export async function fetchSupabaseProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[SupabaseService] fetchProducts notice:', error?.message || error);
      return [];
    }

    return (data || []).map(mapProductFromSupabase);
  } catch (err: any) {
    console.warn('[SupabaseService] fetchProducts network notice:', err?.message || err);
    return [];
  }
}

/**
 * Saves or updates a product in Supabase
 */
export async function upsertSupabaseProduct(product: Product) {
  const rowData = {
    id: product.id,
    name: product.name,
    category: product.category,
    category_name: product.categoryName || '',
    sub_category: product.subCategory || '',
    price: product.price || '',
    per_piece_price: product.perPiecePrice || '',
    amps: product.amps || '',
    voltage: product.voltage || '',
    steps: product.steps || '',
    material: product.material || '',
    description: product.description || '',
    features: product.features || [],
    image: product.image || '',
    images: product.images || [],
    custom_specs: product.customSpecs || [],
    is_top_pick: Boolean(product.isTopPick),
    rating: product.rating ?? 5.0,
    badge: product.badge || '',
    color_theme: product.colorTheme || '',
    updated_at: new Date().toISOString(),
  };

  try {
    const { error } = await supabase
      .from('products')
      .upsert(rowData, { onConflict: 'id' });

    if (error) {
      console.warn('[SupabaseService] upsertSupabaseProduct notice:', error?.message || error);
    }
  } catch (err: any) {
    console.warn('[SupabaseService] upsertSupabaseProduct network notice:', err?.message || err);
  }
}

/**
 * Deletes a product from Supabase
 */
export async function deleteSupabaseProduct(id: string) {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.warn('[SupabaseService] deleteSupabaseProduct notice:', error?.message || error);
    }
  } catch (err: any) {
    console.warn('[SupabaseService] deleteSupabaseProduct network notice:', err?.message || err);
  }
}

/**
 * Fetches all quotes from Supabase
 */
export async function fetchSupabaseQuotes(): Promise<QuoteRequest[]> {
  try {
    const { data, error } = await supabase
      .from('quotes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[SupabaseService] fetchQuotes notice:', error?.message || error);
      return [];
    }

    return (data || []).map(mapQuoteFromSupabase);
  } catch (err: any) {
    console.warn('[SupabaseService] fetchQuotes network notice:', err?.message || err);
    return [];
  }
}

/**
 * Saves a quote to Supabase
 */
export async function insertSupabaseQuote(quote: QuoteRequest) {
  const rowData = {
    id: quote.id,
    name: quote.name,
    phone: quote.phone,
    email: quote.email || '',
    quantity: quote.quantity || '100 Units',
    notes: quote.notes || '',
    product_name: quote.productName || '',
    product_id: quote.productId || '',
    status: quote.status || 'Pending',
    created_at: quote.createdAt || new Date().toISOString(),
  };

  try {
    const { error } = await supabase
      .from('quotes')
      .insert(rowData);

    if (error) {
      console.warn('[SupabaseService] insertSupabaseQuote notice:', error?.message || error);
    }
  } catch (err: any) {
    console.warn('[SupabaseService] insertSupabaseQuote network notice:', err?.message || err);
  }
}

/**
 * Updates quote status in Supabase
 */
export async function updateSupabaseQuoteStatus(id: string, status: QuoteRequest['status']) {
  try {
    const { error } = await supabase
      .from('quotes')
      .update({ status })
      .eq('id', id);

    if (error) {
      console.warn('[SupabaseService] updateSupabaseQuoteStatus notice:', error?.message || error);
    }
  } catch (err: any) {
    console.warn('[SupabaseService] updateSupabaseQuoteStatus network notice:', err?.message || err);
  }
}

/**
 * Deletes a quote from Supabase
 */
export async function deleteSupabaseQuote(id: string) {
  try {
    const { error } = await supabase
      .from('quotes')
      .delete()
      .eq('id', id);

    if (error) {
      console.warn('[SupabaseService] deleteSupabaseQuote notice:', error?.message || error);
    }
  } catch (err: any) {
    console.warn('[SupabaseService] deleteSupabaseQuote network notice:', err?.message || err);
  }
}

/**
 * Fetches catalogue pages from Supabase
 */
export async function fetchSupabaseCataloguePages(): Promise<CataloguePage[]> {
  try {
    const { data, error } = await supabase
      .from('catalogue_pages')
      .select('*')
      .order('page_number', { ascending: true });

    if (error) {
      console.warn('[SupabaseService] fetchCataloguePages notice:', error?.message || error);
      return [];
    }

    return (data || []).map(mapCataloguePageFromSupabase);
  } catch (err: any) {
    console.warn('[SupabaseService] fetchCataloguePages network notice:', err?.message || err);
    return [];
  }
}

/**
 * Saves a catalogue page to Supabase
 */
export async function upsertSupabaseCataloguePage(page: CataloguePage) {
  const rowData = {
    id: page.id,
    page_number: page.pageNumber,
    title: page.title || '',
    subtitle: page.subtitle || '',
    description: page.description || '',
    image_url: page.imageUrl || page.image || '',
    image: page.image || page.imageUrl || '',
    category_tag: page.categoryTag || '',
    updated_at: new Date().toISOString(),
  };

  try {
    const { error } = await supabase
      .from('catalogue_pages')
      .upsert(rowData, { onConflict: 'id' });

    if (error) {
      console.warn('[SupabaseService] upsertSupabaseCataloguePage notice:', error?.message || error);
    }
  } catch (err: any) {
    console.warn('[SupabaseService] upsertSupabaseCataloguePage network notice:', err?.message || err);
  }
}

/**
 * Verifies Supabase connection and checks if the required tables exist
 */
export async function testSupabaseConnection(): Promise<{
  connected: boolean;
  tablesExist: boolean;
  message: string;
  errorDetail?: string;
}> {
  try {
    const { data, error } = await supabase
      .from('store_settings')
      .select('id')
      .limit(1);

    if (error) {
      if (
        error.message?.includes('relation') ||
        error.message?.includes('does not exist') ||
        error.code === '42P01' ||
        error.code === 'PGRST204' ||
        error.code === 'PGRST205'
      ) {
        return {
          connected: true,
          tablesExist: false,
          message: 'Supabase connected, but tables (store_settings, products, etc.) have not been created yet in SQL Editor.',
          errorDetail: error.message,
        };
      }

      if (
        error.code === '42501' ||
        error.message?.includes('permission denied') ||
        error.message?.includes('violates row-level security')
      ) {
        return {
          connected: true,
          tablesExist: false,
          message: 'PostgreSQL Permission Denied: Please run the updated SQL schema with GRANT permissions in Supabase SQL Editor.',
          errorDetail: error.message,
        };
      }

      if (error.message?.includes('JWT') || error.message?.includes('apikey') || error.code === 'PGRST301') {
        return {
          connected: false,
          tablesExist: false,
          message: 'Supabase API Key authentication error. Please verify the publishable key.',
          errorDetail: error.message,
        };
      }

      return {
        connected: false,
        tablesExist: false,
        message: error.message || 'Database query error',
        errorDetail: JSON.stringify(error),
      };
    }

    return {
      connected: true,
      tablesExist: true,
      message: 'All Supabase tables and permissions are active and syncing in real-time!',
    };
  } catch (err: any) {
    return {
      connected: false,
      tablesExist: false,
      message: 'Unable to reach Supabase: ' + (err?.message || err),
      errorDetail: String(err),
    };
  }
}
