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

  // Include direct web link for WhatsApp rich link preview
  let baseUrl = 'https://falconelectricx.vercel.app';
  if (typeof window !== 'undefined') {
    const host = window.location.host;
    if (host && !host.includes('run.app') && !host.includes('localhost')) {
      baseUrl = window.location.origin;
    }
  }
  lines.push(`Product Link: ${baseUrl}/product/${product.id}`);

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
  let cleanPhone = String(rawPhone).replace(/[^0-9]/g, '');
  if (cleanPhone.length === 10) {
    cleanPhone = '91' + cleanPhone;
  }
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

  return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(messageText)}`;
}

/**
 * Universal WhatsApp launcher that works seamlessly for:
 * 1. WhatsApp Business (w4b)
 * 2. Normal WhatsApp
 * 3. Mobile devices (Android / iOS)
 * 4. Desktop WhatsApp Web
 */
export function openWhatsAppChat(
  phone: string | undefined,
  messageText: string
): void {
  const rawPhone = phone || '+91 97175 49515';
  let cleanPhone = String(rawPhone).replace(/[^0-9]/g, '');
  if (cleanPhone.length === 10) {
    cleanPhone = '91' + cleanPhone;
  }

  const encodedText = encodeURIComponent(messageText);

  // Detect mobile user agent
  const isMobile =
    typeof navigator !== 'undefined' &&
    /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

  if (isMobile) {
    // Direct native intent URL: WhatsApp and WhatsApp Business both handle `whatsapp://`
    // This allows Android/iOS to open WhatsApp Business or normal WhatsApp directly
    // and prompts user with an app picker if both are installed, WITHOUT forcing Play Store redirect.
    const nativeUri = `whatsapp://send?phone=${cleanPhone}&text=${encodedText}`;

    // Create an invisible anchor tag to trigger the protocol handler cleanly
    const link = document.createElement('a');
    link.href = nativeUri;
    link.target = '_top';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
    }, 500);

    // Fallback: If neither app responds within 1.5s, fallback to web API
    const fallbackTimer = setTimeout(() => {
      window.location.href = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`;
    }, 1500);

    const onVisibilityChange = () => {
      if (document.hidden) {
        clearTimeout(fallbackTimer);
        document.removeEventListener('visibilitychange', onVisibilityChange);
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
  } else {
    // Desktop: Use web.whatsapp.com
    const desktopUrl = `https://web.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`;
    const newWindow = window.open(desktopUrl, '_blank', 'noopener,noreferrer');
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      window.location.href = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`;
    }
  }
}

/**
 * Redirects user directly to WhatsApp with the product inquiry.
 */
export function shareProductOnWhatsApp(
  product: Product,
  companyDetails: CompanyDetails
): void {
  const messageText = buildProductMessage(product, companyDetails);
  const rawPhone = companyDetails?.whatsapp || companyDetails?.phone || '+91 97175 49515';
  openWhatsAppChat(rawPhone, messageText);
}

