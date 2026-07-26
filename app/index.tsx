import { useEffect, useState } from "react";
import { View } from "react-native";
import { Redirect } from "expo-router";

import { getSettings } from "../lib/storage";
import { COLORS } from "../lib/theme";

export default function Index() {
  const [destination, setDestination] = useState<"/onboarding" | "/home" | null>(null);

  useEffect(() => {
    getSettings().then((settings) => {
      setDestination(settings.onboardingCompleted ? "/home" : "/onboarding");
    });
  }, []);

  if (!destination) {
    return <View style={{ flex: 1, backgroundColor: COLORS.background }} />;
  }

  return <Redirect href={destination} />;
}
