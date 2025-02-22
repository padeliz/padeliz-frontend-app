import { View, Image, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { Link } from 'expo-router';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

export default function Welcome() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require('@assets/images/logos/padel-mascot.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text variant="headlineLarge" style={styles.title}>
          Welcome to Padel Events
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Join exciting padel tournaments and events
        </Text>
      </View>

      <View style={styles.footer}>
        <Link href="/login" asChild>
          <Button mode="contained" style={styles.button}>
            Sign in with Google
          </Button>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'space-between',
    backgroundColor: '#fff',
  },
  header: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: spacing.xl,
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.sm,
    fontSize: typography.fontSizes.xxlarge,
    fontWeight: typography.fontWeights.bold,
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
  },
  footer: {
    paddingBottom: spacing.xl,
  },
  button: {
    padding: spacing.sm,
  },
});
