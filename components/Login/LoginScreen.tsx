import { View, Text, Image, StyleSheet, SafeAreaView } from 'react-native';
import { useAuth } from '@/context/auth';
import Button from '@/components/Buttons/Button';
import * as Colors from '@/constants/Colors';
import * as Fonts from '@/constants/Fonts';

export default function LoginScreen() {
  const { signIn, isLoading } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Image
          source={require('@/assets/images/logos/logo.png')}
          style={styles.logo}
        />

        <Text style={styles.heading}>Welcome to Padeliz</Text>

        <Text style={styles.subtitle}>
          Join padel events, track{'\n'}tournaments, and connect with{'\n'}players
        </Text>


        <View style={styles.buttonContainer}>
          <Button
            label="Sign in with Google"
            onPress={signIn}
            icon={
              <Image
                source={require('@/assets/images/google-icon.png')}
                style={styles.googleIcon}
              />
            }
            style={styles.googleButton}
            labelStyle={styles.googleLabel}
          />
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          By continuing, you agree to our Terms of Service
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.DARK_GRAY,
    alignItems: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 55,
  },
  logo: {
    width: 128,
    height: 128,
    resizeMode: 'contain',
  },
  heading: {
    fontFamily: Fonts.FONT_BOLD,
    fontSize: 28,
    color: Colors.WHITE,
    textAlign: 'center',
    marginTop: 24,
  },
  subtitle: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY,
    color: Colors.WHITE,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 24,
  },
  buttonContainer: {
    width: 320,
    marginTop: 48,
  },
  googleButton: {
    backgroundColor: Colors.WHITE,
    width: 320,
    height: 56,
  },
  googleLabel: {
    color: Colors.DARK_GRAY,
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.BODY,
  },
  googleIcon: {
    width: 19,
    height: 20,
    tintColor: Colors.DARK_GRAY,
  },
  footer: {
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  footerText: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_S,
    color: Colors.CREAM_T,
    textAlign: 'center',
  },
});
