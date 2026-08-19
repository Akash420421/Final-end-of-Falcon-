# Product Requirements Document (PRD) — Comprehensive Specification
## Project: Falcon Electricals – B2B Digital Switch Showcase & Dealership Management Platform
**Document Version:** 2.0.0  
**Author:** Falcon Technical & Product Architecture Group  
**Target Market:** Electrical Manufacturers, Distributors, Dealers, Contractors & Builders (India & Global Exports)  

---

## 1. Executive Summary & Vision Statement

### 1.1 Vision
**Falcon Electricals** is designed to be the definitive digital gateway for modern modular switches, power sockets, regulators, distribution accessories, and circuit breakers. It bridges the communication gap between electrical manufacturers and wholesale dealers across tier-1, tier-2, and tier-3 distribution networks.

### 1.2 Core Business Objectives
* **Replace Outdated Paper Catalogs:** Eliminate printing, courier delays, and outdated price lists by providing an always-updated, cloud-synchronized interactive digital showroom.
* **Accelerate Lead Conversion:** Convert prospective wholesalers, electricians, and interior contractors into direct WhatsApp sales conversations within 2 clicks.
* **Zero-Dependency Admin Management:** Empower non-technical factory owners to add new SKUs, update specifications, change wholesale rates, and upload photos directly from a smartphone without writing a single line of code.
* **Blazing Fast Mobile Experience:** Load complete high-resolution catalogs in under 1 second even on 4G/3G mobile networks in remote industrial zones.

---

## 2. User Personas & Journey Mapping

### Persona A: Rajesh Kumar – Electrical Wholesaler (Tier-2 Distributor)
* **Goal:** Wants to review complete carton packaging sizes, minimum order quantities (MOQ), and module sizes (1M, 2M, 3M, 4M) before placing a ₹2,00,000+ wholesale order.
* **Pain Point:** Physical catalogs don't show real-time stock availability, and sending emails for rate queries takes days.
* **Journey on Falcon:**
  1. Opens website on Android smartphone.
  2. Uses the **Instant Search Bar** to type "16A Socket" or "Regulator".
  3. Clicks on the product card to inspect high-resolution front/back contact photos and IS standard certification.
  4. Clicks the green **"WhatsApp Inquiry"** button, which instantly opens WhatsApp with pre-filled SKU specifications ready to negotiate pricing with Falcon sales staff.

### Persona B: Vikram Sharma – Electrical Contractor & Builder
* **Goal:** Needs fire-retardant (FR Grade Polycarbonate) specification sheets and 100,000-click durability reports to approve switches for a 120-flat residential project.
* **Pain Point:** Needs quick technical validation (contact silver alloy grade, wattage, ISI compliance).
* **Journey on Falcon:**
  1. Visits the **"Why Falcon" & Quality Benchmarks** section.
  2. Inspects test certifications (IS 3854, 10-year replacement warranty, spark-proof design).
  3. Uses **"Get Bulk Quotation"** modal to submit project requirements.

### Persona C: Falcon Business Owner / Plant Manager (Admin)
* **Goal:** Wants to launch a new "Matte Black Series" of switches and update contact numbers immediately.
* **Journey on Falcon:**
  1. Clicks the secure **Lock Icon** in the top navigation bar and enters the Admin Passcode.
  2. Opens **Product Catalog Manager** -> Clicks **"Add New Product"**.
  3. Snaps a photo on their phone; the built-in dynamic compressor optimizes the image in 50ms.
  4. Enters SKU code, clicks "Save to Cloud", and the product goes live across India instantly.

---

## 3. Comprehensive Functional Requirements

### 3.1 Storefront & User Interface Layer

#### Module 1: Header & Quick Accessibility Bar
* **Dynamic Company Logo & Wordmark:** High-DPI responsive vector/raster display with fallback typographic branding.
* **Live Intelligent Search:**
  - Real-time debounced query filtering across Product Title, Category, SKU Code, Rated Voltage/Current (e.g. `6A`, `16A`, `25A`), and Material specifications.
  - Quick clearing button and search results count indicator.
* **Direct Communication Triggers:**
  - Primary "Call Sales" CTA with direct tel URI launcher.
  - Secondary "WhatsApp Chat" CTA with direct instant chat trigger.
* **Admin Login Gate:** Discrete access portal protected by session state.

#### Module 2: High-Impact Hero Showcase Section
* **Strategic Value Proposition:** Highlights 10-Year Replacement Guarantee, ISI Certification, Flame Retardant PC grade, and direct factory pricing.
* **Interactive Hero Product Showcase:** High-resolution product spotlight featuring active interactive badges:
  - 🛡️ *100% Flame Retardant (FR Grade)*
  - ⚡ *Heavy-Duty Silver Alloy Contacts*
  - 🔘 *Smooth Acoustic Tactile Click*
* **Primary Conversion Actions:**
  - "Explore Full Catalog" (Scrolls directly to catalog view).
  - "Download PDF Brochure / Price List".
  - "Apply for Dealership".

#### Module 3: Category Carousel & Interactive Taxonomy Filter
* **Auto-Scrolling Visual Slider:**
  - Displays all active categories (Modular Switches, Power Sockets, Regulators & Dimmers, Distribution Boards, LED Holders, MCBs & Isolators, Surface Boxes).
  - Smooth touch drag & wheel gesture handling with auto-pause on user hover/touch.
* **Real-Time Category Chips:** Filter catalog with zero page reload latency and active category highlighting.

#### Module 4: Responsive Product Catalog Grid
* **Card Anatomy:**
  - High-resolution visual thumbnail with lazy-load skeleton placeholder.
  - Bestseller & Featured badge flags.
  - Product Name, SKU Code (e.g. `FAL-MOD-101`), and Category tag.
  - Technical quick pills (e.g. `10A 240V~`, `1 Module`, `Silver Contacts`).
  - Indicative wholesale price display in INR (₹).
* **Card Interactive Triggers:**
  - 👁️ **"View Details" Modal Trigger:** Opens complete technical specification view.
  - 💬 **"WhatsApp Inquiry":** Deep links to WhatsApp with formatted inquiry text.
  - 📋 **"Get Bulk Quote":** Opens quotation modal with auto-selected SKU.

#### Module 5: Technical Specification & Multi-Angle Modal
* **Multi-Angle Gallery:** Interactive main image viewport with thumbnail switcher supporting multiple uploaded photos.
* **Comprehensive Specification Matrix:**
  - Rated Current & Voltage (e.g. `10A / 16A / 25A 240V AC 50Hz`).
  - Material Grade (100% Virgin Polycarbonate FR Grade, Glow Wire tested up to 850°C).
  - Terminal & Contact Type (Extruded brass terminals with captive screws, Silver cadmium oxide contact tips).
  - Mechanical Endurance (Tested up to 100,000 switching operations).
  - Dimensions & Module footprint (`1M`, `2M`, `3M`, `4M`, `6M`, `8M`).
  - Standard Compliance (`IS 3854:1997`, `RoHS Compliant`).
* **Wholesale Logistics Data:** Master carton packing breakdown (e.g., 20 pcs inner box, 200 pcs master carton), weight, and Minimum Order Quantity (MOQ).

#### Module 6: Dealership & Wholesale Acquisition Section
* **Distributor Benefits Matrix:**
  - High wholesale profit margins & annual dealer turnover rebates.
  - Priority 24–48 hour dispatch from regional hubs.
  - Marketing support: Free display boards, sample kits, and physical marketing collaterals.
* **Interactive Dealership Inquiry Form:** Lead capture capturing Dealer Name, Business Entity, City/State, Contact Number, and Expected Monthly Volume.

#### Module 7: Quality Engineering & Trust Highlights
* **4-Pillar Engineering Benchmark:**
  1. *Fire-Retardant Safety:* Polycarbonate body self-extinguishes in under 10 seconds.
  2. *Zero-Spark Mechanism:* High-conductivity silver alloy contacts prevent arcing.
  3. *Child Safety Shutters:* Integrated 16A/25A safety shutters to prevent accidental contact.
  4. *Corrosion Resistant Terminals:* Heavy nickel/brass plating for humid and coastal climates.

#### Module 8: Company Profile & "About Falcon"
* Detailed narrative of Falcon Electricals' manufacturing heritage, automated injection molding machinery, testing lab, and Pan-India presence.

#### Module 9: Location, Factory & Contact Hub
* Corporate office and factory street addresses, PIN code, and active working hours.
* Official sales email, toll-free/direct phone lines, and GSTIN number.
* Interactive Leaflet location map embed.

#### Module 10: Mobile Bottom Sticky Navigation
* Persistent bottom navigation bar optimized for 1-thumb operation on smartphones:
  - 📞 **Call Factory**
  - 💬 **WhatsApp Sales**
  - 🔍 **Search Catalog**

---

### 3.2 Admin Content Management System (CMS) Layer

#### Module 1: Secure Access Control
* Modal authentication requiring secure master PIN / password with local session persistence.

#### Module 2: Store & Branding Manager
* **Live Company Profile Editing:** Update Brand Name, Tagline, Phone, Secondary Phone, WhatsApp Number, Email, Physical Address, GSTIN, and Operating Hours.
* **High-Res Logo & Hero Switch Uploader:** Direct file upload from phone gallery or camera with **automatic client-side HTML5 canvas compression (< 250 KB)** to ensure zero Firestore document overflow.

#### Module 3: Product SKU Catalog CMS
* **Create New Product:** Full form for Title, Code, Category, Rating, Module Size, Price, MOQ, Material, Contact Type, Warranty, Specs, and Multi-Photo Gallery.
* **Edit Product:** Instant field modification with real-time cloud sync.
* **Delete SKU:** Safe removal with confirmation modal.
* **Feature / Bestseller Toggle:** Instant homepage showcase reordering.

#### Module 4: Taxonomy & Category Manager
* Create new categories with custom icon identifiers and display order.
* Edit and reorganize category sequence.

#### Module 5: Cloud Database Resilience & Tools
* **Real-time Firestore Connection Indicator:** Green/Red status badge indicating cloud connectivity.
* **1-Click Reset to Default Catalog:** Safe fallback tool to re-seed factory-tested default products if database requires restoration.

---

## 4. Non-Functional & Quality Requirements

| Attribute | Specification | Verification Method |
| :--- | :--- | :--- |
| **Initial Page Load** | < 1.0s on 4G Network (Bundle < 180 KB gzipped) | Lighthouse Audit |
| **Database Payload Guard** | Single document writes strictly < 320 KB (Limit: 1,048,576 bytes) | Dynamic Canvas Compressor |
| **Search Latency** | < 5ms for 1,000+ items | In-Memory Indexed Filter |
| **Mobile Touch Targets** | Minimum 44px x 44px touch area on all interactive controls | WCAG 2.1 AA |
| **Browser Compatibility** | Chrome 90+, Safari 14+, Firefox 88+, Edge 90+, Samsung Internet | Cross-Browser Matrix |
| **Uptime & Availability** | 99.95% cloud availability via Firebase Multi-Region Firestore | SLA Monitoring |

---
*Falcon Electricals — Product Requirements Document (PRD) v2.0.*
