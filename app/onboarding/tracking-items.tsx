import { useEffect, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import PrimaryButton from "../../components/PrimaryButton";
import StepHeader from "../../components/StepHeader";
import TrackingItemsEditor from "../../components/TrackingItemsEditor";
import { getSettings, saveSettings } from "../../lib/storage";
import { COLORS } from "../../lib/theme";
import type { FeedUnit, TrackingItems } from "../../lib/types";

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

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <TrackingItemsEditor
          trackingItems={trackingItems}
          feedUnit={feedUnit}
          onToggleItem={toggleItem}
          onChangeFeedUnit={setFeedUnit}
        />
      </ScrollView>

      <PrimaryButton label="다음" onPress={handleNext} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 24,
  },
  scrollContent: {
    paddingBottom: 16,
  },
});
