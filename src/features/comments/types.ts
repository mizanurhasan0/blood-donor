export interface CommentView {
  id: string;
  parentId: string | null;
  authorId: string;
  authorName: string;
  authorAvatar: string | null;
  /** null when the comment was deleted (kept as a placeholder if it has replies). */
  content: string | null;
  createdAt: string;
  replies: CommentView[];
}

export interface CommentPage {
  comments: CommentView[];
  nextCursor: string | null;
}

/** The minimum a client needs to know about the current user for comment UI. */
export interface CommentViewer {
  id: string;
  name: string;
  avatar: string | null;
  isAdmin: boolean;
}
