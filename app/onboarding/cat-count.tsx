import { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";

import PrimaryButton from "../../components/PrimaryButton";
import StepHeader from "../../components/StepHeader";
import { generateId } from "../../lib/id";
import { getSettings, saveCats } from "../../lib/storage";
import { COLORS } from "../../lib/theme";
import type { HouseholdType } from "../../lib/types";

interface CatDraft {
  id: string;
  name: string;
  photoUri?: string;
}

export default function OnboardingCatRegisterScreen() {
  const router = useRouter();
  const [householdType, setHouseholdType] = useState<HouseholdType>("single");
  const [cats, setCats] = useState<CatDraft[]>([{ id: generateId(), name: "" }]);

  useEffect(() => {
    getSettings().then((settings) => setHouseholdType(settings.householdType));
  }, []);

  const canAddMore = householdType === "multi";
  const canProceed = cats.every((cat) => cat.name.trim().length > 0);

  const updateName = (id: string, name: string) => {
    setCats((prev) => prev.map((cat) => (cat.id === id ? { ...cat, name } : cat)));
  };

  const updatePhoto = (id: string, photoUri: string) => {
    setCats((prev) => prev.map((cat) => (cat.id === id ? { ...cat, photoUri } : cat)));
  };

  const addCat = () => {
    setCats((prev) => [...prev, { id: generateId(), name: "" }]);
  };

  const removeCat = (id: string) => {
    setCats((prev) => (prev.length > 1 ? prev.filter((cat) => cat.id !== id) : prev));
  };

  const pickPhoto = async (id: string) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      updatePhoto(id, result.assets[0].uri);
    }
  };

  const handleNext = async () => {
    if (!canProceed) return;
    const now = new Date().toISOString();
    await saveCats(
      cats.map((cat) => ({
        id: cat.id,
        name: cat.name.trim(),
        photoUri: cat.photoUri,
        createdAt: now,
      }))
    );
    router.push("/onboarding/tracking-items");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StepHeader step="2 / 4" title="고양이를 소개해주세요" />

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {cats.map((cat, index) => (
          <View key={cat.id} style={styles.card}>
            {cats.length > 1 && (
              <Pressable style={styles.removeButton} onPress={() => removeCat(cat.id)}>
                <Text style={styles.removeButtonText}>✕</Text>
              </Pressable>
            )}

            <Pressable style={styles.photoCircle} onPress={() => pickPhoto(cat.id)}>
              {cat.photoUri ? (
                <Image source={{ uri: cat.photoUri }} style={styles.photoImage} />
              ) : (
                <Text style={styles.photoPlaceholder}>🐾</Text>
              )}
            </Pressable>

            <TextInput
              style={styles.nameInput}
              placeholder={`고양이 이름 ${index + 1}`}
              placeholderTextColor={COLORS.textFaint}
              value={cat.name}
              onChangeText={(text) => updateName(cat.id, text)}
            />
          </View>
        ))}

        {canAddMore && (
          <Pressable style={styles.addButton} onPress={addCat}>
            <Text style={styles.addButtonText}>+ 고양이 추가</Text>
          </Pressable>
        )}
      </ScrollView>

      <PrimaryButton label="다음" onPress={handleNext} disabled={!canProceed} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 24,
  },
  list: {
    gap: 16,
    paddingBottom: 16,
  },
  card: {
    borderRadius: 28,
    borderWidth: 2,
    borderColor: COLORS.cardBorder,
    backgroundColor: COLORS.cardBackground,
    paddingVertical: 24,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  removeButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
  },
  removeButtonText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  photoCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: COLORS.accentTint,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    overflow: "hidden",
  },
  photoImage: {
    width: "100%",
    height: "100%",
  },
  photoPlaceholder: {
    fontSize: 32,
  },
  nameInput: {
    width: "100%",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: COLORS.textStrong,
    textAlign: "center",
  },
  addButton: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.cardBorder,
    borderStyle: "dashed",
    paddingVertical: 18,
    alignItems: "center",
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.accent,
  },
});
