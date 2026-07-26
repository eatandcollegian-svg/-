import type { DailyRecord, PoopCondition, Snack, VomitType, WaterAmount } from "./types";

const POOP_CONDITION_ADJECTIVE: Record<PoopCondition, string> = {
  좋음: "좋은",
  묽음: "묽은",
  설사: "설사",
  변비: "변비",
};

function poopClause(record: DailyRecord): string | null {
  if (!record.poop) return null;
  if (record.poop.count === 0) return "응가는 하지 않았";
  return `응가를 ${record.poop.count}번 ${POOP_CONDITION_ADJECTIVE[record.poop.condition]} 상태로 눴`;
}

function litterBoxClause(record: DailyRecord): string | null {
  if (!record.litterBox || record.litterBox.count === 0) return null;
  return `모래는 ${record.litterBox.count}번 뭉쳤`;
}

function feedClause(record: DailyRecord): string | null {
  if (!record.feed) return null;
  if (record.feed.amount === 0) return "사료는 먹지 않았";
  const unitLabel = record.feed.unit === "bowl" ? "그릇" : "g";
  return `사료는 ${record.feed.amount}${unitLabel} 먹었`;
}

const WATER_CLAUSES: Record<WaterAmount, string> = {
  적게: "물은 평소보다 적게 마셨",
  보통: "물도 평소만큼 마셨",
  많이: "물은 평소보다 많이 마셨",
};

function waterClause(record: DailyRecord): string | null {
  if (!record.water) return null;
  return WATER_CLAUSES[record.water];
}

function snackClause(record: DailyRecord, snacks: Snack[]): string | null {
  if (!record.snacks || record.snacks.length === 0) return null;
  const names = record.snacks
    .map((id) => snacks.find((snack) => snack.id === id)?.name)
    .filter((name): name is string => Boolean(name));
  if (names.length === 0) return null;
  return `간식으로 ${names.join(", ")}도 먹었`;
}

const VOMIT_CLAUSES: Partial<Record<VomitType, string>> = {
  사료: "사료를 토했",
  털: "털을 토했",
  노란물: "노란 물을 토했",
  기타: "구토를 했",
};

function vomitClause(record: DailyRecord): string | null {
  if (!record.vomit || record.vomit === "없음") return null;
  if (record.vomit === "기타" && record.vomitNote && record.vomitNote.trim()) {
    return `${record.vomitNote.trim()} 구토를 했`;
  }
  return VOMIT_CLAUSES[record.vomit] ?? null;
}

function playClause(record: DailyRecord): string | null {
  if (!record.play) return null;
  if (record.play.count === 0) return "놀아주지는 못했";
  return `${record.play.count * 10}분 놀아줬`;
}

function medicineClause(record: DailyRecord): string | null {
  if (!record.medicine) return null;
  return record.medicine.done ? "약도 잘 먹었" : "약은 먹지 않았";
}

function weightClause(record: DailyRecord): string | null {
  if (record.weight === undefined) return null;
  return `체중은 ${record.weight}kg이었`;
}

function joinClauses(clauses: (string | null)[]): string | null {
  const filtered = clauses.filter((clause): clause is string => Boolean(clause));
  if (filtered.length === 0) return null;
  return `${filtered.join("고 ")}어요.`;
}

export function buildDailySummary(record: DailyRecord, catName: string, snacks: Snack[]): string[] {
  const categorySentences = [
    joinClauses([poopClause(record), litterBoxClause(record)]),
    joinClauses([feedClause(record), waterClause(record), snackClause(record, snacks)]),
    joinClauses([playClause(record)]),
    joinClauses([vomitClause(record), medicineClause(record), weightClause(record)]),
  ].filter((sentence): sentence is string => Boolean(sentence));

  const sentences: string[] = categorySentences.map((sentence, index) =>
    index === 0 ? `오늘 ${catName}는 ${sentence}` : sentence
  );

  if (record.vomit === "없음") {
    sentences.push("구토나 특이사항 없이 편안한 하루를 보냈어요.");
  }

  if (record.note && record.note.trim()) {
    sentences.push(`메모도 남겼어요: "${record.note.trim()}"`);
  }

  if (sentences.length === 0) {
    sentences.push(`오늘은 ${catName}에 대해 기록된 세부 항목이 없어요.`);
  }

  return sentences;
}
