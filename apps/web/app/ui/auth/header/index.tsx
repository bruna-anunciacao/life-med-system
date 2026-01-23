import Logo from "../../../life-med-logo.png";
import Image from "next/image";
import styles from './header.module.css'

const AuthHeader = () => {
  return (
    <div className={styles.container}>
      <Image src={Logo} alt="Life Med Logo" width={200} />
    </div>
  );
};

export default AuthHeader;
