export const BUSINESS_INFO = {
  name: 'Rash Hub Store',
  business: 'Football jerseys only',
  currency: 'GH₵',
  phone: '0533916516',
  phoneFormatted: '053 391 6516',
  phoneTel: 'tel:0533916516',
  whatsapp: '+233533916516',
  whatsappRaw: '233533916516',
  deliveryLocation: 'Abofour, Ghana only',
  deliveryTown: 'Abofour',
  tagline: 'FOOTBALL JERSEYS FOR EVERY FAN.',
  heroHeadline: 'BUY QUALITY JERSEYS FOR INSTANT DELIVERY FOR THE NEW SEASON',
  heroSupporting:
    'Rep your favorite club and national team with quality football jerseys. Discover your next match-day look at Rash Hub Store.',
  brandColors: {
    black: '#080B11',
    navy: '#0F172A',
    electricGreen: '#00E676',
    white: '#FFFFFF',
  },
};

export const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] as const;

export const JERSEY_TYPES = [
  'Home',
  'Away',
  'Third Kit',
  'Goalkeeper',
  'Special Edition',
  'Retro',
] as const;

export const JERSEY_VERSIONS = ['Fan Version', 'Player Version'] as const;

export const ABOFOUR_LOCAL_AREAS = [
  'Abofour Central / Market Area',
  'Abofour Post Office Area',
  'Abofour Zongo',
  'Abofour New Town',
  'Abofour Main Road / Lorry Station',
  'Abofour Senior High School Area',
  'Other Abofour Residential Area',
];

/**
 * Builds a direct WhatsApp chat link with optional pre-filled message
 */
export function getWhatsAppLink(message?: string): string {
  const base = `https://wa.me/${BUSINESS_INFO.whatsappRaw}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}

/**
 * Generates an WhatsApp pre-filled order inquiry message
 */
export function buildWhatsAppOrderMessage(params: {
  orderReference?: string;
  customerName?: string;
  items: Array<{ name: string; size: string; quantity: number; price: number }>;
  total: number;
  deliveryLocation: string;
}): string {
  let msg = `⚽ *${BUSINESS_INFO.name.toUpperCase()} ORDER*\n`;
  if (params.orderReference) {
    msg += `📋 *Order Ref:* ${params.orderReference}\n`;
  }
  if (params.customerName) {
    msg += `👤 *Customer:* ${params.customerName}\n`;
  }
  msg += `\n*JERSEYS ORDERED:*\n`;
  params.items.forEach((item, idx) => {
    msg += `${idx + 1}. ${item.name} (${item.size}) x${item.quantity} — GH₵ ${item.price * item.quantity}\n`;
  });
  msg += `\n💰 *Total Amount:* GH₵ ${params.total.toFixed(2)}\n`;
  msg += `📍 *Delivery Location (Abofour only):* ${params.deliveryLocation}\n\n`;
  msg += `Please confirm availability and instant delivery in Abofour. Thank you!`;
  return msg;
}
