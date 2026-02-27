import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CosmicBackground from '@/components/cosmic/CosmicBackground';

export default function Privacy() {
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
            <h1 className="text-xl font-bold text-white">Privacy Policy</h1>
          </div>
        </header>

        {/* Content */}
        <div className="max-w-2xl mx-auto px-6 py-8">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 space-y-6 text-white/90">
            <section>
              <h2 className="text-lg font-semibold text-white mb-3">1. Information We Collect</h2>
              <p className="text-sm leading-relaxed mb-2">
                We collect information you provide directly to us, including:
              </p>
              <ul className="text-sm space-y-1 ml-4 list-disc">
                <li>Account information (name, email)</li>
                <li>Personal wellness data (habits, goals, nutrition logs)</li>
                <li>Financial tracking data</li>
                <li>Manifestation and affirmation content</li>
                <li>Photos and images you upload</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">2. How We Use Your Information</h2>
              <p className="text-sm leading-relaxed mb-2">
                We use the information we collect to:
              </p>
              <ul className="text-sm space-y-1 ml-4 list-disc">
                <li>Provide, maintain, and improve our services</li>
                <li>Process and complete transactions</li>
                <li>Send you technical notices and support messages</li>
                <li>Personalize your experience</li>
                <li>Monitor and analyze trends and usage</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">3. Data Storage and Security</h2>
              <p className="text-sm leading-relaxed">
                Your data is stored securely using industry-standard encryption. We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">4. Data Sharing</h2>
              <p className="text-sm leading-relaxed">
                We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
              </p>
              <ul className="text-sm space-y-1 ml-4 list-disc mt-2">
                <li>With your consent</li>
                <li>To comply with legal obligations</li>
                <li>To protect our rights and prevent fraud</li>
                <li>With service providers who assist in our operations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">5. Your Rights</h2>
              <p className="text-sm leading-relaxed mb-2">
                You have the right to:
              </p>
              <ul className="text-sm space-y-1 ml-4 list-disc">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Export your data</li>
                <li>Opt-out of communications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">6. Camera and Photo Access</h2>
              <p className="text-sm leading-relaxed">
                When you use our food scanning feature, we request access to your camera and photos. Images are processed to identify food items and nutritional information. We do not store your photos unless you explicitly save them.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">7. AI and Machine Learning</h2>
              <p className="text-sm leading-relaxed">
                We may use AI services to analyze food images, generate meal plans, and provide personalized recommendations. This processing is done securely and your data is not used to train third-party AI models without your consent.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">8. Children's Privacy</h2>
              <p className="text-sm leading-relaxed">
                Alchemize is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">9. Changes to Privacy Policy</h2>
              <p className="text-sm leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">10. Contact Us</h2>
              <p className="text-sm leading-relaxed">
                If you have questions about this Privacy Policy or our data practices, please contact us through the app settings.
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