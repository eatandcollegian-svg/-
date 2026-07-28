import { Pressable, StyleSheet, Switch, Text, View } from "react-native";

import TimePickerField from "./TimePickerField";
import { COLORS, FONTS } from "../lib/theme";
import type { Reminder } from "../lib/types";

export default function ReminderRow({
  reminder,
  onToggle,
  onChangeTime,
  onRemove,
}: {
  reminder: Reminder;
  onToggle: (enabled: boolean) => void;
  onChangeTime: (hour: number, minute: number) => void;
  onRemove?: () => void;
}) {
  return (
    <View style={styles.row}>
      <Switch
        value={reminder.enabled}
        onValueChange={onToggle}
        trackColor={{ false: COLORS.cardBorder, true: COLORS.accent }}
      />
      <TimePickerField
        hour={reminder.hour}
        minute={reminder.minute}
        onChange={onChangeTime}
        disabled={!reminder.enabled}
      />
      <View style={{ flex: 1 }} />
      {onRemove && (
        <Pressable style={styles.deleteButton} onPress={onRemove}>
          <Text style={styles.deleteButtonText}>✕</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
  },
  deleteButtonText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
});
