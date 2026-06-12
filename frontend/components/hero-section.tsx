type HeroSectionProps = {
  title?: string;
  description?: string;
};

export function HeroSection({ title, description }: HeroSectionProps) {
  return (
    <section className="bg-gradient-to-br from-black to-gray-900 py-20 lg:py-32 px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              {title ?? <><span>Making Public Data </span><span className="text-[#533483]">Truly Public</span></>}
            </h1>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              {description ?? 'CompanyLens is an NGO dedicated to making company data accessible, understandable, and actionable for everyone. We believe transparency builds trust in businesses and empowers communities.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="rounded-lg bg-[#533483] px-8 py-3 font-semibold text-white hover:bg-[#6b4799] transition-colors">
                Explore Data
              </button>
              <button className="rounded-lg border-2 border-[#533483] px-8 py-3 font-semibold text-white hover:bg-[#533483]/10 transition-colors">
                Support Our Mission
              </button>
            </div>
          </div>
          <div className="bg-gradient-to-br from-[#533483] to-[#6b4799] rounded-2xl h-96 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-white text-lg font-semibold">Transparent Data Access</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
