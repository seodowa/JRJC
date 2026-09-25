import { ReactNode } from "react";

interface SectionHeaderProps {
  index: string;
  label: string;
  title: ReactNode;
  children?: ReactNode;
}

/** Numbered eyebrow + serif heading, separated from the section above by an ink rule. */
export default function SectionHeader({ index, label, title, children }: SectionHeaderProps) {
  return (
    <div className="grid grid-cols-1 gap-4 border-t border-ink pt-6 md:grid-cols-12 md:items-end md:gap-6">
      <div className="eyebrow md:col-span-2 md:self-start">
        {index} — {label}
      </div>
      <h2 className="text-4xl leading-none sm:text-5xl md:col-span-6 md:text-[3.5rem]">{title}</h2>
      {children && <div className="md:col-span-4 md:flex md:justify-end">{children}</div>}
    </div>
  );
}
