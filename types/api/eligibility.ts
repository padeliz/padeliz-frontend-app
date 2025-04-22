export interface EligibilityRequest {
  discoverySource: {
    type: 'online' | 'friends';
    platform?: string;
    referrals?: string[];
  };
  sportsBackground: {
    sports: {
      name: 'padel' | 'tennis' | 'ping-pong' | 'squash';
      experienceYears: number;
      frequency: 'daily' | 'weekly' | 'monthly' | 'rarely';
      lastPlayed: string;
    }[];
  };
  personalDetails: {
    fullName: string;
    middleName?: string;
    birthDate: string;
    isStudent: boolean;
    studentId?: string;
  };
}

export interface EligibilityStatus {
  status: 'pending' | 'approved' | 'rejected';
  message?: string;
  updatedAt: string;
}

export interface PhotoSubmission {
  id: string;
  url: string;
  status: 'pending' | 'approved' | 'rejected';
  feedback?: string;
  createdAt: string;
}
