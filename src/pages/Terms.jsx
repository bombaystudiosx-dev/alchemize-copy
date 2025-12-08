import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import CosmicBackground from '@/components/cosmic/CosmicBackground';

export default function Terms() {
  return (
    <CosmicBackground>
      <div className="min-h-screen pb-20">
        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/30 border-b border-white/10">
          <div className="flex items-center gap-4 px-4 py-3">
            <Link to={createPageUrl('Settings')}>
              <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
            </Link>
            <h1 className="text-xl font-bold text-white">Terms & Conditions</h1>
          </div>
        </header>

        {/* Content */}
        <div className="max-w-2xl mx-auto px-6 py-8">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 space-y-6 text-white/90">
            <section>
              <h2 className="text-lg font-semibold text-white mb-3">1. Acceptance of Terms</h2>
              <p className="text-sm leading-relaxed">
                By accessing and using Alchemize, you accept and agree to be bound by the terms and provisions of this agreement.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">2. Use License</h2>
              <p className="text-sm leading-relaxed mb-2">
                Permission is granted to temporarily use Alchemize for personal, non-commercial purposes. This license does not include:
              </p>
              <ul className="text-sm space-y-1 ml-4 list-disc">
                <li>Modifying or copying the materials</li>
                <li>Using the materials for commercial purposes</li>
                <li>Attempting to reverse engineer any software</li>
                <li>Removing any copyright or proprietary notations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">3. User Account</h2>
              <p className="text-sm leading-relaxed">
                You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">4. Data and Privacy</h2>
              <p className="text-sm leading-relaxed">
                Your use of Alchemize is also governed by our Privacy Policy. We collect and use information as described in our Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">5. User Content</h2>
              <p className="text-sm leading-relaxed">
                You retain all rights to the content you submit, post, or display on Alchemize. By submitting content, you grant us a license to use, modify, and display that content within the app.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">6. Disclaimer</h2>
              <p className="text-sm leading-relaxed">
                Alchemize is provided "as is" without warranties of any kind. We do not guarantee that the app will be uninterrupted or error-free. Use at your own risk.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">7. Limitation of Liability</h2>
              <p className="text-sm leading-relaxed">
                In no event shall Alchemize or its suppliers be liable for any damages arising out of the use or inability to use the app.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">8. Modifications</h2>
              <p className="text-sm leading-relaxed">
                We reserve the right to modify these terms at any time. Continued use of the app after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">9. Governing Law</h2>
              <p className="text-sm leading-relaxed">
                These terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law provisions.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">10. Contact</h2>
              <p className="text-sm leading-relaxed">
                If you have any questions about these Terms, please contact us through the app settings.
              </p>
            </section>

            <div className="pt-4 border-t border-white/10">
              <p className="text-xs text-white/50 text-center">
                Last Updated: December 8, 2025
              </p>
            </div>
          </div>
        </div>
      </div>
    </CosmicBackground>
  );
}