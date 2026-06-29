import { Link } from 'react-router-dom';

const FEATURES = [
  {
    icon: '🤖',
    title: 'AI-Powered Routing',
    desc: 'Grievances are automatically classified by department and routed to the right officer using machine learning.',
  },
  {
    icon: '📊',
    title: 'Real-time Analytics',
    desc: 'Administrators get live dashboards showing grievance trends, department load, sentiment and priority distribution.',
  },
  {
    icon: '🔔',
    title: 'Live Tracking',
    desc: 'Track your complaint status end-to-end using a unique ticket number — no login required.',
  },
  {
    icon: '🗺️',
    title: 'Geographic Insights',
    desc: 'Heat maps reveal grievance hotspots by district, helping authorities prioritise resource deployment.',
  },
  {
    icon: '⚡',
    title: 'Urgency Detection',
    desc: 'Critical issues are automatically escalated based on AI-detected urgency signals in the complaint text.',
  },
  {
    icon: '🔒',
    title: 'Secure & Private',
    desc: 'JWT authentication, role-based access control, and encrypted tokens protect every citizens data. ',
  },
];

const STEPS = [
  { num: '01', title: 'Register', desc: 'Create a free account using your email.' },
  { num: '02', title: 'Submit', desc: 'Describe your issue with location and photos.' },
  { num: '03', title: 'AI Analysis', desc: 'Our system classifies and routes it instantly.' },
  { num: '04', title: 'Resolution', desc: 'Track updates until your grievance is resolved.' },
];

const LandingPage = () => (
  <div className="animate-fade-in">
    {/* ── Hero ─────────────────────────────────────────────────────── */}
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-900 to-primary-900 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 text-white">
      {/* Floating decorative shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {/* Large blurred circle top-right */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary-500/10 blur-3xl animate-float-slow" />
        {/* Medium circle left */}
        <div className="absolute top-1/2 -left-16 w-72 h-72 rounded-full bg-accent-500/8 blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        {/* Small accent circle bottom */}
        <div className="absolute bottom-12 right-1/3 w-48 h-48 rounded-full bg-primary-400/10 blur-2xl animate-float" style={{ animationDelay: '4s' }} />
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }} />
      </div>

      <div className="relative max-w-5xl mx-auto px-6 py-28 text-center">
        <span className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 bg-primary-500/15 border border-primary-400/20 rounded-full text-xs font-semibold uppercase tracking-widest text-primary-300 backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-glow-pulse" />
          Smart India Hackathon 2024
        </span>
        <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight mb-6 text-balance text-white tracking-tight">
          Jan<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-300 to-primary-500">Samadhan</span>
        </h1>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-12 text-balance leading-relaxed">
          AI-Powered Smart Public Grievance Platform — Submit complaints, track resolutions, and hold authorities accountable.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link to="/register" className="group relative inline-flex items-center gap-2 px-8 py-3.5 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-xl shadow-lg shadow-primary-600/25 hover:shadow-primary-500/30 transition-all duration-200 hover:-translate-y-0.5">
            Submit a Grievance
            <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
          </Link>
          <Link to="/track" className="inline-flex items-center gap-2 px-8 py-3.5 border border-white/20 text-white hover:bg-white/10 font-semibold rounded-xl backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5">
            Track Your Ticket
          </Link>
        </div>
      </div>
    </section>

    {/* ── Stats bar ────────────────────────────────────────────────── */}
    <section className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
        {[
          { val: '10,000+', label: 'Grievances Processed' },
          { val: '9', label: 'Departments Covered' },
          { val: '87%', label: 'Resolved Within SLA' },
          { val: '<30s', label: 'Avg. AI Analysis Time' },
        ].map((s) => (
          <div key={s.label} className="group">
            <p className="text-3xl font-extrabold font-mono text-primary-600 dark:text-primary-400 tracking-tight group-hover:scale-105 transition-transform">{s.val}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 font-medium">{s.label}</p>
          </div>
        ))}
      </div>
    </section>

    {/* ── Features ─────────────────────────────────────────────────── */}
    <section className="max-w-5xl mx-auto px-6 py-20">
      <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white mb-3 tracking-tight">
        Why JanSamadhan?
      </h2>
      <p className="text-center text-gray-500 dark:text-gray-400 mb-14 max-w-xl mx-auto">
        Built for real-world government workflows — not just a demo.
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-stagger">
        {FEATURES.map((f) => (
          <div key={f.title} className="card group hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200">
            <div className="w-12 h-12 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-200">
              {f.icon}
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{f.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>

    {/* ── How it works ─────────────────────────────────────────────── */}
    <section className="bg-gray-100 dark:bg-gray-900/50 py-20">
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white mb-14 tracking-tight">How it works</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {STEPS.map((s, i) => (
            <div key={s.num} className="text-center group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 dark:from-primary-600 dark:to-primary-800 text-white font-bold text-sm flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-600/20 group-hover:scale-110 group-hover:shadow-primary-500/30 transition-all duration-200">
                {s.num}
              </div>
              {i < STEPS.length - 1 && (
                <div className="hidden lg:block absolute translate-x-full translate-y-[-2rem] text-gray-300 dark:text-gray-700 text-2xl ml-4">→</div>
              )}
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{s.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ── CTA ──────────────────────────────────────────────────────── */}
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 dark:from-gray-800 dark:via-gray-800 dark:to-gray-900 text-white py-20 text-center px-6">
      {/* Subtle floating shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-white/5 blur-2xl animate-float-slow" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-white/5 blur-2xl animate-float" />
      </div>
      <div className="relative">
        <h2 className="text-3xl font-extrabold mb-4 text-white tracking-tight">Ready to raise your voice?</h2>
        <p className="text-primary-100 dark:text-gray-300 mb-10 max-w-lg mx-auto text-lg">
          It only takes 2 minutes. No paperwork. No queues.
        </p>
        <Link to="/register" className="group inline-flex items-center gap-2 px-10 py-3.5 bg-white text-primary-700 hover:bg-primary-50 dark:bg-primary-600 dark:text-white dark:hover:bg-primary-500 font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-200 hover:-translate-y-0.5">
          Get Started — It's Free
          <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
        </Link>
      </div>
    </section>
  </div>
);

export default LandingPage;
