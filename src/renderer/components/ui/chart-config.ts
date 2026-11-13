/** Recessive axis and grid defaults shared by every recharts chart. */
export const chartAxis = {
  tick: { fill: "var(--muted-foreground)", fontSize: 12 },
  tickLine: false,
  axisLine: false,
} as const;

export const chartGrid = {
  stroke: "var(--border)",
  strokeDasharray: "3 4",
  vertical: false,
} as const;
