# Reusable Components Architecture (COMPONENTS.md)
## Project: Falcon Electricals – B2B Digital Switch Showcase & CMS Platform
**Document Version:** 2.0.0  
**Library:** React 18.3.1 + Tailwind CSS v4 + Lucide React  
**Location:** `/src/components/`  

---

## 1. Component Hierarchy & Architectural Map

```
App.tsx (Root Shell)
├── ErrorBoundary.tsx
├── FullPageSkeletonLoader.tsx
│
├── [Global Chrome]
│   ├── Header.tsx (Navbar, Search, Dialers, Secret 10-Click Admin Trigger)
│   ├── NavigationRow.tsx (Tab Switcher: Home, Products, About, Why Us, Contact)
│   ├── Footer.tsx (Company Profile, Category Links, Certifications)
│   └── MobileMenuDrawer.tsx (Slide-in Navigation Drawer)
│
├── [Main Content Views]
│   ├── HeroSection.tsx (Value Proposition, CTAs & Spotlight Hero Switch)
│   ├── SearchBar.tsx (Debounced Auto-Complete Search Input)
│   ├── CategoryCarousel.tsx (Auto-Scrolling Touch Carousel)
│   ├── CategoryProductsView.tsx (Filterable Catalog Grid & Spec Chips)
│   ├── FeaturedProducts.tsx (Spotlight Product Matrix)
│   ├── TrustBenefitsStrip.tsx (4-Pillar Quality Indicators)
│   ├── WhatsAppBanner.tsx (B2B Dealership Acquisition Strip)
│   ├── BulkDealerCTA.tsx (Wholesale Lead Capture)
│   ├── AboutFalcon.tsx (Heritage, Plant Machinery & Standards)
│   ├── WhyChooseUs.tsx (Engineering Testing Lab & Benchmarks)
│   ├── ContactSection.tsx (Address Cards, Form & Leaflet Map)
│   └── ProductVisual.tsx (Vector/SVG Electrical Accessory Renderer)
│
└── [Interactive Modals & Overlays]
    ├── ProductDetailsModal.tsx (Multi-Angle Gallery & Technical Spec Matrix)
    ├── QuoteModal.tsx (Structured B2B Quotation Form)
    ├── AdminLoginModal.tsx (Password Verification & Keypad)
    └── AdminPanelModal.tsx (Full CMS Suite: Branding, SKUs, Categories, Cloud Tools)
```

---

## 2. Comprehensive Component Catalog & Props Interface

---

### Component 1: `Header.tsx`
* **File:** `/src/components/Header.tsx`
* **Role:** Top navigation bar displaying brand logo, search bar trigger, direct phone/WhatsApp CTAs, and the 10-click secret admin portal trigger.
* **Props Interface:**
```typescript
interface HeaderProps {
  onOpenPhoneModal: () => void;
  onOpenWhatsApp: (productName?: string) => void;
  onToggleMenu: () => void;
  onAdminTrigger: () => void;
}
```
* **Internal Features:**
  - Tracks 10 consecutive clicks on brand logo within 3 seconds to unlock the hidden admin login dialog.
  - Sticky glassmorphism header (`backdrop-blur-md bg-white/95`).

---

### Component 2: `CategoryCarousel.tsx`
* **File:** `/src/components/CategoryCarousel.tsx`
* **Role:** Auto-scrolling horizontal visual slider showcasing electrical product categories.
* **Props Interface:**
```typescript
interface CategoryCarouselProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}
```
* **Interactive Rules:**
  - Auto-scrolls smoothly every 2.5 seconds.
  - Automatically pauses on mouse enter or touch start; resumes on mouse leave.
  - Gradient edge fade masks indicating scroll overflow.

---

### Component 3: `CategoryProductsView.tsx`
* **File:** `/src/components/CategoryProductsView.tsx`
* **Role:** Primary catalog grid view with category chips, module/amperage filters, sorting, and product cards.
* **Props Interface:**
```typescript
interface CategoryProductsViewProps {
  products: Product[];
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  onSelectProduct: (product: Product) => void;
  onRequestQuote: (product: Product) => void;
  onOpenWhatsApp: (productName: string) => void;
}
```

---

### Component 4: `ProductDetailsModal.tsx`
* **File:** `/src/components/ProductDetailsModal.tsx`
* **Role:** Full-screen dialog displaying multi-angle image gallery, detailed technical spec sheet, packaging MOQ, and instant quote CTAs.
* **Props Interface:**
```typescript
interface ProductDetailsModalProps {
  product: Product | null;
  onClose: () => void;
  onRequestQuote: (product: Product) => void;
  onOpenWhatsApp: (productName: string) => void;
}
```
* **Rules & Hooks:**
  - Hooks (`useState`, `useEffect`) strictly located at the component top level before any early return to guarantee Rules of Hooks compliance.
  - Mobile slide-up animation (`translate-y-0`) with bottom anchor.

---

### Component 5: `QuoteModal.tsx`
* **File:** `/src/components/QuoteModal.tsx`
* **Role:** Structured B2B quotation lead modal capturing dealer contact information, quantities, and location.
* **Props Interface:**
```typescript
interface QuoteModalProps {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
  onSubmitQuote?: (data: QuoteFormData) => void;
}
```

---

### Component 6: `AdminPanelModal.tsx`
* **File:** `/src/components/AdminPanelModal.tsx`
* **Role:** Complete zero-code Content Management System for store owner.
* **Props Interface:**
```typescript
interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
}
```
* **Sub-Modules:**
  1. *Store Branding & Hero CMS:* Live company profile editing + Auto-compressing Logo & Hero Switch photo uploaders.
  2. *Product SKU Catalog CMS:* Add/Edit/Delete products with multi-photo uploaders and featured toggles.
  3. *Category CMS:* Add/Edit category names, display rank, and icons.
  4. *Cloud Tools:* Firestore connection monitor and 1-Click Default Catalog Seed/Restore.

---

### Component 7: `AdminLoginModal.tsx`
* **File:** `/src/components/AdminLoginModal.tsx`
* **Role:** PIN / password verification modal protecting the CMS dashboard.
* **Props Interface:**
```typescript
interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}
```
* **Micro-Interactions:**
  - Shakes horizontally (`animate-shake`) on invalid passcode.
  - Password visibility toggle.

---

### Component 8: `ContactSection.tsx`
* **File:** `/src/components/ContactSection.tsx`
* **Role:** Factory and corporate office contact information, working hours, interactive Leaflet map, and direct inquiry form.
* **Props Interface:**
```typescript
interface ContactSectionProps {
  onOpenWhatsApp: (message?: string) => void;
}
```

---

### Component 9: `SkeletonLoaders.tsx`
* **File:** `/src/components/SkeletonLoaders.tsx`
* **Role:** High-fidelity animated shimmer placeholder skeletons during cloud database cold-starts.
* **Components Exported:**
  - `FullPageSkeletonLoader`: Complete hero, carousel, and grid placeholder.
  - `ProductCardSkeleton`: Single card shimmer placeholder.

---

### Component 10: `ErrorBoundary.tsx`
* **File:** `/src/components/ErrorBoundary.tsx`
* **Role:** Class-based React Error Boundary catching unexpected runtime exceptions with an elegant fallback screen and "Reload Website" button.

---

## 3. Component Design & Implementation Rules

1. **Strict Rules of Hooks Compliance:** Never place `useState`, `useEffect`, or `useMemo` hooks below conditional checks or early returns (`if (!data) return null;`).
2. **Prop Drilling Elimination:** Global state (products, categories, branding, loading status) is accessed directly via `useFalconStore()` hook.
3. **Single-Line Button Labels:** All button labels MUST include `whitespace-nowrap shrink-0` to avoid broken wrapping on mobile screens.
4. **Touch Target Standard:** Every interactive button, pill, tab, and input provides a minimum 44px touch area (`min-h-[44px]`).
5. **Image Rendering Safety:** Every image tag uses a fallback placeholder if an image fails to load or URL is invalid.

---
*Falcon Electricals Component Architecture — Modular, Reusable, Production-Grade.*
