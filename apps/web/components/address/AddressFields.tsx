"use client";

import { FieldErrors, FieldValues, Path, UseFormRegister } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

type AddressFieldsProps<T extends FieldValues> = {
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  isFetchingZipCode: boolean;
  disabled?: boolean;
  fieldPrefix?: Path<T>;
};

export function AddressFields<T extends FieldValues>({
  register,
  errors,
  isFetchingZipCode,
  disabled,
  fieldPrefix,
}: AddressFieldsProps<T>) {
  const getFieldName = (field: string) =>
    fieldPrefix ? `${fieldPrefix}.${field}` : field;

  const getFieldId = (field: string) =>
    fieldPrefix ? `${fieldPrefix}-${field}` : field;

  const getError = (field: string) => {
    if (fieldPrefix) {
      const prefixErrors = errors[fieldPrefix] as FieldErrors<FieldValues>;
      return prefixErrors?.[field]?.message;
    }
    return errors[field as keyof T]?.message;
  };

  return (
    <div className="space-y-5">
      {/* CEP Field */}
      <div className="flex flex-col gap-[0.35rem]">
        <Label
          htmlFor={getFieldId("zipCode")}
          className="text-[0.85rem] font-semibold text-gray-700"
        >
          CEP *
        </Label>
        <div className="relative">
          <Input
            id={getFieldId("zipCode")}
            type="text"
            placeholder="00000000"
            maxLength={8}
            inputMode="numeric"
            disabled={disabled}
            {...register(getFieldName("zipCode"))}
          />
          {isFetchingZipCode && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Spinner size="sm" />
            </div>
          )}
        </div>
        {getError("zipCode") && (
          <span className="text-[0.8rem] text-red-600 mt-[0.15rem]">
            {getError("zipCode")}
          </span>
        )}
      </div>

      {/* Street and District Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Street Field */}
        <div className="flex flex-col gap-[0.35rem]">
          <Label
            htmlFor={getFieldId("street")}
            className="text-[0.85rem] font-semibold text-gray-700"
          >
            Rua *
          </Label>
          <Input
            id={getFieldId("street")}
            type="text"
            placeholder="Rua, Avenida, etc"
            disabled={disabled || isFetchingZipCode}
            {...register(getFieldName("street"))}
          />
          {getError("street") && (
            <span className="text-[0.8rem] text-red-600 mt-[0.15rem]">
              {getError("street")}
            </span>
          )}
        </div>

        {/* District Field */}
        <div className="flex flex-col gap-[0.35rem]">
          <Label
            htmlFor={getFieldId("district")}
            className="text-[0.85rem] font-semibold text-gray-700"
          >
            Bairro *
          </Label>
          <Input
            id={getFieldId("district")}
            type="text"
            placeholder="Nome do bairro"
            disabled={disabled}
            {...register(getFieldName("district"))}
          />
          {getError("district") && (
            <span className="text-[0.8rem] text-red-600 mt-[0.15rem]">
              {getError("district")}
            </span>
          )}
        </div>
      </div>

      {/* Number and Complement Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Number Field */}
        <div className="flex flex-col gap-[0.35rem]">
          <Label
            htmlFor={getFieldId("number")}
            className="text-[0.85rem] font-semibold text-gray-700"
          >
            Número *
          </Label>
          <Input
            id={getFieldId("number")}
            type="text"
            placeholder="Ex: 123"
            disabled={disabled}
            {...register(getFieldName("number"))}
          />
          {getError("number") && (
            <span className="text-[0.8rem] text-red-600 mt-[0.15rem]">
              {getError("number")}
            </span>
          )}
        </div>

        {/* Complement Field */}
        <div className="flex flex-col gap-[0.35rem]">
          <Label
            htmlFor={getFieldId("complement")}
            className="text-[0.85rem] font-semibold text-gray-700"
          >
            Complemento
          </Label>
          <Input
            id={getFieldId("complement")}
            type="text"
            placeholder="Ex: Apto 42, Sala 101"
            disabled={disabled}
            {...register(getFieldName("complement"))}
          />
          {getError("complement") && (
            <span className="text-[0.8rem] text-red-600 mt-[0.15rem]">
              {getError("complement")}
            </span>
          )}
        </div>
      </div>

      {/* City and State Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* City Field */}
        <div className="flex flex-col gap-[0.35rem]">
          <Label
            htmlFor={getFieldId("city")}
            className="text-[0.85rem] font-semibold text-gray-700"
          >
            Cidade *
          </Label>
          <Input
            id={getFieldId("city")}
            type="text"
            placeholder="Nome da cidade"
            disabled={disabled || isFetchingZipCode}
            {...register(getFieldName("city"))}
          />
          {getError("city") && (
            <span className="text-[0.8rem] text-red-600 mt-[0.15rem]">
              {getError("city")}
            </span>
          )}
        </div>

        {/* State Field */}
        <div className="flex flex-col gap-[0.35rem]">
          <Label
            htmlFor={getFieldId("state")}
            className="text-[0.85rem] font-semibold text-gray-700"
          >
            Estado *
          </Label>
          <Input
            id={getFieldId("state")}
            type="text"
            placeholder="SP"
            maxLength={2}
            disabled={disabled || isFetchingZipCode}
            className="uppercase"
            {...register(getFieldName("state"))}
          />
          {getError("state") && (
            <span className="text-[0.8rem] text-red-600 mt-[0.15rem]">
              {getError("state")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
