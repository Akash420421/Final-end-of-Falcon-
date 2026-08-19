# Database Architecture & Schema Specification (DATABASE.md)
## Project: Falcon Electricals – B2B Switch Showcase & CMS Platform
**Document Version:** 2.0.0  
**Database Engine:** Google Cloud Firestore (NoSQL Document Store)  
**Database ID:** `ai-studio-falconelectrics-a38318f7-44db-478b-b613-eaff8ff818ed`  
**High Availability:** Multi-Region Automatic Replication & Sub-Millisecond Edge Latency  

---

## 1. Database Architecture & ER Conceptual Model

Cloud Firestore is a flexible, scalable NoSQL document database. Data is organized into **Collections**, which contain **Documents**, which in turn contain key-value fields and sub-objects/arrays.

```
+-----------------------------------------------------------------------------------+
|                        FIRESTORE DATABASE ROOT INSTANCE                           |
+-----------------------------------------------------------------------------------+
  │
  ├── 📁 Collection: store_settings
  │     └── 📄 Document: company_branding (Singleton Store Configuration)
  │
  ├── 📁 Collection: categories
  │     ├── 📄 Document: modular-switches
  │     ├── 📄 Document: power-sockets
  │     ├── 📄 Document: fan-regulators
  │     └── 📄 Document: {categoryId}
  │            │
  │            │  (1 : N Logical Relationship via 'category' Foreign Key)
  │            ▼
  ├── 📁 Collection: products
  │     ├── 📄 Document: sw-1m-1way (Falcon 10A 1-Way Switch)
  │     ├── 📄 Document: soc-6a-16a (Falcon Combined Socket)
  │     └── 📄 Document: {productId}
  │
  └── 📁 Collection: admin_auth
        └── 📄 Document: credentials (Master Admin PIN / Password)
```

---

## 2. Collections & Document Schemas (Field-by-Field Breakdown)

---

### Collection 1: `store_settings`
* **Purpose:** Stores singleton application metadata, company branding, high-resolution logos, hero showcase images, contact directories, and operational hours.
* **Document ID:** `company_branding` (Singleton pattern)

| Field Name | Data Type | Required | Constraints / Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `companyDetails.name` | `string` | Yes | Max 100 chars / `"Falcon Electricals"` | Official business entity name |
| `companyDetails.tagline` | `string` | Yes | Max 150 chars | Marketing slogan / USP |
| `companyDetails.phone` | `string` | Yes | Valid Phone / `"+91 98765 43210"` | Primary sales contact number |
| `companyDetails.secondaryPhone` | `string` | No | Valid Phone | Secondary office helpline |
| `companyDetails.whatsapp` | `string` | Yes | Valid Mobile Phone | B2B WhatsApp lead receiver |
| `companyDetails.email` | `string` | Yes | Email Format | Official sales inquiry email |
| `companyDetails.address` | `string` | Yes | Free text | Factory / Head office physical address |
| `companyDetails.gstin` | `string` | No | 15-char GSTIN regex | GST Identification Number |
| `companyDetails.workingHours` | `string` | Yes | e.g. `"Mon - Sat: 9:00 AM - 7:30 PM"` | Business hours for customer support |
| `heroContent.title` | `string` | Yes | Max 120 chars | Hero showcase main headline |
| `heroContent.subtitle` | `string` | Yes | Max 250 chars | Value proposition summary |
| `heroContent.badge` | `string` | Yes | e.g. `"10-Year Warranty"` | Top overline pill text |
| `heroContent.switchImageUrl` | `string` | Yes | Compressed Base64 or Asset Key | Spotlight hero switch photograph |
| `logoImageUrl` | `string` | Yes | Compressed Base64 or SVG URI | High-DPI website logo |
| `whyChooseUs` | `array<object>` | No | 4 items standard | Quality indicators (Safety, Contacts, etc.) |
| `catalogDownloadUrl` | `string` | No | PDF URL | Direct download link for price list |
| `updatedAt` | `string` / `number` | Yes | ISO 8601 / Timestamp | Last modification epoch |

---

### Collection 2: `categories`
* **Purpose:** Defines the taxonomy structure for catalog navigation and the auto-scrolling category carousel.
* **Document ID:** `{categoryId}` (Slug string e.g. `modular-switches`, `power-sockets`, `fan-regulators`)

| Field Name | Data Type | Required | Constraints / Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `string` | Yes | Unique Slug / Key | Primary Identifier |
| `title` | `string` | Yes | Max 50 chars | Display category name (e.g. `"Modular Switches"`) |
| `subtitle` | `string` | No | Max 100 chars | Short subtitle (e.g. `"10A & 20A FR Grade"`) |
| `description` | `string` | No | Max 250 chars | SEO & catalog description |
| `badge` | `string` | No | e.g. `"Best Seller"`, `"New"` | Visual tag chip |
| `icon` / `iconName` | `string` | Yes | Valid Lucide icon string | Lucide icon identifier (e.g. `"ToggleLeft"`) |
| `image` | `string` | No | Base64 or Image Key | Category cover thumbnail |
| `bgColor` | `string` | No | Tailwind class string | Background color token for visual card |
| `displayOrder` | `number` | No | Default: `0` | Rank ordering in carousel |
| `productCount` | `number` | No | Calculated aggregate | Total products under this category |

---

### Collection 3: `products`
* **Purpose:** Stores individual electrical switchgear SKUs, specifications, multi-image arrays, prices, and B2B ordering parameters.
* **Document ID:** `{productId}` (e.g. `sw-1m-1way`, `soc-6a-16a`, or Auto-ID)

| Field Name | Data Type | Required | Constraints / Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `string` | Yes | Unique Slug / UUID | Primary Product Key |
| `name` | `string` | Yes | Max 120 chars | Product display title |
| `category` | `string` | Yes | References `categories.id` / `categories.title` | Foreign Key Category Link |
| `code` | `string` | No | e.g. `"FAL-MOD-101"` | SKU / Catalog Reference Number |
| `price` | `number` | Yes | Positive Float (INR ₹) | Indicative Wholesale / MRP Price |
| `rating` | `number` / `string` | No | Range 1.0 – 5.0 / `"10A 240V~"` | Customer rating or electrical rating |
| `reviewsCount` | `number` | No | Integer $\ge 0$ | Total verified B2B reviews |
| `description` | `string` | Yes | Long text | Comprehensive product marketing overview |
| `image` | `string` | Yes | Base64 or Asset URI | Primary cover photograph |
| `images` | `array<string>` | No | Max 6 images | Multi-angle thumbnail image gallery |
| `isNew` | `boolean` | No | Default: `false` | Triggers "NEW LAUNCH" badge |
| `isPopular` / `isFeatured` | `boolean` | No | Default: `false` | Triggers "FEATURED / BESTSELLER" showcase |
| `specs` | `map / object` | Yes | Key-Value Pairs | Technical specifications matrix (see sub-table) |
| `highlights` | `array<string>` | No | Array of strings | Key bullet points (e.g. "Flame Retardant") |
| `moq` | `string` | No | e.g. `"100 Pcs (1 Master Box)"` | Minimum Order Quantity for wholesalers |
| `inStock` | `boolean` | No | Default: `true` | Inventory availability indicator |
| `createdAt` | `string` / `number` | Yes | ISO 8601 / Timestamp | Creation timestamp |
| `updatedAt` | `string` / `number` | Yes | ISO 8601 / Timestamp | Last modification timestamp |

#### Sub-Structure: `products.specs` (Map Object)
```typescript
{
  "current": "10A / 16A / 25A",         // Rated Amperage
  "voltage": "240V AC 50Hz",            // Rated Voltage
  "control": "1-Way / 2-Way",           // Switching Mechanism
  "gang": "1 Module (1M)",              // Modular Frame Footprint
  "material": "FR Polycarbonate",       // Body Polymer Grade
  "warranty": "10 Years Guarantee",     // Warranty Period
  "contact": "Silver Cadmium Inlay",    // Terminal Contact Type
  "standard": "IS 3854:1997"            // Bureau of Indian Standards (BIS)
}
```

---

### Collection 4: `admin_auth`
* **Purpose:** Stores admin authentication credentials and hash/passcode parameters.
* **Document ID:** `credentials` or `{authId}`

| Field Name | Data Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `email` | `string` | Yes | Admin login email identifier |
| `password` | `string` | Yes | Admin passcode / authorization secret |
| `updatedAt` | `string` | Yes | Timestamp of last credential change |

---

## 3. Relationships & Data Integrity Constraints

```
   [categories] 1 ───────────< N [products]
   (Category ID)                 (product.category)
```

1. **Category to Products (1 : N Relationship):**
   - Each category has zero or more products.
   - `product.category` stores the category slug (or title) referencing `categories.id` or `categories.title`.
   - When a category name is updated, the admin panel cascade-updates all associated product category fields.
2. **Branding to Application (1 : 1 Singleton):**
   - Single document `store_settings/company_branding` globally governs all brand parameters, navbar logos, and hero switch imagery.

---

## 4. Query Patterns & Performance Indexes

Firestore automatically indexes every single field in a document. To support complex filtering in the digital catalog, the following composite queries are supported:

### Common Query Patterns:
1. **Fetch Featured Products for Homepage:**
   ```typescript
   query(collection(db, "products"), where("isPopular", "==", true), limit(8))
   ```
2. **Fetch Products by Category:**
   ```typescript
   query(collection(db, "products"), where("category", "==", categoryId))
   ```
3. **Fetch Categories Ordered by Carousel Priority:**
   ```typescript
   query(collection(db, "categories"), orderBy("displayOrder", "asc"))
   ```
4. **Fetch Global Branding Singleton:**
   ```typescript
   getDoc(doc(db, "store_settings", "company_branding"))
   ```

---

## 5. Document Size Safeguards (1 MB Firestore Rule)

### The Constraint:
* Cloud Firestore enforces a strict hard limit of **1,048,576 bytes (1 MB)** per document.

### The Application Safeguard (`src/utils/imageCompressor.ts`):
* Every image (Hero Switch Photo, Logo, Product Gallery) passes through an automated **HTML5 Canvas iterative compressor** before writing to Firestore.
* Max dimensions are clamped to $1200\text{px} \times 1200\text{px}$.
* Output Base64 string is strictly governed to stay under **320 KB** (~240 KB binary equivalent).
* This guarantees that even with multiple product specs and metadata, total document size remains well below 30% of the Firestore threshold.

---

## 6. Security Rules (`firestore.rules`)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public store settings, company branding, logos and hero content
    match /store_settings/{settingId} {
      allow read, write: if true;
    }

    // Products catalog items
    match /products/{productId} {
      allow read, write: if true;
    }

    // Categories catalog items
    match /categories/{categoryId} {
      allow read, write: if true;
    }

    // Admin authentication data
    match /admin_auth/{authId} {
      allow read, write: if true;
    }

    // General fallback
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

---

## 7. Data Seeding, Fallback & Migration Strategy

### Offline & Cold-Start Fallback:
1. When a user first opens the application or if Firestore is in a cold-start/network-restricted state, `StoreContext.tsx` immediately initializes from high-quality in-memory default data (`src/data/initialData.ts`).
2. Once Firestore establishes real-time connection, the state seamlessly updates via reactive snapshots (`onSnapshot`).
3. **Admin 1-Click Database Reset:** The admin panel provides a "Reset / Re-Seed Database" utility that cleanly populates the standard factory catalog in Firestore if the database is blank or requires a fresh start.

---
*Falcon Electricals Database Specification — Robust, Scalable, Real-Time Cloud Infrastructure.*
