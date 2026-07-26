import { StyleSheet, Text, View } from "react-native";

import { COLORS } from "../lib/theme";

export default function StepHeader({ step, title }: { step: string; title: string }) {
  return (
    <View>
      <Text style={styles.step}>{step}</Text>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  step: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textFaint,
  },
  title: {
    marginTop: 12,
    marginBottom: 32,
    fontSize: 26,
    fontWeight: "700",
    color: COLORS.textStrong,
  },
});
