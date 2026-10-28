"use client";

import { FlagOff, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";
import type { ActionResult } from "@/lib/utils/result";
import { deleteCommentAction } from "@/features/comments/actions";
import { dismissReportsAction } from "../actions";
import { useModerationFeedback } from "./moderation-feedback";

export function CommentActions({ commentId }: { commentId: string }) {
  const router = useRouter();
  const notify = useModerationFeedback();
  const [pending, setPending] = useState<"delete" | "dismiss" | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [, startTransition] = useTransition();

  function run(kind: "delete" | "dismiss", action: () => Promise<ActionResult<unknown>>, success: string) {
    setPending(kind);
    startTransition(async () => {
      const result = await action();
      setPending(null);
      setConfirmOpen(false);
      notify(result.ok ? "success" : "error", result.ok ? success : result.error);
      if (result.ok) router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button size="sm" variant="danger" disabled={pending !== null} onClick={() => setConfirmOpen(true)}>
        <Trash className="size-4" aria-hidden="true" />
        Delete
      </Button>
      <Button
        size="sm"
        variant="secondary"
        pending={pending === "dismiss"}
        disabled={pending !== null}
        onClick={() => run("dismiss", () => dismissReportsAction("comment", commentId), "Reports dismissed.")}
      >
        {pending !== "dismiss" && <FlagOff className="size-4" aria-hidden="true" />}
        Dismiss
      </Button>
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Delete this comment?"
        description="The comment text is removed for everyone. This can't be undone."
        confirmLabel="Delete comment"
        pending={pending === "delete"}
        onConfirm={() => run("delete", () => deleteCommentAction(commentId), "Comment deleted.")}
      />
    </div>
  );
}
