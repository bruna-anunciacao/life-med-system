import { Module } from '@nestjs/common';
import { QuestionnaireController } from './questionnaire.controller';
import { QuestionnaireService } from './questionnaire.service';
import { PrismaModule } from '../prisma/prisma.module';
import { QuestionnaireCompletionGuard } from './questionnaire-completion.guard';
import { QuestionnaireAdminController } from './admin/questionnaire-admin.controller';
import { QuestionnaireAdminService } from './admin/questionnaire-admin.service';

@Module({
  imports: [PrismaModule],
  controllers: [QuestionnaireController, QuestionnaireAdminController],
  providers: [
    QuestionnaireService,
    QuestionnaireAdminService,
    QuestionnaireCompletionGuard,
  ],
  exports: [QuestionnaireService, QuestionnaireCompletionGuard],
})
export class QuestionnaireModule {}
