import { Pressable, StyleSheet, Text } from "react-native";

import { COLORS, FONTS } from "../lib/theme";

export default function PrimaryButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      style={[styles.button, disabled && styles.buttonDisabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.label, disabled && styles.labelDisabled]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: "auto",
    marginBottom: 24,
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: "center",
    backgroundColor: COLORS.accent,
  },
  buttonDisabled: {
    backgroundColor: COLORS.disabled,
  },
  label: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: "#FFFFFF",
  },
  labelDisabled: {
    color: COLORS.textFaint,
  },
});
