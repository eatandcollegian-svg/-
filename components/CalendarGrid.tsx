import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { addDays, addMonths, format, getDay, isSameMonth, startOfMonth, subMonths } from "date-fns";

import { COLORS, FONTS } from "../lib/theme";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

interface CalendarCell {
  key: string;
  day: number;
  dateString: string;
  inMonth: boolean;
  isToday: boolean;
  hasRecord: boolean;
}

function monthIndex(date: Date): number {
  return date.getFullYear() * 12 + date.getMonth();
}

function buildCells(viewMonth: Date, todayString: string, markedDates: Set<string>): CalendarCell[] {
  const start = startOfMonth(viewMonth);
  const leadingBlanks = getDay(start);
  const daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate();
  const totalCells = Math.ceil((leadingBlanks + daysInMonth) / 7) * 7;

  const cells: CalendarCell[] = [];
  for (let i = 0; i < totalCells; i++) {
    const date = addDays(start, i - leadingBlanks);
    const inMonth = isSameMonth(date, viewMonth);
    const dateString = format(date, "yyyy-MM-dd");
    cells.push({
      key: dateString,
      day: date.getDate(),
      dateString,
      inMonth,
      isToday: inMonth && dateString === todayString,
      hasRecord: inMonth && markedDates.has(dateString),
    });
  }
  return cells;
}

export default function CalendarGrid({
  viewMonth,
  minMonth,
  maxMonth,
  markedDates,
  todayString,
  onChangeMonth,
  onSelectDate,
}: {
  viewMonth: Date;
  minMonth: Date;
  maxMonth: Date;
  markedDates: Set<string>;
  todayString: string;
  onChangeMonth: (next: Date) => void;
  onSelectDate: (dateString: string) => void;
}) {
  const cells = useMemo(
    () => buildCells(viewMonth, todayString, markedDates),
    [viewMonth, todayString, markedDates]
  );

  const atMin = monthIndex(viewMonth) <= monthIndex(minMonth);
  const atMax = monthIndex(viewMonth) >= monthIndex(maxMonth);

  return (
    <View>
      <View style={styles.header}>
        <Pressable
          style={[styles.navButton, atMin && styles.navButtonDisabled]}
          onPress={() => onChangeMonth(subMonths(viewMonth, 1))}
          disabled={atMin}
        >
          <Text style={[styles.navButtonText, atMin && styles.navButtonTextDisabled]}>‹</Text>
        </Pressable>
        <Text style={styles.monthLabel}>{format(viewMonth, "yyyy년 M월")}</Text>
        <Pressable
          style={[styles.navButton, atMax && styles.navButtonDisabled]}
          onPress={() => onChangeMonth(addMonths(viewMonth, 1))}
          disabled={atMax}
        >
          <Text style={[styles.navButtonText, atMax && styles.navButtonTextDisabled]}>›</Text>
        </Pressable>
      </View>

      <View style={styles.weekdayRow}>
        {WEEKDAYS.map((weekday) => (
          <Text key={weekday} style={styles.weekdayText}>
            {weekday}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((cell) =>
          cell.inMonth ? (
            <Pressable
              key={cell.key}
              style={styles.dayCellOuter}
              onPress={() => onSelectDate(cell.dateString)}
            >
              <View style={[styles.dayCellInner, cell.isToday && styles.dayCellToday]}>
                <Text style={[styles.dayNumber, cell.isToday && styles.dayNumberToday]}>
                  {cell.day}
                </Text>
                <View style={styles.dotSlot}>{cell.hasRecord && <View style={styles.dot} />}</View>
              </View>
            </Pressable>
          ) : (
            <View key={cell.key} style={styles.dayCellOuter}>
              <View style={styles.dayCellInner}>
                <Text style={styles.dayNumberOutside}>{cell.day}</Text>
                <View style={styles.dotSlot} />
              </View>
            </View>
          )
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    marginBottom: 16,
  },
  navButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.accentTint,
  },
  navButtonDisabled: {
    backgroundColor: COLORS.background,
  },
  navButtonText: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.accent,
  },
  navButtonTextDisabled: {
    color: COLORS.cardBorder,
  },
  monthLabel: {
    fontSize: 17,
    fontFamily: FONTS.bold,
    color: COLORS.textStrong,
    minWidth: 116,
    textAlign: "center",
  },
  weekdayRow: {
    flexDirection: "row",
  },
  weekdayText: {
    width: `${100 / 7}%`,
    textAlign: "center",
    fontSize: 13,
    fontFamily: FONTS.semiBold,
    color: COLORS.textFaint,
    marginBottom: 4,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCellOuter: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    padding: 3,
  },
  dayCellInner: {
    flex: 1,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  dayCellToday: {
    borderWidth: 2,
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accentTint,
  },
  dayNumber: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textStrong,
  },
  dayNumberToday: {
    fontFamily: FONTS.bold,
    color: COLORS.accent,
  },
  dayNumberOutside: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.cardBorder,
  },
  dotSlot: {
    height: 6,
    justifyContent: "center",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.accent,
  },
});
