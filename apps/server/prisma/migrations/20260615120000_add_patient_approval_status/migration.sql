-- CreateEnum
CREATE TYPE "profiles"."PatientApprovalStatus" AS ENUM ('APPROVED', 'PENDING', 'REJECTED');

-- AlterTable
ALTER TABLE "patient_profiles"
ADD COLUMN "approval_status" "profiles"."PatientApprovalStatus" NOT NULL DEFAULT 'PENDING';

-- Backfill already answered questionnaires according to the current score rule.
UPDATE "patient_profiles"
SET "approval_status" = CASE
    WHEN "vulnerability_questionnaires"."is_vulnerable" = true
        THEN 'APPROVED'::"profiles"."PatientApprovalStatus"
    ELSE 'PENDING'::"profiles"."PatientApprovalStatus"
END
FROM "vulnerability_questionnaires"
WHERE "vulnerability_questionnaires"."patient_profile_id" = "patient_profiles"."id";
