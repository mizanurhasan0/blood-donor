"use client";

import { CalendarClock, CircleAlert, CircleCheck, Minus, Plus, Siren, type LucideIcon } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import {
  Controller,
  useWatch,
  type Control,
  type UseFormRegister,
  type UseFormSetValue,
} from "react-hook-form";
import { SafetyNotice } from "@/components/shared/safety-notice";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Combobox } from "@/components/ui/combobox";
import { Checkbox, Field, Input, Textarea, describedBy } from "@/components/ui/field";
import { BLOOD_GROUPS } from "@/lib/constants/blood-groups";
import { DISTRICTS } from "@/lib/constants/locations";
import { LIMITS, type Urgency } from "@/lib/constants/site";
import { cn } from "@/lib/utils/cn";
import type { BloodRequestInput, BloodRequestValues } from "@/lib/validators/request";
import { useBloodRequestForm } from "../hooks/use-blood-request-form";
import { PrescriptionUpload } from "./prescription-upload";

type FormControl = Control<BloodRequestInput, unknown, BloodRequestValues>;
type Register = UseFormRegister<BloodRequestInput>;

const DISTRICT_OPTIONS = DISTRICTS.map((d) => ({ value: d.name, label: d.name, hint: d.division }));

// cn() doesn't merge conflicting utilities, so the border colour is passed separately.
const choiceClasses = (invalid: boolean) =>
  cn(
    "relative cursor-pointer rounded-button border bg-surface transition-colors hover:border-muted/60 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-brand",
    invalid ? "border-brand/60" : "border-outline",
  );

/** The patient-side "Post a blood request" form. All logic lives in useBloodRequestForm. */
export function BloodRequestForm({ viewerName }: { viewerName: string }) {
  const { form, onSubmit, onKeyDown, isPending, serverError, submitted, upload, dateRange } =
    useBloodRequestForm();
  const { register, control, setValue, formState } = form;
  const { errors } = formState;

  if (submitted) return <SuccessPanel />;

  const documentError = upload.state.status === "error" ? upload.state.message : errors.documentKey?.message;

  return (
    <form
      noValidate
      onSubmit={onSubmit}
      onKeyDown={onKeyDown}
      className="flex flex-col gap-6"
      aria-busy={isPending || undefined}
    >
      <p className="text-sm text-muted">
        Posting as <span className="font-medium text-foreground">{viewerName}</span>. Everything except the
        optional fields is required.
      </p>

      <Section title="Blood needed">
        <ChoiceGroup id="bloodGroup" legend="Blood group" error={errors.bloodGroup?.message}>
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {BLOOD_GROUPS.map((group) => (
              <label
                key={group}
                className={cn(
                  choiceClasses(!!errors.bloodGroup),
                  "flex min-h-14 items-center justify-center text-lg font-semibold tracking-tight has-checked:border-brand-strong has-checked:bg-brand-strong has-checked:shadow-glow",
                )}
              >
                <input type="radio" value={group} className="sr-only" {...register("bloodGroup")} />
                {group}
              </label>
            ))}
          </div>
        </ChoiceGroup>

        <div className="grid gap-5 sm:grid-cols-2">
          <UnitsStepper
            control={control}
            register={register}
            setValue={setValue}
            error={errors.units?.message}
          />
          <Field
            id="neededDate"
            label="Required date"
            error={errors.neededDate?.message}
            hint={`Today or within the next ${LIMITS.maxDaysAhead} days`}
          >
            <Input
              id="neededDate"
              type="date"
              min={dateRange.min}
              max={dateRange.max}
              aria-invalid={errors.neededDate ? true : undefined}
              aria-describedby={describedBy("neededDate", errors.neededDate?.message, true)}
              {...register("neededDate")}
            />
          </Field>
        </div>

        <UrgencyPicker register={register} error={errors.urgency?.message} />
      </Section>

      <Section title="Hospital & contact">
        <Field id="hospitalName" label="Hospital / institute name" error={errors.hospitalName?.message}>
          <Input
            id="hospitalName"
            autoCapitalize="words"
            enterKeyHint="next"
            placeholder="e.g. Dhaka Medical College Hospital"
            aria-invalid={errors.hospitalName ? true : undefined}
            aria-describedby={describedBy("hospitalName", errors.hospitalName?.message)}
            {...register("hospitalName")}
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Controller
            control={control}
            name="district"
            render={({ field, fieldState }) => (
              <Field id="district" label="District" error={fieldState.error?.message} hint="Type to search">
                {/* Combobox has no ref prop; hand RHF its input so focus-on-error works. */}
                <div ref={(el) => field.ref(el?.querySelector("input") ?? null)}>
                  <Combobox
                    id="district"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    options={DISTRICT_OPTIONS}
                    placeholder="Search districts…"
                    invalid={!!fieldState.error}
                    describedBy={describedBy("district", fieldState.error?.message, true)}
                  />
                </div>
              </Field>
            )}
          />
          <Field
            id="contactPhone"
            label="Contact phone"
            error={errors.contactPhone?.message}
            hint="Only shown to signed-in donors if you allow it"
          >
            <Input
              id="contactPhone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              enterKeyHint="next"
              placeholder="01XXXXXXXXX"
              aria-invalid={errors.contactPhone ? true : undefined}
              aria-describedby={describedBy("contactPhone", errors.contactPhone?.message, true)}
              {...register("contactPhone")}
            />
          </Field>
        </div>

        <Checkbox
          id="allowPhoneReveal"
          label="Let signed-in donors see my phone number"
          description="If you turn this off, donors can still reply in the request's comments."
          {...register("allowPhoneReveal")}
        />
      </Section>

      <Section title="More details">
        <DescriptionField control={control} register={register} error={errors.description?.message} />

        <Field
          id="document"
          label="Prescription or hospital document"
          optional
          error={documentError}
          hint="Optional, but encouraged: it helps moderators verify the request. It stays private unless you choose to share it."
        >
          <PrescriptionUpload
            id="document"
            controller={upload}
            invalid={!!documentError}
            describedBy={describedBy("document", documentError, true)}
          />
        </Field>

        <Checkbox
          id="shareDocumentWithDonors"
          label="Let signed-in donors view the document"
          description={
            upload.state.status === "done" ? "Moderators can always see it." : "Upload a document first."
          }
          disabled={upload.state.status !== "done"}
          className="has-disabled:cursor-not-allowed has-disabled:opacity-60"
          {...register("shareDocumentWithDonors")}
        />
      </Section>

      <SafetyNotice />

      {serverError && (
        <div
          role="alert"
          className="flex gap-3 rounded-card border border-brand/40 bg-brand/10 p-4 text-sm text-foreground"
        >
          <CircleAlert className="mt-0.5 size-5 shrink-0 text-brand-bright" aria-hidden="true" />
          <p>{serverError}</p>
        </div>
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted" aria-live="polite">
          {upload.isUploading
            ? "Wait for the document to finish uploading."
            : "A moderator reviews every request before it goes live."}
        </p>
        <Button
          type="submit"
          size="lg"
          pending={isPending}
          disabled={upload.isUploading}
          className="w-full sm:w-auto"
        >
          {isPending ? "Submitting…" : "Submit request"}
        </Button>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card className="flex flex-col gap-5 p-5 sm:p-6">
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
    </Card>
  );
}

/** Fieldset wrapper for native radio groups, wired like Field for errors. */
function ChoiceGroup({
  id,
  legend,
  error,
  children,
}: {
  id: string;
  legend: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <fieldset
      role="radiogroup"
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy(id, error)}
      className="flex min-w-0 flex-col gap-2"
    >
      <legend className="mb-1.5 text-sm font-medium text-foreground">{legend}</legend>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-sm text-brand-bright">
          {error}
        </p>
      )}
    </fieldset>
  );
}

const URGENCY_OPTIONS: { value: Urgency; label: string; description: string; icon: LucideIcon }[] = [
  { value: "urgent", label: "Urgent", description: "Needed as soon as possible", icon: Siren },
  {
    value: "normal",
    label: "Normal",
    description: "Planned, with time to arrange donors",
    icon: CalendarClock,
  },
];

function UrgencyPicker({ register, error }: { register: Register; error?: string }) {
  return (
    <ChoiceGroup id="urgency" legend="Urgency" error={error}>
      <div className="grid gap-3 sm:grid-cols-2">
        {URGENCY_OPTIONS.map(({ value, label, description, icon: Icon }) => (
          <label
            key={value}
            className={cn(
              choiceClasses(!!error),
              "flex min-h-16 items-center gap-3 p-4",
              value === "urgent"
                ? "has-checked:border-brand has-checked:bg-brand/10"
                : "has-checked:border-muted has-checked:bg-elevated",
            )}
          >
            <input
              type="radio"
              value={value}
              className="size-4 shrink-0 accent-brand focus-visible:outline-none"
              {...register("urgency")}
            />
            <Icon
              className={cn("size-5 shrink-0", value === "urgent" ? "text-brand-bright" : "text-muted")}
              aria-hidden="true"
            />
            <span className="flex flex-col">
              <span className={cn("font-medium", value === "urgent" && "text-brand-bright")}>{label}</span>
              <span className="text-xs text-muted">{description}</span>
            </span>
          </label>
        ))}
      </div>
    </ChoiceGroup>
  );
}

function UnitsStepper({
  control,
  register,
  setValue,
  error,
}: {
  control: FormControl;
  register: Register;
  setValue: UseFormSetValue<BloodRequestInput>;
  error?: string;
}) {
  const current = Number(useWatch({ control, name: "units" })) || 0;
  const step = (delta: number) =>
    setValue("units", Math.min(LIMITS.maxUnits, Math.max(1, current + delta)), {
      shouldValidate: true,
      shouldDirty: true,
    });
  const stepClasses =
    "grid size-11 shrink-0 place-items-center rounded-button border border-outline bg-surface text-foreground transition-colors hover:border-muted/60 disabled:opacity-40";

  return (
    <Field id="units" label="Units (bags)" error={error} hint={`1 to ${LIMITS.maxUnits}`}>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className={stepClasses}
          onClick={() => step(-1)}
          disabled={current <= 1}
          aria-controls="units"
        >
          <Minus className="size-4" aria-hidden="true" />
          <span className="sr-only">Fewer units</span>
        </button>
        <Input
          id="units"
          type="number"
          inputMode="numeric"
          min={1}
          max={LIMITS.maxUnits}
          step={1}
          enterKeyHint="next"
          className="text-center text-lg font-semibold tabular-nums"
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy("units", error, true)}
          {...register("units", { valueAsNumber: true })}
        />
        <button
          type="button"
          className={stepClasses}
          onClick={() => step(1)}
          disabled={current >= LIMITS.maxUnits}
          aria-controls="units"
        >
          <Plus className="size-4" aria-hidden="true" />
          <span className="sr-only">More units</span>
        </button>
      </div>
    </Field>
  );
}

function DescriptionField({
  control,
  register,
  error,
}: {
  control: FormControl;
  register: Register;
  error?: string;
}) {
  const length = (useWatch({ control, name: "description" }) ?? "").length;
  const max = LIMITS.descriptionMaxLength;
  const errorOrHint = describedBy("description", error, true);

  return (
    <Field
      id="description"
      label="Short description"
      optional
      error={error}
      hint="Patient's condition, ward or bed number, who to ask for at the hospital."
    >
      <Textarea
        id="description"
        rows={4}
        maxLength={max}
        aria-invalid={error ? true : undefined}
        aria-describedby={cn(errorOrHint, "description-count")}
        {...register("description")}
      />
      <p
        id="description-count"
        className={cn(
          "-mt-0.5 text-right text-xs tabular-nums",
          length >= max * 0.9 ? "text-warning" : "text-muted",
        )}
      >
        {length}/{max} characters
      </p>
    </Field>
  );
}

function SuccessPanel() {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <Card role="status" className="flex animate-fade-up flex-col items-center gap-4 p-6 text-center sm:p-10">
      <span className="grid size-14 place-items-center rounded-full bg-success/10 text-success">
        <CircleCheck className="size-7" aria-hidden="true" />
      </span>
      <h2 ref={headingRef} tabIndex={-1} className="text-2xl font-semibold tracking-tight focus:outline-none">
        Request submitted — waiting for review
      </h2>
      <p className="max-w-md text-muted">
        A moderator will check the details before your request goes live. Once it&apos;s approved, it appears
        on BloodLink and matching donors are notified by email and on our private Telegram channel. You can
        follow its status from your account.
      </p>
      <div className="mt-2 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <ButtonLink href="/account">View my requests</ButtonLink>
        <ButtonLink href="/requests" variant="secondary">
          Browse requests
        </ButtonLink>
      </div>
    </Card>
  );
}
