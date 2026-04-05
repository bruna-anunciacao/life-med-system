import Link from "next/link";
import { LifeMedLogo } from "../../life-med-logo";
const AuthHeader = () => {
  return (
    <div className="w-full bg-white border-b border-[#e2e8f0]">
      <div className="max-w-7xl mx-auto px-8 py-1 flex items-center">
        <Link href="/">
          <LifeMedLogo width={200} />
        </Link>
      </div>
    </div>
  );
};

export default AuthHeader;
