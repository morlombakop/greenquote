import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans text-slate-900">
      {/* Header / Navbar */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2 font-bold text-xl text-emerald-600 tracking-tight">
            <span>☀️</span>
            <span>GreenQuote</span>
          </div>
          <nav className="flex items-center space-x-4">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors"
            >
              Get a quote
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow flex items-center justify-center py-12 px-4">
        <div className="max-w-3xl text-center space-y-8">
          <div className="inline-flex items-center space-x-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase">
            <span>⚡ Solar Financing Pre-Qualification</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Empower Your Home with <br />
            <span className="text-emerald-600 bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              Smart Solar Financing
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Calculate your residential solar system pricing, assess your risk
            band profiles, and receive instant personalized installment plans
            tailored to your consumption metrics.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 text-center text-lg"
            >
              Get a quote
            </Link>
          </div>

          {/* Quick Core Features Preview */}
          <div className="pt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-emerald-600 text-xl font-bold mb-2">
                01. Instant Pricing
              </div>
              <p className="text-slate-600 text-sm">
                Get transparent, dynamic system pricing computations scaled
                directly to your exact generation requirements.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-emerald-600 text-xl font-bold mb-2">
                02. Risk Assessment
              </div>
              <p className="text-slate-600 text-sm">
                Automated system classification places requests instantly into
                optimized risk profiles for transparent qualification.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-emerald-600 text-xl font-bold mb-2">
                03. Tailored Terms
              </div>
              <p className="text-slate-600 text-sm">
                Review split structural payment options covering competitive 5,
                10, and 15-year fully amortized terms.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        <div className="max-w-6xl mx-auto px-4">
          &copy; {new Date().getFullYear()} GreenQuote. All rights reserved.
          Built for Cloover Engineering Challenge.
        </div>
      </footer>
    </div>
  );
}
