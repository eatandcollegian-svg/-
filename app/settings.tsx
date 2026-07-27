import { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";

import BirthDateInput from "../components/BirthDateInput";
import NamedListEditor from "../components/NamedListEditor";
import PrimaryButton from "../components/PrimaryButton";
import TrackingItemsEditor from "../components/TrackingItemsEditor";
import { generateId } from "../lib/id";
import {
  getCats,
  getMedicines,
  getSettings,
  getSnacks,
  saveCats,
  saveMedicines,
  saveSettings,
  saveSnacks,
} from "../lib/storage";
import { COLORS, FONTS } from "../lib/theme";
import type { AppSettings, Cat, FeedUnit, Medicine, Snack, TrackingItems } from "../lib/types";

export default function SettingsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [cats, setCats] = useState<Cat[]>([]);
  const [snacks, setSnacks] = useState<Snack[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [savedMessage, setSavedMessage] = useState(false);

  useEffect(() => {
    (async () => {
      const [loadedCats, loadedSnacks, loadedMedicines, loadedSettings] = await Promise.all([
        getCats(),
        getSnacks(),
        getMedicines(),
        getSettings(),
      ]);
      setCats(loadedCats);
      setSnacks(loadedSnacks);
      setMedicines(loadedMedicines);
      setSettings(loadedSettings);
      setLoading(false);
    })();
  }, []);

  const toggleTrackingItem = (key: keyof TrackingItems) => {
    setSettings((prev) =>
      prev ? { ...prev, trackingItems: { ...prev.trackingItems, [key]: !prev.trackingItems[key] } } : prev
    );
  };

  const changeFeedUnit = (feedUnit: FeedUnit) => {
    setSettings((prev) => (prev ? { ...prev, feedUnit } : prev));
  };

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

  const updateMedicineName = (id: string, name: string) => {
    setMedicines((prev) => prev.map((medicine) => (medicine.id === id ? { ...medicine, name } : medicine)));
  };

  const addMedicine = () => {
    setMedicines((prev) => [...prev, { id: generateId(), name: "" }]);
  };

  const removeMedicine = (id: string) => {
    setMedicines((prev) => prev.filter((medicine) => medicine.id !== id));
  };

  const handleSave = async () => {
    if (!canSave || !settings) return;
    const trimmedCats = cats.map((cat) => ({ ...cat, name: cat.name.trim() }));
    const trimmedSnacks = snacks
      .map((snack) => ({ ...snack, name: snack.name.trim() }))
      .filter((snack) => snack.name.length > 0);
    const trimmedMedicines = medicines
      .map((medicine) => ({ ...medicine, name: medicine.name.trim() }))
      .filter((medicine) => medicine.name.length > 0);

    await saveCats(trimmedCats);
    await saveSnacks(trimmedSnacks);
    await saveMedicines(trimmedMedicines);
    await saveSettings(settings);
    setCats(trimmedCats);
    setSnacks(trimmedSnacks);
    setMedicines(trimmedMedicines);
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 1500);
  };

  if (loading || !settings) {
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
            <Pressable style={styles.photoWrapper} onPress={() => pickPhoto(cat.id)}>
              <View style={styles.photoCircle}>
                {cat.photoUri ? (
                  <Image source={{ uri: cat.photoUri }} style={styles.photoImage} />
                ) : (
                  <Text style={styles.photoPlaceholder}>🐾</Text>
                )}
              </View>
              <View style={styles.photoBadge}>
                <Text style={styles.photoBadgeText}>📷</Text>
              </View>
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

        <Text style={styles.sectionLabel}>기록 항목</Text>
        <TrackingItemsEditor
          trackingItems={settings.trackingItems}
          feedUnit={settings.feedUnit}
          onToggleItem={toggleTrackingItem}
          onChangeFeedUnit={changeFeedUnit}
        />

        <Text style={styles.sectionLabel}>간식 관리</Text>
        <NamedListEditor
          items={snacks}
          onUpdateName={updateSnackName}
          onAdd={addSnack}
          onRemove={removeSnack}
          addLabel="+ 간식 추가"
          itemPlaceholder="간식 이름"
        />

        <Text style={styles.sectionLabel}>투약 관리</Text>
        <NamedListEditor
          items={medicines}
          onUpdateName={updateMedicineName}
          onAdd={addMedicine}
          onRemove={removeMedicine}
          addLabel="+ 약 추가"
          itemPlaceholder="약 이름"
        />

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
  photoWrapper: {
    width: 72,
    height: 72,
    marginBottom: 12,
  },
  photoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.accentTint,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  photoImage: {
    width: "100%",
    height: "100%",
  },
  photoPlaceholder: {
    fontSize: 28,
  },
  photoBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.accent,
    borderWidth: 2,
    borderColor: COLORS.cardBackground,
    alignItems: "center",
    justifyContent: "center",
  },
  photoBadgeText: {
    fontSize: 11,
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
  savedMessage: {
    textAlign: "center",
    fontSize: 14,
    fontFamily: FONTS.semiBold,
    color: COLORS.accent,
  },
});
