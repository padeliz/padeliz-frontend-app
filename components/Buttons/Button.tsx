import { StyleSheet, View, Pressable, Text } from 'react-native';
import * as Colors from "@/constants/Colors";
import * as Fonts from "@/constants/Fonts";
import { FontStyle } from '@/types/types';

type Props = {
  label: string;
  color: string;
  width: number;
  height: number;
  labelStyle: FontStyle;
};

// TODO: implement color logic

export default function Button({ label, width, color, height }: Props) {
  return (
    <View style={[styles.buttonContainer, {width: width, height: height}]}>
      <Pressable style={[styles.button, {backgroundColor: color}]} onPress={() => alert('You pressed a button.')}>
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
