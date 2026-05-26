"use client";

import { formatDistanceToNow } from "date-fns";
import { IconX, IconStar, IconStarFilled, IconClock } from "@tabler/icons-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "~/components/ui/sheet";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";

interface ResponseField {
  fieldId: string;
  fieldLabel: string;
  value: string;
}

interface ResponseSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  response: {
    id: string;
    submittedAt: string;
    durationSeconds?: number;
    fields: ResponseField[];
  } | null;
  responseIndex?: number;
}

function formatDuration(seconds: number) {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

function FieldValue({ label, value }: { label: string; value: string }) {
  const isRating = /^[1-5]$/.test(value.trim());
  const ratingNum = isRating ? parseInt(value, 10) : null;

  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </p>
      {ratingNum !== null ? (
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) =>
            star <= ratingNum ? (
              <IconStarFilled key={star} className="size-4 text-amber-400" />
            ) : (
              <IconStar key={star} className="size-4 text-muted-foreground/30" />
            )
          )}
          <span className="ml-1 text-sm text-muted-foreground">{ratingNum}/5</span>
        </div>
      ) : value === "" ? (
        <p className="text-sm text-muted-foreground italic">—</p>
      ) : (
        <p className="text-sm break-words">{value}</p>
      )}
    </div>
  );
}

export function ResponseSheet({
  open,
  onOpenChange,
  response,
  responseIndex,
}: ResponseSheetProps) {
  if (!response) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col gap-0 p-0">
        {/* Header */}
        <SheetHeader className="px-5 py-4 border-b border-border/60 flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2 min-w-0">
            <SheetTitle className="text-base font-semibold">
              Response {responseIndex !== undefined ? `#${responseIndex}` : ""}
            </SheetTitle>
            <Badge variant="secondary" className="text-xs shrink-0">
              {formatDistanceToNow(new Date(response.submittedAt), { addSuffix: true })}
            </Badge>
          </div>
          <SheetClose className="rounded-sm opacity-70 hover:opacity-100 transition-opacity">
            <IconX className="size-4" />
            <span className="sr-only">Close</span>
          </SheetClose>
        </SheetHeader>

        {/* Meta row */}
        <div className="flex items-center gap-4 px-5 py-3 bg-muted/30 text-xs text-muted-foreground border-b border-border/40">
          <span>
            {new Date(response.submittedAt).toLocaleDateString(undefined, {
              weekday: "short",
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {response.durationSeconds !== undefined && response.durationSeconds > 0 && (
            <>
              <Separator orientation="vertical" className="h-3" />
              <span className="flex items-center gap-1">
                <IconClock className="size-3" />
                {formatDuration(response.durationSeconds)}
              </span>
            </>
          )}
        </div>

        {/* Fields */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          {response.fields.length === 0 ? (
            <p className="text-sm text-muted-foreground italic text-center py-8">
              No fields recorded for this response.
            </p>
          ) : (
            response.fields.map((field) => (
              <div key={field.fieldId}>
                <FieldValue label={field.fieldLabel} value={field.value} />
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
