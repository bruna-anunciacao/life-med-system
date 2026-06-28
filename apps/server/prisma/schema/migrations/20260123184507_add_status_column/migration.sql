-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('PENDING', 'COMPLETED', 'VERIFIED', 'BLOCKED');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'PENDING';
