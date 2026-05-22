import { useSelector, useDispatch } from 'react-redux';
import { selectToasts, removeToast } from '@/store/slices/uiSlice';
import { useEffect } from 'react';

const ICONS = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

const BG_CLASSES = {
  success: 'bg-green-600',
  error: 'bg-red-600',
  warning: 'bg-yellow-500',
  info: 'bg-blue-600',
};

const Toast = ({ id, type, message, duration }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const timer = setTimeout(() => dispatch(removeToast(id)), duration);
    return () => clearTimeout(timer);
  }, [id, duration, dispatch]);

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-lg shadow-lg text-white text-sm max-w-sm animate-slide-up ${BG_CLASSES[type]}`}
    >
      <span className="font-bold text-base leading-none mt-0.5">{ICONS[type]}</span>
      <p className="flex-1">{message}</p>
      <button
        onClick={() => dispatch(removeToast(id))}
        className="opacity-70 hover:opacity-100 ml-2 leading-none text-lg"
      >
        ×
      </button>
    </div>
  );
};

const ToastContainer = () => {
  const toasts = useSelector(selectToasts);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} />
      ))}
    </div>
  );
};

export default ToastContainer;
