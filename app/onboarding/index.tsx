import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

const BACKGROUND_COLOR = "#FFF8ED";
const ACCENT_COLOR = "#2CB9AC";
const ACCENT_TINT = "rgba(44, 185, 172, 0.12)";

type HouseholdChoice = "single" | "multi";

export default function OnboardingHouseholdScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<HouseholdChoice | null>(null);

  const handleNext = () => {
    if (!selected) return;
    router.push("/onboarding/cat-count");
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.step}>1 / 4</Text>
      <Text style={styles.title}>어떤 집사이신가요?</Text>

      <View style={styles.cardList}>
        <ChoiceCard
          emoji="🐱"
          label="혼묘"
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

      <Pressable
        style={[styles.nextButton, !selected && styles.nextButtonDisabled]}
        onPress={handleNext}
        disabled={!selected}
      >
        <Text style={[styles.nextButtonText, !selected && styles.nextButtonTextDisabled]}>
          다음
        </Text>
      </Pressable>
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
    backgroundColor: BACKGROUND_COLOR,
    paddingHorizontal: 24,
  },
  step: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "600",
    color: "#B5AA96",
  },
  title: {
    marginTop: 12,
    marginBottom: 32,
    fontSize: 26,
    fontWeight: "700",
    color: "#3A3229",
  },
  cardList: {
    gap: 16,
  },
  card: {
    borderRadius: 28,
    borderWidth: 2,
    borderColor: "#EFE6D8",
    backgroundColor: "#FFFFFF",
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  cardSelected: {
    borderColor: ACCENT_COLOR,
    backgroundColor: ACCENT_TINT,
  },
  cardEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 20,
    fontWeight: "700",
    color: "#3A3229",
    marginBottom: 6,
  },
  cardLabelSelected: {
    color: ACCENT_COLOR,
  },
  cardDescription: {
    fontSize: 14,
    color: "#8C8272",
  },
  nextButton: {
    marginTop: "auto",
    marginBottom: 24,
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: "center",
    backgroundColor: ACCENT_COLOR,
  },
  nextButtonDisabled: {
    backgroundColor: "#E7E0D3",
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  nextButtonTextDisabled: {
    color: "#B5AA96",
  },
});
