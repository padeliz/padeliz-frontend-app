import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Snackbar } from 'react-native-paper';
import { StyleSheet } from 'react-native';

type ToastType = 'success' | 'error' | 'info';

interface ToastState {
  visible: boolean;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState>({
    visible: false,
    message: '',
    type: 'info',
  });

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    setToast({ visible: true, message, type });
  }, []);

  const onDismiss = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };

  const getBackgroundColor = () => {
    switch (toast.type) {
      case 'success':
        return '#4CAF50';
      case 'error':
        return '#B00020';
      default:
        return '#323232';
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Snackbar
        visible={toast.visible}
        onDismiss={onDismiss}
        duration={3000}
        style={[styles.snackbar, { backgroundColor: getBackgroundColor() }]}
        action={{
          label: 'Dismiss',
          onPress: onDismiss,
        }}
      >
        {toast.message}
      </Snackbar>
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  snackbar: {
    marginBottom: 20,
  },
});

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
