import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ChipGroup from "../components/ChipGroup";
import PrimaryButton from "../components/PrimaryButton";
import Stepper from "../components/Stepper";
import { formatDisplayDate, todayString } from "../lib/date";
import { generateId } from "../lib/id";
import { getCats, getRecords, getSettings, getSnacks, saveRecords, saveSnacks } from "../lib/storage";
import { COLORS, FONTS } from "../lib/theme";
import type {
  AppSettings,
  Cat,
  DailyRecord,
  PoopCondition,
  Snack,
  VomitType,
  WaterAmount,
} from "../lib/types";

const POOP_CONDITIONS: PoopCondition[] = ["좋음", "묽음", "설사", "변비"];
const WATER_AMOUNTS: WaterAmount[] = ["적게", "보통", "많이"];
const VOMIT_TYPES: VomitType[] = ["없음", "사료", "털", "노란물", "기타"];
const BOWL_LABELS = ["0", "0.5", "1", "1.5", "2"];
const GRAM_LABELS = ["0", "20", "40", "60", "80", "100", "120"];

function emptyRecord(catId: string, date: string): DailyRecord {
  return { id: generateId(), catId, date, snacks: [], updatedAt: new Date().toISOString() };
}

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [cats, setCats] = useState<Cat[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [snacks, setSnacks] = useState<Snack[]>([]);
  const [allRecords, setAllRecords] = useState<DailyRecord[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [record, setRecord] = useState<DailyRecord | null>(null);
  const [newSnackName, setNewSnackName] = useState("");
  const [addingSnack, setAddingSnack] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);

  const today = todayString();

  useEffect(() => {
    (async () => {
      const [loadedCats, loadedSettings, loadedSnacks, loadedRecords] = await Promise.all([
        getCats(),
        getSettings(),
        getSnacks(),
        getRecords(),
      ]);
      setCats(loadedCats);
      setSettings(loadedSettings);
      setSnacks(loadedSnacks);
      setAllRecords(loadedRecords);
      setSelectedCatId(loadedCats[0]?.id ?? null);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!selectedCatId) return;
    const existing = allRecords.find((r) => r.catId === selectedCatId && r.date === today);
    setRecord(existing ?? emptyRecord(selectedCatId, today));
  }, [selectedCatId, allRecords, today]);

  if (loading || !settings) {
    return <SafeAreaView style={styles.container} />;
  }

  if (cats.length === 0 || !record) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.emptyText}>등록된 고양이가 없어요</Text>
      </SafeAreaView>
    );
  }

  const tracking = settings.trackingItems;
  const selectedCat = cats.find((cat) => cat.id === selectedCatId);

  const handleSave = async () => {
    const finalRecord: DailyRecord = { ...record, updatedAt: new Date().toISOString() };
    const index = allRecords.findIndex(
      (r) => r.catId === finalRecord.catId && r.date === finalRecord.date
    );
    const updated =
      index >= 0
        ? allRecords.map((r, i) => (i === index ? finalRecord : r))
        : [...allRecords, finalRecord];
    await saveRecords(updated);
    setAllRecords(updated);
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 1500);
  };

  const toggleSnack = (snackId: string) => {
    setRecord((prev) => {
      if (!prev) return prev;
      const current = prev.snacks ?? [];
      const next = current.includes(snackId)
        ? current.filter((id) => id !== snackId)
        : [...current, snackId];
      return { ...prev, snacks: next };
    });
  };

  const handleAddSnack = async () => {
    const name = newSnackName.trim();
    if (!name) return;
    const newSnack: Snack = { id: generateId(), name };
    const updatedSnacks = [...snacks, newSnack];
    await saveSnacks(updatedSnacks);
    setSnacks(updatedSnacks);
    setNewSnackName("");
    setAddingSnack(false);
    toggleSnack(newSnack.id);
  };

  const feedOptions = settings.feedUnit === "bowl" ? BOWL_LABELS : GRAM_LABELS;
  const feedAmountLabel = record.feed ? String(record.feed.amount) : null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.dateText}>{formatDisplayDate(today)}</Text>

        {cats.length > 1 && (
          <View style={styles.catSwitcher}>
            {cats.map((cat) => (
              <Pressable
                key={cat.id}
                style={[styles.catChip, cat.id === selectedCatId && styles.catChipSelected]}
                onPress={() => setSelectedCatId(cat.id)}
              >
                <Text
                  style={[
                    styles.catChipLabel,
                    cat.id === selectedCatId && styles.catChipLabelSelected,
                  ]}
                >
                  {cat.name}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        <Text style={styles.title}>{selectedCat?.name}의 오늘 기록</Text>

        {tracking.poop && (
          <Section emoji="💩" title="응가">
            <Stepper
              value={record.poop?.count ?? 0}
              onChange={(count) =>
                setRecord((prev) =>
                  prev
                    ? { ...prev, poop: { count, condition: prev.poop?.condition ?? "좋음" } }
                    : prev
                )
              }
            />
            <ChipGroup
              options={POOP_CONDITIONS}
              selected={record.poop?.condition}
              onSelect={(condition) =>
                setRecord((prev) =>
                  prev ? { ...prev, poop: { count: prev.poop?.count ?? 0, condition } } : prev
                )
              }
            />
          </Section>
        )}

        {tracking.litterBox && (
          <Section emoji="🪨" title="감자">
            <Stepper
              value={record.litterBox?.count ?? 0}
              onChange={(count) => setRecord((prev) => (prev ? { ...prev, litterBox: { count } } : prev))}
            />
          </Section>
        )}

        {tracking.feed && (
          <Section emoji="🍚" title={`식사 (${settings.feedUnit === "bowl" ? "그릇" : "g"})`}>
            <ChipGroup
              options={feedOptions}
              selected={feedAmountLabel}
              onSelect={(label) =>
                setRecord((prev) =>
                  prev
                    ? { ...prev, feed: { unit: settings.feedUnit, amount: Number(label) } }
                    : prev
                )
              }
            />
          </Section>
        )}

        {tracking.water && (
          <Section emoji="💧" title="음수량">
            <ChipGroup
              options={WATER_AMOUNTS}
              selected={record.water}
              onSelect={(water) => setRecord((prev) => (prev ? { ...prev, water } : prev))}
            />
          </Section>
        )}

        {tracking.snack && (
          <Section emoji="🍖" title="간식">
            <View style={styles.snackRow}>
              {snacks.map((snack) => {
                const isSelected = (record.snacks ?? []).includes(snack.id);
                return (
                  <Pressable
                    key={snack.id}
                    style={[styles.chip, isSelected && styles.chipSelected]}
                    onPress={() => toggleSnack(snack.id)}
                  >
                    <Text style={[styles.chipLabel, isSelected && styles.chipLabelSelected]}>
                      {snack.name}
                    </Text>
                  </Pressable>
                );
              })}

              {addingSnack ? (
                <View style={styles.newSnackInputRow}>
                  <TextInput
                    style={styles.newSnackInput}
                    placeholder="간식 이름"
                    placeholderTextColor={COLORS.textFaint}
                    value={newSnackName}
                    onChangeText={setNewSnackName}
                    onSubmitEditing={handleAddSnack}
                    autoFocus
                  />
                  <Pressable style={styles.newSnackConfirm} onPress={handleAddSnack}>
                    <Text style={styles.newSnackConfirmText}>추가</Text>
                  </Pressable>
                </View>
              ) : (
                <Pressable style={styles.chip} onPress={() => setAddingSnack(true)}>
                  <Text style={styles.chipLabel}>+ 간식 추가</Text>
                </Pressable>
              )}
            </View>
          </Section>
        )}

        {tracking.vomit && (
          <Section emoji="🤮" title="구토">
            <ChipGroup
              options={VOMIT_TYPES}
              selected={record.vomit}
              onSelect={(vomit) => setRecord((prev) => (prev ? { ...prev, vomit } : prev))}
            />
          </Section>
        )}

        {tracking.medicine && (
          <Section emoji="💊" title="투약">
            <View style={styles.medicineRow}>
              <Text style={styles.medicineLabel}>오늘 약을 먹였어요</Text>
              <Switch
                value={record.medicine?.done ?? false}
                onValueChange={(done) =>
                  setRecord((prev) => (prev ? { ...prev, medicine: { done } } : prev))
                }
                trackColor={{ false: COLORS.cardBorder, true: COLORS.accent }}
                thumbColor="#FFFFFF"
              />
            </View>
          </Section>
        )}

        {tracking.weight && (
          <Section emoji="⚖️" title="체중 (kg)">
            <TextInput
              style={styles.weightInput}
              placeholder="0.0"
              placeholderTextColor={COLORS.textFaint}
              keyboardType="decimal-pad"
              value={record.weight !== undefined ? String(record.weight) : ""}
              onChangeText={(text) =>
                setRecord((prev) =>
                  prev ? { ...prev, weight: text ? Number(text) : undefined } : prev
                )
              }
            />
          </Section>
        )}

        <Section emoji="📝" title="메모">
          <TextInput
            style={styles.noteInput}
            placeholder="자유롭게 메모를 남겨보세요"
            placeholderTextColor={COLORS.textFaint}
            multiline
            value={record.note ?? ""}
            onChangeText={(note) => setRecord((prev) => (prev ? { ...prev, note } : prev))}
          />
        </Section>

        {savedMessage && <Text style={styles.savedMessage}>저장되었어요</Text>}
      </ScrollView>

      <PrimaryButton label="저장하기" onPress={handleSave} />
    </SafeAreaView>
  );
}

function Section({
  emoji,
  title,
  children,
}: {
  emoji: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        {emoji} {title}
      </Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 16,
  },
  emptyText: {
    margin: 24,
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.textStrong,
  },
  dateText: {
    fontSize: 14,
    fontFamily: FONTS.semiBold,
    color: COLORS.textFaint,
  },
  title: {
    fontSize: 22,
    fontFamily: FONTS.bold,
    color: COLORS.textStrong,
    marginBottom: 4,
  },
  catSwitcher: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  catChip: {
    borderRadius: 14,
    borderWidth: 2,
    borderColor: COLORS.cardBorder,
    backgroundColor: COLORS.cardBackground,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  catChipSelected: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accentTint,
  },
  catChipLabel: {
    fontSize: 14,
    fontFamily: FONTS.semiBold,
    color: COLORS.textStrong,
  },
  catChipLabelSelected: {
    color: COLORS.accent,
  },
  section: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.cardBorder,
    backgroundColor: COLORS.cardBackground,
    padding: 18,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.textStrong,
  },
  snackRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    borderRadius: 14,
    borderWidth: 2,
    borderColor: COLORS.cardBorder,
    backgroundColor: COLORS.background,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  chipSelected: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accentTint,
  },
  chipLabel: {
    fontSize: 14,
    fontFamily: FONTS.semiBold,
    color: COLORS.textStrong,
  },
  chipLabelSelected: {
    color: COLORS.accent,
  },
  newSnackInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  newSnackInput: {
    borderRadius: 14,
    borderWidth: 2,
    borderColor: COLORS.cardBorder,
    paddingVertical: 8,
    paddingHorizontal: 14,
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textStrong,
    minWidth: 100,
  },
  newSnackConfirm: {
    borderRadius: 14,
    backgroundColor: COLORS.accent,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  newSnackConfirmText: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: "#FFFFFF",
  },
  medicineRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  medicineLabel: {
    fontSize: 15,
    fontFamily: FONTS.semiBold,
    color: COLORS.textStrong,
  },
  weightInput: {
    borderRadius: 14,
    borderWidth: 2,
    borderColor: COLORS.cardBorder,
    paddingVertical: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.textStrong,
  },
  noteInput: {
    borderRadius: 14,
    borderWidth: 2,
    borderColor: COLORS.cardBorder,
    paddingVertical: 10,
    paddingHorizontal: 16,
    fontSize: 15,
    fontFamily: FONTS.regular,
    color: COLORS.textStrong,
    minHeight: 80,
    textAlignVertical: "top",
  },
  savedMessage: {
    textAlign: "center",
    fontSize: 14,
    fontFamily: FONTS.semiBold,
    color: COLORS.accent,
  },
});
