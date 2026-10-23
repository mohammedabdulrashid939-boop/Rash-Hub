import React, { useEffect } from 'react';
import { Product } from '../types';
import { BUSINESS_INFO } from '../lib/constants';

interface SEOHeadProps {
  currentPage: string;
  product?: Product | null;
  searchQuery?: string;
}

const BASE_URL = 'https://rash-hubs.pages.dev';

export const SEOHead: React.FC<SEOHeadProps> = ({ currentPage, product, searchQuery }) => {
  useEffect(() => {
    // 1. Determine Page Metadata
    let title = 'Rash Hubs — Football Jerseys Store in Abofour, Ghana';
    let description =
      'Shop quality club and national team football jerseys at Rash Hubs. Fan and Player versions available with fast delivery in Abofour, Ghana.';
    let canonicalPath = '/';
    let isIndexable = true;
    let ogType = 'website';
    let ogImage = `${BASE_URL}/logo.png`;

    if (currentPage === 'home') {
      title = 'Rash Hubs — Football Jerseys Store in Abofour, Ghana';
      description =
        'Buy quality club and national team football jerseys for the new season with instant delivery in Abofour, Ghana. Player and Fan versions in stock.';
      canonicalPath = '/';
      isIndexable = true;
    } else if (currentPage === 'shop') {
      title = searchQuery
        ? `"${searchQuery}" Football Jerseys | Rash Hubs`
        : 'Shop Football Jerseys | Club & National Team Kits — Rash Hubs';
      description =
        'Browse football jerseys in Ghana Cedis (GH₵). Home, away, third, and retro kits in Fan and Player versions with same-day Abofour delivery.';
      canonicalPath = '/shop';
      isIndexable = !searchQuery; // Avoid indexing dynamic internal search queries
    } else if (currentPage === 'product' && product) {
      title = `${product.name} | Football Jersey — Rash Hubs`;
      description = `${product.name} (${product.version}, ${product.jersey_type}) for ${BUSINESS_INFO.currency} ${product.selling_price.toFixed(2)}. In stock with instant delivery in Abofour, Ghana.`;
      canonicalPath = `/product/${product.slug}`;
      ogType = 'product';
      const coverImg =
        product.images?.find((img) => img.is_cover)?.url ||
        product.images?.[0]?.url;
      if (coverImg) {
        ogImage = coverImg.startsWith('http') ? coverImg : `${BASE_URL}${coverImg}`;
      }
      isIndexable = true;
    } else if (currentPage === 'contact') {
      title = 'Contact Rash Hubs — Football Jersey Store in Abofour, Ghana';
      description =
        'Contact Rash Hubs for football jersey sizing guidance, club requests, and delivery support in Abofour. Call 0533916516 or WhatsApp +233533916516.';
      canonicalPath = '/contact';
      isIndexable = true;
    } else if (currentPage === 'login') {
      title = 'Customer Login — Rash Hubs';
      description = 'Log in to your Rash Hubs account to manage orders and delivery preferences.';
      canonicalPath = '/login';
      isIndexable = false;
    } else if (currentPage === 'signup') {
      title = 'Create an Account — Rash Hubs';
      description = 'Join Rash Hubs to buy quality football jerseys with delivery in Abofour, Ghana.';
      canonicalPath = '/signup';
      isIndexable = false;
    } else if (currentPage === 'checkout') {
      title = 'Checkout — Rash Hubs';
      description = 'Complete your football jersey order for fast delivery in Abofour, Ghana.';
      canonicalPath = '/checkout';
      isIndexable = false;
    } else if (currentPage === 'account') {
      title = 'My Account & Orders — Rash Hubs';
      description = 'View your recent jersey purchases and profile details at Rash Hubs.';
      canonicalPath = '/account';
      isIndexable = false;
    } else if (currentPage === 'admin') {
      title = 'Store Administration — Rash Hubs';
      description = 'Admin dashboard for uploading and managing jersey catalog and orders.';
      canonicalPath = '/admin';
      isIndexable = false;
    } else if (currentPage === 'order-confirmation') {
      title = 'Order Confirmed — Rash Hubs';
      description = 'Thank you for ordering your football jerseys with Rash Hubs.';
      canonicalPath = '/order-confirmation';
      isIndexable = false;
    } else {
      isIndexable = false;
    }

    const canonicalUrl = `${BASE_URL}${canonicalPath}`;

    // 2. Update Document Title
    document.title = title;

    // Helper to safely set or update a meta tag
    const setMetaTag = (attrName: string, attrVal: string, contentVal: string) => {
      let element = document.querySelector(`meta[${attrName}="${attrVal}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrVal);
        document.head.appendChild(element);
      }
      element.setAttribute('content', contentVal);
    };

    // Helper to set or update link tag (canonical)
    const setLinkTag = (relVal: string, hrefVal: string) => {
      let element = document.querySelector(`link[rel="${relVal}"]`);
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', relVal);
        document.head.appendChild(element);
      }
      element.setAttribute('href', hrefVal);
    };

    // 3. Set Essential SEO Meta Tags
    setMetaTag('name', 'description', description);
    setLinkTag('canonical', canonicalUrl);

    // Robots directive
    if (isIndexable) {
      setMetaTag('name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
      setMetaTag('name', 'googlebot', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    } else {
      setMetaTag('name', 'robots', 'noindex, nofollow');
      setMetaTag('name', 'googlebot', 'noindex, nofollow');
    }

    // 4. Set Open Graph Social Tags
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:url', canonicalUrl);
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:image', ogImage);
    setMetaTag('property', 'og:site_name', 'Rash Hubs');
    setMetaTag('property', 'og:locale', 'en_GH');

    // 5. Set Twitter Card Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', title);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', ogImage);

    // 6. Inject Schema.org JSON-LD Structured Data
    let structuredData: Record<string, unknown>[] = [];

    // Global WebSite & Store Schema
    const storeSchema = {
      '@context': 'https://schema.org',
      '@type': 'Store',
      name: 'Rash Hubs',
      alternateName: 'Rash Hub Store',
      url: BASE_URL,
      logo: `${BASE_URL}/logo.png`,
      image: `${BASE_URL}/logo.png`,
      description:
        'Specialist football jersey retailer delivering quality club and national team jerseys strictly within Abofour, Ghana.',
      telephone: BUSINESS_INFO.whatsapp,
      priceRange: 'GH₵',
      currenciesAccepted: 'GHS',
      paymentAccepted: 'Cash on Delivery, Mobile Money',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Abofour',
        addressRegion: 'Ashanti Region',
        addressCountry: 'GH',
      },
      areaServed: {
        '@type': 'Place',
        name: 'Abofour, Ashanti Region, Ghana',
      },
    };

    if (currentPage === 'home') {
      const websiteSchema = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Rash Hubs',
        url: BASE_URL,
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${BASE_URL}/shop?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      };
      structuredData = [websiteSchema, storeSchema];
    } else if (currentPage === 'shop') {
      const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: BASE_URL,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Shop Football Jerseys',
            item: `${BASE_URL}/shop`,
          },
        ],
      };
      structuredData = [breadcrumbSchema, storeSchema];
    } else if (currentPage === 'product' && product) {
      const totalStock = product.sizes?.reduce((sum, s) => sum + s.stock_quantity, 0) ?? 0;
      const productImages = product.images?.map((img) =>
        img.url.startsWith('http') ? img.url : `${BASE_URL}${img.url}`
      ) || [`${BASE_URL}/logo.png`];

      const productSchema = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        image: productImages,
        description: product.short_description || product.full_description || product.name,
        sku: product.sizes?.[0]?.sku || product.slug || product.id,
        brand: {
          '@type': 'Brand',
          name: product.club_or_country || 'Football Kit',
        },
        offers: {
          '@type': 'Offer',
          url: canonicalUrl,
          priceCurrency: 'GHS',
          price: product.selling_price,
          priceValidUntil: '2027-12-31',
          itemCondition: 'https://schema.org/NewCondition',
          availability:
            totalStock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          seller: {
            '@type': 'Organization',
            name: 'Rash Hubs',
          },
          areaServed: 'Abofour, Ghana',
        },
      };

      const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: BASE_URL,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Shop Jerseys',
            item: `${BASE_URL}/shop`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: product.name,
            item: canonicalUrl,
          },
        ],
      };

      structuredData = [breadcrumbSchema, productSchema];
    } else if (currentPage === 'contact') {
      const contactPageSchema = {
        '@context': 'https://schema.org',
        '@type': 'ContactPage',
        name: 'Contact Rash Hubs',
        description: 'Contact information and WhatsApp ordering for Rash Hubs in Abofour, Ghana.',
        url: `${BASE_URL}/contact`,
        mainEntity: storeSchema,
      };
      structuredData = [contactPageSchema];
    }

    // Attach JSON-LD to head
    let scriptTag = document.getElementById('seo-structured-data') as HTMLScriptElement | null;
    if (structuredData.length > 0) {
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = 'seo-structured-data';
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(structuredData);
    } else if (scriptTag) {
      scriptTag.remove();
    }
  }, [currentPage, product, searchQuery]);

  return null;
};
