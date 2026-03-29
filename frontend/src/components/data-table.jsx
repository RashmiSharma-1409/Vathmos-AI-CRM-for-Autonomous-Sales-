import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function DataTable({ columns, data, onRowClick, selectedKey, rowKey = "id", emptyLabel = "No records found." }) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-line bg-slate-950/30">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/5 text-left">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-5 py-4 text-xs font-medium uppercase tracking-[0.24em] text-slate-500">
                  {column.label}
                </th>
              ))}
              <th className="px-5 py-4" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {data.length ? (
              data.map((row) => {
                const key = row[rowKey];
                return (
                  <tr
                    key={key}
                    className={cn(
                      "cursor-pointer transition hover:bg-white/[0.03]",
                      selectedKey === key ? "bg-white/[0.05]" : "",
                    )}
                    onClick={() => onRowClick?.(row)}
                  >
                    {columns.map((column) => (
                      <td key={column.key} className="px-5 py-4 text-sm text-slate-200">
                        {column.render ? column.render(row) : row[column.key]}
                      </td>
                    ))}
                    <td className="px-5 py-4 text-right text-slate-500">
                      <ChevronRight className="ml-auto h-4 w-4" />
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td className="px-5 py-10 text-center text-sm text-slate-400" colSpan={columns.length + 1}>
                  {emptyLabel}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
