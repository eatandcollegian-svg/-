import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

import type { Cat, Reminder } from "./types";

const ANDROID_CHANNEL_ID = "reminders";

export async function ensureNotificationChannel(): Promise<void> {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: "냥로그 알림",
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

export async function requestNotificationPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const result = await Notifications.requestPermissionsAsync();
  return result.granted;
}

function buildReminderContent(
  category: Reminder["category"],
  cats: Cat[]
): { title: string; body: string } {
  const singleCatName = cats.length === 1 ? cats[0].name : null;

  if (category === "general") {
    return {
      title: "냥로그",
      body: singleCatName ? `오늘 ${singleCatName} 기록하셨나요?` : "오늘 냥이 기록하셨나요?",
    };
  }

  return {
    title: "투약 알림",
    body: singleCatName ? `${singleCatName} 약 먹일 시간이에요` : "약 먹일 시간이에요",
  };
}

export async function cancelReminderSchedule(reminderId: string): Promise<void> {
  if (Platform.OS === "web") return;
  await Notifications.cancelScheduledNotificationAsync(reminderId);
}

export async function syncReminderSchedule(reminder: Reminder, cats: Cat[]): Promise<void> {
  if (Platform.OS === "web") return;
  await cancelReminderSchedule(reminder.id);
  if (!reminder.enabled) return;

  await Notifications.scheduleNotificationAsync({
    identifier: reminder.id,
    content: buildReminderContent(reminder.category, cats),
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: reminder.hour,
      minute: reminder.minute,
      channelId: ANDROID_CHANNEL_ID,
    },
  });
}

export async function syncAllReminderSchedules(reminders: Reminder[], cats: Cat[]): Promise<void> {
  for (const reminder of reminders) {
    await syncReminderSchedule(reminder, cats);
  }
}
