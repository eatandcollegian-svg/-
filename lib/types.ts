export type PoopCondition = "좋음" | "묽음" | "설사" | "변비";

export type WaterAmount = "적게" | "보통" | "많이";

export type VomitType = "없음" | "사료" | "털" | "노란물" | "기타";

export type FeedUnit = "bowl" | "gram";

export type HouseholdType = "single" | "multi";

export const BOWL_FEED_AMOUNTS = [0, 0.5, 1, 1.5, 2] as const;
export const GRAM_FEED_AMOUNTS = [0, 20, 40, 60, 80, 100, 120] as const;

export interface Cat {
  id: string;
  name: string;
  photoUri?: string;
  birthDate?: string;
  createdAt: string;
}

export interface Snack {
  id: string;
  name: string;
}

export interface PoopRecord {
  count: number;
  condition: PoopCondition;
}

export interface LitterBoxRecord {
  count: number;
}

export interface FeedRecord {
  unit: FeedUnit;
  amount: number;
}

export interface MedicineRecord {
  done: boolean;
}

export interface PlayRecord {
  count: number;
}

export interface DailyRecord {
  id: string;
  catId: string;
  date: string;
  poop?: PoopRecord;
  litterBox?: LitterBoxRecord;
  feed?: FeedRecord;
  water?: WaterAmount;
  snacks?: string[];
  vomit?: VomitType;
  vomitNote?: string;
  medicine?: MedicineRecord;
  play?: PlayRecord;
  weight?: number;
  note?: string;
  updatedAt: string;
}

export interface TrackingItems {
  poop: boolean;
  litterBox: boolean;
  feed: boolean;
  water: boolean;
  snack: boolean;
  vomit: boolean;
  medicine: boolean;
  weight: boolean;
  play: boolean;
}

export interface AppSettings {
  onboardingCompleted: boolean;
  householdType: HouseholdType;
  feedUnit: FeedUnit;
  trackingItems: TrackingItems;
}
