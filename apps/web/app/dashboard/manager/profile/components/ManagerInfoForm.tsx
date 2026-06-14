import {
  Controller,
  type Control,
  type FieldErrors,
  type UseFormRegister,
} from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInputBR } from "@/components/ui/phone-input-br";
import { formatCpf } from "@/lib/cpf";
import type { ManagerProfileSchema } from "../manager-profile.validation";

type ManagerInfoFormProps = {
  register: UseFormRegister<ManagerProfileSchema>;
  control: Control<ManagerProfileSchema>;
  errors: FieldErrors<ManagerProfileSchema>;
  email: string;
  cpf: string;
  isEditing: boolean;
};

export function ManagerInfoForm({
  register,
  control,
  errors,
  email,
  cpf,
  isEditing,
}: ManagerInfoFormProps) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name">Nome Completo</Label>
          <Input
            id="name"
            type="text"
            disabled={!isEditing}
            {...register("name")}
          />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} disabled readOnly />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="cpf">CPF</Label>
          <Input
            id="cpf"
            type="text"
            value={cpf ? formatCpf(cpf) : "—"}
            disabled
            readOnly
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone">Telefone</Label>
          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <PhoneInputBR
                id="phone"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                ref={field.ref}
                disabled={!isEditing}
              />
            )}
          />
          {errors.phone && (
            <p className="text-xs text-destructive">{errors.phone.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="bio">Bio</Label>
        <textarea
          id="bio"
          rows={4}
          disabled={!isEditing}
          placeholder="Uma breve descrição sobre você (opcional)."
          className="w-full min-w-0 rounded-lg border border-slate-300 bg-transparent px-2.5 py-2 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          {...register("bio")}
        />
        {errors.bio && (
          <p className="text-xs text-destructive">{errors.bio.message}</p>
        )}
      </div>
    </div>
  );
}
