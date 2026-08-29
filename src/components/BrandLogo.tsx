import Image from "next/image";

const sizeMap = {
  sm: { width: 120, height: 72, className: "h-9" },
  md: { width: 180, height: 108, className: "h-16" },
  lg: { width: 247, height: 148, className: "h-24 lg:h-28" },
};

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function BrandLogo({ size = "md", className = "" }: BrandLogoProps) {
  const { width, height, className: sizeClass } = sizeMap[size];

  return (
    <Image
      src="/logo.png"
      alt="The Catalysts Group"
      width={width}
      height={height}
      className={`object-contain ${sizeClass} w-auto dark:invert dark:brightness-[2] transition-[filter] duration-300 ${className}`}
      priority
    />
  );
}
