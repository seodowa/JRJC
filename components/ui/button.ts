/** Shared button class strings. Use with <button>, <a> or AsyncButton. */
const base =
  "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50";

const sizes = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-5 text-[15px]",
  lg: "h-14 px-7 text-base",
};

const variants = {
  primary: "bg-forest text-paper hover:bg-forest-hover",
  secondary: "border border-ink text-ink hover:bg-ink hover:text-paper",
  ghost: "text-ink hover:bg-gray-200",
  danger: "bg-red-600 text-paper hover:bg-red-700",
  link: "h-auto px-0 text-forest underline-offset-4 hover:underline",
};

export type ButtonVariant = keyof typeof variants;
export type ButtonSize = keyof typeof sizes;

export function buttonClass(variant: ButtonVariant = "primary", size: ButtonSize = "md", extra = "") {
  return [base, variant === "link" ? "" : sizes[size], variants[variant], extra].filter(Boolean).join(" ");
}
