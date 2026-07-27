import { format, subDays } from "date-fns";

import type { DailyRecord } from "./types";

export interface PeriodStats {
  totalDays: number;
  recordedDays: number;
  poopCount: number;
  vomitCount: number;
  feedAverage: number | null;
  snackCount: number;
  medicineDays: number;
  playMinutesTotal: number;
}

export function buildPeriodStats(
  allRecords: DailyRecord[],
  catId: string,
  days: number,
  today: Date
): PeriodStats {
  const rangeStart = format(subDays(today, days - 1), "yyyy-MM-dd");
  const rangeEnd = format(today, "yyyy-MM-dd");

  const filtered = allRecords.filter(
    (record) => record.catId === catId && record.date >= rangeStart && record.date <= rangeEnd
  );

  const feedAmounts = filtered.filter((record) => record.feed).map((record) => record.feed!.amount);

  return {
    totalDays: days,
    recordedDays: filtered.length,
    poopCount: filtered.reduce((sum, record) => sum + (record.poop?.count ?? 0), 0),
    vomitCount: filtered.filter((record) => record.vomit && record.vomit !== "없음").length,
    feedAverage:
      feedAmounts.length > 0 ? feedAmounts.reduce((sum, amount) => sum + amount, 0) / feedAmounts.length : null,
    snackCount: filtered.reduce((sum, record) => sum + (record.snacks?.length ?? 0), 0),
    medicineDays: filtered.filter((record) => record.medicineIds && record.medicineIds.length > 0).length,
    playMinutesTotal: filtered.reduce((sum, record) => sum + (record.play?.minutes ?? 0), 0),
  };
}
