import AuthHeader from "../ui/auth/header";

const AuthLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <AuthHeader />
      <main className="flex-1 flex justify-center items-start">
        {children}
      </main>
    </div>
  );
};

export default AuthLayout;
