import { useEffect, useMemo } from "react";
import { useWatch, Control, UseFormSetValue, UseFormSetError, UseFormClearErrors, FieldValues, Path } from "react-hook-form";
import { useSearchCepQuery } from "@/queries/useAddressQueries";

type UseAddressCepProps<T extends FieldValues> = {
  control: Control<T>;
  setValue: UseFormSetValue<T>;
  setError: UseFormSetError<T>;
  clearErrors: UseFormClearErrors<T>;
  fieldPrefix?: string;
  dirtyFields?: Record<string, any>;
};

export function useAddressCep<T extends FieldValues>({
  control,
  setValue,
  setError,
  clearErrors,
  fieldPrefix,
  dirtyFields,
}: UseAddressCepProps<T>) {
  const fields = useMemo(() => {
    const prefix = fieldPrefix ? `${fieldPrefix}.` : "";
    return {
      zipCode: `${prefix}zipCode` as Path<T>,
      street: `${prefix}street` as Path<T>,
      district: `${prefix}district` as Path<T>,
      city: `${prefix}city` as Path<T>,
      state: `${prefix}state` as Path<T>,
    };
  }, [fieldPrefix]);

  const zipCodeValue = useWatch({ control, name: fields.zipCode });

  const isZipCodeDirty = fieldPrefix
    ? dirtyFields?.[fieldPrefix]?.zipCode
    : dirtyFields?.zipCode;

  const validZipCodeToSearch =
    isZipCodeDirty !== undefined
      ? isZipCodeDirty && zipCodeValue?.length === 8 ? zipCodeValue : ""
      : zipCodeValue?.length === 8 ? zipCodeValue : "";

  const {
    data: zipCodeData,
    isFetching: isFetchingZipCode,
    error: zipCodeError,
  } = useSearchCepQuery(validZipCodeToSearch);

  useEffect(() => {
    if (zipCodeValue?.length !== 8 || isFetchingZipCode) {
      clearErrors(fields.zipCode);
      return;
    }

    if (zipCodeError) {
      setError(fields.zipCode, { type: "manual", message: "CEP não encontrado" });
      setValue(fields.street, "" as any);
      setValue(fields.district, "" as any);
      setValue(fields.city, "" as any);
      setValue(fields.state, "" as any);
      return;
    }

    if (zipCodeData && zipCodeData.zipCode.replace(/\D/g, "") === zipCodeValue) {
      clearErrors(fields.zipCode);
      setValue(fields.street, zipCodeData.street as any);
      setValue(fields.district, zipCodeData.district as any);
      setValue(fields.city, zipCodeData.city as any);
      setValue(fields.state, zipCodeData.state as any);
    }
  }, [zipCodeData, zipCodeError, zipCodeValue, isFetchingZipCode, clearErrors, setError, setValue, fields]);

  return { isFetchingZipCode };
}