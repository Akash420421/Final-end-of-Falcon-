import { Product, CompanyDetails } from '../types';

/**
 * Builds an IndiaMART-style structured WhatsApp inquiry message with Product Image,
 * Specifications, Pricing, and Company Details.
 */
export function buildIndiaMartProductMessage(
  product: Product,
  companyDetails: CompanyDetails
): string {
  const brand = companyDetails.brandName || 'Falcon Electrics';
  const company = companyDetails.companyName || 'Verma Enterprises';
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://vermaenterprises.in';

  // Determine valid direct image URL or product deep-link
  let imageUrl = '';
  if (product.image && (product.image.startsWith('http://') || product.image.startsWith('https://'))) {
    imageUrl = product.image;
  } else if (product.images && product.images.length > 0 && product.images[0].startsWith('http')) {
    imageUrl = product.images[0];
  }

  // Product deep-link for rich preview
  const productWebLink = `${currentOrigin}/product/${product.id}`;

  const lines: string[] = [
    `*⚡ B2B PRODUCT INQUIRY • ${brand.toUpperCase()}*`,
    `━━━━━━━━━━━━━━━━━━━━━━`,
    `*📦 Product:* ${product.name}`,
    `*🏷️ Category:* ${product.categoryName || product.category}${product.subCategory ? ` (${product.subCategory})` : ''}`,
  ];

  if (product.price) {
    lines.push(`*💰 Wholesale Rate:* ${product.price}`);
  }
  if (product.perPiecePrice) {
    lines.push(`*💵 Per Piece Rate:* ₹${product.perPiecePrice}/pc`);
  }

  // Specifications
  const specs: string[] = [];
  if (product.amps) specs.push(`Amps: ${product.amps}`);
  if (product.voltage) specs.push(`Voltage: ${product.voltage}`);
  if (product.steps) specs.push(`Steps/Speed: ${product.steps}`);
  if (product.material) specs.push(`Material: ${product.material}`);

  if (specs.length > 0) {
    lines.push(`*⚙️ Key Specs:* ${specs.join(' | ')}`);
  }

  if (product.features && product.features.length > 0) {
    const keyFeatures = product.features.slice(0, 3).join(' • ');
    lines.push(`*✨ Highlights:* ${keyFeatures}`);
  }

  // Add Direct Image Link & Page Link (triggers rich image preview card on WhatsApp)
  lines.push(`━━━━━━━━━━━━━━━━━━━━━━`);
  if (imageUrl) {
    lines.push(`*📸 Product Photo:* ${imageUrl}`);
  }
  lines.push(`*🔗 View On Website:* ${productWebLink}`);
  lines.push(`━━━━━━━━━━━━━━━━━━━━━━`);

  // Buyer requirement message
  lines.push(`*🏢 Manufacturer:* ${company} (${companyDetails.address || 'Delhi, India'})`);
  lines.push(``);
  lines.push(`*Buyer Message:*`);
  lines.push(`Hello ${company}, I am interested in purchasing this item for bulk/dealer supply. Please share:`);
  lines.push(`1. Minimum Order Quantity (MOQ)`);
  lines.push(`2. Best Wholesale Price List`);
  lines.push(`3. Dispatch & Packaging details`);
  lines.push(``);
  lines.push(`Looking forward to your quick response!`);

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
    messageText = buildIndiaMartProductMessage(product, companyDetails);
  } else if (customText) {
    messageText = customText;
  } else {
    messageText = `Hello ${company} (${brand}), I am looking for the latest electrical product catalogue & bulk wholesale dealer pricing details.\n\nFactory Location: ${companyDetails.address || 'Delhi'}`;
  }

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`;
}

/**
 * Attempts native Web Share API with image file if supported on Mobile;
 * falls back to opening WhatsApp with the rich photo link.
 */
export async function shareProductOnWhatsApp(
  product: Product,
  companyDetails: CompanyDetails
): Promise<void> {
  const messageText = buildIndiaMartProductMessage(product, companyDetails);
  const waUrl = getProductWhatsAppUrl(product, companyDetails);

  // If navigator.canShare is available and product has a remote image URL, attempt native share
  if (
    typeof navigator !== 'undefined' &&
    navigator.share &&
    product.image &&
    (product.image.startsWith('http://') || product.image.startsWith('https://'))
  ) {
    try {
      // Try to fetch image as blob for direct WhatsApp media attachment
      const res = await fetch(product.image, { mode: 'cors' });
      if (res.ok) {
        const blob = await res.blob();
        const file = new File([blob], `${product.name.replace(/[^a-zA-Z0-9]/g, '_')}.webp`, {
          type: blob.type || 'image/webp',
        });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `${product.name} - ${companyDetails.brandName || 'Falcon Electrics'}`,
            text: messageText,
            files: [file],
          });
          return;
        }
      }
    } catch {
      // If native sharing fails or user cancels, fallback to standard WhatsApp redirect
    }
  }

  // Standard high-reliability fallback to WhatsApp Web / App
  window.open(waUrl, '_blank');
}
