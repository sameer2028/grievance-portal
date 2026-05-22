import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { publicApi } from '@/api/otherApis';
import Spinner from '@/components/ui/Spinner';
import { DEPARTMENT_LABELS } from '@/utils/constants';
import { snakeToTitle } from '@/utils/helpers';

const StatBlock = ({ value, label, sub }) => (
  <div className="text-center">
    <p className="text-3xl sm:text-4xl font-black text-primary-600">{value ?? '—'}</p>
    <p className="text-sm font-semibold text-gray-800 mt-1">{label}</p>
    {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
  </div>
);

const PublicStatsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicApi.getStats()
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>;
  if (!data) return null;

  const { overview, byDepartment, byDistrict } = data;

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-700 to-primary-900 text-white py-16 px-6 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">Transparency Dashboard</h1>
        <p className="text-primary-200 max-w-xl mx-auto text-sm">
          Live statistics on public grievance resolution. Updated in real time.
        </p>
      </section>

      {/* Overview stats */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8">
          <StatBlock value={overview.total?.toLocaleString()}      label="Total Grievances"   />
          <StatBlock value={`${overview.resolutionRate}%`}          label="Resolution Rate"   sub="of all submitted" />
          <StatBlock value={overview.recentResolved?.toLocaleString()} label="Resolved This Month" />
          <StatBlock value={overview.avgCitizenRating ? `${overview.avgCitizenRating}/5` : '—'} label="Avg. Citizen Rating"
            sub={overview.totalFeedbacks ? `${overview.totalFeedbacks} reviews` : null}
          />
        </div>
      </section>

      {/* Department breakdown */}
      <section className="bg-gray-50 py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Department Performance</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {(byDepartment || []).map((d) => {
              const rate = d.count > 0 ? Math.round((d.resolved / d.count) * 100) : 0;
              return (
                <div key={d._id} className="card">
                  <div className="flex justify-between items-start mb-3">
                    <p className="font-semibold text-gray-900 text-sm">
                      {DEPARTMENT_LABELS[d._id] || snakeToTitle(d._id)}
                    </p>
                    <span className="text-xs text-gray-500">{d.count} total</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-500 rounded-full"
                        style={{ width: `${rate}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-primary-600 w-12 text-right">{rate}%</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{d.resolved} resolved</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Top districts */}
      {byDistrict?.length > 0 && (
        <section className="max-w-4xl mx-auto px-6 py-12">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Top Districts by Grievances</h2>
          <div className="card">
            {byDistrict.map((d, i) => {
              const max = byDistrict[0].count;
              return (
                <div key={d._id} className={`flex items-center gap-4 py-3 ${i !== 0 ? 'border-t border-gray-100' : ''}`}>
                  <span className="w-5 text-sm font-bold text-gray-400 shrink-0">{i + 1}</span>
                  <span className="text-sm font-medium text-gray-800 w-32 shrink-0">{d._id}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-400 rounded-full"
                      style={{ width: `${Math.round((d.count / max) * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-16 text-right shrink-0">{d.count} cases</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-primary-600 text-white py-12 text-center px-6">
        <h2 className="text-2xl font-bold mb-4">Have a grievance?</h2>
        <p className="text-primary-100 mb-6 max-w-md mx-auto text-sm">
          Submit your complaint and track it to resolution.
        </p>
        <div className="flex gap-3 justify-center">
          <Link to="/register" className="btn bg-white text-primary-700 hover:bg-primary-50 font-semibold px-6">
            Submit Now
          </Link>
          <Link to="/track" className="btn border border-white/40 text-white hover:bg-white/10 font-semibold px-6">
            Track Ticket
          </Link>
        </div>
      </section>
    </div>
  );
};

export default PublicStatsPage;
