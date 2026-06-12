type MissionSectionProps = {
  title?: string;
  paragraphOne?: string;
  paragraphTwo?: string;
};

export function MissionSection({ title, paragraphOne, paragraphTwo }: MissionSectionProps) {
  return (
    <section id="mission" className="py-20 lg:py-32 px-6 lg:px-8 bg-gray-800 border-t border-gray-700">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">{title ?? 'Our Mission'}</h2>
            <p className="text-gray-300 mb-4 text-lg leading-relaxed">
              {paragraphOne ?? 'CompanyLens is dedicated to democratizing access to company information. We believe that transparency is fundamental to a healthy economy and informed society.'}
            </p>
            <p className="text-gray-300 mb-6 text-lg leading-relaxed">
              {paragraphTwo ?? "Too often, critical business information is locked behind paywalls or hidden in complex financial documents. We're breaking down these barriers by making public data truly public."}
            </p>
            <ul className="space-y-3 text-gray-300">
              <li className="flex gap-3">
                <span className="text-[#533483] text-xl">✓</span>
                <span>Make all public data accessible to everyone</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#533483] text-xl">✓</span>
                <span>Translate complex financial data into understandable insights</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#533483] text-xl">✓</span>
                <span>Empower communities with knowledge about local businesses</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#533483] text-xl">✓</span>
                <span>Build tools for journalists, researchers, and advocates</span>
              </li>
            </ul>
          </div>
          <div className="bg-gradient-to-br from-[#533483]/20 to-[#6b4799]/20 rounded-2xl p-8 border border-[#533483]/30">
            <h3 className="text-2xl font-bold text-white mb-4">Why This Matters</h3>
            <p className="text-gray-300 leading-relaxed mb-6">
              Transparency builds trust. When companies are open about their operations, environmental impact, labor practices, and financial health, everyone benefits.
            </p>
            <p className="text-gray-300 leading-relaxed">
              From investors to employees, from regulators to consumers, better access to information leads to better decisions and a more accountable business landscape.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
