# Functional Behavior Specification (FUNCTIONAL_SPEC.md)
## Project: Falcon Electricals – B2B Digital Switch Showcase & CMS Platform
**Document Version:** 2.0.0  
**Focus:** Complete Behavioral Logic, State Transitions, Event Handling, Triggers & Workflows  

---

## 1. Global User Interaction & Button Behavior

Every button, link, and interactive element has an unambiguous, deterministic event handler.

### 1.1 Header & Navigation Buttons

| Element | Interaction / Trigger | Resulting System Behavior |
| :--- | :--- | :--- |
| **Brand Logo (Standard Click)** | Click / Tap | Navigates to `/` (Home Showcase View), scrolls viewport to top `(0, 0)`. |
| **Brand Logo (Secret 10-Click)** | 10 rapid clicks within 3.0s | Unlocks hidden Admin Authentication Gateway (`AdminLoginModal`). |
| **"Call Now" Button** | Click / Tap | Dispatches native `tel:+919876543210` protocol, launching smartphone dialer. |
| **"WhatsApp Sales" Button** | Click / Tap | Generates sanitized URL `https://wa.me/919717549515?text=...` and opens WhatsApp in a new tab. |
| **Search Bar Input Field** | Typing text | Debounces 150ms $\rightarrow$ Filters product matrix in real-time $\rightarrow$ Displays result count. |
| **Search Clear (`X`) Button** | Click / Tap | Resets search string to `""` and restores full unfiltered catalog view. |
| **Mobile Hamburger Menu** | Click / Tap | Slides in `MobileMenuDrawer` from the left with backdrop blur. |
| **Navigation Tab ("Products")** | Click / Tap | If on `/`, smooth-scrolls to `#categories-section`. If on another route, routes to `/products`. |
| **Navigation Tabs (About/Why Us/Contact)** | Click / Tap | Switches active view instantly and scrolls smoothly to top `(0, 0)`. |

---

### 1.2 Product Card Action Buttons

| Button Label | Action Trigger | Exact Functional Flow |
| :--- | :--- | :--- |
| **"View Details" / "View Specs"** | Click on Card or Button | 1. Sets `selectedProduct` state.<br>2. Updates URL history to `/product/:id` or query `?product={id}`.<br>3. Opens `ProductDetailsModal` with zoom viewport. |
| **"WhatsApp Inquiry" (Card)** | Click green button | 1. Extracts `product.name` and `product.code`.<br>2. Formats encoded WhatsApp message: *"Hello Falcon, I am interested in: {name} ({code})."*<br>3. Redirects to WhatsApp. |
| **"Get Bulk Quote" (Card)** | Click quotation button | 1. Sets `selectedProduct`.<br>2. Opens `QuoteModal` with SKU name and code pre-populated in form header. |

---

## 2. Real-Time Search & Multi-Level Filtering Mechanics

```
[User Types Keyword in Search Input]
                │
                ▼
      [Debounce Timer: 150ms]
                │
                ▼
 [Case-Insensitive Multi-Field Matching]
 ├── Matches `product.name` (e.g. "1-Way Modular Switch")
 ├── Matches `product.code` (e.g. "FAL-MOD-101")
 ├── Matches `product.category` (e.g. "Modular Switches")
 ├── Matches `product.specs.current` (e.g. "16A")
 └── Matches `product.specs.material` (e.g. "Polycarbonate")
                │
                ▼
 [Intersect with Active Category Filter (e.g. "Power Sockets")]
                │
                ▼
 [Intersect with Module Size Filter (e.g. "1M", "2M")]
                │
                ▼
 [Apply Sort Order: Price / Featured / Name]
                │
                ├── Matching Items > 0 ──► [Render Product Grid with Count]
                └── Matching Items = 0 ──► [Render Zero Results Screen + "Reset" Button]
```

### 2.1 Filter Combinations
* **Category Filter:** Clicking a category pill (e.g., *Fan Regulators*) sets `selectedCategoryId = "fan-regulators"`.
* **Module Size Dropdown:** Filters SKUs by gang size (`1M`, `2M`, `3M`, `4M`, `6M`, `8M`).
* **Amperage Dropdown:** Filters by current rating (`6A`, `10A`, `16A`, `20A`, `25A`, `32A`).
* **Sorting Engine:**
  - `featured`: Sorts by `isPopular === true` and `isNew === true` first.
  - `price_asc`: Sorts by numeric `product.price` ascending (Lowest to Highest).
  - `price_desc`: Sorts by numeric `product.price` descending (Highest to Lowest).
  - `name_asc`: Alphabetical sort on `product.name`.

---

## 3. B2B Quotation & Wholesale Cart Workflow

Falcon Electricals uses a **Zero-Friction Direct B2B Quotation Workflow** designed specifically for high-ticket wholesale orders:

```
[User Clicks "Get Bulk Quote" on Switch/Socket]
                       │
                       ▼
    [QuoteModal Opens with Selected Product Preview]
                       │
                       ▼
      [Dealer Enters Form Details]
      ├── Dealer / Business Name: "Sharma Electricals"
      ├── Mobile Number: "9876543210" (10-Digit Validation)
      ├── Delivery City & State: "Indore, MP"
      ├── Required Quantity: "500 pcs (5 Master Cartons)"
      └── Special Notes: "Urgent dispatch needed."
                       │
                       ▼
          [User Clicks "Submit Quotation"]
                       │
                       ▼
            [Client-Side Validation]
              ├── Invalid? ──► [Highlight Missing Fields in Red]
              └── Valid?   ──► [Format Structured WhatsApp Lead]
                                        │
                                        ▼
                  [Direct WhatsApp Dispatch & Local Success Toast]
```

---

## 4. Admin Authentication, Security & CMS Mechanics

### 4.1 Admin Login Workflow
1. **Secret Trigger / Key Lock:** User triggers admin login by clicking the secret 10-click logo counter or key lock.
2. **Password Verification:** User inputs admin passcode (e.g., `admin123` or cloud passcode).
3. **Validation Logic:**
   - *Incorrect Password:* The dialog container triggers a **horizontal shake animation** (`animate-shake`), flashes red error text *"Invalid Passcode"*, and clears the input.
   - *Correct Password:* Closes login modal, sets session state `isAdminAuthenticated = true`, and opens `AdminPanelModal`.

---

### 4.2 Admin CMS Sub-Modules & Operations

#### Module A: Store Branding & Photo Manager
* **Live Text Editing:** Admin edits Company Name, Tagline, Phone numbers, WhatsApp, Address, and GSTIN.
* **Website Logo & Hero Switch Photo Upload:**
  - Admin picks an image file or camera snapshot (supports PNG, JPG, WEBP up to 20MB).
  - **Dynamic HTML5 Canvas Compressor:** Automatically downsamples and compresses the image to a high-definition Base64 payload strictly $\le 320\text{ KB}$.
  - Writes directly to Firestore `store_settings/company_branding`.
  - Displays instant green toast alert: `✅ Website Logo uploaded & saved to database!`.

#### Module B: Product SKU Catalog CMS
* **Add New Product:**
  - Form captures Name, SKU Code, Category, Rating, Module Size, Price, MOQ, Specs, and Multi-Photo gallery.
  - Image files are automatically compressed on the fly.
  - Submits new SKU document to Firestore `products` collection.
* **Edit Product:**
  - Modifies existing fields with optimistic UI update and instant Firestore synchronization.
* **Delete Product:**
  - Shows confirmation prompt $\rightarrow$ Deletes document from `products/{id}` $\rightarrow$ Removes item from UI cache.
* **Toggle Featured / Bestseller:**
  - 1-click toggle switches `isPopular` or `isNew` boolean flags in real-time.

#### Module C: Category Taxonomy Manager
* Create new categories with custom icons, titles, and ordering ranks.
* Delete or rename categories with automatic product association handling.

#### Module D: Cloud Database Resilience Tools
* **Live Connection Monitor:** Real-time indicator verifying Firestore cloud connectivity.
* **1-Click Default Catalog Seed:** If the database ever requires restoration, clicking **"Reset & Seed Default Factory Catalog"** cleanly populates factory default SKUs, categories, and branding data.

---

## 5. API Calls, Data Flow & Cloud Synchronization

### 5.1 Real-Time Reactive Listeners
* On initial app boot, `StoreContext` mounts real-time Firestore listeners:
  - `onSnapshot(doc(db, "store_settings", "company_branding"))`
  - `onSnapshot(collection(db, "products"))`
  - `onSnapshot(collection(db, "categories"))`
* Any changes made by an admin on one device propagate to all open visitor browsers in **< 300 milliseconds**.

### 5.2 Optimistic Updates & Local Caching
* Every admin write operation updates the local React state **immediately (0ms)** before waiting for the network round-trip, delivering an instantaneous desktop-app feel.
* If a network failure occurs, the local state reverts and an error toast is displayed.

---

## 6. Loading States & Skeleton Placeholders

| Scenario | Visual Feedback Mechanism |
| :--- | :--- |
| **Initial Cold-Start** | Full-page animated shimmer skeleton (`FullPageSkeletonLoader`) showing hero, carousel, and product card placeholders. |
| **Image Upload Processing** | Button label changes to `"Compressing & Uploading..."` with an active spinning loading ring (`animate-spin`). |
| **Product Card Image Load** | Soft gray background placeholder with smooth cross-fade upon asset decode. |
| **Database Save In-Progress** | Save button disables and displays `"Saving to Cloud..."`. |

---

## 7. Error Handling & Safeguards Matrix

```
+-----------------------------------------------------------------------------------+
| Error Type           | Root Cause                   | Safeguard & Resolution      |
+----------------------+------------------------------+-----------------------------+
| Firestore 1MB Error  | High-res photo upload        | HTML5 Canvas Compressor     |
|                      | (> 1,048,576 bytes)          | enforces <= 320 KB payload  |
+----------------------+------------------------------+-----------------------------+
| React Fiber Anomaly  | Hooks called after early     | Strict Top-Level Rules of   |
|                      | returns (`return null`)      | Hooks in all Modal files    |
+----------------------+------------------------------+-----------------------------+
| Network Disconnect   | Client device loses Internet | In-Memory fallback catalog  |
|                      | or Firestore offline         | + Non-intrusive alert strip |
+----------------------+------------------------------+-----------------------------+
| Broken Image URL     | Missing external asset URI   | Fallback SVG Switch render  |
|                      |                              | via `ProductVisual.tsx`     |
+----------------------+------------------------------+-----------------------------+
| Fatal Script Crash   | Unhandled runtime exception  | Class-based `ErrorBoundary` |
|                      |                              | with "Reload Website" CTA   |
+----------------------+------------------------------+-----------------------------+
```

---

## 8. Animation Triggers & Motion Lifecycle

1. **Modal Zoom Entrance:** Triggered on modal open (`opacity: 0 -> 1`, `scale: 0.95 -> 1.0`, Duration: 250ms).
2. **Mobile Drawer Slide-In:** Triggered when hamburger icon is clicked (`transform: translateX(-100%) -> translateX(0)`, Duration: 250ms).
3. **Card Hover Elevation:** Triggered on mouse enter (`transform: translateY(-4px)`, `box-shadow: shadow-lg`, Duration: 200ms).
4. **Invalid Passcode Shake:** Triggered when wrong admin password is submitted (6-point horizontal vibration `@keyframes shake`, Duration: 400ms).
5. **Auto-Scroll Carousel:** Executes continuously every 2.5s; pauses immediately upon `mouseenter` or `touchstart`; resumes 2.0s after `mouseleave` or `touchend`.
6. **OS Reduced Motion:** Respects `prefers-reduced-motion: reduce` by replacing all movement with simple opacity fades.

---
*Falcon Electricals Functional Specification — Deterministic, Resilient, Production-Grade.*
