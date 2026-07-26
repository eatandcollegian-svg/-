import { useState } from "react";
import { Pressable, StyleSheet, Switch, Text, TextInput, View } from "react-native";

import ChipGroup from "./ChipGroup";
import Stepper from "./Stepper";
import { COLORS, FONTS } from "../lib/theme";
import type { AppSettings, DailyRecord, PoopCondition, Snack, VomitType, WaterAmount } from "../lib/types";

const POOP_CONDITIONS: PoopCondition[] = ["좋음", "묽음", "설사", "변비"];
const WATER_AMOUNTS: WaterAmount[] = ["적게", "보통", "많이"];
const VOMIT_TYPES: VomitType[] = ["없음", "사료", "털", "노란물", "기타"];
const BOWL_LABELS = ["0", "0.5", "1", "1.5", "2"];
const GRAM_LABELS = ["0", "20", "40", "60", "80", "100", "120"];

export default function DailyRecordForm({
  catName,
  dateLabel,
  record,
  onChangeRecord,
  settings,
  snacks,
  onCreateSnack,
  savedMessage,
}: {
  catName: string;
  dateLabel: string;
  record: DailyRecord;
  onChangeRecord: (updater: (prev: DailyRecord) => DailyRecord) => void;
  settings: AppSettings;
  snacks: Snack[];
  onCreateSnack: (name: string) => Promise<Snack>;
  savedMessage: boolean;
}) {
  const [newSnackName, setNewSnackName] = useState("");
  const [addingSnack, setAddingSnack] = useState(false);

  const tracking = settings.trackingItems;
  const feedOptions = settings.feedUnit === "bowl" ? BOWL_LABELS : GRAM_LABELS;
  const feedAmountLabel = record.feed ? String(record.feed.amount) : null;

  const toggleSnack = (snackId: string) => {
    onChangeRecord((prev) => {
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
    const newSnack = await onCreateSnack(name);
    setNewSnackName("");
    setAddingSnack(false);
    toggleSnack(newSnack.id);
  };

  return (
    <>
      <Text style={styles.title}>
        {catName}의 {dateLabel} 기록
      </Text>

      {tracking.poop && (
        <Section emoji="💩" title="응가">
          <Stepper
            value={record.poop?.count ?? 0}
            onChange={(count) =>
              onChangeRecord((prev) => ({
                ...prev,
                poop: { count, condition: prev.poop?.condition ?? "좋음" },
              }))
            }
          />
          <ChipGroup
            options={POOP_CONDITIONS}
            selected={record.poop?.condition}
            onSelect={(condition) =>
              onChangeRecord((prev) => ({
                ...prev,
                poop: { count: prev.poop?.count ?? 0, condition },
              }))
            }
          />
        </Section>
      )}

      {tracking.litterBox && (
        <Section emoji="🪨" title="감자">
          <Stepper
            value={record.litterBox?.count ?? 0}
            onChange={(count) => onChangeRecord((prev) => ({ ...prev, litterBox: { count } }))}
          />
        </Section>
      )}

      {tracking.feed && (
        <Section emoji="🍚" title={`식사 (${settings.feedUnit === "bowl" ? "그릇" : "g"})`}>
          <ChipGroup
            options={feedOptions}
            selected={feedAmountLabel}
            onSelect={(label) =>
              onChangeRecord((prev) => ({
                ...prev,
                feed: { unit: settings.feedUnit, amount: Number(label) },
              }))
            }
          />
        </Section>
      )}

      {tracking.water && (
        <Section emoji="💧" title="음수량">
          <ChipGroup
            options={WATER_AMOUNTS}
            selected={record.water}
            onSelect={(water) => onChangeRecord((prev) => ({ ...prev, water }))}
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
            onSelect={(vomit) => onChangeRecord((prev) => ({ ...prev, vomit }))}
          />
        </Section>
      )}

      {tracking.medicine && (
        <Section emoji="💊" title="투약">
          <View style={styles.medicineRow}>
            <Text style={styles.medicineLabel}>오늘 약을 먹였어요</Text>
            <Switch
              value={record.medicine?.done ?? false}
              onValueChange={(done) => onChangeRecord((prev) => ({ ...prev, medicine: { done } }))}
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
              onChangeRecord((prev) => ({ ...prev, weight: text ? Number(text) : undefined }))
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
          onChangeText={(note) => onChangeRecord((prev) => ({ ...prev, note }))}
        />
      </Section>

      {savedMessage && <Text style={styles.savedMessage}>저장되었어요</Text>}
    </>
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
  title: {
    fontSize: 22,
    fontFamily: FONTS.bold,
    color: COLORS.textStrong,
    marginBottom: 4,
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
