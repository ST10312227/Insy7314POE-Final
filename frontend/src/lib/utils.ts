// filepath: src/lib/utils.ts
// Utility to combine class names
export function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(" ");
}