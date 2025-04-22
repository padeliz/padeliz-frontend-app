import { GoogleUser } from '@/services/auth/google';

export interface Profile {
  id: string;
  userId: string;
  googleAccounts: GoogleUser[];
  primaryEmail: string;
  personalInfo: {
    fullName: string;
    birthDate: string;
    phone?: string;
  };
  profilePhoto: {
    url: string;
    status: 'pending' | 'approved' | 'rejected';
    updatedAt: string;
  };
  eventHistory: {
    total: number;
    participated: number;
    upcoming: number;
  };
  referralCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileUpdateRequest {
  personalInfo?: {
    fullName?: string;
    phone?: string;
  };
}

export interface GoogleAccountLink {
  id: string;
  email: string;
  primary: boolean;
  linkedAt: string;
}
