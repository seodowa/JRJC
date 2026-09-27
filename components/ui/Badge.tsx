import { ReactNode } from "react";

export type BadgeTone = "neutral" | "forest" | "ochre" | "brick" | "ink";

const tones: Record<BadgeTone, string> = {
  neutral: "border-line-strong bg-gray-200 text-ink-2",
  forest: "border-green-300 bg-forest-tint text-forest",
  ochre: "border-yellow-300 bg-yellow-100 text-yellow-700",
  brick: "border-red-300 bg-red-100 text-red-700",
  ink: "border-ink bg-ink text-paper",
};

/** Map a booking/car status label to a badge tone. */
export function toneForStatus(status?: string | null): BadgeTone {
  const s = (status ?? "").toLowerCase();
  if (/(cancel|declin|reject|maint|overdue|unpaid)/.test(s)) return "brick";
  if (/(pending|wait|review|upcoming)/.test(s)) return "ochre";
  if (/(confirm|approv|available|paid|complete|active|ongoing)/.test(s)) return "forest";
  return "neutral";
}

export default function Badge({ tone = "neutral", children, className = "" }: { tone?: BadgeTone; children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium ${tones[tone]} ${className}`}>
      {children}
    </span>
  );
}
