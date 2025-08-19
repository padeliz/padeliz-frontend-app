import { StyleSheet, View, Pressable, Text } from 'react-native';
import * as Colors from "@/constants/Colors";
import * as Fonts from "@/constants/Fonts";

type Props = {
  label: string;
};

// TODO: implement color logic

export default function Button({ label }: Props) {
  return (
    <View style={styles.buttonContainer}>
      <Pressable style={styles.button} onPress={() => alert('You pressed a button.')}>
        <Text style={styles.buttonLabel}>{label}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    width: 326,
    height: 48,
    marginHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: Colors.BLUE,
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
