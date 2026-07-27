import { StyleSheet, Text, View } from "react-native";

import { buildDailySummary } from "../lib/report";
import { COLORS, FONTS } from "../lib/theme";
import type { DailyRecord, Medicine, Snack } from "../lib/types";

export default function DailyReport({
  catName,
  dateLabel,
  record,
  snacks,
  medicines,
}: {
  catName: string;
  dateLabel: string;
  record: DailyRecord;
  snacks: Snack[];
  medicines: Medicine[];
}) {
  const summary = buildDailySummary(record, catName, snacks, medicines);

  const cards: { emoji: string; title: string; value: string }[] = [];

  if (record.poop) {
    cards.push({
      emoji: "💩",
      title: "응가",
      value: record.poop.count === 0 ? "하지 않음" : `${record.poop.count}회 · ${record.poop.condition}`,
    });
  }
  if (record.litterBox) {
    cards.push({ emoji: "🪨", title: "감자", value: `${record.litterBox.count}회` });
  }
  if (record.feed) {
    const unitLabel = record.feed.unit === "bowl" ? "그릇" : "g";
    cards.push({ emoji: "🍚", title: "사료", value: `${record.feed.amount}${unitLabel}` });
  }
  if (record.water) {
    cards.push({ emoji: "💧", title: "음수량", value: record.water });
  }
  if (record.snacks && record.snacks.length > 0) {
    const names = record.snacks
      .map((id) => snacks.find((snack) => snack.id === id)?.name)
      .filter((name): name is string => Boolean(name));
    if (names.length > 0) {
      cards.push({ emoji: "🍖", title: "간식", value: names.join(", ") });
    }
  }
  if (record.vomit) {
    const detail = record.vomit === "기타" && record.vomitNote?.trim() ? ` (${record.vomitNote.trim()})` : "";
    cards.push({ emoji: "🤮", title: "구토", value: `${record.vomit}${detail}` });
  }
  if (record.medicineIds && record.medicineIds.length > 0) {
    const names = record.medicineIds
      .map((id) => medicines.find((medicine) => medicine.id === id)?.name)
      .filter((name): name is string => Boolean(name));
    if (names.length > 0) {
      cards.push({ emoji: "💊", title: "투약", value: names.join(", ") });
    }
  }
  if (record.play) {
    cards.push({ emoji: "🧶", title: "놀이", value: `${record.play.minutes}분` });
  }
  if (record.weight !== undefined) {
    cards.push({ emoji: "⚖️", title: "체중", value: `${record.weight}kg` });
  }

  return (
    <>
      <Text style={styles.title}>
        {catName}의 {dateLabel} 리포트
      </Text>

      <View style={styles.summaryBox}>
        <Text style={styles.summaryText}>{summary.join(" ")}</Text>
      </View>

      {cards.map((card) => (
        <View key={card.title} style={styles.card}>
          <Text style={styles.cardTitle}>
            {card.emoji} {card.title}
          </Text>
          <Text style={styles.cardValue}>{card.value}</Text>
        </View>
      ))}

      {record.note && record.note.trim() && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📝 메모</Text>
          <Text style={styles.noteValue}>{record.note.trim()}</Text>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontFamily: FONTS.bold,
    color: COLORS.textStrong,
    marginBottom: 4,
  },
  summaryBox: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.cardBorder,
    backgroundColor: COLORS.cardBackground,
    padding: 18,
  },
  summaryText: {
    fontSize: 15,
    fontFamily: FONTS.regular,
    color: COLORS.textStrong,
    lineHeight: 24,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.cardBorder,
    backgroundColor: COLORS.cardBackground,
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  cardTitle: {
    fontSize: 15,
    fontFamily: FONTS.semiBold,
    color: COLORS.textStrong,
  },
  cardValue: {
    fontSize: 15,
    fontFamily: FONTS.bold,
    color: COLORS.accent,
  },
  noteValue: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    maxWidth: "60%",
    textAlign: "right",
  },
});
