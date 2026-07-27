import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { COLORS, FONTS } from "../lib/theme";

interface Option {
  id: string;
  name: string;
}

export default function ChipMultiPicker({
  options,
  selectedIds,
  onToggle,
  onCreate,
  addLabel,
  inputPlaceholder,
}: {
  options: Option[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  onCreate: (name: string) => Promise<Option>;
  addLabel: string;
  inputPlaceholder: string;
}) {
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    const name = newName.trim();
    if (!name) return;
    const created = await onCreate(name);
    setNewName("");
    setAdding(false);
    onToggle(created.id);
  };

  return (
    <View style={styles.row}>
      {options.map((option) => {
        const isSelected = selectedIds.includes(option.id);
        return (
          <Pressable
            key={option.id}
            style={[styles.chip, isSelected && styles.chipSelected]}
            onPress={() => onToggle(option.id)}
          >
            <Text style={[styles.chipLabel, isSelected && styles.chipLabelSelected]}>{option.name}</Text>
          </Pressable>
        );
      })}

      {adding ? (
        <View style={styles.newInputRow}>
          <TextInput
            style={styles.newInput}
            placeholder={inputPlaceholder}
            placeholderTextColor={COLORS.textFaint}
            value={newName}
            onChangeText={setNewName}
            onSubmitEditing={handleAdd}
            autoFocus
          />
          <Pressable style={styles.newConfirm} onPress={handleAdd}>
            <Text style={styles.newConfirmText}>추가</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable style={styles.chip} onPress={() => setAdding(true)}>
          <Text style={styles.chipLabel}>{addLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
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
  newInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  newInput: {
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
  newConfirm: {
    borderRadius: 14,
    backgroundColor: COLORS.accent,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  newConfirmText: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: "#FFFFFF",
  },
});
