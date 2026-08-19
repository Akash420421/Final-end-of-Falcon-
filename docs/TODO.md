# Website Recreation Blueprint & Step-by-Step Task List (TODO.md)
## Project: Falcon Electrics (Verma Enterprises) – B2B Digital Switch Showcase & CMS Platform
**Purpose:** Comprehensive, chronological implementation checklist to build or recreate this exact platform from scratch (from zero to full production deployment).

---

## 📋 Phase 0: Project Initialization & Environment Setup

- [ ] **Step 0.1: Initialize Vite Project with React 18 & TypeScript**
  - Initialize project with Vite 6+ and React 18.3.1 (`react`, `react-dom`).
  - Configure `tsconfig.json` in strict mode with `"moduleResolution": "bundler"`.
- [ ] **Step 0.2: Configure Tailwind CSS v4 & Iconography**
  - Install `@tailwindcss/vite` and `tailwindcss@^4.0`.
  - Configure `@import "tailwindcss";` in `src/index.css`.
  - Install `lucide-react` for tree-shaken SVG icons.
- [ ] **Step 0.3: Install Supporting Libraries**
  - Install `leaflet` and `@types/leaflet` for interactive factory map embedding.
  - Install `firebase` (v10+) for Google Cloud Firestore synchronization.
- [ ] **Step 0.4: Set Up Metadata & Environment Configuration**
  - Configure `metadata.json` with app title, description, and permissions.
  - Create `.env.example` documenting all optional cloud variables.

---

## 🗄️ Phase 1: Data Models, TypeScript Interfaces & Initial Seed Catalog

- [ ] **Step 1.1: Define Global TypeScript Types (`src/types.ts`)**
  - Define `Product` interface (`id`, `name`, `code`, `category`, `price`, `rating`, `description`, `image`, `images`, `specs`, `moq`, `isNew`, `isPopular`, `inStock`).
  - Define `Category` interface (`id`, `title`, `subtitle`, `iconName`, `image`, `bgColor`, `displayOrder`).
  - Define `CompanyDetails` & `HeroContent` interfaces for global branding singleton.
  - Define `QuoteFormData` for structured wholesale quotation lead dispatch.
- [ ] **Step 1.2: Create Factory Default Seed Catalog (`src/data/falconData.ts`)**
  - Populate company details: Verma Enterprises, Founder Vivek Verma (Est. 2005), New Delhi factory address, phone `+91 97175 49515`, GSTIN `07AXZPV6671J1Z8`.
  - Populate 4 seasonal categories: Summer Switches, Winter Switches, Rocker Switches, Mixer Grinder Controls.
  - Populate all 5 real electrical SKUs with high-detail technical specs (Fan Regulator ₹220, Heater Switch ₹340, Rocker ₹45, Mixer Switch ₹180, Cooler Switch ₹140).
  - Populate 6 trust pillars: In-House Manufacturing, Quality Tested, Bulk Supply Ready, Competitive Pricing, Custom OEM Orders, 1000+ Clients.

---

## ⚡ Phase 2: Core Engineering Utilities & Cloud Layer

- [ ] **Step 2.1: Implement In-Browser Canvas Image Compressor (`src/utils/imageCompressor.ts`)**
  - Build `compressImageFile` and `compressImageDataUrl` using HTML5 Canvas 2D context.
  - Enforce maximum bounding dimensions ($1200\text{px} \times 1200\text{px}$).
  - Implement iterative quality downscaling ($0.80 \rightarrow 0.35$) testing against `MAX_SAFE_BASE64_LENGTH` ($320\text{ KB}$).
  - Add solid white background fill for transparent PNG conversion.
  - Implement 20MB upper safety threshold check to prevent browser RAM exhaustion.
- [ ] **Step 2.2: Configure Google Cloud Firestore Client (`src/firebase.ts`)**
  - Initialize Firebase app with target database `ai-studio-falconelectrics-a38318f7-44db-478b-b613-eaff8ff818ed`.
  - Export `db` instance and helper references.
- [ ] **Step 2.3: Build Global Reactive State Manager (`src/context/StoreContext.tsx`)**
  - Create `StoreContext` and `useFalconStore` custom React hook.
  - Attach Firestore `onSnapshot` real-time listeners for `store_settings`, `products`, and `categories`.
  - Implement optimistic UI updates for zero-latency local mutations.
  - Add in-memory fallback layer from `src/data/falconData.ts` for offline resilience.
  - Implement mutation handlers: `updateCompanyBranding`, `addProduct`, `updateProduct`, `deleteProduct`, `addCategory`, and `resetToDefaultCatalog`.
- [ ] **Step 2.4: Configure Firestore Security Rules (`firestore.rules`)**
  - Define read/write rules for `store_settings`, `products`, `categories`, and `admin_auth`.

---

## 🎨 Phase 3: Global Chrome & Structural Layout Components

- [ ] **Step 3.1: Create Error Boundary & Skeletons (`src/components/ErrorBoundary.tsx` & `SkeletonLoaders.tsx`)**
  - Build class-based `ErrorBoundary` with reload action to catch unhandled errors.
  - Create `FullPageSkeletonLoader` with animated shimmer cards for cold-starts.
- [ ] **Step 3.2: Build Sticky Header & Secret 10-Click Gateway (`src/components/Header.tsx`)**
  - Display logo, company wordmark ("FALCON ELECTRICS"), and search input trigger.
  - Implement direct "Call Now" (`tel:`) and "WhatsApp Sales" buttons.
  - Implement discrete admin gateway: 10 rapid clicks on brand logo within 3.0s triggers `AdminLoginModal`.
- [ ] **Step 3.3: Build Desktop Navigation Row (`src/components/NavigationRow.tsx`)**
  - Render tab switchers for `Home`, `Products`, `About Us`, `Why Choose Falcon`, and `Contact`.
- [ ] **Step 3.4: Build Mobile Navigation Drawer & Bottom Sticky Bar (`src/components/MobileMenuDrawer.tsx`)**
  - Build slide-in drawer from left with touch backdrop.
  - Build fixed bottom sticky action bar with 1-tap **Call Factory**, **WhatsApp Sales**, and **Search Catalog**.
- [ ] **Step 3.5: Build Global Footer (`src/components/Footer.tsx`)**
  - Display brand profile, category directory, factory address, GSTIN, and BIS/ISI compliance mark.

---

## 📱 Phase 4: Storefront Showcase & Catalog Views

- [ ] **Step 4.1: Build Hero Section (`src/components/HeroSection.tsx`)**
  - Render H1 headline, value proposition copy, and CTA buttons ("Explore Catalog", "Download Price List").
  - Render Hero Switch Spotlight with floating badges (FR Grade PC, Silver Cadmium Inlay Contacts, 100k Clicks).
- [ ] **Step 4.2: Build Debounced Auto-Complete Search Bar (`src/components/SearchBar.tsx`)**
  - Implement 150ms debounced input matching Title, Model Code, Category, Amperage, and Material.
  - Add search clear (`X`) button and live matching results count.
- [ ] **Step 4.3: Build Auto-Scrolling Category Carousel (`src/components/CategoryCarousel.tsx`)**
  - Render touch-swipeable category cards with icons and item count badges.
  - Implement 2.5s auto-scroll with hover/touch pause and resume mechanics.
- [ ] **Step 4.4: Build Trust & Engineering Benefits Strip (`src/components/TrustBenefitsStrip.tsx`)**
  - Render 4-column matrix: 850°C Glow-Wire Fire Retardancy, Zero-Spark Contacts, Child Shutters, Pan-India Dispatch.
- [ ] **Step 4.5: Build Filterable Product Catalog Grid (`src/components/CategoryProductsView.tsx`)**
  - Render category chips, module size filters (`1M`–`8M`), amperage filters (`6A`–`32A`), and sort dropdown.
  - Render responsive product card grid with badges, specs, price, WhatsApp inquiry, and "View Details" buttons.
  - Render Zero-Results empty state with "Reset All Filters" button.
- [ ] **Step 4.6: Build Featured Products Grid (`src/components/FeaturedProducts.tsx`)**
  - Render homepage spotlight grid filtering items where `isPopular === true`.
- [ ] **Step 4.7: Build B2B Wholesale Dealership Acquisition Banner (`src/components/BulkDealerCTA.tsx`)**
  - Display wholesale margins, turnover rebates, free shop display boards, and "Apply for Dealership" CTA.
- [ ] **Step 4.8: Build About Heritage Section (`src/components/AboutFalcon.tsx`)**
  - Render Verma Enterprises 20-year manufacturing history, automated tooling machinery, and testing lab.
- [ ] **Step 4.9: Build Why Choose Us Benchmarks (`src/components/WhyChooseUs.tsx`)**
  - Render 4-point comparison matrix (Virgin Polycarbonate vs Recycled, Silver Inlay vs Stamped, 100k cycles).
- [ ] **Step 4.10: Build Contact & Factory Location Hub (`src/components/ContactSection.tsx`)**
  - Render sales desk directory, physical address cards, business hours, and interactive Leaflet map.

---

## 🪟 Phase 5: Interactive Modals & Lead Conversion Workflows

- [ ] **Step 5.1: Build Product Details Modal (`src/components/ProductDetailsModal.tsx`)**
  - Render multi-angle image gallery with interactive cross-fade thumbnail switcher.
  - Render comprehensive technical specifications table (voltage, amps, polymer grade, contacts, IS standard).
  - Render packaging logistics (inner box pcs, master carton pcs, MOQ).
  - Hook compliance: Ensure all `useState`/`useEffect` hooks reside strictly at the top level before early returns.
- [ ] **Step 5.2: Build Structured B2B Quotation Form Modal (`src/components/QuoteModal.tsx`)**
  - Pre-populate selected SKU name and model code.
  - Validate Dealer Name, 10-digit mobile number, delivery city & state, and required quantity.
  - Format structured WhatsApp payload and dispatch to sales desk.
- [ ] **Step 5.3: Build Admin Authentication Modal (`src/components/AdminLoginModal.tsx`)**
  - Render masked password/PIN input with show/hide toggle.
  - Trigger 6-point horizontal vibration shake animation (`animate-shake`) on invalid passcode.
  - Maintain authenticated session state.

---

## ⚙️ Phase 6: Zero-Code Admin Content Management System (CMS)

- [ ] **Step 6.1: Build Admin CMS Suite (`src/components/AdminPanelModal.tsx`)**
  - **Module A: Store Branding & Photo CMS:** Live company profile editing + Auto-compressing Logo & Hero Switch photo uploaders.
  - **Module B: Product SKU Catalog Manager:** Add new products, edit technical specifications, upload multi-photo galleries, toggle Featured/Bestseller flags, and delete obsolete SKUs.
  - **Module C: Category Taxonomy Manager:** Create new categories, assign Lucide icon names, and reorder display sequence.
  - **Module D: Cloud Tools & Recovery:** Real-time Firestore connection diagnostics and 1-Click "Reset & Re-Seed Default Factory Catalog" utility.

---

## 🚀 Phase 7: Application Assembly, Routing & Deployment

- [ ] **Step 7.1: Assemble Root Application View (`src/App.tsx`)**
  - Connect `StoreContext` provider.
  - Bind active tab routing (`Home`, `Products`, `About`, `Why Us`, `Contact`).
  - Manage modal dialog visibility states (`ProductDetailsModal`, `QuoteModal`, `AdminLoginModal`, `AdminPanelModal`).
  - Implement smooth scroll restoration to top `(0, 0)` on view switch.
- [ ] **Step 7.2: Verify Build & Type Safety**
  - Run TypeScript compiler: `npx tsc --noEmit`.
  - Run Vite production bundle build: `npm run build`.
  - Confirm static output generated in `dist/` with zero bundle errors.
- [ ] **Step 7.3: Deploy to Cloud Container & Verify Performance**
  - Bind dev/production server to `0.0.0.0:3000`.
  - Verify sub-second initial load on mobile 4G network.
  - Verify zero document size overflow on image uploads via Firestore diagnostics.

---
*Falcon Electrics Recreation Checklist — Step-by-Step Blueprint from Zero to Production.*
