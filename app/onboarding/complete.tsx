import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import PrimaryButton from "../../components/PrimaryButton";
import StepHeader from "../../components/StepHeader";
import { getSettings, saveSettings } from "../../lib/storage";
import { COLORS, FONTS } from "../../lib/theme";

export default function OnboardingCompleteScreen() {
  const router = useRouter();

  const handleStart = async () => {
    const settings = await getSettings();
    await saveSettings({ ...settings, onboardingCompleted: true });
    router.replace("/");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StepHeader step="4 / 4" title="모든 준비가 끝났어요!" onBack={() => router.back()} />

      <View style={styles.body}>
        <Text style={styles.emoji}>🐾</Text>
        <Text style={styles.message}>
          이제부터 냥로그와 함께{"\n"}우리 고양이의 건강을 기록해보세요
        </Text>
      </View>

      <PrimaryButton label="시작하기" onPress={handleStart} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 24,
  },
  body: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emoji: {
    fontSize: 64,
    marginBottom: 24,
  },
  message: {
    fontSize: 17,
    fontFamily: FONTS.semiBold,
    color: COLORS.textStrong,
    textAlign: "center",
    lineHeight: 26,
  },
});
