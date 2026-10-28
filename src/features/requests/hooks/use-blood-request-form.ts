"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useRef, useState, useTransition, type KeyboardEvent } from "react";
import { useForm } from "react-hook-form";
import { LIMITS } from "@/lib/constants/site";
import { formatNumber, interpolate, translate } from "@/lib/i18n/format";
import { useLocale, useT } from "@/lib/i18n/locale-context";
import type { ClientDictionary } from "@/lib/i18n/messages";
import { addDays, todayInBangladesh } from "@/lib/utils/dates";
import {
  bloodRequestSchema,
  type BloodRequestInput,
  type BloodRequestValues,
} from "@/lib/validators/request";
import { ALLOWED_DOCUMENT_TYPES } from "@/features/storage/file-validation";
import { createRequestAction } from "../actions";

const UPLOAD_URL = "/api/uploads/prescription";
const ALLOWED_EXTENSIONS = /\.(jpe?g|png|webp|pdf)$/i;
export const MAX_DOCUMENT_MB = Math.round(LIMITS.documentMaxBytes / (1024 * 1024));

type UploadErrors = ClientDictionary["requestForm"]["document"]["errors"];

export type UploadState =
  | { status: "idle" }
  | { status: "uploading"; name: string; size: number; progress: number }
  | { status: "done"; name: string; size: number }
  | { status: "error"; message: string };

interface UploadResponse {
  key?: string;
  name?: string;
  size?: number;
  error?: string;
}

/** Fast client-side feedback only; the server re-validates the real file contents. */
function precheck(file: File, errors: UploadErrors, tooLarge: string): string | null {
  if (file.size === 0) return errors.empty;
  if (file.size > LIMITS.documentMaxBytes) return tooLarge;
  const knownType = file.type ? file.type in ALLOWED_DOCUMENT_TYPES : ALLOWED_EXTENSIONS.test(file.name);
  return knownType ? null : errors.unsupported;
}

/** The server sends a message key in `error`; the status code is the fallback. */
function failureMessage(
  xhr: XMLHttpRequest,
  body: UploadResponse | null,
  t: ClientDictionary,
  tooLarge: string,
): string {
  if (body?.error) return translate(t.feedback, body.error);
  if (xhr.status === 401) return t.requestForm.document.errors.sessionExpired;
  if (xhr.status === 413) return tooLarge;
  return t.requestForm.document.errors.failed;
}

/** XHR (not fetch) so the browser reports real upload progress. */
export function usePrescriptionUpload(onKeyChange: (key: string | undefined) => void) {
  const { lang, t } = useLocale();
  const errors = t.requestForm.document.errors;
  const tooLarge = interpolate(errors.tooLarge, { max: formatNumber(MAX_DOCUMENT_MB, lang) });
  const [state, setState] = useState<UploadState>({ status: "idle" });
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  const abort = useCallback(() => {
    xhrRef.current?.abort();
    xhrRef.current = null;
  }, []);

  useEffect(() => abort, [abort]);

  const remove = useCallback(() => {
    abort();
    setState({ status: "idle" });
    onKeyChange(undefined);
  }, [abort, onKeyChange]);

  const upload = useCallback(
    (file: File) => {
      abort();
      onKeyChange(undefined);
      const problem = precheck(file, errors, tooLarge);
      if (problem) {
        setState({ status: "error", message: problem });
        return;
      }

      const xhr = new XMLHttpRequest();
      xhrRef.current = xhr;
      setState({ status: "uploading", name: file.name, size: file.size, progress: 0 });

      xhr.upload.addEventListener("progress", (event) => {
        if (!event.lengthComputable) return;
        const progress = Math.round((event.loaded / event.total) * 100);
        setState((s) => (s.status === "uploading" ? { ...s, progress } : s));
      });
      xhr.addEventListener("load", () => {
        xhrRef.current = null;
        const body = xhr.response as UploadResponse | null;
        if (xhr.status >= 200 && xhr.status < 300 && body?.key) {
          setState({ status: "done", name: body.name ?? file.name, size: body.size ?? file.size });
          onKeyChange(body.key);
        } else {
          setState({ status: "error", message: failureMessage(xhr, body, t, tooLarge) });
        }
      });
      xhr.addEventListener("error", () => {
        xhrRef.current = null;
        setState({ status: "error", message: errors.network });
      });

      xhr.open("POST", UPLOAD_URL);
      xhr.responseType = "json";
      const data = new FormData();
      data.append("file", file);
      xhr.send(data);
    },
    [abort, errors, onKeyChange, t, tooLarge],
  );

  return { state, upload, remove, isUploading: state.status === "uploading" };
}

export type PrescriptionUploadController = ReturnType<typeof usePrescriptionUpload>;

const TEXT_CONTROLS =
  "input:not([type=radio],[type=checkbox],[type=file],[type=hidden]):not(:disabled), textarea";

/** Makes the mobile keyboard's "Next" key move to the next field instead of submitting the form early. */
export function focusNextOnEnter(event: KeyboardEvent<HTMLFormElement>) {
  const target = event.target;
  if (event.key !== "Enter" || event.defaultPrevented) return;
  if (!(target instanceof HTMLInputElement) || target.enterKeyHint !== "next") return;
  event.preventDefault();
  const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>(TEXT_CONTROLS));
  controls[controls.indexOf(target) + 1]?.focus();
}

const DEFAULT_VALUES: Partial<BloodRequestInput> = {
  units: 1,
  urgency: "normal",
  hospitalName: "",
  district: undefined,
  neededDate: "",
  contactPhone: "",
  description: "",
  allowPhoneReveal: true,
  shareDocumentWithDonors: false,
  documentKey: undefined,
};

const FIELD_NAMES = Object.keys(bloodRequestSchema.shape) as (keyof BloodRequestInput)[];

function isFieldName(name: string): name is keyof BloodRequestInput {
  return (FIELD_NAMES as string[]).includes(name);
}

/** Form state, document upload and submission for the "Post a blood request" page. */
export function useBloodRequestForm() {
  const t = useT();
  const form = useForm<BloodRequestInput, unknown, BloodRequestValues>({
    resolver: zodResolver(bloodRequestSchema),
    defaultValues: DEFAULT_VALUES,
    mode: "onTouched",
    shouldFocusError: true,
  });
  const { setValue, clearErrors, setError, handleSubmit } = form;

  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  // Computed once on mount; only bounds the picker, the schema re-checks on submit.
  const [dateRange] = useState(() => {
    const min = todayInBangladesh();
    return { min, max: addDays(min, LIMITS.maxDaysAhead) };
  });

  const setDocumentKey = useCallback(
    (key: string | undefined) => {
      setValue("documentKey", key, { shouldDirty: true });
      clearErrors("documentKey");
      if (!key) setValue("shareDocumentWithDonors", false);
    },
    [setValue, clearErrors],
  );
  const upload = usePrescriptionUpload(setDocumentKey);

  const applyFieldErrors = (fieldErrors: Record<string, string[]> | undefined) => {
    let focused = false;
    for (const [name, messages] of Object.entries(fieldErrors ?? {})) {
      if (!isFieldName(name) || !messages?.[0]) continue;
      setError(
        name,
        { type: "server", message: translate(t.feedback, messages[0]) },
        { shouldFocus: !focused },
      );
      focused = true;
    }
  };

  const onSubmit = handleSubmit((values) => {
    if (upload.isUploading || isPending) return;
    setServerError(null);
    startTransition(async () => {
      try {
        const result = await createRequestAction(values);
        if (result.ok) {
          setSubmitted(true);
          return;
        }
        setServerError(translate(t.feedback, result.error));
        applyFieldErrors(result.fieldErrors);
      } catch {
        setServerError(t.requestForm.networkError);
      }
    });
  });

  return {
    form,
    onSubmit,
    onKeyDown: focusNextOnEnter,
    isPending,
    serverError,
    submitted,
    upload,
    dateRange,
  };
}
