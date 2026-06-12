export default function TransparencyPage() {
  const metrics = [
    { label: 'Public records indexed', value: '12k+' },
    { label: 'Community volunteers', value: '180+' },
    { label: 'Monthly data requests', value: '24k+' },
    { label: 'Donation-backed coverage', value: '100%' },
  ];

  return (
    <section className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-gray-400">Transparency</p>
        <h2 className="text-3xl font-semibold text-white">How we stay accountable</h2>
        <p className="mt-3 max-w-3xl text-gray-400">
          We publish our progress, funding sources, and impact so the community can see how the platform is maintained and improved.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-2xl border border-gray-700 bg-gray-800 p-6">
            <p className="text-3xl font-bold text-white">{metric.value}</p>
            <p className="mt-2 text-sm text-gray-400">{metric.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-[#533483]/30 bg-[#533483]/10 p-6">
        <h3 className="text-xl font-semibold text-white">Open data, open process</h3>
        <p className="mt-2 text-gray-300">
          Our mission is to make public data easier to understand. That includes showing where data comes from, how often it updates, and how the platform is funded.
        </p>
      </div>
    </section>
  );
}
