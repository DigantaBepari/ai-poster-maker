import type { LayoutConfig } from "../../types/shared.js";
export function defaultSuggestion(layout: LayoutConfig, occasion: string) {
  return {
    colorScheme: layout.colorScheme,
    photoCrop: [],
    decorations: occasion === "condolence" ? ["floral" as const] : [],
    subtitle:
      occasion === "condolence"
        ? "স্মরণে ও শ্রদ্ধায়"
        : "আপনার পাশে, আপনার সঙ্গে",
  };
}
