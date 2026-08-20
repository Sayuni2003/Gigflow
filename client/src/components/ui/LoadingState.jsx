import { cn } from "@/lib/utils";

const SIZE_CLASSES = {
  sm: "size-5 border-2",
  md: "size-8 border-[3px]",
  lg: "size-12 border-4",
};

const LoadingState = ({ label = "Loading...", size = "md", fullScreen = false }) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex flex-col items-center justify-center gap-3 text-text-muted",
        fullScreen ? "min-h-[60vh]" : "py-12",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "animate-spin rounded-full border-primary-soft border-t-primary",
          SIZE_CLASSES[size] || SIZE_CLASSES.md,
        )}
      />
      {label ? <p className="text-sm">{label}</p> : null}
    </div>
  );
};

export default LoadingState;
