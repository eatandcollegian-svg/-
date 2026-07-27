import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { buildPeriodStats } from "../lib/periodStats";
import { getCats, getRecords, getSettings } from "../lib/storage";
import { COLORS, FONTS } from "../lib/theme";
import type { AppSettings, Cat, DailyRecord, FeedUnit } from "../lib/types";

type Period = "week" | "month";

export default function PeriodReportScreen() {
  const router = useRouter();
  const { catId } = useLocalSearchParams<{ catId: string }>();
  const [loading, setLoading] = useState(true);
  const [cats, setCats] = useState<Cat[]>([]);
  const [records, setRecords] = useState<DailyRecord[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [period, setPeriod] = useState<Period>("week");

  useEffect(() => {
    (async () => {
      const [loadedCats, loadedRecords, loadedSettings] = await Promise.all([
        getCats(),
        getRecords(),
        getSettings(),
      ]);
      setCats(loadedCats);
      setRecords(loadedRecords);
      setSettings(loadedSettings);
      setLoading(false);
    })();
  }, []);

  if (loading || !settings) {
    return <SafeAreaView style={styles.container} />;
  }

  const cat = cats.find((c) => c.id === catId);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>‹ 달력</Text>
        </Pressable>
      </View>

      {!cat ? (
        <Text style={styles.emptyText}>고양이 정보를 찾을 수 없어요</Text>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>{cat.name}의 리포트</Text>

          <View style={styles.segmentRow}>
            <SegmentButton label="7일" selected={period === "week"} onPress={() => setPeriod("week")} />
            <SegmentButton label="30일" selected={period === "month"} onPress={() => setPeriod("month")} />
          </View>

          <PeriodStatsView
            stats={buildPeriodStats(records, cat.id, period === "week" ? 7 : 30, new Date())}
            feedUnit={settings.feedUnit}
          />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function SegmentButton({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={[styles.segment, selected && styles.segmentSelected]} onPress={onPress}>
      <Text style={[styles.segmentLabel, selected && styles.segmentLabelSelected]}>{label}</Text>
    </Pressable>
  );
}

function PeriodStatsView({
  stats,
  feedUnit,
}: {
  stats: ReturnType<typeof buildPeriodStats>;
  feedUnit: FeedUnit;
}) {
  const feedUnitLabel = feedUnit === "bowl" ? "그릇" : "g";

  return (
    <>
      <View style={styles.summaryBox}>
        <Text style={styles.summaryText}>
          최근 {stats.totalDays}일 중 {stats.recordedDays}일 기록했어요. 아래 수치는 기록한 날 기준
          하루 평균이에요.
        </Text>
      </View>

      {stats.poopAverage !== null && (
        <StatCard emoji="💩" title="배변" value={`${stats.poopAverage.toFixed(1)}회`} />
      )}
      <StatCard emoji="🤮" title="구토" value={`${stats.vomitCount}회`} />
      {stats.feedAverage !== null && (
        <StatCard emoji="🍚" title="사료" value={`${stats.feedAverage.toFixed(1)}${feedUnitLabel}`} />
      )}
      {stats.snackAverage !== null && (
        <StatCard emoji="🍖" title="간식" value={`${stats.snackAverage.toFixed(1)}회`} />
      )}
      <StatCard emoji="💊" title="투약" value={`${stats.medicineDays}/${stats.totalDays}일`} />
      {stats.playAverage !== null && (
        <StatCard emoji="🧶" title="놀이" value={`${stats.playAverage.toFixed(1)}분`} />
      )}
    </>
  );
}

function StatCard({ emoji, title, value }: { emoji: string; title: string; value: string }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>
        {emoji} {title}
      </Text>
      <Text style={styles.cardValue}>{value}</Text>
    </View>
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
  emptyText: {
    margin: 24,
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.textStrong,
  },
  title: {
    fontSize: 22,
    fontFamily: FONTS.bold,
    color: COLORS.textStrong,
    marginBottom: 4,
  },
  segmentRow: {
    flexDirection: "row",
    gap: 8,
  },
  segment: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: COLORS.cardBorder,
    backgroundColor: COLORS.cardBackground,
    paddingVertical: 10,
    alignItems: "center",
  },
  segmentSelected: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accentTint,
  },
  segmentLabel: {
    fontSize: 14,
    fontFamily: FONTS.semiBold,
    color: COLORS.textStrong,
  },
  segmentLabelSelected: {
    color: COLORS.accent,
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
});
