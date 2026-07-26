import { format } from "date-fns";

export function todayString(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function formatDisplayDate(dateString: string): string {
  return format(new Date(dateString), "M월 d일");
}
