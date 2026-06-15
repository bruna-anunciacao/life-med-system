import { QuestionnaireService } from '../questionnaire.service';
import { QuestionnaireAdminRepository } from './questionnaire-admin.repository';
import { QuestionnaireAdminService } from './questionnaire-admin.service';

describe('QuestionnaireAdminService', () => {
  const repository = {
    updateQuestionnaire: jest.fn(),
    createQuestion: jest.fn(),
    updateQuestion: jest.fn(),
    deleteQuestion: jest.fn(),
    createOption: jest.fn(),
    updateOption: jest.fn(),
    deleteOption: jest.fn(),
  };
  const questionnaireService = {
    getActiveQuestionnaire: jest.fn(),
    toDefinition: jest.fn((q) => ({ definitionOf: q.id })),
  };

  let service: QuestionnaireAdminService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new QuestionnaireAdminService(
      repository as unknown as QuestionnaireAdminRepository,
      questionnaireService as unknown as QuestionnaireService,
    );
  });

  it('getActive returns the definition of the active questionnaire', async () => {
    questionnaireService.getActiveQuestionnaire.mockResolvedValue({ id: 'q-1' });

    const result = await service.getActive();

    expect(questionnaireService.toDefinition).toHaveBeenCalledWith({
      id: 'q-1',
    });
    expect(result).toEqual({ definitionOf: 'q-1' });
  });

  // Cada mutação delega ao repositório e serializa o resultado via toDefinition.
  const cases: [keyof QuestionnaireAdminService, () => Promise<unknown>, jest.Mock][] =
    [
      [
        'updateQuestionnaire',
        () => service.updateQuestionnaire('q-1', {} as any),
        repository.updateQuestionnaire,
      ],
      [
        'createQuestion',
        () => service.createQuestion('q-1', {} as any),
        repository.createQuestion,
      ],
      [
        'updateQuestion',
        () => service.updateQuestion('q-1', 'qq-1', {} as any),
        repository.updateQuestion,
      ],
      [
        'deleteQuestion',
        () => service.deleteQuestion('q-1', 'qq-1'),
        repository.deleteQuestion,
      ],
      [
        'createOption',
        () => service.createOption('q-1', 'qq-1', {} as any),
        repository.createOption,
      ],
      [
        'updateOption',
        () => service.updateOption('q-1', 'o-1', {} as any),
        repository.updateOption,
      ],
      [
        'deleteOption',
        () => service.deleteOption('q-1', 'o-1'),
        repository.deleteOption,
      ],
    ];

  it.each(cases)(
    '%s delegates to the repository and serializes via toDefinition',
    async (_name, call, repoMethod) => {
      repoMethod.mockResolvedValue({ id: 'updated-q' });

      const result = await call();

      expect(repoMethod).toHaveBeenCalled();
      expect(questionnaireService.toDefinition).toHaveBeenCalledWith({
        id: 'updated-q',
      });
      expect(result).toEqual({ definitionOf: 'updated-q' });
    },
  );
});
