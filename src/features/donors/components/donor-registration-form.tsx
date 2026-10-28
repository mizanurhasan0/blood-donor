"use client";

import { CircleCheck, Pencil } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Controller, useWatch } from "react-hook-form";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Combobox } from "@/components/ui/combobox";
import { Checkbox, Field, Input, describedBy } from "@/components/ui/field";
import { BLOOD_GROUPS } from "@/lib/constants/blood-groups";
import { DISTRICTS, divisionOf, isDistrict } from "@/lib/constants/locations";
import { formatNumber, interpolate, translate } from "@/lib/i18n/format";
import { useLocale, useT } from "@/lib/i18n/locale-context";
import { cn } from "@/lib/utils/cn";
import type { DonorProfileInput } from "@/lib/validators/donor";
import { useDonorRegistration } from "../hooks/use-donor-registration";

interface DonorRegistrationFormProps {
  mode?: "register" | "edit";
  initialValues?: Partial<DonorProfileInput>;
  /** Register mode: the viewer already had a donor profile when the page rendered. */
  registered?: boolean;
  /** Register mode: Telegram card shown with the confirmation. */
  telegram?: ReactNode;
  onSaved?: () => void;
  onCancel?: () => void;
}

export function DonorRegistrationForm({
  mode = "register",
  initialValues,
  registered = false,
  telegram,
  onSaved,
  onCancel,
}: DonorRegistrationFormProps) {
  const { lang, t } = useLocale();
  const { form, onSubmit, isPending, formError, saved } = useDonorRegistration(initialValues, onSaved);
  const { register, control, formState, setFocus } = form;
  const { errors } = formState;
  // Saving refreshes the page, so `registered` can flip to true before `saved` does.
  const [registeredOnMount] = useState(registered);
  const district = useWatch({ control, name: "district" });
  const division = isDistrict(district) ? divisionOf(district) : null;
  const districtOptions = useMemo(
    () =>
      DISTRICTS.map((d) => ({
        value: d.name,
        label: t.geo.districts[d.name],
        hint: t.geo.divisions[d.division],
      })),
    [t],
  );
  const copy = t.donor.form;
  /** Field errors are validation keys from the schema, shown in the visitor's language. */
  const fieldError = (message?: string) => (message ? translate(t.feedback, message) : undefined);

  useEffect(() => {
    if (mode === "edit") setFocus("fullName");
  }, [mode, setFocus]);

  if (mode === "register" && registeredOnMount) {
    return <RegisteredView title={copy.alreadyTitle} description={copy.alreadyText} telegram={telegram} />;
  }
  if (mode === "register" && (saved || registered)) {
    return (
      <RegisteredView
        announce
        title={copy.registeredTitle}
        description={form.getValues("emailNotifications") ? copy.registeredEmailOn : copy.registeredEmailOff}
        telegram={telegram}
      />
    );
  }

  const body = (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      <Field id="donor-name" label={copy.fullName} error={fieldError(errors.fullName?.message)}>
        <Input
          id="donor-name"
          autoComplete="name"
          aria-invalid={errors.fullName ? true : undefined}
          aria-describedby={describedBy("donor-name", errors.fullName?.message)}
          {...register("fullName")}
        />
      </Field>

      <fieldset>
        <legend className="text-sm font-medium">{copy.bloodGroup}</legend>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {BLOOD_GROUPS.map((group) => (
            <label key={group} className="cursor-pointer">
              <input
                type="radio"
                value={group}
                className="peer sr-only"
                aria-describedby={errors.bloodGroup ? "donor-group-error" : undefined}
                {...register("bloodGroup")}
              />
              <span className="flex min-h-12 items-center justify-center rounded-button border border-outline bg-surface text-lg font-semibold transition-colors peer-checked:border-brand-strong peer-checked:bg-brand-strong peer-checked:text-foreground peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand hover:border-muted">
                {group}
              </span>
            </label>
          ))}
        </div>
        {errors.bloodGroup && (
          <p id="donor-group-error" role="alert" className="mt-1.5 text-sm text-brand-bright">
            {fieldError(errors.bloodGroup.message)}
          </p>
        )}
      </fieldset>

      <div className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_11rem]">
        <Field
          id="donor-district"
          label={copy.district}
          error={fieldError(errors.district?.message)}
          hint={interpolate(copy.districtHint, { count: formatNumber(DISTRICTS.length, lang) })}
        >
          <Controller
            control={control}
            name="district"
            render={({ field, fieldState }) => (
              <Combobox
                id="donor-district"
                value={field.value ?? ""}
                onChange={field.onChange}
                onBlur={field.onBlur}
                options={districtOptions}
                placeholder={copy.districtPlaceholder}
                invalid={fieldState.invalid}
                describedBy={describedBy("donor-district", fieldState.error?.message, true)}
              />
            )}
          />
        </Field>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="donor-division" className="text-sm font-medium">
            {copy.division}
          </label>
          <output
            id="donor-division"
            htmlFor="donor-district"
            className="flex min-h-11 items-center rounded-button border border-dashed border-outline px-3.5 text-sm text-muted"
          >
            {division ? t.geo.divisions[division] : copy.divisionAuto}
          </output>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field
          id="donor-area"
          label={copy.area}
          optional
          error={fieldError(errors.area?.message)}
          hint={copy.areaHint}
        >
          <Input
            id="donor-area"
            placeholder={copy.areaPlaceholder}
            autoComplete="address-level3"
            aria-invalid={errors.area ? true : undefined}
            aria-describedby={describedBy("donor-area", errors.area?.message, true)}
            {...register("area")}
          />
        </Field>
        <Field
          id="donor-phone"
          label={copy.phone}
          optional
          error={fieldError(errors.phone?.message)}
          hint={copy.phoneHint}
        >
          <Input
            id="donor-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            placeholder={copy.phonePlaceholder}
            aria-invalid={errors.phone ? true : undefined}
            aria-describedby={describedBy("donor-phone", errors.phone?.message, true)}
            {...register("phone")}
          />
        </Field>
      </div>

      <div className="flex flex-col gap-2 rounded-card border border-outline/70 bg-surface/60 p-4">
        <Checkbox
          id="donor-available"
          className="min-h-11"
          label={copy.available}
          description={copy.availableHint}
          {...register("available")}
        />
        <Checkbox
          id="donor-email"
          className="min-h-11"
          label={copy.emailOptIn}
          description={copy.emailOptInHint}
          {...register("emailNotifications")}
        />
      </div>

      {formError && (
        <p role="alert" className="rounded-button border border-brand/40 bg-brand/10 px-4 py-3 text-sm">
          {translate(t.feedback, formError)}
        </p>
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
        {onCancel && (
          <Button variant="ghost" onClick={onCancel} disabled={isPending}>
            {t.common.cancel}
          </Button>
        )}
        <Button type="submit" size="lg" pending={isPending}>
          {mode === "edit" ? copy.saveChanges : copy.register}
        </Button>
      </div>
    </form>
  );

  if (mode === "edit") return body;
  return (
    <Card className="flex flex-col gap-6 p-5 sm:p-8">
      <div className="flex flex-col gap-1.5">
        <h2 className="text-xl font-semibold">{copy.title}</h2>
        <p className="text-sm text-muted">{copy.intro}</p>
      </div>
      {body}
    </Card>
  );
}

function RegisteredView({
  title,
  description,
  telegram,
  announce = false,
}: {
  title: string;
  description: string;
  telegram?: ReactNode;
  announce?: boolean;
}) {
  const t = useT();
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (announce) heading.current?.focus();
  }, [announce]);

  return (
    <div className="flex flex-col gap-6">
      <Card
        role={announce ? "status" : undefined}
        className="flex animate-fade-in flex-col items-center gap-3 p-6 text-center sm:p-8"
      >
        <span className="grid size-14 place-items-center rounded-full bg-success/10 text-success">
          <CircleCheck className="size-7" aria-hidden="true" />
        </span>
        <h2 ref={heading} tabIndex={-1} className="text-xl font-semibold outline-none">
          {title}
        </h2>
        <p className="max-w-md text-sm text-muted">{description}</p>
        <div className="mt-2 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <ButtonLink href="/requests">{t.donor.form.seeRequests}</ButtonLink>
          <ButtonLink href="/account" variant="secondary">
            {t.donor.form.manageProfile}
          </ButtonLink>
        </div>
      </Card>
      {telegram}
    </div>
  );
}

/** Account page: shows the profile card with an "Edit profile" toggle to the same form. */
export function DonorProfileEditor({
  card,
  initialValues,
}: {
  card: ReactNode;
  initialValues: DonorProfileInput;
}) {
  const { t } = useLocale();
  const [editing, setEditing] = useState(false);
  const [notice, setNotice] = useState("");
  const editButton = useRef<HTMLButtonElement>(null);
  const wasEditing = useRef(false);

  useEffect(() => {
    if (wasEditing.current && !editing) editButton.current?.focus();
    wasEditing.current = editing;
  }, [editing]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="profile-heading" className="text-xl font-semibold">
          {t.account.donorProfile}
        </h2>
        {!editing && (
          <Button
            ref={editButton}
            variant="secondary"
            onClick={() => {
              setNotice("");
              setEditing(true);
            }}
          >
            <Pencil className="size-4" aria-hidden="true" />
            {t.account.editProfile}
          </Button>
        )}
      </div>
      <p role="status" className={cn("text-sm text-success", !notice && "sr-only")}>
        {notice}
      </p>
      {editing ? (
        <Card className="p-5 sm:p-6">
          <DonorRegistrationForm
            mode="edit"
            initialValues={initialValues}
            onSaved={() => {
              setEditing(false);
              setNotice(t.account.profileUpdated);
            }}
            onCancel={() => setEditing(false)}
          />
        </Card>
      ) : (
        card
      )}
    </div>
  );
}
