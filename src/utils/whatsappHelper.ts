import { Product, CompanyDetails } from '../types';

/**
 * Builds a clean, professional WhatsApp inquiry message for a product.
 */
export function buildProductMessage(
  product: Product,
  companyDetails: CompanyDetails
): string {
  const brand = companyDetails?.brandName || 'Falcon Electrics';
  const company = companyDetails?.companyName || 'Verma Enterprises';

  const lines: string[] = [
    `Hello ${company} (${brand}),`,
    ``,
    `I am interested in this product for bulk/dealer purchase:`,
    `Product: ${product.name}`,
  ];

  if (product.categoryName || product.category) {
    lines.push(`Category: ${product.categoryName || product.category}`);
  }

  if (product.price) {
    lines.push(`Price: ${product.price}`);
  } else if (product.perPiecePrice) {
    lines.push(`Price: ₹${product.perPiecePrice}/pc`);
  }

  lines.push(``);
  lines.push(`Please share the wholesale dealer quote, minimum order quantity (MOQ) and delivery details.`);

  return lines.join('\n');
}

/**
 * Generates the complete WhatsApp redirect URL for a product or general inquiry.
 */
export function getProductWhatsAppUrl(
  product: Product | null | undefined,
  companyDetails: CompanyDetails,
  customText?: string
): string {
  const rawPhone = companyDetails?.whatsapp || companyDetails?.phone || '+91 97175 49515';
  const cleanPhone = String(rawPhone).replace(/[^0-9]/g, '');
  const company = companyDetails?.companyName || 'Verma Enterprises';
  const brand = companyDetails?.brandName || 'Falcon Electrics';

  let messageText = '';

  if (product) {
    messageText = buildProductMessage(product, companyDetails);
  } else if (customText) {
    messageText = customText;
  } else {
    messageText = `Hello ${company} (${brand}), I am interested in your electrical products. Please share your latest catalogue and wholesale price list.`;
  }

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`;
}

/**
 * Redirects user directly to WhatsApp with the product inquiry.
 */
export function shareProductOnWhatsApp(
  product: Product,
  companyDetails: CompanyDetails
): void {
  const waUrl = getProductWhatsAppUrl(product, companyDetails);
  window.open(waUrl, '_blank');
}
