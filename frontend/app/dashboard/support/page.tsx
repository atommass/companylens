export default function SupportPage() {
  return (
    <section className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-gray-400">Support</p>
        <h2 className="text-3xl font-semibold text-white">Help us keep public data free</h2>
        <p className="mt-3 max-w-3xl text-gray-400">
          CompanyLens is community supported. Donations, volunteers, and contributors keep the platform available to everyone without paywalls.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { title: 'Donate', text: 'Help fund hosting, infrastructure, and data processing costs.' },
          { title: 'Volunteer', text: 'Join our community and help improve data quality or product design.' },
          { title: 'Contribute', text: 'Submit code, data sources, and ideas to make the platform stronger.' },
        ].map((item) => (
          <div key={item.title} className="rounded-2xl border border-gray-700 bg-gray-800 p-6">
            <h3 className="text-xl font-semibold text-white">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-gray-400">{item.text}</p>
            <button className="mt-4 rounded-lg bg-[#533483] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#6b4799]">
              {item.title === 'Donate' ? 'Donate now' : item.title === 'Volunteer' ? 'Get involved' : 'Contribute'}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
