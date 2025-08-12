import { StyleSheet, View, Pressable, Text } from 'react-native';
import * as Colors from "@/constants/Colors";
import * as Fonts from "@/constants/Fonts";
import { blue } from 'react-native-reanimated/lib/typescript/Colors';

type Props = {
  label: string;
};

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
    top: 120,
    bottom: 16,
    marginHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    color: Colors.BLUE,
    borderRadius: 8,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonLabel: {
    color: Colors.WHITE,
    fontSize: 16,
  },
});
