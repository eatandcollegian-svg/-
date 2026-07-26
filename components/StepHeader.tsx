import { Pressable, StyleSheet, Text, View } from "react-native";

import { COLORS, FONTS } from "../lib/theme";

export default function StepHeader({
  step,
  title,
  onBack,
}: {
  step: string;
  title: string;
  onBack?: () => void;
}) {
  return (
    <View>
      <View style={styles.topRow}>
        {onBack && (
          <Pressable style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>‹ 이전</Text>
          </Pressable>
        )}
        <Text style={styles.step}>{step}</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 12,
  },
  backButton: {
    paddingVertical: 4,
    paddingHorizontal: 4,
    marginLeft: -4,
  },
  backButtonText: {
    fontSize: 14,
    fontFamily: FONTS.semiBold,
    color: COLORS.accent,
  },
  step: {
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
