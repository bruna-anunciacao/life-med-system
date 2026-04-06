-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'MANAGER';

-- CreateTable
CREATE TABLE "manager_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "phone" TEXT,
    "bio" TEXT,
    "photo_url" TEXT,
    "address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "manager_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "manager_profiles_user_id_key" ON "manager_profiles"("user_id");

-- AddForeignKey
ALTER TABLE "manager_profiles" ADD CONSTRAINT "manager_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
