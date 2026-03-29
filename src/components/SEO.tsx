import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  jsonLd?: object | object[];
}

const DEFAULT_TITLE = 'AI Stock Assist — AI-Powered Stock Analysis';
const DEFAULT_DESC = 'Professional stock analysis powered by Google Gemini AI. Fundamental metrics, cash flow analysis, and BUY/HOLD/SELL recommendations.';

export default function SEO({ title, description = DEFAULT_DESC, keywords = [], jsonLd }: SEOProps) {
  const fullTitle = title ? `${title} | AI Stock Assist` : DEFAULT_TITLE;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords.length > 0 && <meta name="keywords" content={keywords.join(', ')} />}
      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
}
