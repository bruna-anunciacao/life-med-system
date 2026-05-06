type UserProfileHeaderProps = {
  name: string;
  email: string;
  role: string;
  specialty?: string;
  photoUrl: string | null;
};

export function UserProfileHeader({ name, email, role, specialty, photoUrl }: UserProfileHeaderProps) {
  const roleLabel =
    role === "PROFESSIONAL"
      ? specialty || "Profissional"
      : role === "MANAGER"
        ? "Gestor"
        : "Paciente";

  return (
    <div className="flex items-center gap-5">
      {photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photoUrl}
          alt={name}
          style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover" }}
        />
      ) : (
        <div className="w-16 h-16 flex items-center justify-center rounded-full bg-[#e6f1ff] border-2 border-[#006fee] text-2xl font-bold text-[#006fee] flex-shrink-0">
          {name?.charAt(0).toUpperCase()}
        </div>
      )}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">{name}</h2>
        <p className="text-sm text-gray-500">{email}</p>
        <span className="mt-1 px-2.5 py-0.5 inline-block rounded-full bg-[rgba(0,111,238,0.08)] text-xs font-semibold text-[#006fee]">
          {roleLabel}
        </span>
      </div>
    </div>
  );
}
