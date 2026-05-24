"use client";

import { type FormEvent, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";

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
import { Textarea } from "~/components/ui/textarea";
import { useGetPublicFormById, useSubmitPublicForm } from "~/hooks/api/form";

type PublicForm = NonNullable<ReturnType<typeof useGetPublicFormById>["form"]>;
type PublicField = PublicForm["fields"][number];

const getInputType = (type: PublicField["type"]) => {
	switch (type) {
		case "EMAIL":
			return "email";
		case "DATE":
			return "date";
		case "NUMBER":
		case "RATING":
			return "number";
		default:
			return "text";
	}
};

export default function PublicFormPage() {
	const params = useParams<{ form_id?: string }>();
	const formId = Array.isArray(params.form_id) ? params.form_id[0] : params.form_id;
	const [fieldValues, setFieldValues] = useState<Record<string, string | boolean | string[]>>({});

	const { form, error, isLoading, isFetching } = useGetPublicFormById(formId ?? "");
	const { submitPublicFormAsync, status: submitStatus } = useSubmitPublicForm();
	const isSubmitting = submitStatus === "pending";

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (!formId || !form) {
			return;
		}

		const values: Array<{ fieldId: string; value: string | number | boolean | string[] }> = [];

		for (const field of form.fields) {
			if (field.type === "CHECKBOX") {
				values.push({
					fieldId: field.id,
					value: Boolean(fieldValues[field.id]),
				});
				continue;
			}

			const rawValue = fieldValues[field.id];
			if (typeof rawValue !== "string") {
				continue;
			}

			const trimmedValue = rawValue.trim();
			if (trimmedValue.length === 0) {
				continue;
			}

			if (field.type === "NUMBER" || field.type === "RATING") {
				const parsedNumber = Number(trimmedValue);
				if (!Number.isFinite(parsedNumber)) {
					toast.error(`${field.label} must be a valid number`);
					return;
				}

				values.push({
					fieldId: field.id,
					value: parsedNumber,
				});
				continue;
			}

			if (field.type === "MULTI_SELECT") {
				const parsedValues = trimmedValue
					.split(",")
					.map((item) => item.trim())
					.filter(Boolean);

				values.push({
					fieldId: field.id,
					value: parsedValues,
				});
				continue;
			}

			if (field.type === "DATE") {
				if (Number.isNaN(new Date(trimmedValue).getTime())) {
					toast.error(`${field.label} must be a valid date`);
					return;
				}
			}

			values.push({
				fieldId: field.id,
				value: trimmedValue,
			});
		}

		try {
			await submitPublicFormAsync({ formId, values });
			toast.success("Form submitted successfully");
			setFieldValues({});
		} catch (submitError) {
			const message =
				submitError instanceof Error ? submitError.message : "Failed to submit form";
			toast.error(message);
		}
	};

	if (isLoading) {
		return (
			<div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-6 py-10">
				<p className="text-sm text-muted-foreground">Loading form...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-6 py-10">
				<p className="text-sm text-destructive">Failed to load form.</p>
			</div>
		);
	}

	if (!form) {
		return (
			<div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-6 py-10">
				<p className="text-sm text-muted-foreground">Form not found.</p>
			</div>
		);
	}

	return (
		<div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-6 py-10">
			<header className="space-y-2">
				<h1 className="text-2xl font-semibold tracking-tight">{form.title}</h1>
				{form.description ? (
					<p className="text-sm text-muted-foreground">{form.description}</p>
				) : null}
				{isFetching ? (
					<p className="text-xs text-muted-foreground">Refreshing...</p>
				) : null}
			</header>

			<form
				className="space-y-8"
				onSubmit={handleSubmit}
			>
					<FieldGroup>
						{form.fields.map((field) => {
							const inputId = `field-${field.id}`;
							const isCheckbox = field.type === "CHECKBOX";
							const isLongText = field.type === "LONG_TEXT";
							const rawFieldValue = fieldValues[field.id];
							const stringValue = typeof rawFieldValue === "string" ? rawFieldValue : "";
							const control = isCheckbox ? (
							<div className="flex items-center gap-2">
								<Checkbox
									id={inputId}
									name={field.labelKey}
									checked={Boolean(fieldValues[field.id])}
									disabled={isSubmitting}
									onCheckedChange={(checked) => {
										setFieldValues((prev) => ({
											...prev,
											[field.id]: Boolean(checked),
										}));
									}}
								/>
								<span className="text-sm text-muted-foreground">Yes</span>
							</div>
						) : isLongText ? (
							<Textarea
								id={inputId}
								name={field.labelKey}
								value={stringValue}
								placeholder={field.placeholder ?? undefined}
								disabled={isSubmitting}
								onChange={(event) => {
									setFieldValues((prev) => ({
										...prev,
										[field.id]: event.target.value,
									}));
								}}
							/>
						) : (
							<Input
								id={inputId}
								name={field.labelKey}
								type={getInputType(field.type)}
								value={stringValue}
								placeholder={field.placeholder ?? undefined}
								disabled={isSubmitting}
								onChange={(event) => {
									setFieldValues((prev) => ({
										...prev,
										[field.id]: event.target.value,
									}));
								}}
							/>
						);

						return (
							<Field key={field.id}>
								<FieldLabel htmlFor={inputId}>
									{field.label}
									{field.isRequired ? (
										<span className="text-destructive"> *</span>
									) : null}
								</FieldLabel>
								<FieldContent>
									{control}
									{field.description ? (
										<FieldDescription>{field.description}</FieldDescription>
									) : null}
								</FieldContent>
							</Field>
						);
					})}
				</FieldGroup>

				<div className="space-y-2">
					<Button type="submit" disabled={isSubmitting}>
						{isSubmitting ? "Submitting..." : "Submit"}
					</Button>
				</div>
			</form>
		</div>
	);
}
