import { cn } from "../../lib/utils";

type PreloaderProps = {
  loading?: boolean;
  title?: string;
  description?: string;
  className?: string;
  compact?: boolean;
};

export function Preloader({
  loading = true,
  title = "Loading products",
  description = "Fetching the latest catalog items.",
  className,
  compact = false,
}: PreloaderProps) {
  if (!loading) {
    return null;
  }

  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className={cn(
        compact
          ? "flex w-full items-center justify-center py-8"
          : "relative flex min-h-[22rem] w-full items-center justify-center overflow-hidden rounded-[2rem] border border-border bg-card px-6 py-16 shadow-[0_20px_60px_rgba(15,23,42,0.08)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]",
        className,
      )}
    >
      <div
        className={cn(
          "relative z-10 flex flex-col items-center text-center",
          compact ? "gap-3" : "gap-5",
        )}
      >
        <div
          className={cn(
            "relative rounded-full border border-border bg-background/70 p-4 shadow-sm backdrop-blur-sm dark:bg-background/40",
            compact && "p-3",
          )}
        >
          <div
            className={cn(
              "relative rounded-full border-[3px] border-border/70 dark:border-border/40",
              compact ? "h-8 w-8" : "h-12 w-12",
            )}
          />
          {/* Inner orbit — purple dot, clockwise */}
          <div
            className={cn(
              "absolute inset-0 rounded-full motion-reduce:animate-none",
              compact ? "m-3" : "m-4",
            )}
            style={{ animation: "rb-orbit 1.2s linear infinite" }}
          >
            <span
              className={cn(
                "absolute left-1/2 top-0 -translate-x-1/2 rounded-full bg-purple-600 shadow-[0_0_14px_rgba(168,85,247,0.45)]",
                compact ? "h-2 w-2" : "h-2.5 w-2.5",
              )}
            />
          </div>

          {/* Outer orbit — cyan dot, counter-clockwise */}
          <div
            className="absolute inset-0 rounded-full motion-reduce:animate-none"
            style={{ animation: "rb-orbit 2s linear infinite reverse" }}
          >
            <span
              className={cn(
                "absolute left-1/2 top-0 -translate-x-1/2 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.5)]",
                compact ? "h-1.5 w-1.5" : "h-2 w-2",
              )}
            />
          </div>
        </div>

        <div className="space-y-1">
          <h2
            className={cn(
              "font-semibold text-foreground",
              compact ? "text-sm" : "text-2xl",
            )}
          >
            {title}
          </h2>
          {!compact && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
