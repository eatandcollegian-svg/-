import { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";

import BirthDateInput from "../components/BirthDateInput";
import PrimaryButton from "../components/PrimaryButton";
import { generateId } from "../lib/id";
import { getCats, getSnacks, saveCats, saveSnacks } from "../lib/storage";
import { COLORS, FONTS } from "../lib/theme";
import type { Cat, Snack } from "../lib/types";

export default function SettingsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [cats, setCats] = useState<Cat[]>([]);
  const [snacks, setSnacks] = useState<Snack[]>([]);
  const [savedMessage, setSavedMessage] = useState(false);

  useEffect(() => {
    (async () => {
      const [loadedCats, loadedSnacks] = await Promise.all([getCats(), getSnacks()]);
      setCats(loadedCats);
      setSnacks(loadedSnacks);
      setLoading(false);
    })();
  }, []);

  const canSave = cats.every((cat) => cat.name.trim().length > 0);

  const updateCatName = (id: string, name: string) => {
    setCats((prev) => prev.map((cat) => (cat.id === id ? { ...cat, name } : cat)));
  };

  const updateCatPhoto = (id: string, photoUri: string) => {
    setCats((prev) => prev.map((cat) => (cat.id === id ? { ...cat, photoUri } : cat)));
  };

  const updateCatBirthDate = (id: string, birthDate: string | undefined) => {
    setCats((prev) => prev.map((cat) => (cat.id === id ? { ...cat, birthDate } : cat)));
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
      updateCatPhoto(id, result.assets[0].uri);
    }
  };

  const updateSnackName = (id: string, name: string) => {
    setSnacks((prev) => prev.map((snack) => (snack.id === id ? { ...snack, name } : snack)));
  };

  const addSnack = () => {
    setSnacks((prev) => [...prev, { id: generateId(), name: "" }]);
  };

  const removeSnack = (id: string) => {
    setSnacks((prev) => prev.filter((snack) => snack.id !== id));
  };

  const handleSave = async () => {
    if (!canSave) return;
    const trimmedCats = cats.map((cat) => ({ ...cat, name: cat.name.trim() }));
    const trimmedSnacks = snacks
      .map((snack) => ({ ...snack, name: snack.name.trim() }))
      .filter((snack) => snack.name.length > 0);

    await saveCats(trimmedCats);
    await saveSnacks(trimmedSnacks);
    setCats(trimmedCats);
    setSnacks(trimmedSnacks);
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 1500);
  };

  if (loading) {
    return <SafeAreaView style={styles.container} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>‹ 달력</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>설정</Text>

        <Text style={styles.sectionLabel}>고양이 정보</Text>
        {cats.map((cat) => (
          <View key={cat.id} style={styles.catCard}>
            <Pressable style={styles.photoCircle} onPress={() => pickPhoto(cat.id)}>
              {cat.photoUri ? (
                <Image source={{ uri: cat.photoUri }} style={styles.photoImage} />
              ) : (
                <Text style={styles.photoPlaceholder}>🐾</Text>
              )}
            </Pressable>

            <TextInput
              style={styles.nameInput}
              placeholder="고양이 이름"
              placeholderTextColor={COLORS.textFaint}
              value={cat.name}
              onChangeText={(text) => updateCatName(cat.id, text)}
            />

            <Text style={styles.birthDateLabel}>생년월일 (선택)</Text>
            <BirthDateInput
              value={cat.birthDate}
              onChange={(birthDate) => updateCatBirthDate(cat.id, birthDate)}
            />
          </View>
        ))}

        <Text style={styles.sectionLabel}>간식 관리</Text>
        <View style={styles.snackList}>
          {snacks.map((snack) => (
            <View key={snack.id} style={styles.snackRow}>
              <TextInput
                style={styles.snackInput}
                placeholder="간식 이름"
                placeholderTextColor={COLORS.textFaint}
                value={snack.name}
                onChangeText={(text) => updateSnackName(snack.id, text)}
              />
              <Pressable style={styles.snackDeleteButton} onPress={() => removeSnack(snack.id)}>
                <Text style={styles.snackDeleteButtonText}>✕</Text>
              </Pressable>
            </View>
          ))}

          <Pressable style={styles.addSnackButton} onPress={addSnack}>
            <Text style={styles.addSnackButtonText}>+ 간식 추가</Text>
          </Pressable>
        </View>

        {savedMessage && <Text style={styles.savedMessage}>저장되었어요</Text>}
      </ScrollView>

      <PrimaryButton label="저장하기" onPress={handleSave} disabled={!canSave} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  backButton: {
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  backButtonText: {
    fontSize: 15,
    fontFamily: FONTS.semiBold,
    color: COLORS.accent,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 16,
  },
  title: {
    fontSize: 22,
    fontFamily: FONTS.bold,
    color: COLORS.textStrong,
    marginBottom: 4,
  },
  sectionLabel: {
    fontSize: 14,
    fontFamily: FONTS.semiBold,
    color: COLORS.textMuted,
    marginTop: 8,
  },
  catCard: {
    borderRadius: 24,
    borderWidth: 2,
    borderColor: COLORS.cardBorder,
    backgroundColor: COLORS.cardBackground,
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: "center",
    gap: 4,
  },
  photoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.accentTint,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    overflow: "hidden",
  },
  photoImage: {
    width: "100%",
    height: "100%",
  },
  photoPlaceholder: {
    fontSize: 28,
  },
  nameInput: {
    width: "100%",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingVertical: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.textStrong,
    textAlign: "center",
  },
  birthDateLabel: {
    marginTop: 12,
    marginBottom: 8,
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
  },
  snackList: {
    gap: 10,
  },
  snackRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  snackInput: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: COLORS.cardBorder,
    backgroundColor: COLORS.cardBackground,
    paddingVertical: 10,
    paddingHorizontal: 16,
    fontSize: 15,
    fontFamily: FONTS.regular,
    color: COLORS.textStrong,
  },
  snackDeleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
  },
  snackDeleteButtonText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  addSnackButton: {
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.cardBorder,
    borderStyle: "dashed",
    paddingVertical: 14,
    alignItems: "center",
  },
  addSnackButtonText: {
    fontSize: 14,
    fontFamily: FONTS.semiBold,
    color: COLORS.accent,
  },
  savedMessage: {
    textAlign: "center",
    fontSize: 14,
    fontFamily: FONTS.semiBold,
    color: COLORS.accent,
  },
});
