import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

// Make sure to dismiss the web browser when auth is complete
WebBrowser.maybeCompleteAuthSession();

export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  photoUrl?: string;
}

export const googleAuth = {
  useGoogleAuth() {
    return Google.useAuthRequest({
      clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      redirectUri: 'https://auth.expo.io/@arsh.padel.minitour/padel-events-app',
      scopes: ['profile', 'email'],
      extraParams: {
        prompt: 'consent',
      },
    });
  },

  async getUserInfo(token: string): Promise<GoogleUser> {
    console.log('Fetching user info with token');
    const response = await fetch('https://www.googleapis.com/userinfo/v2/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('User info response:', response.status);
    const userInfo = await response.json();
    return {
      id: userInfo.id,
      email: userInfo.email,
      name: userInfo.name,
      photoUrl: userInfo.picture,
    };
  },
};
