import { StyleSheet, Text, View } from "react-native";

import { COLORS, FONTS } from "../lib/theme";

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
    fontFamily: FONTS.semiBold,
    color: COLORS.textFaint,
  },
  title: {
    marginTop: 12,
    marginBottom: 32,
    fontSize: 26,
    fontFamily: FONTS.bold,
    color: COLORS.textStrong,
  },
});
