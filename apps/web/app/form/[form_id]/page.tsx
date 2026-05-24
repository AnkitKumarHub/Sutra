"use client";

import { useParams } from "next/navigation";

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
import { useGetPublicFormById } from "~/hooks/api/form";

type PublicForm = NonNullable<ReturnType<typeof useGetPublicFormById>["form"]>;
type PublicField = PublicForm["fields"][number];

const getInputType = (type: PublicField["type"]) => {
	switch (type) {
		case "EMAIL":
			return "email";
		case "PASSWORD":
			return "password";
		case "NUMBER":
			return "number";
		default:
			return "text";
	}
};

export default function PublicFormPage() {
	const params = useParams<{ form_id?: string }>();
	const formId = Array.isArray(params.form_id) ? params.form_id[0] : params.form_id;

	const { form, error, isLoading, isFetching } = useGetPublicFormById(formId ?? "");

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
				onSubmit={(event) => {
					event.preventDefault();
				}}
			>
				<FieldGroup>
					{form.fields.map((field) => {
						const inputId = `field-${field.id}`;
						const isYesNo = field.type === "YES_NO";
						const control = isYesNo ? (
							<div className="flex items-center gap-2">
								<Checkbox
									id={inputId}
									name={field.labelKey}
									aria-required={field.isRequired}
								/>
								<span className="text-sm text-muted-foreground">Yes</span>
							</div>
						) : (
							<Input
								id={inputId}
								name={field.labelKey}
								type={getInputType(field.type)}
								placeholder={field.placeholder ?? undefined}
								required={field.isRequired}
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
					<Button type="submit">Submit</Button>
					<p className="text-sm text-muted-foreground">
						Submissions are not saved yet.
					</p>
				</div>
			</form>
		</div>
	);
}
