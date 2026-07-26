import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import PrimaryButton from "../../components/PrimaryButton";
import StepHeader from "../../components/StepHeader";
import { getSettings, saveSettings } from "../../lib/storage";
import { COLORS } from "../../lib/theme";
import type { HouseholdType } from "../../lib/types";

export default function OnboardingHouseholdScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<HouseholdType | null>(null);

  const handleNext = async () => {
    if (!selected) return;
    const settings = await getSettings();
    await saveSettings({ ...settings, householdType: selected });
    router.push("/onboarding/cat-count");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StepHeader step="1 / 4" title="어떤 집사이신가요?" />

      <View style={styles.cardList}>
        <ChoiceCard
          emoji="🐱"
          label="외동묘"
          description="고양이를 한 마리 키우고 있어요"
          selected={selected === "single"}
          onPress={() => setSelected("single")}
        />
        <ChoiceCard
          emoji="🐈‍⬛"
          label="다묘"
          description="고양이를 여러 마리 키우고 있어요"
          selected={selected === "multi"}
          onPress={() => setSelected("multi")}
        />
      </View>

      <PrimaryButton label="다음" onPress={handleNext} disabled={!selected} />
    </SafeAreaView>
  );
}

function ChoiceCard({
  emoji,
  label,
  description,
  selected,
  onPress,
}: {
  emoji: string;
  label: string;
  description: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={[styles.card, selected && styles.cardSelected]} onPress={onPress}>
      <Text style={styles.cardEmoji}>{emoji}</Text>
      <Text style={[styles.cardLabel, selected && styles.cardLabelSelected]}>{label}</Text>
      <Text style={styles.cardDescription}>{description}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 24,
  },
  cardList: {
    gap: 16,
  },
  card: {
    borderRadius: 28,
    borderWidth: 2,
    borderColor: COLORS.cardBorder,
    backgroundColor: COLORS.cardBackground,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  cardSelected: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accentTint,
  },
  cardEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.textStrong,
    marginBottom: 6,
  },
  cardLabelSelected: {
    color: COLORS.accent,
  },
  cardDescription: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
});
