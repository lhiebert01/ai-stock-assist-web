import { ArrowLeft } from 'lucide-react';

interface PrivacyPolicyProps {
  onBack: () => void;
}

export default function PrivacyPolicy({ onBack }: PrivacyPolicyProps) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-white transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-sm text-[var(--color-text-muted)] mb-10">Last updated: March 2026</p>

      <div className="space-y-8 text-sm text-[var(--color-text-secondary)] leading-relaxed">
        <section>
          <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-3">1. Introduction</h2>
          <p>
            AI Stock Assist ("we," "our," or "the Service") is operated by Lindsay Hiebert.
            This Privacy Policy explains how we collect, use, and protect your information when you use
            our website at <span className="text-[var(--color-accent)]">aistockassist.com</span>.
          </p>
          <p className="mt-2">
            By using AI Stock Assist, you agree to the collection and use of information as described in this policy.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-3">2. Information We Collect</h2>
          <p className="mb-2">We collect the following information:</p>
          <ul className="list-disc list-inside space-y-1.5 ml-2">
            <li><strong>Account Information:</strong> Email address and display name when you create an account via Supabase Auth (including Google sign-in).</li>
            <li><strong>Usage Data:</strong> Stock tickers analyzed, methodology preferences, and analysis history to provide and improve the Service.</li>
            <li><strong>Payment Information:</strong> Payment processing is handled entirely by Stripe. We never store your credit card numbers, CVV, or full payment details on our servers.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-3">3. How We Use Your Information</h2>
          <ul className="list-disc list-inside space-y-1.5 ml-2">
            <li>Provide stock analysis and AI-generated recommendations</li>
            <li>Manage your account and analysis credits</li>
            <li>Process payments via Stripe</li>
            <li>Maintain your analysis history</li>
            <li>Improve the Service and fix issues</li>
            <li>Communicate important updates about your account</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-3">4. Data Storage & Security</h2>
          <p>
            Your data is stored securely using Supabase (PostgreSQL with Row Level Security).
            All connections use HTTPS encryption. Passwords are handled by Supabase Auth with
            industry-standard hashing. We implement appropriate technical and organizational
            measures to protect your personal information.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-3">5. Payment Processing</h2>
          <p>
            All payments are processed securely through <strong>Stripe</strong>. We never see or store
            your full credit card details. Stripe's privacy policy applies to payment data.
            We only store your Stripe customer ID to link purchases to your account.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-3">6. Third-Party Services</h2>
          <p className="mb-2">We use the following third-party services:</p>
          <ul className="list-disc list-inside space-y-1.5 ml-2">
            <li><strong>Google Gemini AI:</strong> Generates stock analysis and recommendations. Ticker symbols and financial data are sent for analysis.</li>
            <li><strong>Groq (Llama 3.3 70B):</strong> Backup AI provider for reliability.</li>
            <li><strong>Yahoo Finance:</strong> Source of real-time stock market data and financial metrics.</li>
            <li><strong>Supabase:</strong> Authentication and database hosting.</li>
            <li><strong>Stripe:</strong> Payment processing.</li>
            <li><strong>Render:</strong> Application hosting.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-3">7. Data Sharing</h2>
          <p>
            We do <strong>not</strong> sell, trade, or rent your personal information to third parties.
            We do not use tracking pixels, behavioral advertising, or sell data to data brokers.
            Your analysis data is yours — we use it only to provide the Service.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-3">8. Your Rights</h2>
          <p className="mb-2">You have the right to:</p>
          <ul className="list-disc list-inside space-y-1.5 ml-2">
            <li><strong>Access</strong> your personal data and analysis history</li>
            <li><strong>Update</strong> your account information</li>
            <li><strong>Delete</strong> your account and all associated data</li>
            <li><strong>Export</strong> your analysis data (via Word export feature)</li>
          </ul>
          <p className="mt-2">
            To exercise any of these rights, contact us at the email below.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-3">9. Cookies & Local Storage</h2>
          <p>
            We use browser local storage to maintain your authentication session.
            We do not use third-party tracking cookies or analytics cookies.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-3">10. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Changes will be posted on this page
            with an updated date. Continued use of the Service after changes constitutes acceptance.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-3">11. Contact</h2>
          <p>
            Questions about this Privacy Policy? Contact us at:{' '}
            <a href="mailto:lindsay.hiebert@gmail.com" className="text-[var(--color-accent)] hover:underline">
              lindsay.hiebert@gmail.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
