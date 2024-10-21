-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ReportBlogPost" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "content" TEXT NOT NULL,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "authorId" INTEGER NOT NULL,
    "blogPostId" INTEGER NOT NULL,
    CONSTRAINT "ReportBlogPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ReportBlogPost_blogPostId_fkey" FOREIGN KEY ("blogPostId") REFERENCES "BlogPost" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ReportBlogPost" ("authorId", "blogPostId", "content", "id") SELECT "authorId", "blogPostId", "content", "id" FROM "ReportBlogPost";
DROP TABLE "ReportBlogPost";
ALTER TABLE "new_ReportBlogPost" RENAME TO "ReportBlogPost";
CREATE TABLE "new_ReportComment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "content" TEXT NOT NULL,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "authorId" INTEGER NOT NULL,
    "commentId" INTEGER NOT NULL,
    CONSTRAINT "ReportComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ReportComment_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ReportComment" ("authorId", "commentId", "content", "id") SELECT "authorId", "commentId", "content", "id" FROM "ReportComment";
DROP TABLE "ReportComment";
ALTER TABLE "new_ReportComment" RENAME TO "ReportComment";
CREATE TABLE "new_ReportReply" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "content" TEXT NOT NULL,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "authorId" INTEGER NOT NULL,
    "replyId" INTEGER NOT NULL,
    CONSTRAINT "ReportReply_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ReportReply_replyId_fkey" FOREIGN KEY ("replyId") REFERENCES "Reply" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ReportReply" ("authorId", "content", "id", "replyId") SELECT "authorId", "content", "id", "replyId" FROM "ReportReply";
DROP TABLE "ReportReply";
ALTER TABLE "new_ReportReply" RENAME TO "ReportReply";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
