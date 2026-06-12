type SupportSectionProps = {
  title?: string;
  subtitle?: string;
};

export function SupportSection({ title, subtitle }: SupportSectionProps) {
  return (
    <section id="support" className="py-20 lg:py-32 px-6 lg:px-8 bg-gradient-to-br from-[#533483]/10 to-[#6b4799]/10 border-t border-[#533483]/30">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">{title ?? 'Support Our Mission'}</h2>
          <p className="text-xl text-gray-300">
            {subtitle ?? "We're entirely free because we believe data access shouldn't be a commodity."}<br />
            Help us make transparency universal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 hover:border-[#533483] transition-colors">
            <div className="text-4xl mb-4">💝</div>
            <h3 className="text-xl font-semibold text-white mb-3">Donate</h3>
            <p className="text-gray-400 mb-4">
              Your donations directly fund our infrastructure, development, and community programs.
            </p>
            <button className="w-full rounded-lg bg-[#533483] hover:bg-[#6b4799] text-white font-semibold py-2 transition-colors">
              Donate Now
            </button>
          </div>

          <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 hover:border-[#533483] transition-colors">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-white mb-3">Volunteer</h3>
            <p className="text-gray-400 mb-4">
              Join our community of data advocates, developers, and transparency enthusiasts.
            </p>
            <button className="w-full rounded-lg bg-[#533483] hover:bg-[#6b4799] text-white font-semibold py-2 transition-colors">
              Get Involved
            </button>
          </div>

          <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 hover:border-[#533483] transition-colors">
            <div className="text-4xl mb-4">🔧</div>
            <h3 className="text-xl font-semibold text-white mb-3">Contribute</h3>
            <p className="text-gray-400 mb-4">
              Contribute code, data, ideas, or expertise on GitHub and help build transparency tools.
            </p>
            <button className="w-full rounded-lg bg-[#533483] hover:bg-[#6b4799] text-white font-semibold py-2 transition-colors">
              View on GitHub
            </button>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-8 border border-[#533483]/30 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">100% Transparent</h3>
          <p className="text-gray-300 mb-4">
            We publish our financials, operational reports, and impact metrics publicly. See how your support makes a difference.
          </p>
          <a href="#" className="text-[#a8a0d8] hover:text-[#c4bce0] font-semibold">
            View Our Transparency Report →
          </a>
        </div>
      </div>
    </section>
  );
}
