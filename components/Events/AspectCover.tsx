/**
 * Primary cover image with optional temporary height from aspect_ratio.
 * No image → do not mount this component (caller omits the wrapper).
 * Missing aspect_ratio → no temporary height (image defines height after load).
 * With aspect_ratio → temp height = width / ratio until onLoad, then aspectRatio style.
 */
import { useState } from 'react';
import {
  Image,
  View,
  StyleSheet,
  type ImageSourcePropType,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

type Props = {
  source: ImageSourcePropType;
  aspectRatio?: number | null;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export default function AspectCover({
  source,
  aspectRatio = null,
  style,
  testID = 'aspect-cover',
}: Props) {
  const [width, setWidth] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const hasRatio =
    aspectRatio != null && Number.isFinite(aspectRatio) && aspectRatio > 0;
  const useTempHeight = !loaded && hasRatio && width > 0;

  const onLayout = (e: LayoutChangeEvent) => {
    setWidth(e.nativeEvent.layout.width);
  };

  return (
    <View
      style={[
        styles.wrap,
        useTempHeight ? { height: width / (aspectRatio as number) } : null,
        loaded && hasRatio ? { aspectRatio: aspectRatio as number } : null,
        style,
      ]}
      onLayout={onLayout}
      testID={testID}
    >
      <Image
        source={source}
        style={styles.image}
        resizeMode="cover"
        onLoad={() => setLoaded(true)}
        testID={`${testID}-image`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
