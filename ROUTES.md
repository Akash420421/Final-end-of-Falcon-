# Routing & URL Architecture (ROUTES.md)
## Project: Falcon Electricals – B2B Digital Switch Showcase & CMS Platform
**Document Version:** 2.0.0  
**Router Engine:** React Router DOM v7 (`BrowserRouter`)  
**Navigation Model:** Single-Page Application (SPA) with Deep Linking & History State  

---

## 1. Complete Website URL & Route Directory

| URL Path | Active View Component | Navigation Tab | Description & Use Case |
| :--- | :--- | :--- | :--- |
| `/` | `HeroSection`, `CategoryCarousel`, `FeaturedProducts`, `BulkDealerCTA`, `ContactSection` | `HOME` | Main digital showroom homepage featuring hero spotlight, category slider, trust badges, and quick contact. |
| `/products` | `CategoryProductsView` | `PRODUCTS` | Complete filterable product catalog showing all electrical SKUs with search, amperage, and module filters. |
| `/category/:id` | `CategoryProductsView` | `PRODUCTS` | Filtered product catalog scoped exclusively to a specific category (e.g. `/category/modular-switches`). |
| `/product/:id` | `ProductDetailsModal` + Main View | Dynamic | Deep-linkable full-screen technical specification modal for a specific SKU (e.g. `/product/sw-1m-1way`). |
| `/about` | `AboutFalcon` | `ABOUT` | Company background, manufacturing heritage, automated machinery, testing lab, and ISO/ISI standards. |
| `/why-us` | `WhyChooseUs` | `WHY_US` | Engineering quality benchmarks, 100,000-click durability reports, and spark-resistance certifications. |
| `/contact` | `ContactSection` | `CONTACT` | Factory & corporate office address, sales desk phone lines, WhatsApp helpline, and interactive Leaflet map. |
| `/admin` | `AdminPanelModal` | Dynamic | Standalone full-screen Admin Content Management System (CMS) for managing products, branding, and cloud settings. |

---

## 2. Route Parameters & Query Parameters Specification

---

### 2.1 Dynamic Route: `/category/:id`
* **Route Parameter:** `:id` (String) – The category slug or unique identifier.
* **Examples:**
  - `/category/modular-switches` $\rightarrow$ Displays only Modular Switches.
  - `/category/power-sockets` $\rightarrow$ Displays only 6A/16A/25A Sockets.
  - `/category/fan-regulators` $\rightarrow$ Displays 4-Step / 5-Step Regulators & Dimmers.
* **Behavior:** Automatically updates the active category chip and re-filters the product matrix with zero network latency.

---

### 2.2 Dynamic Route: `/product/:id`
* **Route Parameter:** `:id` (String) – The product SKU identifier.
* **Examples:**
  - `/product/sw-1m-1way` $\rightarrow$ Opens Falcon 10A 1-Way Switch modal.
  - `/product/soc-6a-16a` $\rightarrow$ Opens Falcon Heavy-Duty Combined Socket modal.
* **Behavior:**
  - Opens `ProductDetailsModal` over the current view.
  - Allows direct deep-linking (e.g., sharing a direct product link via WhatsApp or email).
  - Pressing the browser back button or clicking the close button smoothly navigates back to `/products`.

---

### 2.3 Search Query Parameter: `?product={id}`
* **Query Parameter:** `product` (String) – Fallback query parameter for opening a product modal while preserving the underlying page scroll position.
* **Example:** `https://falconelectricals.com/?product=sw-1m-1way`

---

## 3. Navigation Behavior & Scroll Management

1. **Top Scroll Restoration:**
   - Every route transition (e.g., clicking "About Us", "Contact", or a Category card) automatically scrolls the viewport smoothly to the top (`window.scrollTo({ top: 0, behavior: 'smooth' })`).
2. **Category Deep-Scroll Trigger:**
   - When clicking "Products" from the Home navbar, if already on `/`, the application smooth-scrolls directly to `#categories-section`. If on another route, it navigates to `/products`.
3. **Modal History State:**
   - Opening a product modal pushes a new history entry (`/product/:id`).
   - Closing the modal executes `navigate(-1)` if history exists, or falls back to `/products` if opened directly from a shared link.

---

## 4. Breadcrumb Navigation Rules

The breadcrumb component dynamically derives hierarchy from the current URL path:

```
[Route: /]                   Home
[Route: /products]           Home > Products
[Route: /category/:id]       Home > Products > [Category Title]
[Route: /product/:id]        Home > Products > [Category Title] > [Product Name]
[Route: /about]              Home > About Us
[Route: /why-us]             Home > Why Choose Us
[Route: /contact]            Home > Contact Us
```

---

## 5. 404 Fallback & Catch-All Routing

* **Catch-All Route:** `path="*"` in `Router`
* **Behavior:** Any unrecognized URL automatically falls back to `/` (Home Showcase View) with all state gracefully intact.

---
*Falcon Electricals Routing Architecture — Clean, SEO-Friendly, Deep-Linkable.*
