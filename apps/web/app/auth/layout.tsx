import AuthHeader from "../ui/auth/header";

const AuthLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div>
      <AuthHeader />
      <main className="ml-64 flex-1 p-8 overflow-y-auto h-full">
        {children}
      </main>
    </div>
  );
};

export default AuthLayout;
