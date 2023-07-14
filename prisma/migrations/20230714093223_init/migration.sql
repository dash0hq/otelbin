/*
  Warnings:

  - Added the required column `config` to the `OtelColConfig` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_OtelColConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "updatedAt" DATETIME NOT NULL,
    "name" TEXT NOT NULL,
    "config" TEXT NOT NULL
);
INSERT INTO "new_OtelColConfig" ("id", "name", "updatedAt") SELECT "id", "name", "updatedAt" FROM "OtelColConfig";
DROP TABLE "OtelColConfig";
ALTER TABLE "new_OtelColConfig" RENAME TO "OtelColConfig";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
