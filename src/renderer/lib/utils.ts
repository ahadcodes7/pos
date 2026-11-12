import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// `rounded-field` is our own radius token (index.css); teach tailwind-merge it conflicts
// with `rounded-md` etc. so a caller's radius override wins instead of both applying.
const twMerge = extendTailwindMerge({
  extend: { classGroups: { rounded: [{ rounded: ["field"] }] } },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
