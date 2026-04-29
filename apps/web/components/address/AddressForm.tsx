"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
  useSearchCepQuery,
  useUserAddressQuery,
  useSaveAddressMutation,
} from "@/queries/useAddressQueries";
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
    formState: { errors, isSubmitting, dirtyFields, isDirty, isValid },
  } = form;

  const [isEditing, setIsEditing] = useState(false);

  const zipCodeValue = useWatch({ control, name: "zipCode" });
  
  const validZipCodeToSearch = dirtyFields.zipCode && zipCodeValue?.length === 8 ? zipCodeValue : "";

  const hasExistingAddress = !!existingAddress;
  const isEditMode = isEditing || !hasExistingAddress;

  const {
    data: zipCodeData,
    isFetching: isFetchingZipCode,
    error: zipCodeError,
  } = useSearchCepQuery(validZipCodeToSearch);

  const saveMutation = useSaveAddressMutation();

  useEffect(() => {

    if (zipCodeValue?.length !== 8 || isFetchingZipCode) {
      clearErrors("zipCode");
      return;
    }

    if (zipCodeError) {
      setError("zipCode", { type: "manual", message: "CEP não encontrado" });
      setValue("street", "");
      setValue("district", "");
      setValue("city", "");
      setValue("state", "");
    } 
    
    if (zipCodeData && zipCodeData.zipCode.replace(/\D/g, "") === zipCodeValue) {
      clearErrors("zipCode");
      setValue("street", zipCodeData.street);
      setValue("district", zipCodeData.district);
      setValue("city", zipCodeData.city);
      setValue("state", zipCodeData.state);
    }
  }, [zipCodeData, zipCodeError, zipCodeValue, isFetchingZipCode, setValue, setError, clearErrors]);

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
        <div className="flex flex-col gap-[0.35rem]">
          <Label
            htmlFor="zipCode"
            className="text-[0.85rem] font-semibold text-gray-700"
          >
            CEP *
          </Label>
          <div className="relative">
            <Input
              id="zipCode"
              type="text"
              placeholder="00000000"
              maxLength={8}
              inputMode="numeric"
              disabled={!isEditMode}
              {...form.register("zipCode")}
            />
            {isFetchingZipCode && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Spinner size="sm" />
              </div>
            )}
          </div>
          {errors.zipCode && (
            <span className="text-[0.8rem] text-red-600 mt-[0.15rem]">
              {errors.zipCode.message}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col gap-[0.35rem]">
            <Label
              htmlFor="street"
              className="text-[0.85rem] font-semibold text-gray-700"
            >
              Rua *
            </Label>
            <Input
              id="street"
              type="text"
              placeholder="Rua, Avenida, etc"
              disabled={!isEditMode || isFetchingZipCode}
              {...form.register("street")}
            />
            {errors.street && (
              <span className="text-[0.8rem] text-red-600 mt-[0.15rem]">
                {errors.street.message}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-[0.35rem]">
            <Label
              htmlFor="district"
              className="text-[0.85rem] font-semibold text-gray-700"
            >
              Bairro *
            </Label>
            <Input
              id="district"
              type="text"
              placeholder="Nome do bairro"
              disabled={!isEditMode}
              {...form.register("district")}
            />
            {errors.district && (
              <span className="text-[0.8rem] text-red-600 mt-[0.15rem]">
                {errors.district.message}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col gap-[0.35rem]">
            <Label
              htmlFor="number"
              className="text-[0.85rem] font-semibold text-gray-700"
            >
              Número *
            </Label>
            <Input
              id="number"
              type="text"
              placeholder="Ex: 123"
              disabled={!isEditMode}
              {...form.register("number")}
            />
            {errors.number && (
              <span className="text-[0.8rem] text-red-600 mt-[0.15rem]">
                {errors.number.message}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-[0.35rem]">
            <Label
              htmlFor="complement"
              className="text-[0.85rem] font-semibold text-gray-700"
            >
              Complemento
            </Label>
            <Input
              id="complement"
              type="text"
              placeholder="Ex: Apto 42, Sala 101"
              disabled={!isEditMode}
              {...form.register("complement")}
            />
            {errors.complement && (
              <span className="text-[0.8rem] text-red-600 mt-[0.15rem]">
                {errors.complement.message}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col gap-[0.35rem]">
            <Label
              htmlFor="city"
              className="text-[0.85rem] font-semibold text-gray-700"
            >
              Cidade *
            </Label>
            <Input
              id="city"
              type="text"
              placeholder="Nome da cidade"
              disabled={!isEditMode || isFetchingZipCode}
              {...form.register("city")}
            />
            {errors.city && (
              <span className="text-[0.8rem] text-red-600 mt-[0.15rem]">
                {errors.city.message}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-[0.35rem]">
            <Label
              htmlFor="state"
              className="text-[0.85rem] font-semibold text-gray-700"
            >
              Estado *
            </Label>
            <Input
              id="state"
              type="text"
              placeholder="SP"
              maxLength={2}
              disabled={!isEditMode || isFetchingZipCode}
              className="uppercase"
              {...form.register("state")}
            />
            {errors.state && (
              <span className="text-[0.8rem] text-red-600 mt-[0.15rem]">
                {errors.state.message}
              </span>
            )}
          </div>
        </div>

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
