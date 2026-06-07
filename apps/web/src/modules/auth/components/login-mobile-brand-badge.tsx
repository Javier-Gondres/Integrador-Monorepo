interface LoginMobileBrandBadgeProps {
  className?: string;
}

export function LoginMobileBrandBadge({
  className = "",
}: LoginMobileBrandBadgeProps) {
  return (
    <div
      className={`flex flex-col items-center gap-2 font-bold tracking-[.01em] ${className}`}
    >
      <div className="bg-[#F1F5F9] w-14 h-14 rounded-full grid place-items-center ">
        <span className="w-12 h-12 rounded-full bg-[#3C50E0]" />
      </div>
      <span className="text-sm text-[#1E293B]">Multi Empresa</span>
    </div>
  );
}
