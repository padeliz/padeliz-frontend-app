import { Platform, type ViewStyle } from 'react-native';

/**
 * Cross-platform surface elevation without legacy web `shadow*` props.
 * Android uses elevation; web/iOS use CSS-like boxShadow.
 */
export function surfaceShadow(
  elevation: number,
  boxShadow: string,
): ViewStyle {
  if (Platform.OS === 'android') {
    return { elevation };
  }
  return { boxShadow };
}
