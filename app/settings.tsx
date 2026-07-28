import { useEffect, useState } from "react";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";

import BirthDateInput from "../components/BirthDateInput";
import NamedListEditor from "../components/NamedListEditor";
import PrimaryButton from "../components/PrimaryButton";
import ReminderRow from "../components/ReminderRow";
import TrackingItemsEditor from "../components/TrackingItemsEditor";
import { generateId } from "../lib/id";
import { requestNotificationPermission, syncAllReminderSchedules } from "../lib/notifications";
import {
  getCats,
  getMedicines,
  getReminders,
  getSettings,
  getSnacks,
  saveCats,
  saveMedicines,
  saveReminders,
  saveSettings,
  saveSnacks,
} from "../lib/storage";
import { COLORS, FONTS } from "../lib/theme";
import type { AppSettings, Cat, FeedUnit, Medicine, Reminder, Snack, TrackingItems } from "../lib/types";

const MAX_MEDICINE_REMINDERS = 5;

export default function SettingsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [cats, setCats] = useState<Cat[]>([]);
  const [snacks, setSnacks] = useState<Snack[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [savedMessage, setSavedMessage] = useState(false);

  useEffect(() => {
    (async () => {
      const [loadedCats, loadedSnacks, loadedMedicines, loadedReminders, loadedSettings] = await Promise.all([
        getCats(),
        getSnacks(),
        getMedicines(),
        getReminders(),
        getSettings(),
      ]);
      setCats(loadedCats);
      setSnacks(loadedSnacks);
      setMedicines(loadedMedicines);
      setReminders(loadedReminders);
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

  const medicineReminders = reminders.filter((reminder) => reminder.category === "medicine");
  const generalReminder = reminders.find((reminder) => reminder.category === "general");

  const toggleReminder = async (id: string, enabled: boolean) => {
    if (enabled) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        Alert.alert("알림 권한이 필요해요", "기기 설정에서 냥로그의 알림 권한을 허용해주세요.");
        return;
      }
    }
    setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, enabled } : r)));
  };

  const changeReminderTime = (id: string, hour: number, minute: number) => {
    setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, hour, minute } : r)));
  };

  const addMedicineReminder = () => {
    if (medicineReminders.length >= MAX_MEDICINE_REMINDERS) return;
    setReminders((prev) => [
      ...prev,
      { id: generateId(), category: "medicine", enabled: false, hour: 9, minute: 0 },
    ]);
  };

  const removeMedicineReminder = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
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
    await saveReminders(reminders);
    await saveSettings(settings);
    await syncAllReminderSchedules(reminders, trimmedCats);
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

        <Text style={styles.sectionLabel}>알림</Text>
        <View style={styles.reminderCard}>
          <Text style={styles.reminderCardTitle}>🔔 통합 알림</Text>
          {generalReminder && (
            <ReminderRow
              reminder={generalReminder}
              onToggle={(enabled) => toggleReminder(generalReminder.id, enabled)}
              onChangeTime={(hour, minute) => changeReminderTime(generalReminder.id, hour, minute)}
            />
          )}
        </View>

        <View style={styles.reminderCard}>
          <Text style={styles.reminderCardTitle}>💊 투약 알림</Text>
          {medicineReminders.map((reminder) => (
            <ReminderRow
              key={reminder.id}
              reminder={reminder}
              onToggle={(enabled) => toggleReminder(reminder.id, enabled)}
              onChangeTime={(hour, minute) => changeReminderTime(reminder.id, hour, minute)}
              onRemove={
                medicineReminders.length > 1 ? () => removeMedicineReminder(reminder.id) : undefined
              }
            />
          ))}
          {medicineReminders.length < MAX_MEDICINE_REMINDERS && (
            <Pressable style={styles.addReminderButton} onPress={addMedicineReminder}>
              <Text style={styles.addReminderButtonText}>+ 알림 추가</Text>
            </Pressable>
          )}
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
  reminderCard: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.cardBorder,
    backgroundColor: COLORS.cardBackground,
    padding: 18,
    gap: 14,
  },
  reminderCardTitle: {
    fontSize: 15,
    fontFamily: FONTS.semiBold,
    color: COLORS.textStrong,
  },
  addReminderButton: {
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.cardBorder,
    borderStyle: "dashed",
    paddingVertical: 12,
    alignItems: "center",
  },
  addReminderButtonText: {
    fontSize: 14,
    fontFamily: FONTS.semiBold,
    color: COLORS.accent,
  },
});
