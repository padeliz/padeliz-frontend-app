import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Portal, ActivityIndicator } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';

interface LoadingContextType {
  showLoading: () => void;
  hideLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);

  const showLoading = useCallback(() => {
    setVisible(true);
  }, []);

  const hideLoading = useCallback(() => {
    setVisible(false);
  }, []);

  return (
    <LoadingContext.Provider value={{ showLoading, hideLoading }}>
      {children}
      {visible && (
        <Portal>
          <View style={styles.container}>
            <View style={styles.loader}>
              <ActivityIndicator size="large" />
            </View>
          </View>
        </Portal>
      )}
    </LoadingContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loader: {
    padding: 20,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
});

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}
