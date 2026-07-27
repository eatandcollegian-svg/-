import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import PrimaryButton from "../../components/PrimaryButton";
import StepHeader from "../../components/StepHeader";
import { getSettings, saveSettings } from "../../lib/storage";
import { COLORS, FONTS } from "../../lib/theme";
import type { FeedUnit, TrackingItems } from "../../lib/types";

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

export default function OnboardingTrackingItemsScreen() {
  const router = useRouter();
  const [trackingItems, setTrackingItems] = useState<TrackingItems | null>(null);
  const [feedUnit, setFeedUnit] = useState<FeedUnit>("bowl");

  useEffect(() => {
    getSettings().then((settings) => {
      setTrackingItems(settings.trackingItems);
      setFeedUnit(settings.feedUnit);
    });
  }, []);

  const toggleItem = (key: keyof TrackingItems) => {
    setTrackingItems((prev) => (prev ? { ...prev, [key]: !prev[key] } : prev));
  };

  const handleNext = async () => {
    if (!trackingItems) return;
    const settings = await getSettings();
    await saveSettings({ ...settings, trackingItems, feedUnit });
    router.push("/onboarding/complete");
  };

  if (!trackingItems) {
    return <SafeAreaView style={styles.container} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StepHeader step="3 / 4" title="무엇을 기록할까요?" onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {TRACKING_OPTIONS.map((option) => (
          <Pressable key={option.key} style={styles.row} onPress={() => toggleItem(option.key)}>
            <Text style={styles.rowEmoji}>{option.emoji}</Text>
            <Text style={styles.rowLabel}>{option.label}</Text>
            <Switch
              value={trackingItems[option.key]}
              onValueChange={() => toggleItem(option.key)}
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
                onPress={() => setFeedUnit("bowl")}
              />
              <FeedUnitChip
                label="그램 단위"
                selected={feedUnit === "gram"}
                onPress={() => setFeedUnit("gram")}
              />
            </View>
          </View>
        )}
      </ScrollView>

      <PrimaryButton label="다음" onPress={handleNext} />
    </SafeAreaView>
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
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 24,
  },
  list: {
    gap: 12,
    paddingBottom: 16,
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
