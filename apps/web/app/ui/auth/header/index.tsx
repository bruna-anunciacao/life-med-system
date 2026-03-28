import Logo from "../../../life-med-logo.png";
import Image from "next/image";
import styles from "./header.module.css";
import Link from "next/link";
const AuthHeader = () => {
  return (
    <div className={styles.container}>
      <Link href="/">
        <Image
          src={Logo}
          alt="Life Med Logo"
          width={200}
          className={styles.logo}
        />
      </Link>
    </div>
  );
};

export default AuthHeader;
