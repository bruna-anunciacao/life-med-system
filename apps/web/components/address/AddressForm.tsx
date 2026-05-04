"use client";

import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  useUserAddressQuery,
  useSaveAddressMutation,
} from "@/queries/useAddressQueries";
import { useAddressCep } from "@/hooks/useAddressCep";
import { AddressFields } from "./AddressFields";
import { addressSchema, type AddressSchema } from "./address.validation";

type AddressFormProps = {
  userId: string;
  onSuccess?: () => void;
};

export function AddressForm({ userId, onSuccess }: AddressFormProps) {
  const { data: existingAddress } = useUserAddressQuery(userId);

  const form = useForm<AddressSchema>({
    resolver: zodResolver(addressSchema),
    mode: "onBlur",
    values: existingAddress
      ? {
          zipCode: existingAddress.zipCode,
          street: existingAddress.street,
          number: existingAddress.number || "",
          complement: existingAddress.complement || "",
          district: existingAddress.district,
          city: existingAddress.city,
          state: existingAddress.state,
        }
      : undefined,
  });

  const {
    control,
    setValue,
    reset,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting, isDirty, isValid },
  } = form;

  const [isEditing, setIsEditing] = useState(false);

  const hasExistingAddress = !!existingAddress;
  const isEditMode = isEditing || !hasExistingAddress;

  const { isFetchingZipCode } = useAddressCep({
    control,
    setValue,
    setError,
    clearErrors,
    dirtyFields: form.formState.dirtyFields,
  });

  const saveMutation = useSaveAddressMutation();

  const handleCancel = useCallback(() => {
    reset();
    setIsEditing(false);
  }, [reset]);

  async function onSubmit(data: AddressSchema) {
    try {
      const addressData = {
        zipCode: data.zipCode,
        street: data.street,
        number: data.number,
        complement: data.complement || undefined,
        district: data.district,
        city: data.city,
        state: data.state,
      };

      await saveMutation.mutateAsync({
        userId,
        data: addressData,
        hasAddress: hasExistingAddress,
      });

      const message = hasExistingAddress
        ? "Endereço atualizado com sucesso!"
        : "Endereço salvo com sucesso!";
      toast.success(message);

      setIsEditing(false);
      onSuccess?.();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao salvar endereço.",
      );
    }
  }

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-base font-semibold text-gray-700">Endereço</h2>
          <p className="text-sm text-gray-500">Cadastre ou atualize o endereço de localização.</p>
        </div>
        {hasExistingAddress && (
          <Button
            type="button"
            onClick={() => (isEditing ? handleCancel() : setIsEditing(true))}
            size="lg"
          >
            {isEditing ? "Cancelar" : "Editar Endereço"}
          </Button>
        )}
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <AddressFields
          register={form.register}
          errors={errors}
          isFetchingZipCode={isFetchingZipCode}
          disabled={!isEditMode}
        />

        {isEditMode && (
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                isFetchingZipCode ||
                saveMutation.isPending ||
                (hasExistingAddress && !isDirty) ||
                !isValid
              }
              size="lg"
            >
              {isSubmitting || saveMutation.isPending
                ? "Salvando..."
                : hasExistingAddress
                  ? "Atualizar Endereço"
                  : "Salvar Endereço"}
            </Button>
          </div>
        )}
      </form>
    </>
  );
}
