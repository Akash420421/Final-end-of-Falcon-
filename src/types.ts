export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  category: string; // e.g. 'summer', 'winter', 'modular', 'accessories', 'industrial'
  categoryName: string;
  subCategory?: string; // Optional sub-category (e.g., 'Rotary Switches', 'Fan Piano Switches')
  price?: string;
  perPiecePrice?: string; // 1 Pc Price
  amps?: string;
  voltage?: string;
  steps?: string;
  material?: string;
  description: string;
  features: string[];
  image: string; // Primary image URL or visual key
  images?: string[]; // Multiple photo gallery URLs
  customSpecs?: ProductSpec[]; // Custom key-value specs defined by admin
  isTopPick?: boolean;
  rating?: number;
  badge?: string;
  colorTheme?: string;
}

export interface Category {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  imageUrl?: string; // Custom uploaded image URL for category
  imageFit?: 'contain' | 'cover' | 'fill'; // Image fit mode for category cards (default: 'contain' auto-fit)
  bgColor: string; // Tailored category soft background
  borderColor: string;
  textColor: string;
  iconName: string;
  icon?: string;
  badge: string;
  order?: number;
  subCategories?: string[]; // Sub-categories under this category (e.g. ['Rotary Switches', 'Fan Piano Switches', 'Other Summer Controls'])
}

export interface QuoteRequest {
  id: string;
  name: string;
  phone: string;
  email?: string;
  quantity?: string;
  notes?: string;
  productName?: string;
  productId?: string;
  createdAt: string;
  status: 'Pending' | 'Contacted' | 'Closed';
}

export interface CataloguePage {
  id: string;
  pageNumber: number;
  title?: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string; // Custom uploaded A4 image URL
  image?: string;
  categoryTag?: string;
}

export interface CatalogueSettings {
  title: string;
  subtitle: string;
  badge?: string;
  pdfDownloadUrl?: string;
  whatsappMessage?: string;
  showPageNumbers?: boolean;
  pages: CataloguePage[];
}

export interface CompanyDetails {
  brandName: string;
  companyName: string;
  founder: string;
  foundedYear: number;
  tagline: string;
  logoTagline?: string;
  hideLogoText?: boolean;
  customHeaderBannerUrl?: string;
  headerBrandMode?: 'logo_text' | 'banner';
  headerBannerHeight?: number;
  address: string;
  mapQuery?: string;
  googleMapsEmbedUrl?: string;
  googleMapsDirectionsUrl?: string;
  phone: string;
  whatsapp: string;
  email: string;
  gstin: string;
  businessHours: string;
  facebook: string;
  instagram: string;
  quote: string;
  visitingCardImageUrl?: string;
  headerTheme?: string;
  location: {
    lat: number;
    lng: number;
    zoom: number;
  };
}

export type NavigationTab = 'HOME' | 'ABOUT' | 'PRODUCTS' | 'WHY_US' | 'CONTACT' | 'CATALOGUE';
