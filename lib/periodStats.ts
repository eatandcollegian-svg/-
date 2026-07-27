import { format, subDays } from "date-fns";

import type { DailyRecord } from "./types";

export interface PeriodStats {
  totalDays: number;
  recordedDays: number;
  poopAverage: number | null;
  vomitCount: number;
  feedAverage: number | null;
  snackAverage: number | null;
  medicineDays: number;
  playAverage: number | null;
}

function average(values: number[]): number | null {
  return values.length > 0 ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
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

  return {
    totalDays: days,
    recordedDays: filtered.length,
    poopAverage: average(filtered.filter((record) => record.poop).map((record) => record.poop!.count)),
    vomitCount: filtered.filter((record) => record.vomit && record.vomit !== "없음").length,
    feedAverage: average(filtered.filter((record) => record.feed).map((record) => record.feed!.amount)),
    snackAverage: average(
      filtered.filter((record) => record.snacks !== undefined).map((record) => record.snacks!.length)
    ),
    medicineDays: filtered.filter((record) => record.medicineIds && record.medicineIds.length > 0).length,
    playAverage: average(filtered.filter((record) => record.play).map((record) => record.play!.minutes)),
  };
}
