import { useNotification } from '@/hooks';

/**
 * Utility hook that provides common notification patterns
 */
export const useNotificationHelpers = () => {
  const { addNotification } = useNotification();

  const showSuccess = (title: string, message?: string) => {
    addNotification({
      type: 'success',
      title,
      message,
      duration: 4000,
    });
  };

  const showError = (title: string, message?: string) => {
    addNotification({
      type: 'error',
      title,
      message,
      duration: 6000,
    });
  };

  const showWarning = (title: string, message?: string) => {
    addNotification({
      type: 'warning',
      title,
      message,
      duration: 5000,
    });
  };

  const showInfo = (title: string, message?: string) => {
    addNotification({
      type: 'info',
      title,
      message,
      duration: 4000,
    });
  };

  const showPersistent = (
    type: 'success' | 'error' | 'warning' | 'info',
    title: string,
    message?: string,
    action?: { label: string; onClick: () => void }
  ) => {
    addNotification({
      type,
      title,
      message,
      duration: 0, // Persistent - won't auto-dismiss
      action,
    });
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showPersistent,
    addNotification, // Still expose the raw function for custom usage
  };
};
