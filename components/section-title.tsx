import { cn } from "@/lib/utils";

type SectionTitleProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  centered?: boolean;
  className?: string;
};

export function SectionTitle({
  eyebrow,
  title,
  description,
  centered = false,
  className,
}: SectionTitleProps) {
  return (
    <div className={cn("space-y-3", centered && "text-center", className)}>
      {eyebrow ? (
        <p className="inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="font-display text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl">
        {title}
      </h2>
      {description ? (
        <p className="max-w-3xl text-sm leading-relaxed text-slate-300 sm:text-base">
          {description}
        </p>
      ) : null}
    </div>
  );
}
