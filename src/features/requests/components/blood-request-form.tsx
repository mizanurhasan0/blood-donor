"use client";

import { CalendarClock, CircleAlert, CircleCheck, Minus, Plus, Siren, type LucideIcon } from "lucide-react";
import { useEffect, useMemo, useRef, type ReactNode } from "react";
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
import { formatNumber, interpolate, translate } from "@/lib/i18n/format";
import { useLocale, useT } from "@/lib/i18n/locale-context";
import { cn } from "@/lib/utils/cn";
import type { BloodRequestInput, BloodRequestValues } from "@/lib/validators/request";
import { useBloodRequestForm } from "../hooks/use-blood-request-form";
import { PrescriptionUpload } from "./prescription-upload";

type FormControl = Control<BloodRequestInput, unknown, BloodRequestValues>;
type Register = UseFormRegister<BloodRequestInput>;

// cn() doesn't merge conflicting utilities, so the border colour is passed separately.
const choiceClasses = (invalid: boolean) =>
  cn(
    "relative cursor-pointer rounded-button border bg-surface transition-colors hover:border-muted/60 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-brand",
    invalid ? "border-brand/60" : "border-outline",
  );

/** The patient-side "Post a blood request" form. All logic lives in useBloodRequestForm. */
export function BloodRequestForm({ viewerName }: { viewerName: string }) {
  const { lang, t } = useLocale();
  const copy = t.requestForm;
  const { form, onSubmit, onKeyDown, isPending, serverError, submitted, upload, dateRange } =
    useBloodRequestForm();
  const { register, control, setValue, formState } = form;
  const { errors } = formState;

  // Labels follow the language; the stored value stays the English district name.
  const districtOptions = useMemo(
    () =>
      DISTRICTS.map((d) => ({
        value: d.name,
        label: t.geo.districts[d.name],
        hint: t.geo.divisions[d.division],
      })),
    [t],
  );

  if (submitted) return <SuccessPanel />;

  // Schema and server errors arrive as message keys; translate them here.
  const message = (key?: string) => (key ? translate(t.feedback, key) : undefined);
  const documentError =
    upload.state.status === "error" ? upload.state.message : message(errors.documentKey?.message);
  const [beforeName, afterName = ""] = copy.postingAs.split("{name}");

  return (
    <form
      noValidate
      onSubmit={onSubmit}
      onKeyDown={onKeyDown}
      className="flex flex-col gap-6"
      aria-busy={isPending || undefined}
    >
      <p className="text-sm text-muted">
        {beforeName}
        <span className="font-medium text-foreground">{viewerName}</span>
        {afterName} {copy.requiredNote}
      </p>

      <Section title={copy.sections.blood}>
        <ChoiceGroup id="bloodGroup" legend={copy.bloodGroup} error={message(errors.bloodGroup?.message)}>
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
            error={message(errors.units?.message)}
          />
          <Field
            id="neededDate"
            label={copy.neededDate.label}
            error={message(errors.neededDate?.message)}
            hint={interpolate(copy.neededDate.hint, { days: formatNumber(LIMITS.maxDaysAhead, lang) })}
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

        <UrgencyPicker register={register} error={message(errors.urgency?.message)} />
      </Section>

      <Section title={copy.sections.hospital}>
        <Field id="hospitalName" label={copy.hospital.label} error={message(errors.hospitalName?.message)}>
          <Input
            id="hospitalName"
            autoCapitalize="words"
            enterKeyHint="next"
            placeholder={copy.hospital.placeholder}
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
              <Field
                id="district"
                label={copy.district.label}
                error={message(fieldState.error?.message)}
                hint={copy.district.hint}
              >
                {/* Combobox has no ref prop; hand RHF its input so focus-on-error works. */}
                <div ref={(el) => field.ref(el?.querySelector("input") ?? null)}>
                  <Combobox
                    id="district"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    options={districtOptions}
                    placeholder={copy.district.placeholder}
                    invalid={!!fieldState.error}
                    describedBy={describedBy("district", fieldState.error?.message, true)}
                  />
                </div>
              </Field>
            )}
          />
          <Field
            id="contactPhone"
            label={copy.phone.label}
            error={message(errors.contactPhone?.message)}
            hint={copy.phone.hint}
          >
            <Input
              id="contactPhone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              enterKeyHint="next"
              placeholder={copy.phone.placeholder}
              aria-invalid={errors.contactPhone ? true : undefined}
              aria-describedby={describedBy("contactPhone", errors.contactPhone?.message, true)}
              {...register("contactPhone")}
            />
          </Field>
        </div>

        <Checkbox
          id="allowPhoneReveal"
          label={copy.allowPhone.label}
          description={copy.allowPhone.description}
          {...register("allowPhoneReveal")}
        />
      </Section>

      <Section title={copy.sections.details}>
        <DescriptionField
          control={control}
          register={register}
          error={message(errors.description?.message)}
        />

        <Field
          id="document"
          label={copy.document.label}
          optional
          error={documentError}
          hint={copy.document.hint}
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
          label={copy.document.shareLabel}
          description={
            upload.state.status === "done" ? copy.document.shareReady : copy.document.shareNeedsUpload
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
          {upload.isUploading ? copy.footer.uploading : copy.footer.review}
        </p>
        <Button
          type="submit"
          size="lg"
          pending={isPending}
          disabled={upload.isUploading}
          className="w-full sm:w-auto"
        >
          {isPending ? copy.submitting : copy.submit}
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

/** Option order and icons only; the text comes from requestForm.urgency.options. */
const URGENCY_OPTIONS: { value: Urgency; icon: LucideIcon }[] = [
  { value: "urgent", icon: Siren },
  { value: "normal", icon: CalendarClock },
];

function UrgencyPicker({ register, error }: { register: Register; error?: string }) {
  const copy = useT().requestForm.urgency;
  return (
    <ChoiceGroup id="urgency" legend={copy.label} error={error}>
      <div className="grid gap-3 sm:grid-cols-2">
        {URGENCY_OPTIONS.map(({ value, icon: Icon }) => (
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
              <span className={cn("font-medium", value === "urgent" && "text-brand-bright")}>
                {copy.options[value].label}
              </span>
              <span className="text-xs text-muted">{copy.options[value].hint}</span>
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
  const { lang, t } = useLocale();
  const copy = t.requestForm.units;
  const current = Number(useWatch({ control, name: "units" })) || 0;
  const step = (delta: number) =>
    setValue("units", Math.min(LIMITS.maxUnits, Math.max(1, current + delta)), {
      shouldValidate: true,
      shouldDirty: true,
    });
  const stepClasses =
    "grid size-11 shrink-0 place-items-center rounded-button border border-outline bg-surface text-foreground transition-colors hover:border-muted/60 disabled:opacity-40";

  return (
    <Field
      id="units"
      label={copy.label}
      error={error}
      hint={interpolate(copy.hint, { min: formatNumber(1, lang), max: formatNumber(LIMITS.maxUnits, lang) })}
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          className={stepClasses}
          onClick={() => step(-1)}
          disabled={current <= 1}
          aria-controls="units"
        >
          <Minus className="size-4" aria-hidden="true" />
          <span className="sr-only">{copy.fewer}</span>
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
          <span className="sr-only">{copy.more}</span>
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
  const { lang, t } = useLocale();
  const copy = t.requestForm.description;
  const length = (useWatch({ control, name: "description" }) ?? "").length;
  const max = LIMITS.descriptionMaxLength;
  const errorOrHint = describedBy("description", error, true);

  return (
    <Field id="description" label={copy.label} optional error={error} hint={copy.hint}>
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
        {interpolate(copy.counter, { count: formatNumber(length, lang), max: formatNumber(max, lang) })}
      </p>
    </Field>
  );
}

function SuccessPanel() {
  const copy = useT().requestForm.success;
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
        {copy.title}
      </h2>
      <p className="max-w-md text-muted">{copy.body}</p>
      <div className="mt-2 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <ButtonLink href="/account">{copy.myRequests}</ButtonLink>
        <ButtonLink href="/requests" variant="secondary">
          {copy.browse}
        </ButtonLink>
      </div>
    </Card>
  );
}
