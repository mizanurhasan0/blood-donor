import { z } from "zod";
import { LIMITS } from "@/lib/constants/site";
import { cleanText, objectIdSchema } from "./common";

export const commentSchema = z.object({
  requestId: objectIdSchema,
  parentId: objectIdSchema.optional(),
  content: z
    .string({ error: "This field is required" })
    .transform(cleanText)
    .pipe(
      z.string().min(2, "Write a little more").max(LIMITS.commentMaxLength, "Keep it under 1000 characters"),
    ),
});

export type CommentInput = z.input<typeof commentSchema>;
export type CommentValues = z.output<typeof commentSchema>;
