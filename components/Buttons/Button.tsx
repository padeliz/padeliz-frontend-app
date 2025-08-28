import { StyleSheet, View, Pressable, Text } from 'react-native';
import * as Colors from "@/constants/Colors";
import * as Fonts from "@/constants/Fonts";
import { FontStyle } from '@/types/types';
import Icon from "@expo/vector-icons/FontAwesome";
import { FontAwesome } from "@expo/vector-icons";

type Props = {
  label: string;
  color: string;
  width: number;
  height: number;
  labelStyle?: FontStyle;
  onPress: () => void;
  icon?: React.ComponentProps<typeof FontAwesome>["name"];
};

export default function Button({ label, width, color, height, onPress }: Props) {
  return (
    <View style={[styles.buttonContainer, {width: width, height: height}]}>
      <Pressable style={[styles.button, {backgroundColor: color}]} onPress={onPress}>
        <Text style={styles.buttonLabel}>{label}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  button: {
    borderRadius: 8,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonLabel: {
    color: Colors.WHITE,
    fontFamily: Fonts.NAME,
    fontSize: Fonts.BODY,
    fontWeight: Fonts.MEDIUM,
  },
});
