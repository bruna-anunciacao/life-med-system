import Logo from "../../../life-med-logo.png";
import Image from "next/image";
import Link from "next/link";
const AuthHeader = () => {
  return (
    <div className="w-full bg-white border-b border-[#e2e8f0]">
      <div className="max-w-7xl mx-auto px-8 py-1 flex items-center">
        <Link href="/">
          <Image
            src={Logo}
            alt="Life Med Logo"
            width={200}
          />
        </Link>
      </div>
    </div>
  );
};

export default AuthHeader;
