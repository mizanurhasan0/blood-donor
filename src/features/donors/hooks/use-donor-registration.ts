"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { donorProfileSchema } from "@/lib/validators/donor";
import { saveDonorProfileAction } from "../actions";

type FormInput = z.input<typeof donorProfileSchema>;
type FormOutput = z.output<typeof donorProfileSchema>;

const FIELDS = [
  "fullName",
  "bloodGroup",
  "district",
  "area",
  "phone",
  "available",
  "emailNotifications",
] as const satisfies readonly (keyof FormInput)[];

function isField(name: string): name is (typeof FIELDS)[number] {
  return (FIELDS as readonly string[]).includes(name);
}

/** Donor profile form state: client validation, submission in a transition and server error mapping. */
export function useDonorRegistration(initialValues?: Partial<FormInput>, onSaved?: () => void) {
  const form = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(donorProfileSchema),
    mode: "onTouched",
    defaultValues: {
      fullName: "",
      area: "",
      phone: "",
      available: true,
      emailNotifications: true,
      ...initialValues,
    },
  });
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const onSubmit = form.handleSubmit((values) => {
    setFormError(null);
    startTransition(async () => {
      const result = await saveDonorProfileAction(values);
      if (result.ok) {
        setSaved(true);
        onSaved?.();
        return;
      }
      setFormError(result.error);
      let focused = false;
      for (const [name, messages] of Object.entries(result.fieldErrors ?? {})) {
        const message = messages?.[0];
        if (!isField(name) || !message) continue;
        form.setError(name, { message }, { shouldFocus: !focused });
        focused = true;
      }
    });
  });

  return { form, onSubmit, isPending, formError, saved };
}
