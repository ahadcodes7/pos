/**
 * The shared "soft filled" field look: tinted fill at rest, card fill with a violet border
 * and soft glow on focus. Used by Input, Textarea, SelectTrigger and the SearchableSelect
 * trigger so every field in the app looks the same. Tokens live in index.css.
 */
export const fieldVariants =
  "h-10 w-full rounded-field border border-transparent bg-field px-3.5 text-sm text-foreground outline-none transition-[background-color,border-color,box-shadow] hover:bg-field-hover placeholder:text-muted-foreground focus-visible:border-ring focus-visible:bg-card focus-visible:ring-[3px] focus-visible:ring-ring/20 aria-invalid:border-destructive aria-invalid:ring-destructive/15 disabled:cursor-not-allowed disabled:opacity-50";
