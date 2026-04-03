import Image from "next/image";

interface LifeMedLogoProps {
  width?: number;
  height?: number;
  className?: string;
}

export function LifeMedLogo({ width = 160, height = 60, className }: LifeMedLogoProps) {
  return (
    <Image
      src="/logo-life-med.svg"
      alt="Life Med"
      width={width}
      height={height}
      className={className}
    />
  );
}
