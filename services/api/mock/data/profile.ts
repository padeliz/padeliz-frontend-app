export const mockProfile = {
  id: '1',
  userId: '1',
  primaryEmail: 'player@example.com',
  googleAccounts: [],
  personalInfo: {
    fullName: 'John Player',
    birthDate: '1990-01-01',
    phone: '+34600000000',
  },
  profilePhoto: {
    url: 'https://ui-avatars.com/api/?name=John+Player',
    status: 'approved',
    updatedAt: new Date().toISOString(),
  },
  eventHistory: {
    total: 12,
    participated: 10,
    upcoming: 2,
  },
  referralCount: 4,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
