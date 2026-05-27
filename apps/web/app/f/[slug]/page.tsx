"use client";

import { type FormEvent, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { LockIcon, ArrowRightIcon, ArrowLeftIcon, CheckCircleIcon, ShieldIcon, EyeOffIcon } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import {
  useGetPublishedFormBySlug,
  useGetPublishedPagesBySlug,
  useSubmitPublicForm,
  useUnlockForm,
} from "~/hooks/api/form";

// ── Types ─────────────────────────────────────────────────────────────────────

type PublicForm = NonNullable<ReturnType<typeof useGetPublishedFormBySlug>["form"]>;
type PublicField = PublicForm["fields"][number];
type DateRangeValue = { start: string; end: string };

const getInputType = (type: PublicField["type"]) => {
  switch (type) {
    case "EMAIL": return "email";
    case "DATE": return "date";
    case "NUMBER": case "RATING": return "number";
    default: return "text";
  }
};

// ── Password Gate ─────────────────────────────────────────────────────────────

function PasswordGate({
  slug,
  formTitle,
  formDescription,
  onUnlock,
}: {
  slug: string;
  formTitle: string;
  formDescription: string | null;
  onUnlock: (token: string) => void;
}) {
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const { unlockFormAsync, isPending } = useUnlockForm();

  const handleUnlock = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!password.trim()) return;
    try {
      const { unlockToken } = await unlockFormAsync({ slug, password });
      onUnlock(unlockToken);
    } catch (err) {
      toast.error((err as Error).message ?? "Incorrect password");
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-8 px-6 py-16">
      {/* Lock icon */}
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-200 dark:border-amber-800 shadow-lg">
        <ShieldIcon className="h-10 w-10 text-amber-500" />
      </div>

      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">{formTitle}</h1>
        {formDescription && <p className="text-sm text-muted-foreground">{formDescription}</p>}
        <p className="text-sm text-muted-foreground/80 mt-3 flex items-center justify-center gap-1.5">
          <LockIcon className="h-3.5 w-3.5" />
          This form is password protected
        </p>
      </div>

      {/* Password form */}
      <form
        onSubmit={(e) => void handleUnlock(e)}
        className="w-full flex flex-col gap-4"
      >
        <div className="relative">
          <Input
            type={showPw ? "text" : "password"}
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isPending}
            className="pr-10 h-11 text-base"
            autoFocus
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <EyeOffIcon className="h-4 w-4" />
          </button>
        </div>
        <Button type="submit" disabled={isPending || !password.trim()} className="h-11 text-base">
          {isPending ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Unlocking...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <LockIcon className="h-4 w-4" />
              Unlock Form
            </span>
          )}
        </Button>
      </form>
    </div>
  );
}

// ── Form Field Renderer ───────────────────────────────────────────────────────

function FormField({
  field,
  value,
  isSubmitting,
  onChange,
}: {
  field: PublicField;
  value: string | string[] | DateRangeValue | undefined;
  isSubmitting: boolean;
  onChange: (val: string | string[] | DateRangeValue) => void;
}) {
  const inputId = `field-${field.id}`;
  const isCheckbox = field.type === "CHECKBOX";
  const isLongText = field.type === "LONG_TEXT";
  const isSingleSelect = field.type === "SINGLE_SELECT";
  const isMultiSelect = field.type === "MULTI_SELECT";
  const isDateRange = field.type === "DATE" && field.config?.mode === "range";
  const stringValue = typeof value === "string" ? value : "";
  const options = field.config?.options ?? [];
  const selected = Array.isArray(value) ? value : [];
  const rangeValue = typeof value === "object" && value !== null && !Array.isArray(value) ? value : { start: "", end: "" };
  const maxWords = field.config?.maxWords;
  const wordCount = stringValue.trim() ? stringValue.trim().split(/\s+/).length : 0;

  const control = isCheckbox ? (
    <div className="flex flex-col gap-2">
      {options.map((opt) => (
        <div key={opt} className="flex items-center gap-2">
          <Checkbox
            id={`${inputId}-${opt}`}
            checked={selected.includes(opt)}
            disabled={isSubmitting}
            onCheckedChange={(checked) =>
              onChange(checked ? [...selected, opt] : selected.filter((x) => x !== opt))
            }
          />
          <span className="text-sm text-muted-foreground">{opt}</span>
        </div>
      ))}
    </div>
  ) : isLongText ? (
    <div className="space-y-1">
      <Textarea
        id={inputId}
        name={field.labelKey}
        value={stringValue}
        placeholder={field.placeholder ?? undefined}
        disabled={isSubmitting}
        onChange={(e) => onChange(e.target.value)}
      />
      {maxWords && (
        <p className={`text-xs ${wordCount > maxWords ? "text-destructive" : "text-muted-foreground"}`}>
          {wordCount}/{maxWords} words
        </p>
      )}
    </div>
  ) : isSingleSelect ? (
    <Select value={stringValue} onValueChange={(v) => onChange(v)} disabled={isSubmitting}>
      <SelectTrigger>
        <SelectValue placeholder={field.placeholder ?? "Select option"} />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  ) : isMultiSelect ? (
    <Input
      id={inputId}
      name={field.labelKey}
      value={Array.isArray(value) ? value.join(", ") : stringValue}
      placeholder={field.placeholder ?? "Option A, Option B"}
      disabled={isSubmitting}
      onChange={(e) => onChange(e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
    />
  ) : isDateRange ? (
    <div className="grid grid-cols-2 gap-2">
      <Input
        type="date"
        value={rangeValue.start}
        disabled={isSubmitting}
        onChange={(e) => onChange({ ...rangeValue, start: e.target.value })}
      />
      <Input
        type="date"
        value={rangeValue.end}
        disabled={isSubmitting}
        onChange={(e) => onChange({ ...rangeValue, end: e.target.value })}
      />
    </div>
  ) : (
    <div className="space-y-1">
      <Input
        id={inputId}
        name={field.labelKey}
        type={getInputType(field.type)}
        value={stringValue}
        placeholder={field.placeholder ?? undefined}
        disabled={isSubmitting}
        onChange={(e) => onChange(e.target.value)}
      />
      {maxWords && (
        <p className={`text-xs ${wordCount > maxWords ? "text-destructive" : "text-muted-foreground"}`}>
          {wordCount}/{maxWords} words
        </p>
      )}
    </div>
  );

  return (
    <Field key={field.id}>
      <FieldLabel htmlFor={inputId}>
        {field.label}
        {field.isRequired && <span className="text-destructive"> *</span>}
      </FieldLabel>
      <FieldContent>
        {control}
        {field.description && <FieldDescription>{field.description}</FieldDescription>}
      </FieldContent>
    </Field>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function PublicFormPage() {
  const params = useParams<{ slug?: string }>();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  // Unlock token for password-protected forms (stored in component state — not localStorage intentionally)
  const [unlockToken, setUnlockToken] = useState<string | undefined>(undefined);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [fieldValues, setFieldValues] = useState<Record<string, string | string[] | DateRangeValue>>({});

  const { form, error, isLoading } = useGetPublishedFormBySlug(slug ?? "", unlockToken);
  const { submitPublicFormAsync, status: submitStatus } = useSubmitPublicForm();
  const isSubmitting = submitStatus === "pending";

  const { pages } = useGetPublishedPagesBySlug(slug ?? "");

  // ── Derive page-split fields ──────────────────────────────────────────────
  const pageGroups = useMemo(() => {
    if (!form?.fields) return [];
    if (!pages || pages.length === 0) {
      // Single page mode — all fields together
      return [{ id: "__single__", title: null, fields: form.fields }];
    }

    // Multi-page mode: group fields by page, then collect unassigned at end
    const grouped = pages.map((page) => ({
      id: page.id,
      title: page.title,
      fields: form.fields.filter((f) => f.pageId === page.id),
    }));

    const unassigned = form.fields.filter((f) => !f.pageId);
    if (unassigned.length > 0) {
      grouped.push({ id: "__unassigned__", title: "Other", fields: unassigned });
    }

    // Remove empty page groups
    return grouped.filter((g) => g.fields.length > 0);
  }, [form?.fields, pages]);

  const totalPages = pageGroups.length;
  const isLastPage = currentPageIndex === totalPages - 1;
  const isMultiPage = totalPages > 1;
  const currentGroup = pageGroups[currentPageIndex];

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleFieldChange = (fieldId: string, value: string | string[] | DateRangeValue) => {
    setFieldValues((prev) => ({ ...prev, [fieldId]: value }));
  };

  const buildSubmitValues = () => {
    if (!form) return [];
    const values: Array<{ fieldId: string; value: string | number | string[] | DateRangeValue }> = [];

    for (const field of form.fields) {
      if (field.type === "CHECKBOX") {
        values.push({ fieldId: field.id, value: Array.isArray(fieldValues[field.id]) ? (fieldValues[field.id] as string[]) : [] });
        continue;
      }
      if (field.type === "DATE" && field.config?.mode === "range") {
        const raw = fieldValues[field.id];
        if (!raw || typeof raw !== "object" || Array.isArray(raw)) continue;
        if (!raw.start || !raw.end) continue;
        values.push({ fieldId: field.id, value: raw as DateRangeValue });
        continue;
      }
      const rawValue = fieldValues[field.id];
      if (typeof rawValue !== "string") continue;
      const trimmed = rawValue.trim();
      if (!trimmed) continue;
      if ((field.type === "SHORT_TEXT" || field.type === "LONG_TEXT") && field.config?.maxWords) {
        const words = trimmed.split(/\s+/).filter(Boolean).length;
        if (words > field.config.maxWords) {
          toast.error(`${field.label} exceeds ${field.config.maxWords} words`);
          return [];
        }
      }

      if (field.type === "NUMBER" || field.type === "RATING") {
        const num = Number(trimmed);
        if (!Number.isFinite(num)) { toast.error(`${field.label} must be a valid number`); return []; }
        values.push({ fieldId: field.id, value: num });
        continue;
      }
      if (field.type === "MULTI_SELECT") {
        values.push({ fieldId: field.id, value: trimmed.split(",").map((s) => s.trim()).filter(Boolean) });
        continue;
      }
      if (field.type === "DATE" && Number.isNaN(new Date(trimmed).getTime())) {
        toast.error(`${field.label} must be a valid date`); return [];
      }
      values.push({ fieldId: field.id, value: trimmed });
    }
    return values;
  };

  const handleNext = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCurrentPageIndex((i) => Math.min(i + 1, totalPages - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form) return;
    const values = buildSubmitValues();
    if (!values.length && form.fields.length > 0) return; // error already toasted
    try {
      await submitPublicFormAsync({ formId: form.id, values });
      setIsSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      toast.error((err as { message?: string }).message ?? "Failed to submit form");
    }
  };

  // ── Loading / error states ────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-4 px-6 py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading form...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-6 py-16 text-center">
        <p className="text-sm text-destructive font-medium">Failed to load form.</p>
        <p className="text-xs text-muted-foreground">{(error as unknown as { message?: string }).message}</p>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-6 py-16 text-center">
        <p className="text-sm text-muted-foreground">Form not found.</p>
      </div>
    );
  }

  if (form.isClosed) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-6 py-16 text-center">
        <p className="text-sm font-medium">Form is closed.</p>
        <p className="text-xs text-muted-foreground">
          {form.closedReason === "EXPIRED" ? "This form has expired." : "Response limit has been reached."}
        </p>
      </div>
    );
  }

  // ── Password gate ─────────────────────────────────────────────────────────

  if (form.isPasswordProtected && !unlockToken) {
    return (
      <PasswordGate
        slug={slug ?? ""}
        formTitle={form.title}
        formDescription={form.description ?? null}
        onUnlock={setUnlockToken}
      />
    );
  }

  // ── Success state ─────────────────────────────────────────────────────────

  if (isSubmitted) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-6 px-6 py-20 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-50 dark:bg-green-950/30 border-2 border-green-200 dark:border-green-800 shadow-lg">
          <CheckCircleIcon className="h-10 w-10 text-green-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Response received!</h2>
          <p className="text-muted-foreground text-sm">Thank you for filling out <strong>{form.title}</strong>.</p>
        </div>
      </div>
    );
  }

  // ── Form render ───────────────────────────────────────────────────────────

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-6 py-10">
      {/* Header */}
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">{form.title}</h1>
        {form.description && <p className="text-sm text-muted-foreground">{form.description}</p>}
      </header>

      {/* Progress indicator (multi-page only) */}
      {isMultiPage && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-medium">{currentGroup?.title ?? `Step ${currentPageIndex + 1}`}</span>
            <span>{currentPageIndex + 1} / {totalPages}</span>
          </div>
          <div className="flex gap-1.5">
            {pageGroups.map((g, i) => (
              <div
                key={g.id}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  i <= currentPageIndex ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Field form */}
      <form
        className="space-y-8"
        onSubmit={isLastPage ? (e) => void handleSubmit(e) : (e) => void handleNext(e)}
      >
        <FieldGroup>
          {(currentGroup?.fields ?? []).map((field) => (
            <FormField
              key={field.id}
              field={field}
              value={fieldValues[field.id]}
              isSubmitting={isSubmitting}
              onChange={(val) => handleFieldChange(field.id, val)}
            />
          ))}
        </FieldGroup>

        <div className="flex items-center justify-between gap-4 pt-2">
          {isMultiPage && currentPageIndex > 0 ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setCurrentPageIndex((i) => Math.max(i - 1, 0));
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              disabled={isSubmitting}
            >
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Back
            </Button>
          ) : <div />}

          <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Submitting...
              </span>
            ) : isLastPage ? (
              "Submit"
            ) : (
              <span className="flex items-center gap-2">
                Next
                <ArrowRightIcon className="h-4 w-4" />
              </span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
