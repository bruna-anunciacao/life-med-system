"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AlertCircle, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useUserAddressQuery,
  useSaveAddressMutation,
} from "@/queries/useAddressQueries";
import { useUserQuery } from "@/queries/useUserQuery";
import { useAddressCep } from "@/hooks/useAddressCep";
import { AddressFields } from "@/components/address/AddressFields";
import {
  addressSchema,
  type AddressSchema,
} from "@/components/address/address.validation";

interface AddressSectionProps {
  isOpen: boolean;
  currentModality: string;
  isEditing: boolean;
  onEditingChange: (isEditing: boolean) => void;
}

const AddressSection = ({ isOpen, currentModality, isEditing, onEditingChange }: AddressSectionProps) => {

  const { data: user } = useUserQuery();
  const { data: existingAddress } = useUserAddressQuery(user?.id || "");
  const saveMutation = useSaveAddressMutation();

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

  const { isFetchingZipCode } = useAddressCep({
    control,
    setValue,
    setError,
    clearErrors,
    dirtyFields: form.formState.dirtyFields,
  });

  const hasExistingAddress = !!existingAddress;
  const isEditMode = isEditing;

  // Reset edit state when modal closes or modality changes
  useEffect(() => {
    if (!isOpen || currentModality !== "CLINIC") {
      onEditingChange(false);
      reset();
    }
  }, [isOpen, currentModality, reset, onEditingChange]);

  const handleCancel = useCallback(() => {
    reset();
    onEditingChange(false);
  }, [reset, onEditingChange]);

  const onSubmit = async (data: AddressSchema) => {
    try {
      if (!user?.id) {
        toast.error("Erro: usuário não identificado.");
        return;
      }

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
        userId: user.id,
        data: addressData,
        hasAddress: hasExistingAddress,
      });

      const message = hasExistingAddress
        ? "Endereço atualizado com sucesso!"
        : "Endereço salvo com sucesso!";
      toast.success(message);

      onEditingChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao salvar endereço.",
      );
    }
  };

  // Don't render if not CLINIC modality
  if (currentModality !== "CLINIC") {
    return null;
  }

  return (
    <div>
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-gray-800 tracking-wide uppercase">
          Endereço da Clínica
        </h3>
      </div>

      {!isEditMode && (
        <div className="flex items-start justify-between gap-4 px-3 py-3 rounded-md border border-gray-200 bg-gray-50">
          <div className="flex-1 min-w-0">
            {hasExistingAddress ? (
              <div className="space-y-0.5">
                <p className="text-sm text-gray-900">
                  {existingAddress.street}, {existingAddress.number}
                  {existingAddress.complement && ` — ${existingAddress.complement}`}
                </p>
                <p className="text-sm text-gray-600">
                  {existingAddress.district}, {existingAddress.city}/{existingAddress.state}
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                Nenhum endereço cadastrado.
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => onEditingChange(true)}
            className={cn(
              "px-3 py-2 rounded-md text-xs font-medium whitespace-nowrap transition-colors duration-150",
              hasExistingAddress
                ? "text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-300"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-300 flex items-center gap-1"
            )}
          >
            {hasExistingAddress ? (
              "Editar"
            ) : (
              <>
                <Plus className="w-3 h-3" />
                Adicionar
              </>
            )}
          </button>
        </div>
      )}

      {isEditMode && (
        <div className="space-y-4">
          <div className="px-3 py-3 rounded-md border border-gray-200 bg-white space-y-3">
            <AddressFields
              register={form.register}
              errors={errors}
              isFetchingZipCode={isFetchingZipCode}
              disabled={false}
            />

            {errors.zipCode ||
            errors.street ||
            errors.number ||
            errors.district ||
            errors.city ||
            errors.state ? (
              <div className="text-xs text-red-500 flex items-start gap-1">
                <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span>Por favor, corrija os erros acima.</span>
              </div>
            ) : null}
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={isSubmitting || saveMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSubmit(onSubmit)}
              size="sm"
              disabled={
                isSubmitting ||
                isFetchingZipCode ||
                saveMutation.isPending ||
                (hasExistingAddress && !isDirty) ||
                !isValid
              }
            >
              {isSubmitting || saveMutation.isPending ? (
                <span className="flex items-center gap-1">
                  <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Salvando...
                </span>
              ) : (
                (hasExistingAddress ? "Atualizar" : "Salvar")
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressSection;
