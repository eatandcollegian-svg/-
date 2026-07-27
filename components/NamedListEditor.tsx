import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { COLORS, FONTS } from "../lib/theme";

interface Item {
  id: string;
  name: string;
}

export default function NamedListEditor({
  items,
  onUpdateName,
  onAdd,
  onRemove,
  addLabel,
  itemPlaceholder,
}: {
  items: Item[];
  onUpdateName: (id: string, name: string) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
  addLabel: string;
  itemPlaceholder: string;
}) {
  return (
    <View style={styles.list}>
      {items.map((item) => (
        <View key={item.id} style={styles.row}>
          <TextInput
            style={styles.input}
            placeholder={itemPlaceholder}
            placeholderTextColor={COLORS.textFaint}
            value={item.name}
            onChangeText={(text) => onUpdateName(item.id, text)}
          />
          <Pressable style={styles.deleteButton} onPress={() => onRemove(item.id)}>
            <Text style={styles.deleteButtonText}>✕</Text>
          </Pressable>
        </View>
      ))}

      <Pressable style={styles.addButton} onPress={onAdd}>
        <Text style={styles.addButtonText}>{addLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  input: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: COLORS.cardBorder,
    backgroundColor: COLORS.cardBackground,
    paddingVertical: 10,
    paddingHorizontal: 16,
    fontSize: 15,
    fontFamily: FONTS.regular,
    color: COLORS.textStrong,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
  },
  deleteButtonText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  addButton: {
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.cardBorder,
    borderStyle: "dashed",
    paddingVertical: 14,
    alignItems: "center",
  },
  addButtonText: {
    fontSize: 14,
    fontFamily: FONTS.semiBold,
    color: COLORS.accent,
  },
});
