export type HistoryEntry = { id: string; expression: string; result: string };

const OPS = ["+", "−", "×", "÷"] as const;
export type Op = (typeof OPS)[number];

const toJsOp: Record<Op, string> = { "+": "+", "−": "-", "×": "*", "÷": "/" };

export function formatNumber(n: number): string {
  if (!isFinite(n)) return "Error";
  if (Math.abs(n) >= 1e15 || (Math.abs(n) < 1e-6 && n !== 0)) {
    return n.toExponential(6).replace(/\.?0+e/, "e");
  }
  const s = parseFloat(n.toPrecision(12)).toString();
  return s;
}

export function evalExpression(expr: string): number {
  // Replace display ops with JS ops
  let js = expr;
  for (const op of OPS) js = js.split(op).join(toJsOp[op]);
  js = js.replace(/%/g, "/100");
  // eslint-disable-next-line no-new-func
  const val = Function(`"use strict"; return (${js})`)();
  return Number(val);
}