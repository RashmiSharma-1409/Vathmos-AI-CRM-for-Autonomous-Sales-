import { Badge } from "@/components/ui/badge";
import { getPriorityTone } from "@/lib/formatters";

export function StatusPill({ label, tone }) {
  return <Badge tone={tone || getPriorityTone(label)}>{label}</Badge>;
}
