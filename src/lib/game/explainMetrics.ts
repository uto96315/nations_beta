import type { TurnSummary } from "./types";
import type { DashboardMetric } from "./dashboardMetrics";

const KEY_HINTS: Partial<Record<string, string>> = {
  gdpGrowth: "景気・投資・外部要因が成長率に影響しました。",
  nationalSatisfaction: "物価、所得、公共服务のバランスが満足度に影響しました。",
  employmentRate: "公共事業・企業景況が雇用に影響しました。",
  inflation: "エネルギー価格や需要が物価に影響しました。",
  fiscalBalanceTrillion: "税率・歳出・公債発行が財政収支に影響しました。",
  nationalDebtTrillion: "赤字や国債発行が国債残高に影響しました。",
  gdpTrillion: "名目GDPの規模が、GDP比の指標の分母に影響しました。",
  birthRate: "子育て支援や生活不安が出生率に影響しました。",
  rulingPartySupport: "政策評価・政治情勢が支持率に影響しました。",
  governanceAbility: "党内結束や政策実行力が政権運営能力に影響しました。",
};

function metricSourceKeys(metric: DashboardMetric): string[] {
  switch (metric.id) {
    case "gdp":
      return ["gdpGrowth"];
    case "sat":
      return ["nationalSatisfaction"];
    case "unemp":
      return ["employmentRate"];
    case "inf":
      return ["inflation"];
    case "fiscal":
      return ["fiscalBalanceTrillion", "gdpTrillion"];
    case "debt":
      return ["nationalDebtTrillion", "gdpTrillion"];
    case "birth":
      return ["birthRate"];
    case "cab":
      return ["rulingPartySupport"];
    default:
      return [];
  }
}

export function explainMetricChange(
  metric: DashboardMetric,
  summary: TurnSummary | null | undefined,
): string[] {
  if (Math.abs(metric.delta) < 0.0001) {
    return ["前ターンから大きな変化はありません（ゲーム内推定）。"];
  }

  if (!summary) {
    return ["まだターン結果がありません。ターンを進めると要因が表示されます。"];
  }

  const lines: string[] = [];
  const changes = summary.indicatorChanges;

  if (summary.policyName) {
    lines.push(`実行した政策「${summary.policyName}」の影響が考えられます（推定）。`);
  } else if (summary.skipped) {
    lines.push("政策を選ばずにターンが経過しました。経済の自然動向が中心です。");
  }

  if (summary.eventTitle) {
    lines.push(`イベント「${summary.eventTitle}」の影響が残っている可能性があります。`);
  }

  for (const key of metricSourceKeys(metric)) {
    const raw = changes[key as keyof typeof changes];
    if (raw === undefined) continue;
    let note = KEY_HINTS[key];
    if (key === "employmentRate" && metric.id === "unemp") {
      note = "雇用率の変化が失業率に反映されています。";
      const dir = raw >= 0 ? "低下" : "上昇";
      lines.push(`${note}（雇用率が${raw >= 0 ? "上昇" : "低下"}し、失業率は${dir}）`);
      continue;
    }
    if (key === "gdpTrillion" && (metric.id === "fiscal" || metric.id === "debt")) {
      note = "GDP規模の変化により、GDP比の見え方が変わっています。";
    }
    if (!(key === "employmentRate" && metric.id === "unemp")) {
      const dir = raw >= 0 ? "上昇" : "低下";
      const text = note ?? KEY_HINTS[key] ?? "関連指標";
      lines.push(`${text}（直近ターンで${dir}）`);
    }
  }

  if (summary.newsHeadlines[0]) {
    lines.push(`関連ニュース：${summary.newsHeadlines[0]}`);
  }

  if (summary.warnings[0]) {
    lines.push(summary.warnings[0]);
  }

  if (lines.length === 0) {
    lines.push("予算構成や経済の自動更新が反映された可能性があります（ゲーム内推定）。");
  }

  return lines.slice(0, 4);
}
