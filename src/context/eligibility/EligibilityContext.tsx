import { createContext, useContext, useState, ReactNode } from 'react';
import { EligibilityRequest } from '@/types/api/eligibility';

interface EligibilityContextType {
  formData: Partial<EligibilityRequest>;
  updateFormData: (data: Partial<EligibilityRequest>) => void;
  resetFormData: () => void;
}

const EligibilityContext = createContext<EligibilityContextType | undefined>(undefined);

export function EligibilityProvider({ children }: { children: ReactNode }) {
  const [formData, setFormData] = useState<Partial<EligibilityRequest>>({});

  const updateFormData = (data: Partial<EligibilityRequest>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const resetFormData = () => {
    setFormData({});
  };

  return (
    <EligibilityContext.Provider value={{ formData, updateFormData, resetFormData }}>
      {children}
    </EligibilityContext.Provider>
  );
}

export function useEligibility() {
  const context = useContext(EligibilityContext);
  if (context === undefined) {
    throw new Error('useEligibility must be used within an EligibilityProvider');
  }
  return context;
}
