import BrandLogo from "../components/BrandLogo";
import { LoginMobileBrandBadge } from "../components/login-mobile-brand-badge";
import { LoginFormContainer } from "../containers/login-form-container";

const desktopFormCardClassName =
  "flex flex-col w-full max-w-md py-14 px-3 rounded-2xl shadow-[0_-8px_25px_-5px_rgba(0,0,0,0.08),0_20px_25px_-5px_rgba(0,0,0,0.12)]";

const bluePanelClassName =
  "rounded-2xl bg-linear-to-b from-sky-500 to-[#3C50E0] min-h-0 h-full";

export function LoginScreen() {
  return (
    <main className="min-h-screen flex flex-col bg-[#F1F5F9]">
      <header className="max-sm:hidden shrink-0 px-5 pt-5">
        <BrandLogo />
      </header>

      {/* Desktop: form y panel azul comparten la misma altura */}
      <div className="hidden sm:grid flex-1 min-h-0 grid-cols-2 gap-x-4 px-5 pb-5">
        <section className="flex items-center justify-center min-h-0">
          <div className={desktopFormCardClassName}>
            <LoginFormContainer />
          </div>
        </section>

        <section className={bluePanelClassName} />
      </div>

      {/* Mobile: header azul full-width + form plano (sin card) */}
      <section className="sm:hidden flex-1 flex flex-col w-full min-h-0">
        <div className="relative w-full shrink-0">
          <div
            className="h-28 w-full bg-linear-to-b from-sky-500 to-[#3C50E0]"
            aria-hidden
          />

          <LoginMobileBrandBadge className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 z-10" />
        </div>

        <div className="flex-1 w-full px-6 pt-16 pb-8">
          <LoginFormContainer />
        </div>
      </section>
    </main>
  );
}
