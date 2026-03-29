import { Button } from "@/components/ui/button";

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }) {
  return (
    <div className="glass-panel rounded-[28px] border border-dashed border-line p-10 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white/6 text-accent-cyan">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="mt-5 font-display text-2xl font-semibold text-white">{title}</h3>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-400">{description}</p>
      {actionLabel && onAction ? (
        <Button className="mt-6" variant="accent" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
