const SIZE_CLASSES = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-2',
  lg: 'w-12 h-12 border-4',
};

const Spinner = ({ size = 'md', className = '' }) => (
  <div
    className={`
      ${SIZE_CLASSES[size]}
      rounded-full
      border-gray-200
      border-t-primary-600
      animate-spin
      ${className}
    `}
    role="status"
    aria-label="Loading"
  />
);

export default Spinner;
