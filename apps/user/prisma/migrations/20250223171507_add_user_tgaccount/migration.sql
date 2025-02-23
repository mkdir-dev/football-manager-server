-- CreateTable
CREATE TABLE "UserAccount" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "displayName" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "telegramAccountId" INTEGER NOT NULL,

    CONSTRAINT "UserAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TelegramAccount" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "telegramId" INTEGER NOT NULL,
    "username" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "avatarUrl" TEXT,
    "language" TEXT DEFAULT 'en',
    "isAllowsWrite" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "TelegramAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserAccount_telegramAccountId_key" ON "UserAccount"("telegramAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "TelegramAccount_telegramId_key" ON "TelegramAccount"("telegramId");

-- AddForeignKey
ALTER TABLE "UserAccount" ADD CONSTRAINT "UserAccount_telegramAccountId_fkey" FOREIGN KEY ("telegramAccountId") REFERENCES "TelegramAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
