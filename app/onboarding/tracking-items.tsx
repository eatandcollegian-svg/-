import { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import PrimaryButton from "../../components/PrimaryButton";
import StepHeader from "../../components/StepHeader";
import TrackingItemsEditor from "../../components/TrackingItemsEditor";
import { DEFAULT_FEED_UNIT, DEFAULT_TRACKING_ITEMS, getCats, saveCats } from "../../lib/storage";
import { COLORS } from "../../lib/theme";
import type { FeedUnit, TrackingItems } from "../../lib/types";

export default function OnboardingTrackingItemsScreen() {
  const router = useRouter();
  const [trackingItems, setTrackingItems] = useState<TrackingItems>(DEFAULT_TRACKING_ITEMS);
  const [feedUnit, setFeedUnit] = useState<FeedUnit>(DEFAULT_FEED_UNIT);

  const toggleItem = (key: keyof TrackingItems) => {
    setTrackingItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleNext = async () => {
    const cats = await getCats();
    await saveCats(cats.map((cat) => ({ ...cat, trackingItems, feedUnit })));
    router.push("/onboarding/complete");
  };

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
