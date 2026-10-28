"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { Button } from "./button";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  className?: string;
}

/**
 * Native <dialog> modal: focus trapping, Escape-to-close and the inert
 * backdrop come from the browser, so no portal or focus library is needed.
 */
export function Dialog({ open, onClose, title, description, children, className }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(event) => event.target === ref.current && onClose()}
      aria-labelledby={titleId}
      className={cn(
        "m-auto w-[calc(100%-2rem)] max-w-md rounded-card border border-outline bg-surface p-0 text-foreground shadow-popover",
        "backdrop:bg-background/80 backdrop:backdrop-blur-sm open:animate-fade-up",
        className,
      )}
    >
      <div className="flex flex-col gap-4 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <h2 id={titleId} className="text-lg font-semibold">
              {title}
            </h2>
            {description && <div className="text-sm text-muted">{description}</div>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="-m-2 grid size-10 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-elevated hover:text-foreground"
          >
            <X className="size-5" aria-hidden="true" />
            <span className="sr-only">Close</span>
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}

interface ConfirmDialogProps extends Omit<DialogProps, "children"> {
  confirmLabel: string;
  onConfirm: () => void;
  pending?: boolean;
  destructive?: boolean;
}

export function ConfirmDialog({
  confirmLabel,
  onConfirm,
  pending,
  destructive = true,
  ...props
}: ConfirmDialogProps) {
  return (
    <Dialog {...props}>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="ghost" onClick={props.onClose} disabled={pending}>
          Cancel
        </Button>
        <Button variant={destructive ? "danger" : "primary"} onClick={onConfirm} pending={pending}>
          {confirmLabel}
        </Button>
      </div>
    </Dialog>
  );
}
