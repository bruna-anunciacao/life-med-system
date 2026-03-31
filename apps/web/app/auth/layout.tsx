import Image from "next/image";

const AuthLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div className="min-h-screen flex bg-white">
      {/* Painel esquerdo — oculto em mobile */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#2563eb] flex-col justify-center p-14 relative overflow-hidden">
        {/* Círculo decorativo */}
        <div className="absolute w-90 h-90 rounded-full bg-white/5 -bottom-20 -right-20 pointer-events-none" />
        <div className="absolute w-48 h-48 rounded-full bg-white/5 -top-12 -left-12 pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center gap-10">
          <Image
            src="/undraw_doctor_aum1-2.svg"
            alt="Cuidado médico Life Med"
            width={360}
            height={280}
            className="drop-shadow-xl"
            priority
          />
          <div className="flex flex-col gap-3 text-center">
            <h2 className="text-3xl font-bold text-white leading-snug">
              Saúde conectada, <br />
              <span className="text-[#dbeafe]">simples e segura</span>
            </h2>
            <p className="text-white/60 text-base max-w-xs mx-auto leading-relaxed">
              Plataforma moderna para agendamentos, prontuários e telemedicina.
            </p>
          </div>
        </div>
      </div>

      {/* Painel direito — formulário */}
      <div className="flex-1 flex items-center justify-center py-8 px-6">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
