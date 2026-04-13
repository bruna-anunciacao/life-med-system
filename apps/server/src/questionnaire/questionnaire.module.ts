import { Module } from '@nestjs/common';
import { QuestionnaireController } from './questionnaire.controller';
import { QuestionnaireService } from './questionnaire.service';
import { PrismaModule } from '../prisma/prisma.module';
import { QuestionnaireCompletionGuard } from './questionnaire-completion.guard';

@Module({
  imports: [PrismaModule],
  controllers: [QuestionnaireController],
  providers: [QuestionnaireService, QuestionnaireCompletionGuard],
  exports: [QuestionnaireService, QuestionnaireCompletionGuard],
})
export class QuestionnaireModule {}
