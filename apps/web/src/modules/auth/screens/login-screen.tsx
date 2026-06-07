import BrandLogo from "../components/BrandLogo";
import { LoginFormContainer } from "../containers/login-form-container";

export function LoginScreen() {
  return (
    <main
      className={`min-h-screen grid-rows-[0.01fr_1fr] grid grid-cols-2 bg-[#F1F5F9]
         max-sm:grid-cols-1 max-sm:grid-rows-[0.25fr_1fr]`}
    >
      <header className="max-sm:hidden row-start-1 row-end-2 col-start-1 col-end-3 self-center">
        <div className="flex ml-3 mt-5">
          <BrandLogo />
        </div>
      </header>

      <section className="row-start-2 row-end-3 flex items-center justify-center max-sm:row-start-2 max-sm:row-end-3">
        <div className="flex flex-col mx-3 w-full max-w-2xl max-md:max-w-xl max-sm:max-w-96 p-3 shadow-xl rounded-2xl">
          <LoginFormContainer />
        </div>
      </section>

      <section
        className="row-start-2 row-end-3 flex mx-5 mt-4 max-w-full max-h-[80%]
                    max-sm:row-start-1 max-sm:row-end-2 max-sm:max-h-full max-sm:border-none max-sm:rounded-none max-sm:m-0
                    border-x border-x-transparent rounded-sm bg-linear-to-b from-sky-500 to-[#3C50E0]"
      >
        <div className="relative flex w-full max-sm:max-w-full justify-center">
          <div
            className="absolute sm:hidden flex gap-3 items-center font-bold tracking-[.01em] text-white
              max-sm:bottom-4 max-sm:left-1/2 max-sm:-translate-x-1/2 max-sm:translate-y-1/2 max-sm:z-10
              max-sm:flex-col-reverse max-sm:justify-center max-sm:items-center"
          >
            <span className="sm:hidden bg-[#F1F5F9] w-12 aspect-square rounded-full grid place-items-center">
              <span className="sm:hidden w-10 aspect-square rounded-full bg-[#3C50E0]" />
            </span>
            <span className="text-black">Multi Empresa</span>
          </div>
        </div>
      </section>
    </main>
  );
}
