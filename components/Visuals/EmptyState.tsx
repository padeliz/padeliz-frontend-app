import { View, Text, Image, StyleSheet, ImageSourcePropType } from 'react-native';
import Button from '@/components/Buttons/Button';
import * as Colors from '@/constants/Colors';
import * as Fonts from '@/constants/Fonts';

type Props = {
  illustration: ImageSourcePropType;
  title: string;
  description: string;
  ctaLabel: string;
  onCtaPress: () => void;
};

export default function EmptyState({ illustration, title, description, ctaLabel, onCtaPress }: Props) {
  return (
    <View style={styles.container}>
      <Image source={illustration} style={styles.illustration} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <View style={styles.ctaWrapper}>
        <Button label={ctaLabel} onPress={onCtaPress} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    width: '100%',
  },
  illustration: {
    width: 192,
    height: 192,
    resizeMode: 'contain',
    marginBottom: 24,
  },
  title: {
    fontFamily: Fonts.FONT_BOLD,
    fontSize: Fonts.HEADING_2,
    color: Colors.WHITE,
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY,
    color: Colors.INACTIVE,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  ctaWrapper: {
    width: '100%',
  },
});
