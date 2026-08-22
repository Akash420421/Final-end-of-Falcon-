import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useFalconStore } from '../context/StoreContext';

/**
 * Dynamic SEO Head Manager:
 * - Updates Document Title in real-time based on Route, Company & Brand Name
 * - Sets unique Canonical URL (<link rel="canonical" href="https://falconelectrics.com/...">)
 * - Updates Meta Description and Open Graph tags per route
 * - Injects live dynamic Schema.org JSON-LD for Search Engine Rich Results
 */
export const SEOHead: React.FC = () => {
  const { companyDetails, products, categories } = useFalconStore();
  const location = useLocation();

  useEffect(() => {
    const brand = companyDetails.brandName || 'Falcon Electrics';
    const company = companyDetails.companyName || 'Verma Enterprises';
    const path = location.pathname;
    const baseUrl = 'https://falconelectrics.com';

    let pageTitle = `${company} | ${brand} — Modular Switches, Fan Regulators & Heater Rotary Switches Manufacturer in Delhi`;
    let metaDescription = `${company} (${brand}) is a leading Delhi-based direct factory manufacturer of heavy-duty 16A modular switches, step fan regulators, heater rotary switches & electrical accessories in ${companyDetails.address || 'Delhi, India'}. Wholesale & B2B supplier across India.`;
    let canonicalUrl = `${baseUrl}${path === '/' ? '' : path}`;

    // Route-specific SEO Metadata
    if (path === '/products') {
      pageTitle = `All Switches, Regulators & Modular Accessories Catalog | ${brand} (${company})`;
      metaDescription = `Explore the full electrical switchgear catalogue of ${brand}. Direct factory supply of 5-step fan regulators, 16A/25A rotary switches, modular switches & sockets in Delhi, India.`;
    } else if (path.startsWith('/category/')) {
      const catId = path.replace('/category/', '').trim().toLowerCase();
      const currentCategory = categories.find(
        (c) => c.id.toLowerCase() === catId || c.title.toLowerCase().includes(catId)
      );
      const catTitle = currentCategory ? currentCategory.title : 'Electrical Switches';
      pageTitle = `${catTitle} Range | ${brand} Direct Factory Manufacturer Delhi`;
      metaDescription = `Buy wholesale ${catTitle} from ${company} (${brand}). Heavy-duty electrical accessories, certified performance, flame-retardant materials & pan-India dispatch.`;
    } else if (path.startsWith('/product/')) {
      const prodId = path.replace('/product/', '').trim();
      const currentProduct = products.find((p) => p.id === prodId);
      if (currentProduct) {
        pageTitle = `${currentProduct.name} | ${brand} Manufacturer Delhi`;
        metaDescription = `${currentProduct.name} manufactured by ${company} (${brand}). ${currentProduct.description || 'Heavy-duty modular switchgear specifications and direct factory wholesale pricing.'}`;
      }
    } else if (path === '/catalogue') {
      pageTitle = `Product Catalogue & Technical Specifications | ${brand} (${company})`;
      metaDescription = `View and download the complete technical catalogue of ${brand} switchgear, step fan regulators, heater switches, and electrical accessories with wiring ratings.`;
    } else if (path === '/about') {
      pageTitle = `About ${company} & ${brand} | Electrical Switches Manufacturer in Vikas Nagar Delhi`;
      metaDescription = `Learn about ${company} (${brand}), founded by Mr. Rajveer Verma in New Delhi. Direct manufacturer of modular switchgear and electrical accessories with pan-India dealer supply.`;
    } else if (path === '/why-us') {
      pageTitle = `Why Choose ${brand} | Certified Quality & Factory Wholesale Pricing`;
      metaDescription = `Discover why electrical contractors and wholesale dealers trust ${brand} for silver-cadmium switches, spark resistance, and direct factory pricing.`;
    } else if (path === '/contact') {
      pageTitle = `Contact Factory & Sales Office | ${company} (${brand}) Vikas Nagar Delhi`;
      metaDescription = `Contact ${company} factory at 109-A/D, Block A, Vikas Nagar Extn, Uttam Nagar, New Delhi 110059. Call ${companyDetails.phone || '+91 97175 49515'} for bulk orders and wholesale supply.`;
    } else if (path === '/admin') {
      pageTitle = `Admin Control Panel | ${brand}`;
      metaDescription = `Secure Admin Control Panel for ${brand} store management.`;
    }

    // 1. Dynamic Page Title
    document.title = pageTitle;

    // 2. Dynamic Canonical Link Tag
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    // 3. Update Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', metaDescription);

    // 4. Update OG Title, Description, and URL
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', pageTitle);
    }

    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) {
      ogDesc.setAttribute('content', metaDescription);
    }

    let ogUrl = document.querySelector('meta[property="og:url"]');
    if (!ogUrl) {
      ogUrl = document.createElement('meta');
      ogUrl.setAttribute('property', 'og:url');
      document.head.appendChild(ogUrl);
    }
    ogUrl.setAttribute('content', canonicalUrl);

    // 5. Update Dynamic JSON-LD Product Schema
    let dynamicScript = document.getElementById('dynamic-products-jsonld') as HTMLScriptElement | null;
    if (!dynamicScript) {
      dynamicScript = document.createElement('script');
      dynamicScript.id = 'dynamic-products-jsonld';
      dynamicScript.type = 'application/ld+json';
      document.head.appendChild(dynamicScript);
    }

    const productSchemaList = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      'name': `${brand} Catalog — ${company}`,
      'url': canonicalUrl,
      'description': `Live manufactured product line by ${company}`,
      'numberOfItems': products.length,
      'itemListElement': products.slice(0, 25).map((prod, index) => ({
        '@type': 'Product',
        'position': index + 1,
        'name': prod.name,
        'description': prod.description || `${prod.name} by ${brand}`,
        'category': prod.categoryName || prod.category,
        'image': prod.image || undefined,
        'brand': {
          '@type': 'Brand',
          'name': brand,
        },
        'offers': {
          '@type': 'Offer',
          'priceCurrency': 'INR',
          'price': prod.price ? prod.price.replace(/[^0-9.]/g, '') || undefined : undefined,
          'availability': 'https://schema.org/InStock',
          'seller': {
            '@type': 'Organization',
            'name': company,
          },
        },
      })),
    };

    dynamicScript.textContent = JSON.stringify(productSchemaList);
  }, [companyDetails, products, categories, location.pathname]);

  return null;
};
