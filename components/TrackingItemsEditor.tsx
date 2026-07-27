import { Pressable, StyleSheet, Switch, Text, View } from "react-native";

import { COLORS, FONTS } from "../lib/theme";
import type { FeedUnit, TrackingItems } from "../lib/types";

const TRACKING_OPTIONS: { key: keyof TrackingItems; emoji: string; label: string }[] = [
  { key: "poop", emoji: "💩", label: "응가" },
  { key: "litterBox", emoji: "🪨", label: "감자" },
  { key: "feed", emoji: "🍚", label: "사료" },
  { key: "water", emoji: "💧", label: "음수량" },
  { key: "snack", emoji: "🍖", label: "간식" },
  { key: "vomit", emoji: "🤮", label: "구토" },
  { key: "medicine", emoji: "💊", label: "투약" },
  { key: "weight", emoji: "⚖️", label: "체중" },
  { key: "play", emoji: "🧶", label: "놀이" },
];

export default function TrackingItemsEditor({
  trackingItems,
  feedUnit,
  onToggleItem,
  onChangeFeedUnit,
}: {
  trackingItems: TrackingItems;
  feedUnit: FeedUnit;
  onToggleItem: (key: keyof TrackingItems) => void;
  onChangeFeedUnit: (unit: FeedUnit) => void;
}) {
  return (
    <View style={styles.list}>
      {TRACKING_OPTIONS.map((option) => (
        <Pressable key={option.key} style={styles.row} onPress={() => onToggleItem(option.key)}>
          <Text style={styles.rowEmoji}>{option.emoji}</Text>
          <Text style={styles.rowLabel}>{option.label}</Text>
          <Switch
            value={trackingItems[option.key]}
            onValueChange={() => onToggleItem(option.key)}
            trackColor={{ false: COLORS.cardBorder, true: COLORS.accent }}
            thumbColor="#FFFFFF"
          />
        </Pressable>
      ))}

      {trackingItems.feed && (
        <View style={styles.feedUnitSection}>
          <Text style={styles.feedUnitLabel}>사료 기록 단위</Text>
          <View style={styles.feedUnitOptions}>
            <FeedUnitChip
              label="그릇 단위"
              selected={feedUnit === "bowl"}
              onPress={() => onChangeFeedUnit("bowl")}
            />
            <FeedUnitChip
              label="그램 단위"
              selected={feedUnit === "gram"}
              onPress={() => onChangeFeedUnit("gram")}
            />
          </View>
        </View>
      )}
    </View>
  );
}

function FeedUnitChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={[styles.chip, selected && styles.chipSelected]} onPress={onPress}>
      <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.cardBorder,
    backgroundColor: COLORS.cardBackground,
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  rowEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  rowLabel: {
    flex: 1,
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: COLORS.textStrong,
  },
  feedUnitSection: {
    marginTop: 8,
    paddingHorizontal: 4,
  },
  feedUnitLabel: {
    fontSize: 14,
    fontFamily: FONTS.semiBold,
    color: COLORS.textMuted,
    marginBottom: 10,
  },
  feedUnitOptions: {
    flexDirection: "row",
    gap: 12,
  },
  chip: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.cardBorder,
    backgroundColor: COLORS.cardBackground,
    paddingVertical: 14,
    alignItems: "center",
  },
  chipSelected: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accentTint,
  },
  chipLabel: {
    fontSize: 15,
    fontFamily: FONTS.semiBold,
    color: COLORS.textStrong,
  },
  chipLabelSelected: {
    color: COLORS.accent,
  },
});
