-- AlterTable
ALTER TABLE "UserAccount" ADD COLUMN     "email" TEXT;

-- CreateTable
CREATE TABLE "GoogleAccount" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "googleId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "avatarUrl" TEXT,
    "email" TEXT,
    "isVerifiedEmail" BOOLEAN DEFAULT false,
    "userAccountId" INTEGER NOT NULL,

    CONSTRAINT "GoogleAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GoogleAccount_googleId_key" ON "GoogleAccount"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "GoogleAccount_userAccountId_key" ON "GoogleAccount"("userAccountId");

-- AddForeignKey
ALTER TABLE "GoogleAccount" ADD CONSTRAINT "GoogleAccount_userAccountId_fkey" FOREIGN KEY ("userAccountId") REFERENCES "UserAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
