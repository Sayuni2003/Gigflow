import { cn } from "../../lib/utils";

const CategoryFilterBadge = ({ icon: Icon, label, active = false, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-bg-card text-text-secondary hover:border-primary hover:text-text-primary",
      )}
    >
      {Icon ? <Icon className="size-4" /> : null}
      {label}
    </button>
  );
};

export default CategoryFilterBadge;
