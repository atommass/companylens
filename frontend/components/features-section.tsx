type FeaturesSectionProps = {
  title?: string;
  subtitle?: string;
};

export function FeaturesSection({ title, subtitle }: FeaturesSectionProps) {
  const features = [
    {
      title: 'Public Data Access',
      description: 'Free access to company information, financial records, and public filings for everyone.',
      icon: '🌐',
    },
    {
      title: 'Easy to Understand',
      description: 'We simplify complex financial data with clear visualizations and plain language explanations.',
      icon: '📖',
    },
    {
      title: 'Community Driven',
      description: 'Built and maintained by a passionate community of data advocates and transparency enthusiasts.',
      icon: '👥',
    },
    {
      title: 'No Paywalls',
      description: 'All features are completely free. We operate through donations and community support.',
      icon: '🎁',
    },
    {
      title: 'Open Source',
      description: 'Our code and methodologies are open source for auditing and community improvement.',
      icon: '🔓',
    },
    {
      title: 'Educational Resources',
      description: 'Learn about business transparency, financial literacy, and data interpretation.',
      icon: '🎓',
    },
  ];

  return (
    <section id="features" className="py-20 lg:py-32 px-6 lg:px-8 bg-gray-900">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            {title ?? 'Our Commitment to Transparency'}
          </h2>
          <p className="text-xl text-gray-400">
            {subtitle ?? 'Features built with transparency, accessibility, and community impact in mind'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-gray-800 rounded-lg p-8 shadow-sm hover:shadow-md hover:border-[#533483]/50 transition-all border border-gray-700 hover:bg-gray-750">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
