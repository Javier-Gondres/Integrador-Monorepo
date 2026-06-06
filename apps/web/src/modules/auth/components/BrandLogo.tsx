"use client";

import useMediaQuery from "@/shared/hooks/use-media-query";

export default function BrandLogo() {
  const mobileDeviceWidth = 639;
  const isMobile = useMediaQuery(`(max-width: ${mobileDeviceWidth}px)`);
  if (isMobile) return null;
  return <p className="font-bold">Multi Empresa</p>;
}
