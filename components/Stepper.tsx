import { Pressable, StyleSheet, Text, View } from "react-native";

import { COLORS, FONTS } from "../lib/theme";

export default function Stepper({
  value,
  onChange,
  min = 0,
  max = 20,
  step = 1,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <View style={styles.container}>
      <Pressable
        style={styles.button}
        disabled={value <= min}
        onPress={() => onChange(Math.max(min, value - step))}
      >
        <Text style={styles.buttonText}>–</Text>
      </Pressable>
      <Text style={styles.value}>{value}</Text>
      <Pressable
        style={styles.button}
        disabled={value >= max}
        onPress={() => onChange(Math.min(max, value + step))}
      >
        <Text style={styles.buttonText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  button: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.accentTint,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.accent,
  },
  value: {
    minWidth: 24,
    textAlign: "center",
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.textStrong,
  },
});
