import AsyncStorage from "@react-native-async-storage/async-storage";

import type { AppSettings, Cat, DailyRecord, Medicine, Reminder, Snack } from "./types";

const KEYS = {
  settings: "nyanglog:settings",
  cats: "nyanglog:cats",
  records: "nyanglog:records",
  snacks: "nyanglog:snacks",
  medicines: "nyanglog:medicines",
  reminders: "nyanglog:reminders",
} as const;

const DEFAULT_REMINDERS: Reminder[] = [
  { id: "reminder-general", category: "general", enabled: false, hour: 20, minute: 0 },
  { id: "reminder-medicine-default", category: "medicine", enabled: false, hour: 9, minute: 0 },
];

const DEFAULT_SETTINGS: AppSettings = {
  onboardingCompleted: false,
  householdType: "single",
  feedUnit: "bowl",
  trackingItems: {
    poop: true,
    litterBox: true,
    feed: true,
    water: true,
    snack: true,
    vomit: true,
    medicine: true,
    weight: true,
    play: true,
  },
};

export async function getSettings(): Promise<AppSettings> {
  const raw = await AsyncStorage.getItem(KEYS.settings);
  if (!raw) return DEFAULT_SETTINGS;
  const parsed = JSON.parse(raw);
  return {
    ...DEFAULT_SETTINGS,
    ...parsed,
    trackingItems: { ...DEFAULT_SETTINGS.trackingItems, ...parsed.trackingItems },
  };
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await AsyncStorage.setItem(KEYS.settings, JSON.stringify(settings));
}

export async function getCats(): Promise<Cat[]> {
  const raw = await AsyncStorage.getItem(KEYS.cats);
  return raw ? JSON.parse(raw) : [];
}

export async function saveCats(cats: Cat[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.cats, JSON.stringify(cats));
}

export async function getRecords(): Promise<DailyRecord[]> {
  const raw = await AsyncStorage.getItem(KEYS.records);
  return raw ? JSON.parse(raw) : [];
}

export async function saveRecords(records: DailyRecord[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.records, JSON.stringify(records));
}

export async function getSnacks(): Promise<Snack[]> {
  const raw = await AsyncStorage.getItem(KEYS.snacks);
  return raw ? JSON.parse(raw) : [];
}

export async function saveSnacks(snacks: Snack[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.snacks, JSON.stringify(snacks));
}

export async function getMedicines(): Promise<Medicine[]> {
  const raw = await AsyncStorage.getItem(KEYS.medicines);
  return raw ? JSON.parse(raw) : [];
}

export async function saveMedicines(medicines: Medicine[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.medicines, JSON.stringify(medicines));
}

export async function getReminders(): Promise<Reminder[]> {
  const raw = await AsyncStorage.getItem(KEYS.reminders);
  return raw ? JSON.parse(raw) : DEFAULT_REMINDERS;
}

export async function saveReminders(reminders: Reminder[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.reminders, JSON.stringify(reminders));
}

export async function resetAllData(): Promise<void> {
  await AsyncStorage.multiRemove(Object.values(KEYS));
}
