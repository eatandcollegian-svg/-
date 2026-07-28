import { useState } from "react";
import { Modal, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";

import PrimaryButton from "./PrimaryButton";
import { COLORS, FONTS } from "../lib/theme";

function formatTime(hour: number, minute: number): string {
  const period = hour < 12 ? "오전" : "오후";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${period} ${hour12}:${String(minute).padStart(2, "0")}`;
}

function toDate(hour: number, minute: number): Date {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date;
}

export default function TimePickerField({
  hour,
  minute,
  onChange,
  disabled,
}: {
  hour: number;
  minute: number;
  onChange: (hour: number, minute: number) => void;
  disabled?: boolean;
}) {
  const [iosPickerVisible, setIosPickerVisible] = useState(false);
  const [draft, setDraft] = useState(() => toDate(hour, minute));

  const openPicker = () => {
    if (disabled) return;

    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: toDate(hour, minute),
        mode: "time",
        is24Hour: false,
        onChange: (event, selected) => {
          if (event.type === "set" && selected) {
            onChange(selected.getHours(), selected.getMinutes());
          }
        },
      });
      return;
    }

    setDraft(toDate(hour, minute));
    setIosPickerVisible(true);
  };

  const confirmIos = () => {
    onChange(draft.getHours(), draft.getMinutes());
    setIosPickerVisible(false);
  };

  return (
    <>
      <Pressable
        style={[styles.field, disabled && styles.fieldDisabled]}
        onPress={openPicker}
        disabled={disabled}
      >
        <Text style={[styles.fieldText, disabled && styles.fieldTextDisabled]}>
          {formatTime(hour, minute)}
        </Text>
      </Pressable>

      {Platform.OS === "ios" && (
        <Modal visible={iosPickerVisible} transparent animationType="slide">
          <View style={styles.modalBackdrop}>
            <View style={styles.modalSheet}>
              <DateTimePicker
                value={draft}
                mode="time"
                display="spinner"
                locale="ko-KR"
                onChange={(_event, selected) => selected && setDraft(selected)}
              />
              <PrimaryButton label="확인" onPress={confirmIos} />
            </View>
          </View>
        </Modal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  field: {
    borderRadius: 14,
    borderWidth: 2,
    borderColor: COLORS.cardBorder,
    backgroundColor: COLORS.background,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  fieldDisabled: {
    opacity: 0.5,
  },
  fieldText: {
    fontSize: 15,
    fontFamily: FONTS.semiBold,
    color: COLORS.textStrong,
  },
  fieldTextDisabled: {
    color: COLORS.textFaint,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  modalSheet: {
    backgroundColor: COLORS.cardBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 12,
  },
});
