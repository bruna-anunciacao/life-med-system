import Logo from "../../../life-med-logo.png";
import Image from "next/image";
import Link from "next/link";
const AuthHeader = () => {
  return (
    <div className="w-full bg-[#f8fafc] border-b border-[#e2e8f0] flex justify-center items-center p-4">
      <Link href="/">
        <Image
          src={Logo}
          alt="Life Med Logo"
          width={200}
          className="w-[200px] h-auto sm:w-[150px]"
        />
      </Link>
    </div>
  );
};

export default AuthHeader;
