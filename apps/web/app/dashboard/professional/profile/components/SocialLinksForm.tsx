import { type UseFormRegister } from "react-hook-form";
import type { ProfileSchema } from "../profile.validation";

type SocialLinksFormProps = {
  isEditing: boolean;
  register: UseFormRegister<ProfileSchema>;
};

export function SocialLinksForm({ isEditing, register }: SocialLinksFormProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div className="flex flex-col gap-[0.35rem]">
        <label className="text-[0.85rem] font-semibold text-gray-700">Link de referência (Linkedin/Lattes)</label>
        <input
          type="text"
          className="px-3 py-[0.6rem] border border-gray-200 rounded-lg bg-white text-[0.95rem] text-gray-900 transition-colors duration-200 focus:outline-none focus:border-[#006fee] focus:shadow-[0_0_0_3px_rgba(0,111,238,0.1)] disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
          disabled={!isEditing}
          {...register("socialLinks.referenceLink")}
        />
      </div>
      <div className="flex flex-col gap-[0.35rem]">
        <label className="text-[0.85rem] font-semibold text-gray-700">Instagram</label>
        <input
          type="text"
          className="px-3 py-[0.6rem] border border-gray-200 rounded-lg bg-white text-[0.95rem] text-gray-900 transition-colors duration-200 focus:outline-none focus:border-[#006fee] focus:shadow-[0_0_0_3px_rgba(0,111,238,0.1)] disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
          disabled={!isEditing}
          {...register("socialLinks.instagram")}
        />
      </div>
      <div className="flex flex-col gap-[0.35rem]">
        <label className="text-[0.85rem] font-semibold text-gray-700">Outro</label>
        <input
          type="text"
          className="px-3 py-[0.6rem] border border-gray-200 rounded-lg bg-white text-[0.95rem] text-gray-900 transition-colors duration-200 focus:outline-none focus:border-[#006fee] focus:shadow-[0_0_0_3px_rgba(0,111,238,0.1)] disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
          disabled={!isEditing}
          {...register("socialLinks.other")}
        />
      </div>
    </div>
  );
}
