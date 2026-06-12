import { Module } from '@nestjs/common';
import { QuestionnaireController } from './questionnaire.controller';
import { QuestionnaireService } from './questionnaire.service';
import { QuestionnaireRepository } from './questionnaire.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { QuestionnaireCompletionGuard } from './questionnaire-completion.guard';
import { QuestionnaireAdminController } from './admin/questionnaire-admin.controller';
import { QuestionnaireAdminService } from './admin/questionnaire-admin.service';
import { QuestionnaireAdminRepository } from './admin/questionnaire-admin.repository';

@Module({
  imports: [PrismaModule],
  controllers: [QuestionnaireController, QuestionnaireAdminController],
  providers: [
    QuestionnaireService,
    QuestionnaireRepository,
    QuestionnaireAdminService,
    QuestionnaireAdminRepository,
    QuestionnaireCompletionGuard,
  ],
  exports: [QuestionnaireService, QuestionnaireCompletionGuard],
})
export class QuestionnaireModule {}
