import { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import CalendarGrid from "../components/CalendarGrid";
import DailyRecordForm from "../components/DailyRecordForm";
import DailyReport from "../components/DailyReport";
import PrimaryButton from "../components/PrimaryButton";
import { daysSinceBirth, formatDisplayDate, todayString } from "../lib/date";
import { generateId } from "../lib/id";
import { getCats, getRecords, getSettings, getSnacks, saveRecords, saveSnacks } from "../lib/storage";
import { COLORS, FONTS } from "../lib/theme";
import type { AppSettings, Cat, DailyRecord, Snack } from "../lib/types";

const MIN_MONTH = new Date(2026, 6, 1);
const MAX_MONTH = new Date(2029, 11, 1);

function emptyRecord(catId: string, date: string): DailyRecord {
  return { id: generateId(), catId, date, snacks: [], updatedAt: new Date().toISOString() };
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function clampMonth(date: Date): Date {
  const index = date.getFullYear() * 12 + date.getMonth();
  const minIndex = MIN_MONTH.getFullYear() * 12 + MIN_MONTH.getMonth();
  const maxIndex = MAX_MONTH.getFullYear() * 12 + MAX_MONTH.getMonth();
  if (index < minIndex) return MIN_MONTH;
  if (index > maxIndex) return MAX_MONTH;
  return startOfMonth(date);
}

export default function HomeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [cats, setCats] = useState<Cat[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [snacks, setSnacks] = useState<Snack[]>([]);
  const [allRecords, setAllRecords] = useState<DailyRecord[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [viewMonth, setViewMonth] = useState(() => clampMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [record, setRecord] = useState<DailyRecord | null>(null);
  const [savedMessage, setSavedMessage] = useState(false);

  const today = todayString();

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        const [loadedCats, loadedSettings, loadedSnacks, loadedRecords] = await Promise.all([
          getCats(),
          getSettings(),
          getSnacks(),
          getRecords(),
        ]);
        if (cancelled) return;
        setCats(loadedCats);
        setSettings(loadedSettings);
        setSnacks(loadedSnacks);
        setAllRecords(loadedRecords);
        setSelectedCatId((prev) =>
          prev && loadedCats.some((cat) => cat.id === prev) ? prev : (loadedCats[0]?.id ?? null)
        );
        setLoading(false);
      })();
      return () => {
        cancelled = true;
      };
    }, [])
  );

  useEffect(() => {
    if (!selectedCatId || !selectedDate) {
      setRecord(null);
      return;
    }
    const existing = allRecords.find((r) => r.catId === selectedCatId && r.date === selectedDate);
    setRecord(existing ?? emptyRecord(selectedCatId, selectedDate));
  }, [selectedCatId, selectedDate, allRecords]);

  if (loading || !settings) {
    return <SafeAreaView style={styles.container} />;
  }

  if (cats.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.emptyText}>등록된 고양이가 없어요</Text>
      </SafeAreaView>
    );
  }

  const selectedCat = cats.find((cat) => cat.id === selectedCatId);
  const markedDates = new Set(allRecords.filter((r) => r.catId === selectedCatId).map((r) => r.date));

  const handleSave = async () => {
    if (!record) return;
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

  const handleCreateSnack = async (name: string): Promise<Snack> => {
    const newSnack: Snack = { id: generateId(), name };
    const updated = [...snacks, newSnack];
    await saveSnacks(updated);
    setSnacks(updated);
    return newSnack;
  };

  if (selectedDate && record) {
    const dateLabel = formatDisplayDate(selectedDate);
    const hasData = markedDates.has(selectedDate);

    const backToCalendar = () => {
      setSelectedDate(null);
      setEditing(false);
    };

    if (editing) {
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.editHeader}>
            <Pressable
              style={styles.backButton}
              onPress={hasData ? () => setEditing(false) : backToCalendar}
            >
              <Text style={styles.backButtonText}>{hasData ? "‹ 리포트" : "‹ 달력"}</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <DailyRecordForm
              catName={selectedCat?.name ?? ""}
              dateLabel={dateLabel}
              record={record}
              onChangeRecord={(updater) => setRecord((prev) => (prev ? updater(prev) : prev))}
              settings={settings}
              snacks={snacks}
              onCreateSnack={handleCreateSnack}
              savedMessage={savedMessage}
            />
          </ScrollView>

          <PrimaryButton label="저장하기" onPress={handleSave} />
        </SafeAreaView>
      );
    }

    if (!hasData) {
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.editHeader}>
            <Pressable style={styles.backButton} onPress={backToCalendar}>
              <Text style={styles.backButtonText}>‹ 달력</Text>
            </Pressable>
          </View>

          <View style={styles.emptyStateBody}>
            <Text style={styles.emptyStateEmoji}>🗒️</Text>
            <Text style={styles.emptyStateTitle}>기록 없음</Text>
            <Text style={styles.emptyStateDescription}>
              {selectedCat?.name}의 {dateLabel} 기록이 아직 없어요
            </Text>
          </View>

          <PrimaryButton label="기록하기" onPress={() => setEditing(true)} />
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.editHeader}>
          <Pressable style={styles.backButton} onPress={backToCalendar}>
            <Text style={styles.backButtonText}>‹ 달력</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <DailyReport
            catName={selectedCat?.name ?? ""}
            dateLabel={dateLabel}
            record={record}
            snacks={snacks}
          />
        </ScrollView>

        <PrimaryButton label="수정하기" onPress={() => setEditing(true)} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.calendarHeader}>
        <View style={{ flex: 1 }} />
        <Pressable
          style={styles.iconButton}
          onPress={() => {
            setSelectedDate(today);
            setEditing(false);
          }}
        >
          <Text style={styles.iconButtonText}>＋</Text>
        </Pressable>
        <Pressable style={styles.iconButton} onPress={() => router.push("/settings")}>
          <Text style={styles.iconButtonText}>⚙</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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

        <CalendarGrid
          viewMonth={viewMonth}
          minMonth={MIN_MONTH}
          maxMonth={MAX_MONTH}
          markedDates={markedDates}
          todayString={today}
          onChangeMonth={(next) => setViewMonth(clampMonth(next))}
          onSelectDate={setSelectedDate}
        />

        {selectedCat?.birthDate && (
          <Text style={styles.dDayText}>
            {selectedCat.name} 태어난지 {daysSinceBirth(selectedCat.birthDate)}일
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
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
  emptyStateBody: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  emptyStateEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.textStrong,
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    textAlign: "center",
  },
  calendarHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 12,
    gap: 10,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.accentTint,
  },
  iconButtonText: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.accent,
  },
  dDayText: {
    textAlign: "center",
    fontSize: 14,
    fontFamily: FONTS.semiBold,
    color: COLORS.textMuted,
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
  editHeader: {
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
});
