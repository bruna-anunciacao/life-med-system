-- Reset existing responses (no real users yet)
DELETE FROM "vulnerability_questionnaires";

-- Drop legacy JSON column
ALTER TABLE "vulnerability_questionnaires" DROP COLUMN "responses";

-- CreateTable: questionnaires
CREATE TABLE "questionnaires" (
    "id" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "vulnerability_threshold" INTEGER NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "questionnaires_pkey" PRIMARY KEY ("id")
);

-- CreateTable: questions
CREATE TABLE "questions" (
    "id" TEXT NOT NULL,
    "questionnaire_id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "questions_questionnaire_id_order_idx" ON "questions"("questionnaire_id", "order");

-- CreateTable: question_options
CREATE TABLE "question_options" (
    "id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "question_options_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "question_options_question_id_order_idx" ON "question_options"("question_id", "order");

-- CreateTable: questionnaire_answers
CREATE TABLE "questionnaire_answers" (
    "id" TEXT NOT NULL,
    "vulnerability_questionnaire_id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "option_id" TEXT NOT NULL,

    CONSTRAINT "questionnaire_answers_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "questionnaire_answers_vulnerability_questionnaire_id_question_id_key"
    ON "questionnaire_answers"("vulnerability_questionnaire_id", "question_id");

-- Add new columns to vulnerability_questionnaires
ALTER TABLE "vulnerability_questionnaires" ADD COLUMN "questionnaire_id" TEXT NOT NULL;
ALTER TABLE "vulnerability_questionnaires" ADD COLUMN "answered_version" INTEGER NOT NULL;

-- Foreign keys
ALTER TABLE "questions" ADD CONSTRAINT "questions_questionnaire_id_fkey"
    FOREIGN KEY ("questionnaire_id") REFERENCES "questionnaires"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "question_options" ADD CONSTRAINT "question_options_question_id_fkey"
    FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "vulnerability_questionnaires" ADD CONSTRAINT "vulnerability_questionnaires_questionnaire_id_fkey"
    FOREIGN KEY ("questionnaire_id") REFERENCES "questionnaires"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

ALTER TABLE "questionnaire_answers" ADD CONSTRAINT "questionnaire_answers_vulnerability_questionnaire_id_fkey"
    FOREIGN KEY ("vulnerability_questionnaire_id") REFERENCES "vulnerability_questionnaires"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "questionnaire_answers" ADD CONSTRAINT "questionnaire_answers_question_id_fkey"
    FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "questionnaire_answers" ADD CONSTRAINT "questionnaire_answers_option_id_fkey"
    FOREIGN KEY ("option_id") REFERENCES "question_options"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
