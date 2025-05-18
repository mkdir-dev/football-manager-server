-- AlterTable
ALTER TABLE "UserAccount" ALTER COLUMN "hashRefreshToken" DROP NOT NULL,
ALTER COLUMN "refreshTokenExpiry" DROP NOT NULL;
