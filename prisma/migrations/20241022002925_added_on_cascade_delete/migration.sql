/*
  Warnings:

  - Made the column `authorId` on table `BlogPost` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BlogPost" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "visibleToPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastModified" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "authorId" INTEGER NOT NULL,
    "codeTemplateId" INTEGER,
    CONSTRAINT "BlogPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BlogPost_codeTemplateId_fkey" FOREIGN KEY ("codeTemplateId") REFERENCES "CodeTemplate" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_BlogPost" ("authorId", "codeTemplateId", "content", "createdAt", "description", "id", "lastModified", "title", "visibleToPublic") SELECT "authorId", "codeTemplateId", "content", "createdAt", "description", "id", "lastModified", "title", "visibleToPublic" FROM "BlogPost";
DROP TABLE "BlogPost";
ALTER TABLE "new_BlogPost" RENAME TO "BlogPost";
CREATE TABLE "new_Comment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "content" TEXT NOT NULL,
    "visibleToPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "authorId" INTEGER NOT NULL,
    "blogPostId" INTEGER NOT NULL,
    CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Comment_blogPostId_fkey" FOREIGN KEY ("blogPostId") REFERENCES "BlogPost" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Comment" ("authorId", "blogPostId", "content", "createdAt", "id", "visibleToPublic") SELECT "authorId", "blogPostId", "content", "createdAt", "id", "visibleToPublic" FROM "Comment";
DROP TABLE "Comment";
ALTER TABLE "new_Comment" RENAME TO "Comment";
CREATE TABLE "new_RatingBlogPost" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "upvote" BOOLEAN NOT NULL,
    "authorId" INTEGER NOT NULL,
    "blogPostId" INTEGER NOT NULL,
    CONSTRAINT "RatingBlogPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RatingBlogPost_blogPostId_fkey" FOREIGN KEY ("blogPostId") REFERENCES "BlogPost" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_RatingBlogPost" ("authorId", "blogPostId", "id", "upvote") SELECT "authorId", "blogPostId", "id", "upvote" FROM "RatingBlogPost";
DROP TABLE "RatingBlogPost";
ALTER TABLE "new_RatingBlogPost" RENAME TO "RatingBlogPost";
CREATE TABLE "new_RatingComment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "upvote" BOOLEAN NOT NULL,
    "authorId" INTEGER NOT NULL,
    "commentId" INTEGER NOT NULL,
    CONSTRAINT "RatingComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RatingComment_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_RatingComment" ("authorId", "commentId", "id", "upvote") SELECT "authorId", "commentId", "id", "upvote" FROM "RatingComment";
DROP TABLE "RatingComment";
ALTER TABLE "new_RatingComment" RENAME TO "RatingComment";
CREATE TABLE "new_Reply" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "content" TEXT NOT NULL,
    "visibleToPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "authorId" INTEGER NOT NULL,
    "commentId" INTEGER NOT NULL,
    "replyingToId" INTEGER,
    CONSTRAINT "Reply_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Reply_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Reply_replyingToId_fkey" FOREIGN KEY ("replyingToId") REFERENCES "Reply" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Reply" ("authorId", "commentId", "content", "createdAt", "id", "replyingToId", "visibleToPublic") SELECT "authorId", "commentId", "content", "createdAt", "id", "replyingToId", "visibleToPublic" FROM "Reply";
DROP TABLE "Reply";
ALTER TABLE "new_Reply" RENAME TO "Reply";
CREATE TABLE "new_ReportBlogPost" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "content" TEXT NOT NULL,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "authorId" INTEGER NOT NULL,
    "blogPostId" INTEGER NOT NULL,
    CONSTRAINT "ReportBlogPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ReportBlogPost_blogPostId_fkey" FOREIGN KEY ("blogPostId") REFERENCES "BlogPost" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ReportBlogPost" ("authorId", "blogPostId", "content", "id", "resolved") SELECT "authorId", "blogPostId", "content", "id", "resolved" FROM "ReportBlogPost";
DROP TABLE "ReportBlogPost";
ALTER TABLE "new_ReportBlogPost" RENAME TO "ReportBlogPost";
CREATE TABLE "new_ReportComment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "content" TEXT NOT NULL,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "authorId" INTEGER NOT NULL,
    "commentId" INTEGER NOT NULL,
    CONSTRAINT "ReportComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ReportComment_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ReportComment" ("authorId", "commentId", "content", "id", "resolved") SELECT "authorId", "commentId", "content", "id", "resolved" FROM "ReportComment";
DROP TABLE "ReportComment";
ALTER TABLE "new_ReportComment" RENAME TO "ReportComment";
CREATE TABLE "new_ReportReply" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "content" TEXT NOT NULL,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "authorId" INTEGER NOT NULL,
    "replyId" INTEGER NOT NULL,
    CONSTRAINT "ReportReply_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ReportReply_replyId_fkey" FOREIGN KEY ("replyId") REFERENCES "Reply" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ReportReply" ("authorId", "content", "id", "replyId", "resolved") SELECT "authorId", "content", "id", "replyId", "resolved" FROM "ReportReply";
DROP TABLE "ReportReply";
ALTER TABLE "new_ReportReply" RENAME TO "ReportReply";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
