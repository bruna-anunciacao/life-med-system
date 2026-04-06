-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'GESTOR';

-- CreateTable
CREATE TABLE "gestor_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "bio" TEXT,
    "photo_url" TEXT,
    "address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gestor_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "gestor_profiles_user_id_key" ON "gestor_profiles"("user_id");

-- AddForeignKey
ALTER TABLE "gestor_profiles" ADD CONSTRAINT "gestor_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
