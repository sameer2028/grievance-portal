import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import { StatusBadge } from '@/components/ui/Badge';
import { truncate, timeAgo } from '@/utils/helpers';

// Priority → circle color
const PRIORITY_COLORS = {
  critical: '#dc2626',
  high:     '#f97316',
  medium:   '#f59e0b',
  low:      '#22c55e',
};

// Priority → circle radius
const PRIORITY_RADIUS = {
  critical: 12,
  high:     10,
  medium:   8,
  low:      6,
};

/**
 * Props:
 *   grievances - array of grievance objects with location.coordinates
 *   center     - [lat, lng], default center of Uttar Pradesh
 *   zoom       - default 7
 *   height     - CSS string, default "420px"
 *   linkBase   - "/grievances" | "/admin/grievances"
 */
const GrievanceMap = ({
  grievances = [],
  center = [26.8467, 80.9462],
  zoom = 7,
  height = '420px',
  linkBase = '/admin/grievances',
}) => {
  // Only render grievances that have actual coordinates
  const withCoords = grievances.filter((g) => {
    const coords = g.location?.coordinates?.coordinates;
    return coords && (coords[0] !== 0 || coords[1] !== 0);
  });

  return (
    <div style={{ height }} className="rounded-lg overflow-hidden border border-gray-200">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        {/* OpenStreetMap tiles — free, no API key needed */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {withCoords.map((g) => {
          // GeoJSON stores [longitude, latitude], Leaflet wants [lat, lng]
          const [lng, lat] = g.location.coordinates.coordinates;
          const color = PRIORITY_COLORS[g.priority] || '#94a3b8';
          const radius = PRIORITY_RADIUS[g.priority] || 7;

          return (
            <CircleMarker
              key={g._id}
              center={[lat, lng]}
              radius={radius}
              pathOptions={{
                color,
                fillColor: color,
                fillOpacity: 0.7,
                weight: 2,
              }}
            >
              <Popup maxWidth={240}>
                <div className="text-sm space-y-1.5">
                  <p className="font-semibold text-gray-900 text-sm leading-tight">
                    {truncate(g.title, 60)}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    <StatusBadge status={g.status} />
                  </div>
                  <p className="text-xs text-gray-500">{g.location.address || g.location.district}</p>
                  <p className="text-xs text-gray-400">{timeAgo(g.createdAt)}</p>
                  <Link
                    to={`${linkBase}/${g._id}`}
                    className="text-xs text-primary-600 font-medium hover:underline block"
                  >
                    View details →
                  </Link>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Legend */}
      <div className="bg-white border-t border-gray-200 px-4 py-2 flex flex-wrap items-center gap-x-4 gap-y-1">
        <span className="text-xs text-gray-500 font-medium mr-2">Priority:</span>
        {Object.entries(PRIORITY_COLORS).map(([priority, color]) => (
          <div key={priority} className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-full border-2 border-white"
              style={{ backgroundColor: color, boxShadow: `0 0 0 1px ${color}` }}
            />
            <span className="text-xs text-gray-500 capitalize">{priority}</span>
          </div>
        ))}
        <span className="ml-auto text-xs text-gray-400">
          {withCoords.length} of {grievances.length} mapped
        </span>
      </div>
    </div>
  );
};

export default GrievanceMap;
