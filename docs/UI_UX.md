# UI/UX Specification & Interaction Architecture (UI_UX.md)
## Project: Falcon Electricals – B2B Digital Switch Showcase & CMS Platform
**Document Version:** 2.0.0  
**Design Standard:** Industrial Precision, Mobile-First Touch Ergonomics & Responsive High-Contrast Layouts  

---

## 1. Global Layout & Viewport Hierarchy

The application implements a responsive, single-page architectural shell that dynamically renders main content views, full-screen product galleries, and slide-in overlays without page reloads.

```
+-----------------------------------------------------------------------------------+
| Top Announcement Bar (Working Hours, GSTIN & Fast Helpline)                       |
+-----------------------------------------------------------------------------------+
| Sticky Main Header (Logo, Search Trigger, Quick Dial, WhatsApp & Admin Key)       |
+-----------------------------------------------------------------------------------+
| Global Navigation Menu Row (Home, Products, Categories, About Us, Contact)        |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|                              ACTIVE MAIN VIEWPORT                                 |
|                                                                                   |
|  [Route: /]                   [Route: /products]          [Route: /contact]       |
|  ├── Dynamic Hero Showcase    ├── Active Breadcrumbs      ├── Contact Card Matrix |
|  ├── Category Carousel        ├── Category Filter Chips   ├── Working Hours       |
|  ├── Trust Benefits Strip     ├── Product Grid Matrix     ├── Leaflet Factory Map |
|  ├── Featured Products Grid   └── Zero Results State      └── Quick Inquiry Form  |
|  ├── B2B Dealership Banner                                                        |
|  ├── Why Choose Falcon                                                            |
|  ├── Factory Quality Lab                                                          |
|  └── Contact & Map Section                                                        |
|                                                                                   |
+-----------------------------------------------------------------------------------+
| Global Footer (Company Info, Category Directory, Certifications & Legal)         |
+-----------------------------------------------------------------------------------+
| Fixed Mobile Bottom Action Hub (Call Factory, WhatsApp Sales, Catalog Search)     |
+-----------------------------------------------------------------------------------+
```

---

## 2. Comprehensive View & Page Layout Specifications

---

### View 1: Main Home Showcase View (`/`)

#### 1.1 Top Announcement Bar
* **Layout:** Slim 36px horizontal strip with dark industrial slate background (`bg-slate-900 text-slate-300`).
* **Content:**
  - Left: Operating Hours ("Mon - Sat: 9:00 AM - 7:30 PM") with clock icon.
  - Center: Compliance badge ("ISI & ISO 9001:2015 Certified Manufacturer").
  - Right: Quick Phone & WhatsApp links with subtle hover highlights.
* **Responsive Behavior:** On mobile screens (`< 640px`), secondary text collapses to display only the direct contact number.

#### 1.2 Sticky Main Header
* **Layout:** 68px height, `bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40`.
* **Elements:**
  1. **Brand Identity:** Falcon Falcon bird emblem with crisp typographic wordmark ("FALCON ELECTRICALS") and tagline ("Switch to Quality").
  2. **Live Auto-Complete Search Input:** Centered pill container with search icon, clear button, and category tag dropdown.
  3. **Direct Contact CTAs:**
     - 📞 **"Call Now"** (`tel:` link with phone icon).
     - 💬 **"WhatsApp"** (Emerald green badge `#25D366` with instant chat trigger).
  4. **Admin Key Lock:** Secure key icon triggering the password modal.
  5. **Mobile Hamburger Menu:** 44px tap zone on mobile to slide out the navigation drawer.

#### 1.3 Hero Section (The Switch Showcase)
* **Layout:** 2-Column Split Hero (Desktop) / Vertical Stack (Mobile).
* **Left Column (Value Proposition & CTAs):**
  - **Overline Badge:** "10-Year Replacement Guarantee • Direct Factory Supply".
  - **H1 Headline:** High-impact heading emphasizing fire-retardant safety and heavy-duty silver contacts.
  - **Action Button Row:**
    - Primary Red Button (`#E0183D`): "Explore Catalog" (Smooth scrolls to product catalog).
    - Secondary Outline Button: "Download PDF Brochure" with download icon.
    - WhatsApp Quick Inquiry Button.
* **Right Column (Hero Switch Spotlight):**
  - **Visual Container:** Slate-900 dark contrast container with radial background accent.
  - **Interactive Hero Switch:** High-definition rendered modular switch image.
  - **Floating Technical Badges:**
    - 🛡️ *100% Virgin FR Polycarbonate*
    - ⚡ *Silver Cadmium Inlay Contacts*
    - 🔘 *100,000+ Click Mechanical Durability*

#### 1.4 Category Carousel & Quick Filter Bar
* **Layout:** Full-width container with gradient edge masks indicating horizontal scrollability.
* **Card Anatomy:** 140px $\times$ 140px rounded-2xl cards with custom category icons, title, and item count badge.
* **Interaction:** Auto-scrolls smoothly; touch-drag enabled; hovering pauses auto-scroll.

#### 1.5 Trust & Benefits Strip
* **Layout:** 4-Column Grid (`grid-cols-2 md:grid-cols-4 gap-4 py-8`).
* **Pillars:**
  1. *Fire-Retardant Safety:* Self-extinguishing material tested up to 850°C.
  2. *Zero-Spark Contacts:* High-conductivity silver alloy preventing oxidation.
  3. *Child Safety Shutters:* Dual safety shutters on power sockets.
  4. *Fast Pan-India Logistics:* 24–48 hour dispatch commitment.

#### 1.6 Featured Products Grid
* **Layout:** 3 to 4 column responsive grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6`).
* **Card Anatomy:** (Refer to Card Specification in Section 3).

#### 1.7 B2B Dealership Acquisition Banner
* **Layout:** Full-width deep slate container with subtle metallic grid texture.
* **Content:** "Become an Authorized Falcon Dealer / Distributor in Your City". Highlights dealer margins, annual turnover rebates, and complimentary shop display boards.
* **Action:** Direct "Apply for Dealership" button opening the structured inquiry form.

#### 1.8 Factory Quality Assurance & Engineering Showcase
* **Layout:** 3-Step visual workflow detailing:
  1. Automated High-Precision Injection Molding.
  2. 100,000 Cycle Contact Life Endurance Testing.
  3. High-Voltage Spark Resistance & Insulation Testing.

#### 1.9 Location, Factory & Contact Hub
* **Layout:** Split layout featuring interactive Leaflet map, address card, phone directory, and working hours.

---

### View 2: Dedicated Products & Category Filter View (`/products`, `/category/:id`)

* **Breadcrumb Strip:** `Home > Products > [Active Category Name]` for instant orientation.
* **Active Category Header:** Category title, description, and total SKU counter (e.g. "Showing 24 Products in Modular Switches").
* **Filter & Sort Toolbar:**
  - Category selector chips with horizontal scroll.
  - Module size filters (`1M`, `2M`, `3M`, `4M`, `6M`, `8M`).
  - Amperage filters (`6A`, `10A`, `16A`, `25A`, `32A`).
  - Sort dropdown: "Featured First", "Price: Low to High", "Price: High to Low", "Model Code A-Z".
* **Zero Results State:** Clean graphic showing a search icon, message ("No products found matching your filter"), and a "Reset All Filters" button.

---

### View 3: About Falcon Heritage & Engineering View (`/about`)

* **Brand Origin Story:** Falcon Electricals' journey, plant infrastructure, and commitment to electrical safety standards.
* **Certifications Matrix:** ISO 9001:2015, ISI (IS 3854, IS 1293), CE, and RoHS badges.
* **Core Leadership & Vision:** Direct message from management on quality assurance.

---

### View 4: Contact & Factory Location Hub (`/contact`)

* **Direct Contact Cards:** Primary sales desk, technical assistance line, and export inquiry helpline.
* **Factory Coordinates:** Full address, landmark, PIN code, and GPS directions.
* **Interactive Leaflet Map:** Embedded map centered on factory coordinates with custom red marker pin.
* **Quick Message Form:** Direct lead submission capturing Name, City, Mobile Number, and Requirement.

---

## 3. Modal Dialogs & Drawer Interaction Specifications

---

### Modal 1: Comprehensive Technical Specification & Product Modal

```
+-----------------------------------------------------------------------------------+
| [Modal Header: Product Name & SKU Code]                                       [X] |
+-----------------------------------------------------------------------------------+
| +----------------------------------+  +-----------------------------------------+ |
| |                                  |  | Technical Specifications Table          | |
| |        MAIN IMAGE VIEWPORT       |  | ├── Rated Voltage: 240V~ 50Hz           | |
| |     (High-Resolution Display)    |  | ├── Rated Current: 10A / 16A            | |
| |                                  |  | ├── Module Footprint: 1 Module (1M)     | |
| +----------------------------------+  | ├── Body Material: FR Grade PC          | |
| +----------------------------------+  | ├── Contact: Silver Cadmium Inlay       | |
| | [Thumb 1] [Thumb 2] [Thumb 3]    |  | ├── Standard: IS 3854:1997              | |
| +----------------------------------+  | └── Warranty: 10 Years Guarantee        | |
|                                       +-----------------------------------------+ |
|                                       | Packaging & Wholesale MOQ               | |
|                                       | Inner Box: 20 Pcs • Master Carton: 200  | |
+-----------------------------------------------------------------------------------+
| Actions: [ 💬 WhatsApp Direct Inquiry ]    [ 📋 Request Bulk Price Quotation ]    |
+-----------------------------------------------------------------------------------+
```

#### Interaction Flow:
1. **Trigger:** Clicing "View Details" on any product card or deep-linking to `/product/:id`.
2. **Animation:** Backdrop fades in (200ms); modal container scales from 0.95 to 1.0 (250ms ease-out). On mobile, slides up smoothly from bottom (`translate-y-0`).
3. **Thumbnail Switcher:** Clicking any thumbnail updates the main viewport instantly with a smooth cross-fade.
4. **Dismissal:** Clicking `X`, clicking outside on backdrop, or pressing `Esc` key smoothly dismisses the modal.

---

### Modal 2: B2B Bulk Quotation Request Modal

* **Header:** "Request Bulk Wholesale Quotation".
* **Pre-Filled Info:** Displays selected product name and SKU code with an option to add more items.
* **Form Inputs:**
  - Full Name / Business Entity Name (Required).
  - Mobile Number with auto +91 prefix (Required, 10-digit validation).
  - City & State (Required for shipping estimation).
  - Estimated Order Quantity (e.g. 500 pcs, 2000 pcs, 10 Master Cartons).
  - Additional Notes / Requirement textarea.
* **Submit Action:** Validates all fields $\rightarrow$ Formats structured message $\rightarrow$ Dispatches to WhatsApp / Cloud storage $\rightarrow$ Displays positive confirmation checkmark.

---

### Modal 3: Secure Admin Authentication Modal

* **Header:** Lock icon with "Falcon Admin Portal".
* **Input:** Password / PIN entry field with "Show / Hide Password" toggle.
* **Error Handling:** If incorrect password is submitted, input field triggers a horizontal shake animation (`animate-shake`) and displays "Invalid Admin Passcode".
* **Success:** Instant transition into the full Admin Management Dashboard.

---

### Modal 4: Full Admin CMS Dashboard

* **Header Strip:** Admin status badge, Database Connection indicator, and "Exit Admin" button.
* **Tab Navigation:**
  1. 🏢 **Store Branding:** Edit Company Name, Tagline, Phone, WhatsApp, Address, Logo, and Hero Switch Photo.
  2. 📦 **Products Manager:** Add New Product, Edit Specs, Upload Multi-Photos, Toggle Featured/Bestseller, Delete SKU.
  3. 📑 **Categories Manager:** Add/Edit/Delete Categories and assign icon names.
  4. ⚙️ **Database & Cloud Tools:** Connection monitor, raw JSON export, and 1-Click Catalog Reset.
* **Photo Upload Interaction:** Drag-and-drop or file pick triggers client-side HTML5 canvas compression with live progress spinner and instant thumbnail preview.

---

### Drawer: Mobile Menu & Bottom Sticky Action Hub

* **Slide-In Mobile Drawer (`< 768px`):** Slides in from left with full navigation links, contact shortcuts, and category list.
* **Bottom Sticky Bar:** Fixed at `bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 p-2 flex justify-around`.
  - 📞 **Call Sales:** 1-tap phone dialer.
  - 💬 **WhatsApp:** 1-tap WhatsApp chat with Falcon sales desk.
  - 🔍 **Search Catalog:** 1-tap focus into search bar with automatic smooth scroll to top.

---

## 4. Animation & Motion Design Specifications

All animations are designed to be subtle, functional, and performant (60 FPS on mobile GPUs).

### 4.1 Timing & Easing Curves
* **Standard Transition:** `duration-200 ease-in-out` ($200\text{ ms}, \text{cubic-bezier}(0.4, 0, 0.2, 1)$).
* **Modal Entrance:** `duration-250 ease-out` ($250\text{ ms}, \text{cubic-bezier}(0, 0, 0.2, 1)$).
* **Auto-Scroll Carousel:** Linear continuous step ($2.5\text{ s}$ per card interval).

### 4.2 Keyframe Definitions

```css
/* Fade In Animation */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide Up (Mobile Modals & Drawers) */
@keyframes slideUp {
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* Error Shake Animation (Invalid Password) */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-6px); }
  40%, 80% { transform: translateX(6px); }
}

/* Pulse Glow (WhatsApp Live Badge) */
@keyframes pulseSubtle {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.9; }
}
```

### 4.3 Interactive Hover States
* **Product Card:** Lifts 2px vertically with subtle expansion of drop-shadow: `hover:-translate-y-1 hover:shadow-lg transition-all duration-200`.
* **Category Pill:** Scale up to 1.02 with border accent color switch.
* **Primary Button:** Background shifts from `#E0183D` to `#C01333` with active tap depression (`active:scale-98`).

### 4.4 Accessibility (`prefers-reduced-motion`)
If user has enabled reduced motion in OS settings:
* All `translate`, `scale`, and carousel auto-scroll transitions are automatically disabled.
* Only clean opacity cross-fades ($100\text{ ms}$) are applied.

---
*Falcon Electricals UI/UX Specification — Crafted for Speed, Conversion & Industrial Elegance.*
