import { useDispatch } from 'react-redux';
import { addToast } from '@/store/slices/uiSlice';

/**
 * Usage:
 *   const toast = useToast();
 *   toast.success('Grievance submitted!');
 *   toast.error('Something went wrong');
 */
export const useToast = () => {
  const dispatch = useDispatch();

  return {
    success: (message, duration) =>
      dispatch(addToast({ type: 'success', message, duration })),
    error: (message, duration) =>
      dispatch(addToast({ type: 'error', message, duration })),
    warning: (message, duration) =>
      dispatch(addToast({ type: 'warning', message, duration })),
    info: (message, duration) =>
      dispatch(addToast({ type: 'info', message, duration })),
  };
};
