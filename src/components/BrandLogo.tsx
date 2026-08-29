import Image from "next/image";

const sizeMap = {
  sm: { width: 120, height: 72, className: "h-8 sm:h-9" },
  md: { width: 160, height: 96, className: "h-12 sm:h-14" },
  lg: { width: 200, height: 120, className: "h-16 sm:h-20 lg:h-24" },
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
      className={`object-contain ${sizeClass} w-auto dark:bg-white dark:rounded-xl dark:p-1.5 ${className}`}
      priority
    />
  );
}
