import { View, Text, Pressable, StyleSheet, Linking } from 'react-native';
import * as Colors from '@/constants/Colors';
import * as Fonts from '@/constants/Fonts';
import { LEGAL_LINK_ITEMS, legalUrl } from '@/constants/legalUrls';

type Props = {
  style?: object;
};

export default function LegalLinksRow({ style }: Props) {
  return (
    <View style={[styles.row, style]} testID="legal-links-row">
      {LEGAL_LINK_ITEMS.map((item, index) => (
        <View key={item.key} style={styles.item}>
          {index > 0 ? <Text style={styles.sep}>·</Text> : null}
          <Pressable
            testID={`legal-link-${item.key}`}
            onPress={() => void Linking.openURL(legalUrl(item.key))}
            accessibilityRole="link"
          >
            <Text style={styles.link}>{item.label}</Text>
          </Pressable>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    paddingBottom: 24,
    paddingHorizontal: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sep: {
    color: Colors.CREAM_60,
    fontSize: Fonts.BODY_XS,
    marginRight: 4,
  },
  link: {
    color: Colors.BLUE,
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_XS,
  },
});
