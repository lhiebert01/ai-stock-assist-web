const SITE_URL = 'https://aistockassist.com';

export function getOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'AI Stock Assist',
    url: SITE_URL,
    logo: `${SITE_URL}/icons/icon-512.png`,
    description: 'AI-powered stock analysis for professional fundamental analysis.',
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'lindsay.hiebert@gmail.com',
      contactType: 'customer support',
    },
  };
}

export function getSoftwareApplicationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'AI Stock Assist',
    url: SITE_URL,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    description: 'Professional AI-powered stock analysis with fundamental metrics, cash flow analysis, and investment recommendations.',
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'USD',
      lowPrice: '0',
      highPrice: '9.99',
      offerCount: '3',
    },
  };
}

export function getFAQJsonLd(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };
}
