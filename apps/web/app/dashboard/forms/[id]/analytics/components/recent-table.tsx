"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

interface RecentResponseField {
  fieldId: string;
  fieldLabel: string;
  value: string;
}

interface RecentResponse {
  id: string;
  submittedAt: string;
  fields: RecentResponseField[];
}

interface RecentTableProps {
  responses: RecentResponse[];
  isLoading?: boolean;
}

export function RecentTable({ responses, isLoading }: RecentTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!responses || responses.length === 0) return null;

  // Collect unique field labels from first response for column headers
  const columns = responses[0]?.fields.slice(0, 4).map((f) => f.fieldLabel) ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.56 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Recent Responses</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                  Submitted
                </th>
                {columns.map((col) => (
                  <th
                    key={col}
                    className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {responses.map((row, i) => (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25, delay: i === 0 ? 0 : 0 }}
                    className="border-b border-border/30 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(row.submittedAt), { addSuffix: true })}
                    </td>
                    {row.fields.slice(0, 4).map((f) => (
                      <td key={f.fieldId} className="px-4 py-3 max-w-[200px]">
                        <span className="truncate block" title={f.value}>
                          {f.value || <span className="text-muted-foreground italic">—</span>}
                        </span>
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </CardContent>
      </Card>
    </motion.div>
  );
}
