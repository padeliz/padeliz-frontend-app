import { StyleSheet, View, Pressable, Text } from 'react-native';
import * as Colors from "@/constants/Colors";
import * as Fonts from "@/constants/Fonts";

type Props = {
  label: string;
  width?: number;
  height: number;
};

export default function InactiveButton({ label, width, height }: Props) {
  return (
    <View style={[styles.buttonContainer, {width: width, height: height}]}>
        <Text style={styles.buttonLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8, 
    backgroundColor: Colors.CREAM + "20",
    padding: 10,
  },
  button: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonLabel: {
    color: Colors.CREAM_T,
    fontFamily: Fonts.NAME,
    fontSize: Fonts.BODY_S,
    fontWeight: Fonts.REGULAR,
  },
});
