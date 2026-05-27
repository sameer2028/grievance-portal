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
    desc: 'JWT authentication, role-based access control, and encrypted tokens protect every citizens data. ' ,
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
    <section className="bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 dark:bg-gray-900 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 text-white">
      <div className="max-w-5xl mx-auto px-6 py-24 text-center">
        <span className="inline-block mb-4 px-3 py-1 bg-primary-500/40 dark:bg-primary-500/20 rounded-full text-xs font-semibold uppercase tracking-widest text-white">
          Smart India Hackathon 2024
        </span>
        <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-6 text-balance text-white">
          AI-Powered Public<br />Grievance Portal
        </h1>
        <p className="text-primary-100 dark:text-gray-300 text-lg max-w-2xl mx-auto mb-10 text-balance">
          Submit your complaints, track resolutions, and hold authorities accountable — powered by
          machine learning for faster, smarter routing.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link to="/register" className="btn bg-white text-primary-700 hover:bg-primary-50 dark:bg-primary-600 dark:text-white dark:hover:bg-primary-500 px-8 py-3 font-semibold shadow-lg">
            Submit a Grievance
          </Link>
          <Link to="/track" className="btn border border-white/40 text-white hover:bg-white/10 dark:border-gray-600 dark:hover:bg-gray-800 px-8 py-3 font-semibold">
            Track Your Ticket
          </Link>
        </div>
      </div>
    </section>

    {/* ── Stats bar ────────────────────────────────────────────────── */}
    <section className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
        {[
          { val: '10,000+', label: 'Grievances Processed' },
          { val: '9',       label: 'Departments Covered' },
          { val: '87%',     label: 'Resolved Within SLA' },
          { val: '<30s',    label: 'Avg. AI Analysis Time' },
        ].map((s) => (
          <div key={s.label}>
            <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{s.val}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>
    </section>

    {/* ── Features ─────────────────────────────────────────────────── */}
    <section className="max-w-5xl mx-auto px-6 py-20">
      <h2 className="text-center text-3xl font-bold text-gray-900 dark:text-white mb-3">
        Why GrievancePortal?
      </h2>
      <p className="text-center text-gray-500 dark:text-gray-400 mb-12 max-w-xl mx-auto">
        Built for real-world government workflows — not just a demo.
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {FEATURES.map((f) => (
          <div key={f.title} className="card hover:shadow-card-hover transition-shadow">
            <span className="text-3xl mb-4 block">{f.icon}</span>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{f.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>

    {/* ── How it works ─────────────────────────────────────────────── */}
    <section className="bg-gray-100 dark:bg-gray-900/50 py-20">
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="text-center text-3xl font-bold text-gray-900 dark:text-white mb-12">How it works</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {STEPS.map((s, i) => (
            <div key={s.num} className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary-600 dark:bg-primary-900/50 text-white dark:text-primary-300 font-bold text-sm flex items-center justify-center mx-auto mb-4">
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
    <section className="bg-primary-600 dark:bg-gray-800 text-white py-16 text-center px-6">
      <h2 className="text-3xl font-bold mb-4 text-white">Ready to raise your voice?</h2>
      <p className="text-primary-100 dark:text-gray-300 mb-8 max-w-lg mx-auto">
        It only takes 2 minutes. No paperwork. No queues.
      </p>
      <Link to="/register" className="btn bg-white text-primary-700 hover:bg-primary-50 dark:bg-primary-600 dark:text-white dark:hover:bg-primary-500 px-10 py-3 font-semibold shadow-lg">
        Get Started — It's Free
      </Link>
    </section>
  </div>
);

export default LandingPage;
