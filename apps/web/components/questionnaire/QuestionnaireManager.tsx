"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useAdminQuestionnaireQuery,
  useCreateOptionMutation,
  useCreateQuestionMutation,
  useDeleteOptionMutation,
  useDeleteQuestionMutation,
  useUpdateOptionMutation,
  useUpdateQuestionMutation,
  useUpdateThresholdMutation,
} from "@/queries/useQuestionnaireAdminQueries";
import type {
  AdminOptionInput,
  QuestionnaireOption,
  QuestionnaireQuestion,
} from "@/services/questionnaire-service";

type EditingState =
  | { kind: "none" }
  | { kind: "create-question" }
  | { kind: "edit-question"; question: QuestionnaireQuestion }
  | {
      kind: "edit-option";
      questionId: string;
      option: QuestionnaireOption;
    }
  | { kind: "create-option"; questionId: string };

export function QuestionnaireManager() {
  const { data, isLoading } = useAdminQuestionnaireQuery();
  const updateThreshold = useUpdateThresholdMutation();
  const createQuestion = useCreateQuestionMutation();
  const updateQuestion = useUpdateQuestionMutation();
  const deleteQuestion = useDeleteQuestionMutation();
  const updateOption = useUpdateOptionMutation();
  const deleteOption = useDeleteOptionMutation();

  const [thresholdDraft, setThresholdDraft] = useState<string>("");
  const [editing, setEditing] = useState<EditingState>({ kind: "none" });

  const thresholdValue = useMemo(() => {
    if (thresholdDraft !== "") return Number(thresholdDraft);
    return data?.vulnerabilityThreshold ?? 0;
  }, [thresholdDraft, data]);

  if (isLoading) {
    return (
      <section className="flex min-h-[40vh] items-center justify-center">
        <Spinner size="lg" />
      </section>
    );
  }

  if (!data) {
    return (
      <Card className="bg-white">
        <CardContent className="p-8">
          <p className="text-sm text-red-600">
            Não foi possível carregar o questionário.
          </p>
        </CardContent>
      </Card>
    );
  }

  const maxScore = data.maxPossibleScore;
  const thresholdInvalid =
    thresholdValue < 1 || thresholdValue > maxScore || Number.isNaN(thresholdValue);

  const handleSaveThreshold = async () => {
    if (thresholdInvalid) {
      toast.error(`Limiar precisa estar entre 1 e ${maxScore}.`);
      return;
    }
    try {
      await updateThreshold.mutateAsync({
        id: data.id,
        threshold: thresholdValue,
      });
      setThresholdDraft("");
      toast.success("Limiar atualizado.");
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const handleMoveQuestion = async (
    question: QuestionnaireQuestion,
    direction: -1 | 1,
  ) => {
    const sorted = [...data.questions].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((q) => q.id === question.id);
    const swap = sorted[idx + direction];
    if (!swap) return;
    try {
      await updateQuestion.mutateAsync({
        id: data.id,
        questionId: question.id,
        input: { order: swap.order },
      });
      await updateQuestion.mutateAsync({
        id: data.id,
        questionId: swap.id,
        input: { order: question.order },
      });
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const handleDeleteQuestion = async (question: QuestionnaireQuestion) => {
    if (!confirm(`Remover a pergunta "${question.label}"?`)) return;
    try {
      await deleteQuestion.mutateAsync({
        id: data.id,
        questionId: question.id,
      });
      toast.success("Pergunta removida.");
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const handleDeleteOption = async (
    question: QuestionnaireQuestion,
    option: QuestionnaireOption,
  ) => {
    if (question.options.length <= 2) {
      toast.error("Cada pergunta precisa de ao menos 2 opções ativas.");
      return;
    }
    if (!confirm(`Remover a opção "${option.label}"?`)) return;
    try {
      await deleteOption.mutateAsync({ id: data.id, optionId: option.id });
      toast.success("Opção removida.");
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">
          Questionário de Vulnerabilidade
        </h1>
        <p className="text-sm text-slate-600">
          Edite perguntas, opções e o limiar. Pacientes que já responderam
          precisarão responder novamente.
        </p>
      </header>

      <Card className="bg-white">
        <CardContent className="space-y-4 p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Limiar de vulnerabilidade
          </h2>
          <div className="grid gap-3 sm:grid-cols-[200px_1fr_auto] sm:items-end">
            <div>
              <Label htmlFor="threshold">Limiar</Label>
              <Input
                id="threshold"
                type="number"
                min={1}
                max={maxScore}
                value={thresholdDraft === "" ? data.vulnerabilityThreshold : thresholdDraft}
                onChange={(e) => setThresholdDraft(e.target.value)}
              />
            </div>
            <p className="text-sm text-slate-500">
              Pontuação máxima possível: <strong>{maxScore}</strong>.
              {thresholdInvalid && (
                <span className="ml-2 text-red-600">
                  Use um valor entre 1 e {maxScore}.
                </span>
              )}
            </p>
            <Button
              onClick={handleSaveThreshold}
              disabled={
                updateThreshold.isPending ||
                thresholdInvalid ||
                Number(thresholdDraft || data.vulnerabilityThreshold) ===
                  data.vulnerabilityThreshold
              }
            >
              Salvar limiar
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Perguntas</h2>
        <Button
          onClick={() => setEditing({ kind: "create-question" })}
          className="gap-1"
        >
          <Plus className="h-4 w-4" /> Adicionar pergunta
        </Button>
      </div>

      <div className="space-y-3">
        {data.questions.map((question, idx) => (
          <Card key={question.id} className="bg-white">
            <CardContent className="space-y-3 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-500">
                    Pergunta {idx + 1} · ordem {question.order}
                  </p>
                  <h3 className="text-base font-semibold text-slate-900">
                    {question.label}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-1">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => handleMoveQuestion(question, -1)}
                    disabled={idx === 0}
                    title="Mover para cima"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => handleMoveQuestion(question, 1)}
                    disabled={idx === data.questions.length - 1}
                    title="Mover para baixo"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() =>
                      setEditing({ kind: "edit-question", question })
                    }
                    title="Editar pergunta"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => handleDeleteQuestion(question)}
                    title="Remover pergunta"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>

              <ul className="space-y-1">
                {question.options.map((option) => (
                  <li
                    key={option.id}
                    className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 text-sm"
                  >
                    <div>
                      <span className="font-medium text-slate-900">
                        {option.label}
                      </span>
                      <span className="ml-2 text-slate-500">
                        ({option.score} pts)
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() =>
                          setEditing({
                            kind: "edit-option",
                            questionId: question.id,
                            option,
                          })
                        }
                        title="Editar opção"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDeleteOption(question, option)}
                        title="Remover opção"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-red-600" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setEditing({
                    kind: "create-option",
                    questionId: question.id,
                  })
                }
                className="gap-1"
              >
                <Plus className="h-3.5 w-3.5" /> Adicionar opção
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {editing.kind === "create-question" && (
        <QuestionDialog
          mode="create"
          questionnaireId={data.id}
          nextOrder={data.questions.length + 1}
          onClose={() => setEditing({ kind: "none" })}
          onSaveQuestion={async (input) => {
            await createQuestion.mutateAsync({ id: data.id, input });
          }}
        />
      )}

      {editing.kind === "edit-question" && (
        <QuestionDialog
          mode="edit"
          questionnaireId={data.id}
          question={editing.question}
          onClose={() => setEditing({ kind: "none" })}
          onSaveQuestion={async (input) => {
            await updateQuestion.mutateAsync({
              id: data.id,
              questionId: editing.question.id,
              input: { label: input.label },
            });
          }}
        />
      )}

      {(editing.kind === "edit-option" || editing.kind === "create-option") && (
        <OptionDialog
          questionnaireId={data.id}
          state={editing}
          onClose={() => setEditing({ kind: "none" })}
        />
      )}
    </section>
  );
}

function QuestionDialog(props: {
  mode: "create" | "edit";
  questionnaireId: string;
  question?: QuestionnaireQuestion;
  nextOrder?: number;
  onClose: () => void;
  onSaveQuestion: (input: {
    label: string;
    order: number;
    options: AdminOptionInput[];
  }) => Promise<void>;
}) {
  const [label, setLabel] = useState(props.question?.label ?? "");
  const [options, setOptions] = useState<AdminOptionInput[]>(
    props.question
      ? props.question.options.map((o) => ({
          label: o.label,
          score: o.score,
          order: o.order,
        }))
      : [
          { label: "", score: 0, order: 1 },
          { label: "", score: 0, order: 2 },
        ],
  );
  const [saving, setSaving] = useState(false);

  const isCreate = props.mode === "create";

  const handleSave = async () => {
    if (!label.trim()) {
      toast.error("Texto da pergunta é obrigatório.");
      return;
    }
    if (isCreate) {
      if (options.length < 2 || options.some((o) => !o.label.trim())) {
        toast.error("Cada pergunta precisa de ao menos 2 opções com texto.");
        return;
      }
    }

    if (
      !confirm(
        "Pacientes que já responderam precisarão responder novamente. Continuar?",
      )
    ) {
      return;
    }

    setSaving(true);
    try {
      await props.onSaveQuestion({
        label,
        order: props.question?.order ?? props.nextOrder ?? 1,
        options,
      });
      toast.success("Pergunta salva.");
      props.onClose();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && props.onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isCreate ? "Nova pergunta" : "Editar pergunta"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="q-label">Texto da pergunta</Label>
            <Input
              id="q-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          </div>
          {isCreate && (
            <div className="space-y-2">
              <Label>Opções (mínimo 2)</Label>
              {options.map((opt, idx) => (
                <div key={idx} className="grid grid-cols-[1fr_100px_auto] gap-2">
                  <Input
                    placeholder="Texto da opção"
                    value={opt.label}
                    onChange={(e) => {
                      const next = [...options];
                      next[idx] = { ...opt, label: e.target.value };
                      setOptions(next);
                    }}
                  />
                  <Input
                    type="number"
                    min={0}
                    placeholder="Pontos"
                    value={opt.score}
                    onChange={(e) => {
                      const next = [...options];
                      next[idx] = { ...opt, score: Number(e.target.value) };
                      setOptions(next);
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (options.length <= 2) return;
                      setOptions(options.filter((_, i) => i !== idx));
                    }}
                    disabled={options.length <= 2}
                    title="Remover opção"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setOptions([
                    ...options,
                    { label: "", score: 0, order: options.length + 1 },
                  ])
                }
              >
                <Plus className="h-3.5 w-3.5" /> Adicionar opção
              </Button>
            </div>
          )}
          {!isCreate && (
            <p className="text-xs text-slate-500">
              Para editar opções e pontuação, use os botões na lista de opções.
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={props.onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function OptionDialog(props: {
  questionnaireId: string;
  state:
    | {
        kind: "edit-option";
        questionId: string;
        option: QuestionnaireOption;
      }
    | { kind: "create-option"; questionId: string };
  onClose: () => void;
}) {
  const updateOption = useUpdateOptionMutation();
  const createOption = useCreateOptionMutation();
  const isCreate = props.state.kind === "create-option";
  const existing =
    props.state.kind === "edit-option" ? props.state.option : undefined;

  const [label, setLabel] = useState(existing?.label ?? "");
  const [score, setScore] = useState<number>(existing?.score ?? 0);
  const [order, setOrder] = useState<number>(existing?.order ?? 1);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!label.trim()) {
      toast.error("Texto da opção é obrigatório.");
      return;
    }
    if (
      !confirm(
        "Pacientes que já responderam precisarão responder novamente. Continuar?",
      )
    ) {
      return;
    }
    setSaving(true);
    try {
      if (isCreate) {
        await createOption.mutateAsync({
          id: props.questionnaireId,
          questionId: props.state.questionId,
          input: { label, score, order },
        });
      } else {
        await updateOption.mutateAsync({
          id: props.questionnaireId,
          optionId: existing!.id,
          input: { label, score, order },
        });
      }
      toast.success("Opção salva.");
      props.onClose();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && props.onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isCreate ? "Nova opção" : "Editar opção"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor="opt-label">Texto</Label>
            <Input
              id="opt-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="opt-score">Pontos</Label>
              <Input
                id="opt-score"
                type="number"
                min={0}
                value={score}
                onChange={(e) => setScore(Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="opt-order">Ordem</Label>
              <Input
                id="opt-order"
                type="number"
                min={1}
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={props.onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default QuestionnaireManager;
