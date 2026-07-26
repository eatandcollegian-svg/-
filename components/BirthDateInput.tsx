import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { COLORS, FONTS } from "../lib/theme";

function parseInitial(value?: string): [string, string, string] {
  if (!value) return ["", "", ""];
  const [y, m, d] = value.split("-");
  return [y ?? "", m ? String(Number(m)) : "", d ? String(Number(d)) : ""];
}

export default function BirthDateInput({
  value,
  onChange,
}: {
  value?: string;
  onChange: (value?: string) => void;
}) {
  const initial = parseInitial(value);
  const [year, setYear] = useState(initial[0]);
  const [month, setMonth] = useState(initial[1]);
  const [day, setDay] = useState(initial[2]);

  const emit = (y: string, m: string, d: string) => {
    if (y.length === 4 && m.length > 0 && d.length > 0) {
      onChange(`${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`);
    } else {
      onChange(undefined);
    }
  };

  return (
    <View style={styles.row}>
      <TextInput
        style={styles.yearInput}
        value={year}
        onChangeText={(text) => {
          const next = text.replace(/\D/g, "").slice(0, 4);
          setYear(next);
          emit(next, month, day);
        }}
        placeholder="년도"
        placeholderTextColor={COLORS.textFaint}
        keyboardType="number-pad"
        maxLength={4}
      />
      <Text style={styles.unit}>년</Text>
      <TextInput
        style={styles.smallInput}
        value={month}
        onChangeText={(text) => {
          const next = text.replace(/\D/g, "").slice(0, 2);
          setMonth(next);
          emit(year, next, day);
        }}
        placeholder="월"
        placeholderTextColor={COLORS.textFaint}
        keyboardType="number-pad"
        maxLength={2}
      />
      <Text style={styles.unit}>월</Text>
      <TextInput
        style={styles.smallInput}
        value={day}
        onChangeText={(text) => {
          const next = text.replace(/\D/g, "").slice(0, 2);
          setDay(next);
          emit(year, month, next);
        }}
        placeholder="일"
        placeholderTextColor={COLORS.textFaint}
        keyboardType="number-pad"
        maxLength={2}
      />
      <Text style={styles.unit}>일</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  yearInput: {
    width: 64,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingVertical: 8,
    textAlign: "center",
    fontSize: 15,
    fontFamily: FONTS.regular,
    color: COLORS.textStrong,
  },
  smallInput: {
    width: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingVertical: 8,
    textAlign: "center",
    fontSize: 15,
    fontFamily: FONTS.regular,
    color: COLORS.textStrong,
  },
  unit: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
  },
});
