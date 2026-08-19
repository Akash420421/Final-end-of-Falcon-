import React, { useEffect } from 'react';
import { useFalconStore } from '../context/StoreContext';

/**
 * Dynamic SEO Head Manager:
 * - Updates Document Title in real-time based on Company & Brand Name
 * - Synchronizes Open Graph and Meta Description tags
 * - Injects live dynamic Schema.org JSON-LD with all current products
 */
export const SEOHead: React.FC = () => {
  const { companyDetails, products } = useFalconStore();

  useEffect(() => {
    const brand = companyDetails.brandName || 'Falcon Electrics';
    const company = companyDetails.companyName || 'Verma Enterprises';
    const tagline = companyDetails.tagline || 'Heavy-Duty Switchgear & Modular Accessories';

    // 1. Dynamic Page Title
    document.title = `${company} | ${brand} — ${tagline} | Delhi Manufacturer`;

    // 2. Update Meta Description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        `${company} (${brand}) - Direct factory manufacturer of modular switches, 5-step fan regulators, 16A rotary heater switches & appliance accessories in ${companyDetails.address || 'Delhi, India'}. Wholesale & B2B supplier.`
      );
    }

    // 3. Update OG Title & Description
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', `${company} | ${brand} — Modular Electrical Manufacturer`);
    }

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) {
      ogDesc.setAttribute(
        'content',
        `Direct factory supply of modular switches, fan regulators & heater rotary switches from ${company}. High reliability & pan-India wholesale delivery.`
      );
    }

    // 4. Update Dynamic JSON-LD Product Schema
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
      'description': `Live manufactured product line by ${company}`,
      'numberOfItems': products.length,
      'itemListElement': products.slice(0, 20).map((prod, index) => ({
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
  }, [companyDetails, products]);

  return null;
};
