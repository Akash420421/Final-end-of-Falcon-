# UI Screen Map & Component Blueprint (UI_SCREEN_MAP.md)
## Project: Falcon Electricals – B2B Digital Switch Showcase & CMS Platform
**Document Version:** 2.0.0  
**Blueprint Standard:** Hierarchical Structural Trees for Every Screen, Sub-View, Modal & Overlay  

---

## 1. Master Application Blueprint Overview

```
FALCON ELECTRICALS PLATFORM
├── 1. Global Chrome (Persistent on All Routes)
├── 2. Screen 1: Home Showcase Screen (Route: `/`)
├── 3. Screen 2: Products & Catalog Screen (Route: `/products` & `/category/:id`)
├── 4. Screen 3: About Falcon Heritage Screen (Route: `/about`)
├── 5. Screen 4: Why Choose Us & Testing Lab Screen (Route: `/why-us`)
├── 6. Screen 5: Contact & Factory Location Screen (Route: `/contact`)
├── 7. Modal 1: Comprehensive Product Details Modal (Route: `/product/:id` or Query)
├── 8. Modal 2: B2B Wholesale Quotation Modal
├── 9. Modal 3: Secure Admin Authentication Keypad
├── 10. Screen 6 / Modal 4: Full Admin CMS Suite (Route: `/admin` or Authorized State)
├── 11. Overlay: Mobile Navigation Drawer (Viewport: `< 768px`)
└── 12. Bottom Hub: Mobile Sticky Action Bar (Viewport: `< 768px`)
```

---

## 2. Detailed Screen-by-Screen Hierarchical Blueprints

---

### 🌐 Global Persistent Chrome (Rendered on All Screens)

```
Global Chrome
├── Top Announcement Bar (bg-slate-900)
│   ├── Working Hours ("Mon - Sat: 9:00 AM - 7:30 PM")
│   ├── Compliance Badge ("ISI & ISO 9001:2015 Certified")
│   └── Quick Contact Links (Phone & WhatsApp)
│
├── Sticky Main Header (bg-white/95 backdrop-blur-md)
│   ├── Brand Identity Container
│   │   ├── Falcon Bird Emblem / Logo Image
│   │   ├── Typography Wordmark ("FALCON ELECTRICALS")
│   │   └── Subtitle Tagline ("Switch to Quality")
│   ├── Live Search Bar Trigger
│   │   ├── Search Icon (Lucide `Search`)
│   │   ├── Auto-Complete Text Input Field
│   │   └── Clear Search Button (`X` Icon)
│   ├── Fast Action Buttons
│   │   ├── Call Now CTA Button (Phone Icon + `tel:` Link)
│   │   └── WhatsApp Sales CTA (Emerald Green `#25D366`)
│   ├── Admin Secret Gate (10-Click Brand Logo Trigger / Key Lock)
│   └── Mobile Hamburger Toggle Button (44px Touch Target)
│
├── Navigation Tab Row (Desktop Tab Bar)
│   ├── Home Tab (`/`)
│   ├── Products & Catalog Tab (`/products`)
│   ├── About Us Tab (`/about`)
│   ├── Why Falcon Tab (`/why-us`)
│   └── Contact Us Tab (`/contact`)
│
├── Global Footer
│   ├── Brand & Manufacturing Profile Column
│   ├── Quick Links & Category Directory Column
│   ├── Contact Directory (Factory Address, GSTIN, Email, Phone)
│   ├── Bureau of Indian Standards (BIS / ISI) Certification Strip
│   └── Copyright & Legal Notice
│
└── Mobile Sticky Bottom Bar (Fixed `< 768px`)
    ├── 📞 Call Factory Action (1-Tap Dialer)
    ├── 💬 WhatsApp Sales Action (1-Tap Chat)
    └── 🔍 Search Catalog Action (1-Tap Auto-Focus)
```

---

### 📱 Screen 1: Home Showcase Screen (`/`)

```
Home Screen (Route: `/`)
├── 1. Dynamic Hero Showcase Section
│   ├── Left Column: Value Proposition & Conversion
│   │   ├── Overline Tag ("10-Year Replacement Guarantee • Direct Factory Supply")
│   │   ├── H1 Display Heading ("Engineered for Safety, Built to Last")
│   │   ├── Descriptive Paragraph (FR Grade Polycarbonate & Silver Contacts)
│   │   └── CTA Action Row
│   │       ├── Primary Red Button ("Explore Full Catalog")
│   │       ├── Secondary Outline Button ("Download Price List / Brochure")
│   │       └── WhatsApp Direct Inquiry Button
│   └── Right Column: Hero Spotlight Visual
│       ├── Dark Slate Contrast Backdrop Panel
│       ├── Rendered High-Resolution Switch Photo
│       └── Floating Technical Badges
│           ├── 🛡️ Flame Retardant (FR Grade Polycarbonate)
│           ├── ⚡ Heavy-Duty Silver Cadmium Inlay Contacts
│           └── 🔘 100,000+ Click Mechanical Durability
│
├── 2. Auto-Scrolling Category Carousel
│   ├── Section Header ("Browse by Electrical Category")
│   ├── Auto-Scrolling Track with Touch-Swipe Support
│   │   ├── Category Card 1: Modular Switches (Icon + Item Count + Cover)
│   │   ├── Category Card 2: Power Sockets (Icon + Item Count + Cover)
│   │   ├── Category Card 3: Fan Regulators & Dimmers
│   │   ├── Category Card 4: Distribution Boards & Enclosures
│   │   ├── Category Card 5: MCBs & Isolators
│   │   ├── Category Card 6: LED Holders & Ceiling Roses
│   │   └── Category Card 7: Surface & Flush Metal Boxes
│   └── Carousel Navigation Arrows (Prev / Next)
│
├── 3. Trust & Engineering Benefits Strip (4-Column Matrix)
│   ├── Pillar 1: 850°C Glow-Wire Fire Retardant Safety
│   ├── Pillar 2: Zero-Spark Silver Alloy Terminal Contacts
│   ├── Pillar 3: Child Safety Protective Shutters
│   └── Pillar 4: Pan-India 24–48 Hour Dispatch Guarantee
│
├── 4. Featured & Bestseller Products Grid
│   ├── Section Header ("Featured Switchgear & Accessories")
│   ├── View All Products Link Button
│   └── Product Cards Grid (3 to 4 Columns)
│       └── [Product Card Component Structure] (See Section 3)
│
├── 5. B2B Wholesale & Dealership Acquisition Banner
│   ├── Headline ("Become an Authorized Falcon Dealer in Your City")
│   ├── Key Distributor Benefits List
│   │   ├── High Wholesale Trade Margins
│   │   ├── Annual Turnover Rebates
│   │   └── Free Shop Display Boards & Marketing Kits
│   └── "Apply for Dealership" Action Button
│
├── 6. Quality Assurance & Engineering Testing Showcase
│   ├── Test 1: High-Precision Automated Injection Molding
│   ├── Test 2: 100,000 Cycle Contact Life Endurance Rig
│   └── Test 3: High-Voltage Spark Resistance & Insulation Test
│
└── 7. Factory Location & Quick Contact Hub
    ├── Interactive Leaflet Map Container
    ├── Factory Address Card & GPS Directions
    └── Direct Sales Helpline Card
```

---

### 📦 Screen 2: Products & Catalog Screen (`/products` & `/category/:id`)

```
Products & Catalog Screen (Route: `/products` or `/category/:id`)
├── 1. Breadcrumb Navigation Strip
│   └── `Home > Products > [Active Category Title]`
│
├── 2. Category Header & Meta Strip
│   ├── Active Category Title (e.g. "Modular Switches")
│   ├── Category Description & Standards Note
│   └── Live Product Count Badge ("Showing 24 SKUs")
│
├── 3. Filter & Sort Toolbar
│   ├── Horizontal Category Scroll Chips (All, Switches, Sockets, Regulators...)
│   ├── Module Size Filter Dropdown (`1M`, `2M`, `3M`, `4M`, `6M`, `8M`)
│   ├── Amperage Filter Dropdown (`6A`, `10A`, `16A`, `20A`, `25A`, `32A`)
│   ├── Sort By Dropdown (Featured, Price: Low to High, Price: High to Low, Name A-Z)
│   └── Reset All Filters Button
│
├── 4. Primary Products Matrix Grid
│   ├── Product Card 1
│   ├── Product Card 2
│   ├── Product Card 3
│   └── Product Card N...
│
└── 5. Zero Results Empty State (Displayed when no SKUs match filter)
    ├── Magnifying Glass Search Graphic
    ├── Title ("No Products Found Matching Your Criteria")
    ├── Subtitle ("Try clearing your search keyword or selected module size filters.")
    └── "Reset All Filters" CTA Button
```

---

### 🏢 Screen 3: About Falcon Heritage Screen (`/about`)

```
About Falcon Screen (Route: `/about`)
├── 1. Hero Heritage Banner ("Engineering Safety Since Inception")
├── 2. Manufacturing Heritage Story & Founder's Vision
├── 3. State-of-the-Art Factory Infrastructure Matrix
│   ├── Automated Injection Molding Machinery
│   ├── In-House Tool Room & Die Making
│   └── High-Speed Automated Assembly Lines
├── 4. Compliance & Certifications Showcase
│   ├── ISO 9001:2015 Quality Management System
│   ├── BIS / ISI Standard Mark (IS 3854:1997)
│   └── RoHS Environmental Safety Compliance
└── 5. Factory Tour Gallery & Plant Photos
```

---

### ⚡ Screen 4: Why Choose Us & Testing Lab Screen (`/why-us`)

```
Why Choose Us Screen (Route: `/why-us`)
├── 1. Header Banner ("Engineered to Exceed Industry Benchmarks")
├── 2. Detailed 4-Pillar Quality Comparison Matrix
│   ├── Comparison 1: Falcon Virgin FR Polycarbonate vs. Competitor Recycled Plastics
│   ├── Comparison 2: Heavy-Duty Silver Cadmium Inlay vs. Standard Copper Contacts
│   ├── Comparison 3: Extruded Brass Terminals with Captive Screws vs. Stamped Terminals
│   └── Comparison 4: Tested 100,000 Cycles vs. Standard 40,000 Cycles
├── 3. Testing Lab & Quality Check Video / Photo Demonstration
└── 4. 10-Year Replacement Guarantee Terms & Claim Process
```

---

### 📞 Screen 5: Contact & Factory Location Screen (`/contact`)

```
Contact Screen (Route: `/contact`)
├── 1. Page Header ("Get in Touch with Falcon Electricals")
├── 2. Contact Cards Grid (3 Columns)
│   ├── Card 1: Sales & Wholesale Inquiries (Phone, WhatsApp, Email)
│   ├── Card 2: Technical & Project Support (Engineer Helpline, Specs)
│   └── Card 3: Factory & Corporate Headquarters (Physical Address & PIN)
├── 3. Direct Lead & Wholesale Inquiry Form
│   ├── Full Name Input Field
│   ├── Business Entity / Shop Name Input Field
│   ├── 10-Digit Mobile Number Input Field
│   ├── City & State Input Field
│   ├── Requirement / Product Notes Textarea
│   └── "Submit Inquiry to Factory" Primary Button
├── 4. Interactive Factory Location Map
│   ├── Embedded Leaflet / OpenStreetMap Container
│   ├── Red Location Pin Marker
│   └── "Get Directions on Google Maps" External Link
└── 5. Operating Business Hours & Holiday Schedule Card
```

---

## 3. Product Card Component Blueprint

Every card inside the catalog grid follows this exact structural blueprint:

```
Product Card Component
├── Card Container (bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg)
│   ├── Top Visual Thumbnail Area
│   │   ├── Bestseller Badge (Top-Left Pill, e.g. "BESTSELLER")
│   │   ├── New Launch Badge (Top-Left Pill, e.g. "NEW")
│   │   ├── Featured Star Icon (Top-Right Accent)
│   │   └── Product Image (High-Res Render with Fallback Placeholder)
│   │
│   ├── Product Info Body
│   │   ├── Category Name Tag (text-xs font-medium text-slate-500)
│   │   ├── Product Display Title (text-base font-semibold text-slate-900)
│   │   ├── SKU Code Monospace Pill (e.g. `FAL-MOD-101`)
│   │   └── Technical Spec Chips Row
│   │       ├── Amperage Chip (e.g. "10A 240V~")
│   │       ├── Module Size Chip (e.g. "1 Module (1M)")
│   │       └── Material Chip (e.g. "FR Polycarbonate")
│   │
│   ├── Pricing & Wholesale MOQ Row
│   │   ├── Wholesale Indicative Price (₹ 68.00)
│   │   └── Minimum Order Quantity Label ("MOQ: 100 Pcs")
│   │
│   └── Action Buttons Row
│       ├── WhatsApp Direct Inquiry Button (Emerald Green with WhatsApp Icon)
│       └── View Details & Specs Button (Secondary Outline with Eye Icon)
```

---

## 4. Modal Dialogs & Overlay Blueprints

---

### 🪟 Modal 1: Comprehensive Product Details Modal (Route: `/product/:id`)

```
Product Details Modal
├── Modal Backdrop (fixed inset-0 bg-black/60 backdrop-blur-sm z-50)
└── Modal Dialog Container (bg-white rounded-2xl shadow-2xl max-w-3xl overflow-hidden)
    ├── Modal Header Strip
    │   ├── Product Title & SKU Code
    │   └── Close Button (`X` Icon, 44px Touch Target)
    │
    ├── Modal Content Body (2-Column Desktop / Stack Mobile)
    │   ├── Left Column: Multi-Angle Visual Gallery
    │   │   ├── Main High-Resolution Image Viewport (with Zoom Trigger)
    │   │   └── Thumbnail Switcher Row ([Thumb 1] [Thumb 2] [Thumb 3])
    │   │
    │   └── Right Column: Technical Spec Sheet & Logistics
    │       ├── Category & Rating Summary
    │       ├── Technical Specifications Table
    │       │   ├── Rated Voltage: 240V~ 50Hz
    │       │   ├── Rated Current: 10A / 16A / 25A
    │       │   ├── Module Footprint: 1M / 2M
    │       │   ├── Polymer Material: 100% Virgin FR Polycarbonate
    │       │   ├── Terminal Contact: Silver Cadmium Inlay
    │       │   ├── Indian Standard: IS 3854:1997
    │       │   └── Warranty: 10-Year Replacement Guarantee
    │       ├── Packaging & Wholesale Information
    │       │   ├── Inner Box Packing: 20 pcs
    │       │   ├── Master Carton Packing: 200 pcs
    │       │   └── Minimum Order Quantity (MOQ): 100 pcs
    │       └── Descriptive Overview Notes
    │
    └── Modal Footer Action Bar
        ├── 💬 "Inquire on WhatsApp" Button (Deep links SKU to WhatsApp)
        └── 📋 "Request Bulk Price Quotation" Button (Opens QuoteModal)
```

---

### 📋 Modal 2: B2B Wholesale Quotation Modal

```
B2B Quotation Modal
├── Modal Backdrop (fixed inset-0 bg-black/60 backdrop-blur-sm z-50)
└── Modal Dialog Container (bg-white rounded-2xl shadow-2xl max-w-lg)
    ├── Modal Header ("Request Wholesale Quotation") + Close Button
    ├── Selected Product Preview Card (Thumbnail + Name + Code)
    ├── Form Inputs
    │   ├── Business / Dealer Name Input Field (Required)
    │   ├── 10-Digit Mobile Number Input Field (Required)
    │   ├── Delivery City & State Input Field (Required)
    │   ├── Required Order Quantity Field (e.g. 500 pcs / 10 Master Cartons)
    │   └── Additional Special Instructions / Requirement Textarea
    └── Form Action Buttons
        ├── "Cancel" Secondary Button
        └── "Submit Quote via WhatsApp" Primary Button
```

---

### 🔐 Modal 3: Secure Admin Authentication Keypad

```
Admin Authentication Modal
├── Modal Backdrop (fixed inset-0 bg-black/70 backdrop-blur-sm z-50)
└── Modal Keypad Container (bg-slate-900 text-white rounded-2xl border border-slate-700 max-w-sm)
    ├── Keypad Header (Lock Icon + "Falcon Admin Gateway")
    ├── Passcode Input Field (Masked Password + Show/Hide Eye Toggle)
    ├── Error Feedback Text (Shakes horizontally on invalid passcode)
    └── Action Buttons
        ├── "Cancel" Button
        └── "Unlock Admin Dashboard" Primary Red Button
```

---

### ⚙️ Screen 6 / Modal 4: Full Admin CMS Suite (`/admin`)

```
Full Admin CMS Dashboard
├── Top Admin Bar (bg-slate-900 border-b border-slate-700)
│   ├── Admin Status Indicator & Live Database Status Badge
│   ├── Store Name Title ("Falcon CMS Manager")
│   └── "Exit Admin Panel" Button
│
├── Tab Navigation Bar
│   ├── Tab 1: 🏢 Store Branding & Hero CMS
│   ├── Tab 2: 📦 Product Catalog Manager
│   ├── Tab 3: 📑 Category Manager
│   └── Tab 4: 🛠️ Cloud Database Tools
│
└── Tab Content Viewport
    │
    ├── [Tab 1: Store Branding View]
    │   ├── Company Profile Form (Name, Tagline, Phone, WhatsApp, Address, GSTIN)
    │   ├── Website Logo Uploader (Drag-and-drop + Auto Canvas Compressor)
    │   ├── Hero Switch Photo Uploader (Drag-and-drop + Auto Canvas Compressor)
    │   └── Save Branding Changes Button (Syncs to Firestore)
    │
    ├── [Tab 2: Product Catalog Manager View]
    │   ├── "Add New Product" Action Button
    │   ├── SKU Search & Filter Filter Bar
    │   ├── Products Management Table / Grid
    │   │   ├── Row: Image + Name + SKU + Category + Price + Featured Toggle
    │   │   └── Actions: [ Edit Specs ] [ Manage Photos ] [ Delete SKU ]
    │   └── Product Edit / Create Drawer Modal (Form fields + Photo uploader)
    │
    ├── [Tab 3: Category Manager View]
    │   ├── "Create New Category" Button
    │   └── Category List (Title + Icon Selector + Display Order + Delete)
    │
    └── [Tab 4: Cloud Database Tools View]
        ├── Live Firestore Connection Diagnostics
        ├── Document Size Inspection (Verifies < 320 KB rule)
        └── 1-Click "Reset & Re-Seed Default Factory Catalog" Button
```

---

### 📱 Overlay: Mobile Slide-In Navigation Drawer (`< 768px`)

```
Mobile Navigation Drawer
├── Backdrop Overlay (bg-black/50 backdrop-blur-xs fixed inset-0 z-50)
└── Drawer Container (bg-white w-80 max-w-[85vw] h-full fixed top-0 left-0 z-50 shadow-2xl p-6)
    ├── Drawer Header
    │   ├── Brand Logo & Title
    │   └── Close Button (`X` Icon)
    │
    ├── Main Navigation Links List
    │   ├── 🏠 Home (`/`)
    │   ├── 📦 Complete Catalog (`/products`)
    │   ├── 🏢 About Falcon (`/about`)
    │   ├── ⚡ Why Falcon (`/why-us`)
    │   └── 📞 Contact & Factory (`/contact`)
    │
    ├── Quick Category Directory (Direct links to popular categories)
    │
    └── Drawer Footer
        ├── 📞 Call Now Button
        ├── 💬 WhatsApp Sales Chat
        └── 🔒 Admin Login Portal Trigger
```

---
*Falcon Electricals UI Screen Map — Complete Structural Blueprint for All Devices.*
