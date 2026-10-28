"use client";

import { CircleCheck, CloudUpload, FileText } from "lucide-react";
import { useRef, useState, type ChangeEvent, type DragEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/lib/i18n/config";
import { formatNumber, interpolate } from "@/lib/i18n/format";
import { useLocale } from "@/lib/i18n/locale-context";
import type { ClientDictionary } from "@/lib/i18n/messages";
import { cn } from "@/lib/utils/cn";
import { ACCEPT_ATTRIBUTE } from "@/features/storage/file-validation";
import { MAX_DOCUMENT_MB, type PrescriptionUploadController } from "../hooks/use-blood-request-form";

type SizeLabels = ClientDictionary["requestForm"]["document"]["size"];

function formatBytes(bytes: number, lang: Locale, labels: SizeLabels): string {
  if (bytes < 1024) return interpolate(labels.bytes, { value: formatNumber(bytes, lang) });
  if (bytes < 1024 * 1024) {
    return interpolate(labels.kilobytes, { value: formatNumber(Math.round(bytes / 1024), lang) });
  }
  const megabytes = Number((bytes / (1024 * 1024)).toFixed(1));
  return interpolate(labels.megabytes, { value: formatNumber(megabytes, lang) });
}

interface PrescriptionUploadProps {
  id: string;
  controller: PrescriptionUploadController;
  invalid?: boolean;
  describedBy?: string;
}

/** Dashed dropzone over a real file input, so it works with tap, click, keyboard and drag-and-drop. */
export function PrescriptionUpload({ id, controller, invalid, describedBy }: PrescriptionUploadProps) {
  const { lang, t } = useLocale();
  const copy = t.requestForm.document;
  const { state, upload, remove } = controller;
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const showDropzone = state.status === "idle" || state.status === "error";

  function onChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ""; // lets the same file be picked again after removing it
    if (file) upload(file);
  }

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) upload(file);
  }

  return (
    <div className="flex flex-col">
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={ACCEPT_ATTRIBUTE}
        className="peer sr-only"
        tabIndex={showDropzone ? undefined : -1}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        onChange={onChange}
      />

      {showDropzone && (
        <label
          htmlFor={id}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={cn(
            "flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed px-4 py-6 text-center transition-colors peer-focus-visible:border-brand peer-focus-visible:ring-2 peer-focus-visible:ring-brand/30 hover:border-muted/60",
            dragging
              ? "border-brand bg-brand/5"
              : cn(invalid ? "border-brand/60" : "border-outline", "bg-surface/60 hover:bg-surface"),
          )}
        >
          <CloudUpload className="size-7 text-muted" aria-hidden="true" />
          <span className="text-sm font-medium text-foreground">
            <span className="text-brand-bright">{copy.chooseFile}</span> {copy.dragHere}
          </span>
          <span className="text-xs text-muted">
            {interpolate(copy.accepted, { max: formatNumber(MAX_DOCUMENT_MB, lang) })}
          </span>
        </label>
      )}

      {state.status === "uploading" && (
        <FileRow name={state.name} size={formatBytes(state.size, lang, copy.size)}>
          <div
            role="progressbar"
            aria-label={interpolate(copy.uploadingName, { name: state.name })}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={state.progress}
            className="mt-2.5 h-1.5 w-full overflow-hidden rounded-pill bg-elevated"
          >
            <div
              className="h-full origin-left rounded-pill bg-brand transition-transform duration-150"
              style={{ transform: `scaleX(${state.progress / 100})` }}
            />
          </div>
          <p className="mt-1.5 text-xs text-muted">
            {state.progress < 100
              ? interpolate(copy.uploading, { percent: formatNumber(state.progress, lang) })
              : copy.checking}
          </p>
          <div className="mt-2">
            <Button variant="ghost" size="sm" onClick={remove} className="min-h-11">
              {copy.cancel}
            </Button>
          </div>
        </FileRow>
      )}

      {state.status === "done" && (
        <FileRow
          name={state.name}
          size={formatBytes(state.size, lang, copy.size)}
          uploadedLabel={copy.uploaded}
        >
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => inputRef.current?.click()}
              className="min-h-11"
            >
              {copy.replace}
            </Button>
            <Button variant="ghost" size="sm" onClick={remove} className="min-h-11">
              {copy.remove}
            </Button>
          </div>
        </FileRow>
      )}
    </div>
  );
}

function FileRow({
  name,
  size,
  uploadedLabel,
  children,
}: {
  name: string;
  size: string;
  uploadedLabel?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-32 gap-3 rounded-card border border-outline bg-surface p-4">
      <span className="grid size-10 shrink-0 place-items-center rounded-button bg-elevated text-muted">
        <FileText className="size-5" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground" title={name}>
          {name}
        </p>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted">
          {size}
          {uploadedLabel && (
            <span className="inline-flex items-center gap-1 text-success">
              <CircleCheck className="size-3.5" aria-hidden="true" />
              {uploadedLabel}
            </span>
          )}
        </p>
        {children}
      </div>
    </div>
  );
}
