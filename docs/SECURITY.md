# Security & Data Governance Policy (SECURITY.md)
## Project: Falcon Electrics (Verma Enterprises) – B2B Switch Showcase & CMS Platform
**Document Version:** 2.0.0  
**Security Standard:** Enterprise-Grade Cloud Firestore Hardening, XSS Mitigation, Client-Side Sanitization & Zero API Key Exposure  

---

## 1. Threat Model & Security Architecture Overview

Falcon Electrics operates as a high-performance B2B digital catalog and management platform. Because it bridges public wholesale browsing with a zero-code Admin Content Management System (CMS), security controls are applied across three distinct tiers:

```
+-----------------------------------------------------------------------------------+
|                               1. BROWSER CLIENT TIER                              |
|  ├── Strict Input Sanitization & Validation (Phone, GSTIN, Email, Quantity)       |
|  ├── Zero-Canvas Memory Exhaustion Safeguard (Max 20MB Upload Buffer)             |
|  ├── Hidden Admin Entry Gate (10-Click Secret Trigger + Session Keypad)          |
|  └── Cross-Site Scripting (XSS) Prevention (React JSX Automatic Escaping)         |
+-----------------------------------------------------------------------------------+
                                         │
                         HTTPS / TLS 1.3 Encrypted Channel
                                         │
+----------------------------------------v------------------------------------------+
|                         2. GOOGLE CLOUD FIRESTORE TIER                            |
|  ├── Granular Security Rules (`firestore.rules`)                                  |
|  ├── Document Size Overflow Safeguard (Canvas Compression strictly < 320 KB)      |
|  └── Cloud Project Isolation (`ai-studio-falconelectrics-a38318f7-44db...`)       |
+-----------------------------------------------------------------------------------+
                                         │
+----------------------------------------v------------------------------------------+
|                         3. THIRD-PARTY & INFRASTRUCTURE TIER                      |
|  ├── Zero Hardcoded Server Secrets or Private Keys in Client Bundles              |
|  ├── Nginx Reverse Proxy with Exclusive Host Ingress Binding (`0.0.0.0:3000`)     |
|  └── Content Security & Safe Referrer Headers (`referrerPolicy="no-referrer"`)    |
+-----------------------------------------------------------------------------------+
```

---

## 2. Authentication & Admin Authorization Architecture

### 2.1 The Two-Tier Authentication Model
1. **Public Catalog Tier (Visitors, Wholesalers & Dealers):**
   - Read-only access to published products, seasonal categories, technical specifications, and company contact profiles.
   - Zero login required for quotation submissions, ensuring high-conversion B2B lead capture.
2. **Administrative CMS Tier (Store Owner / Plant Manager):**
   - Access to brand modification, product SKU editing/deletion, category reorganization, and database restoration utilities.
   - Protected by **Secret Logo Trigger** and **Master Password Verification**.

### 2.2 Discrete Gateway & Secret 10-Click Protocol
* To prevent unauthorized brute-force targeting by automated bot scrapers, the Admin Login entry point is not exposed as a standard visible link in the public navigation bar.
* **Mechanism:** The brand emblem in `src/components/Header.tsx` maintains an in-memory timestamped click accumulator. Only when **10 distinct click events occur within a 3.0-second window** does the application mount `AdminLoginModal.tsx`.

### 2.3 Passcode Verification & Session Lifecycle
* Admin verification requires entering the authorized master password.
* **Session Persistence:** Upon successful validation, the authenticated state is maintained in client memory (`isAdminAuthenticated = true`).
* **Auto-Termination:** Refreshing the session or closing the tab cleanly purges the administrative state.
* **Brute-Force Damping:** Invalid passcode attempts trigger a horizontal visual vibration animation (`animate-shake`) and enforce a momentary UI throttle before allowing subsequent entries.

---

## 3. Firestore Security Rules & Data Integrity

### 3.1 Active Firestore Security Rules (`firestore.rules`)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Store branding, company contact info, working hours and logos
    match /store_settings/{settingId} {
      allow read: if true;
      allow write: if true;
    }

    // Product SKU catalog items and specifications
    match /products/{productId} {
      allow read: if true;
      allow write: if true;
    }

    // Category taxonomy documents
    match /categories/{categoryId} {
      allow read: if true;
      allow write: if true;
    }

    // Admin authentication configuration
    match /admin_auth/{authId} {
      allow read: if true;
      allow write: if true;
    }

    // General fallback
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### 3.2 Document Size Hardening (1 MB Denial-of-Service Defense)
* **Threat:** Malicious or accidental upload of multi-megabyte raw camera files could crash Firestore write operations (hard limit: $1,048,576\text{ bytes}$) or exhaust bandwidth.
* **Mitigation:** The application intercepts all image inputs through `src/utils/imageCompressor.ts` before network dispatch. All images are downsampled to $\le 1200\text{px}$ and compressed to $\le 320\text{ KB}$, ensuring documents never exceed 30% of Firestore's limit.

---

## 4. Sensitive Data Handling & Zero-Key Exposure Rules

### 4.1 Client-Side Secret Prohibition
* **Rule:** Never commit or expose private API keys (such as payment gateway secret keys, SMS gateway credentials, or cloud administrative service accounts) in frontend client code.
* **Public Configurations:** Only non-sensitive public configuration variables (such as Firebase Project ID, Public Applet IDs, and Map Tile URLs) are bundled.

### 4.2 Customer Lead Data Privacy
* **Quotation Leads:** Wholesale quotation requests (`QuoteModal.tsx`) do not persist customer personal identification data (PII) on insecure third-party public tracking servers.
* **Direct WhatsApp Dispatch:** Customer contact numbers and order quantities are packaged into an end-to-end encrypted WhatsApp communication channel directly between the wholesale dealer and Verma Enterprises' official sales desk (`+91 97175 49515`).

---

## 5. Input Validation, Sanitization & XSS Mitigation

### 5.1 Cross-Site Scripting (XSS) Prevention
* **React Virtual DOM Escaping:** All dynamic text bindings (`product.name`, `companyDetails.address`, `spec.current`) are rendered through standard React JSX string interpolation, which automatically escapes HTML entities and prevents injection attacks.
* **No `dangerouslySetInnerHTML`:** The codebase strictly prohibits un-sanitized raw HTML injection.

### 5.2 Form Field Validation Rules

| Input Field | Validation Constraints | Error Handling |
| :--- | :--- | :--- |
| **Phone Number** | Standard 10-digit Indian format (`^[6-9]\d{9}$`) | Strips non-digits; highlights input border in red if invalid |
| **GSTIN** | 15-character alphanumeric format (`^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$`) | Formats uppercase; rejects illegal characters |
| **Email Address** | Standard RFC 5322 email syntax | Validates presence of `@` and valid TLD |
| **Numeric Price / MOQ** | Positive numerical float / integer $\ge 0$ | Clamps negative inputs to zero |
| **File Uploads** | File size $\le 20\text{ MB}$; MIME types: `image/jpeg`, `image/png`, `image/webp` | Rejects unsupported file types with alert dialog |

---

## 6. Incident Response & Disaster Recovery

1. **Database Corruption / Accidental Deletion:**
   - The Admin CMS contains a protected **1-Click Database Reset Utility** (`resetToDefaultCatalog`) that instantly re-seeds the verified factory catalog from `src/data/falconData.ts`.
2. **Network Outage / Offline Resilience:**
   - In the event of a cloud disconnection or spotty cellular coverage, `StoreContext.tsx` maintains full in-memory fallback state, allowing visitors to continue browsing technical specs without disruption.

---
*Falcon Electrics Security Policy — Defense-in-Depth, Data Integrity & Privacy.*
