import { View } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { COLORS, FONTS } from "../lib/theme";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    [FONTS.regular]: require("../assets/fonts/Pretendard-Regular.ttf"),
    [FONTS.medium]: require("../assets/fonts/Pretendard-Medium.ttf"),
    [FONTS.semiBold]: require("../assets/fonts/Pretendard-SemiBold.ttf"),
    [FONTS.bold]: require("../assets/fonts/Pretendard-Bold.ttf"),
  });

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: COLORS.background }} />;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}
