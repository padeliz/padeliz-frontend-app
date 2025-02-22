import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { usePathname } from 'expo-router';

export function Logo() {
  const pathname = usePathname();
  const title = getTitle(pathname);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require('@assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
      </View>
    </View>
  );
}

function getTitle(pathname: string) {
  switch (pathname) {
    case '/my-events':
      return 'My Events';
    case '/upcoming-events':
      return 'All Events';
    case '/profile':
      return 'Profile';
    default:
      return '';
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginLeft: -16,
  },
  logoContainer: {
    alignItems: 'flex-start',
  },
  logo: {
    width: 120,
    height: 60,
  },
  titleContainer: {
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
});
