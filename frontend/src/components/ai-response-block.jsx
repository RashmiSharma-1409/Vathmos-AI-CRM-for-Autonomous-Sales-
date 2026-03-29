import { CheckCheck, Copy, PencilLine } from "lucide-react";
import { Card } from "@/components/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export function AIResponseBlock({
  title,
  subtitle,
  content,
  badges = [],
  editableValue,
  onEditableChange,
  onCopy,
  copied,
  className = "",
}) {
  const isEditable = typeof editableValue === "string" && typeof onEditableChange === "function";

  return (
    <Card className={cn("h-full", className)}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-slate-500">AI Output</p>
          <h3 className="mt-2 font-display text-xl font-semibold text-white">{title}</h3>
          {subtitle ? <p className="mt-2 text-sm text-slate-400">{subtitle}</p> : null}
        </div>
        <div className="flex items-center gap-2">
          {badges.map((badge) => (
            <Badge key={badge.label} tone={badge.tone}>{badge.label}</Badge>
          ))}
          {onCopy ? (
            <Button variant="secondary" size="sm" onClick={onCopy}>
              {copied ? <CheckCheck className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          ) : null}
        </div>
      </div>

      <div className="mt-5 rounded-[24px] border border-line bg-slate-950/40 p-4">
        {isEditable ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-slate-500">
              <PencilLine className="h-4 w-4" />
              Editable version
            </div>
            <Textarea value={editableValue} onChange={(event) => onEditableChange(event.target.value)} />
          </div>
        ) : (
          <div className="prose-ai whitespace-pre-wrap text-sm leading-7 text-slate-200">{content || "No AI output yet."}</div>
        )}
      </div>
    </Card>
  );
}
