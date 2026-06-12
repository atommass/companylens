export function FooterSection() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 px-6 lg:px-8 border-t border-gray-800">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="text-[#533483]">🔍</span> CompanyLens
            </h3>
            <p className="text-sm">
              An NGO committed to making public company data accessible, understandable, and useful for everyone.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Mission</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-[#533483] transition-colors">Our Mission</a></li>
              <li><a href="#" className="hover:text-[#533483] transition-colors">Transparency Report</a></li>
              <li><a href="#" className="hover:text-[#533483] transition-colors">Impact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-[#533483] transition-colors">Donate</a></li>
              <li><a href="#" className="hover:text-[#533483] transition-colors">Contribute</a></li>
              <li><a href="#" className="hover:text-[#533483] transition-colors">Get Involved</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-[#533483] transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-[#533483] transition-colors">Terms</a></li>
              <li><a href="#" className="hover:text-[#533483] transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm">
            &copy; 2026 CompanyLens NGO. We're a non-profit organization committed to transparency.
          </p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="text-sm hover:text-[#533483] transition-colors">Twitter</a>
            <a href="#" className="text-sm hover:text-[#533483] transition-colors">LinkedIn</a>
            <a href="#" className="text-sm hover:text-[#533483] transition-colors">GitHub</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
