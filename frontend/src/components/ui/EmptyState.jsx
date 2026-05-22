import { Link } from 'react-router-dom';

/**
 * Props:
 *   icon    - emoji string, default "📭"
 *   title   - main heading
 *   desc    - supporting text
 *   action  - { label: "Submit one", to: "/grievances/submit" } (optional)
 */
const EmptyState = ({ icon = '📭', title = 'Nothing here yet', desc = '', action }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center px-6">
    <span className="text-5xl mb-4 select-none">{icon}</span>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    {desc && <p className="text-sm text-gray-500 max-w-sm mb-6">{desc}</p>}
    {action && (
      <Link to={action.to} className="btn-primary">
        {action.label}
      </Link>
    )}
  </div>
);

export default EmptyState;
