import BrandLogo from "@/modules/auth/components/BrandLogo";

export default function page() {
  return (
    <>
      {/* contenedor principal,  */}
      <main
        className={`min-h-screen grid-rows-[0.01fr_1fr] grid grid-cols-2 bg-[#F1F5F9] 
           max-sm:grid-cols-1 max-sm:grid-rows-[0.25fr_1fr] `} /* estilos para dispositivos moviles */
      >
        {/* header, solo visible en desktop */}
        <header className="max-sm:hidden row-start-1 row-end-2 col-start-1 col-end-3 self-center">
          <div className="flex ml-3 mt-5">
            <BrandLogo />
          </div>
        </header>

        {/* seccion del formulario, posiciona toda los elementos que tiene dentro en el grid */}
        <section
          className={`row-start-2 row-end-3 flex items-center justify-center max-sm:row-start-2 max-sm:row-end-3`}
        >
          {/* div para ajustar el ancho y disposicion */}
          <div className="flex flex-col mx-3 w-full max-w-2xl max-md:max-w-xl max-sm:max-w-96 p-3 shadow-xl rounded-2xl">
            {/* wrapper para el form */}
            <div className="w-full text-black space-y-2">
              <h1 className="text-3xl font-semibold text-center">
                Iniciar Sesión
              </h1>
              <p className="text-sm text-center">
                Bienvenido. Ingrese sus credenciales para continuar.
              </p>

              {/* formulario */}
              <form action="" className="mt-10">
                <div className="my-2">
                  <label htmlFor="email" className="">
                    Email:
                  </label>
                  <input
                    className={`border border-[#E2E8f0] rounded-sm bg-slate-50 w-full text-sm outline-none py-3 px-2`}
                    type="email"
                    name="email"
                    id="email"
                    placeholder="prueba@ejemplo.com"
                  />
                </div>

                <div className="my-2">
                  <label htmlFor="password" className="">
                    Contraseña:
                  </label>
                  <input
                    className={`border border-[#E2E8f0] rounded-sm bg-slate-50 w-full text-sm outline-none py-3 px-2`}
                    type="password"
                    name="password"
                    id="password"
                    placeholder="su contraseña"
                  />
                </div>

                <div className="flex justify-between max-sm:flex-col max-sm:gap-2">
                  <div className="flex gap-2">
                    <input type="checkbox" id="remember_ps" />
                    <label htmlFor="remember_ps">Recordarme</label>
                  </div>

                  <a href="#" className="hover:underline">
                    Contraseña olvidada?
                  </a>
                </div>

                <button
                  type="submit"
                  className="mt-10 w-full border rounded-sm bg-[#3C50E0] text-white p-2"
                >
                  Acceder
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* seccion de fondo/logo */}
        <section
          className="row-start-2 row-end-3 flex mx-5 mt-10 max-w-full max-h-[80%]
                      max-sm:row-start-1 max-sm:row-end-2 max-sm:max-h-full max-sm:border-none max-sm:rounded-none max-sm:m-0 
                      border-x border-x-transparent rounded-sm bg-linear-to-b from-sky-500 to-[#3C50E0]"
        >
          <div className="relative flex w-full max-sm:max-w-full justify-center ">
            <div
              className="absolute sm:hidden flex gap-3 items-center font-bold tracking-[.01em] text-white 
                max-sm:bottom-4 max-sm:left-1/2 max-sm:-translate-x-1/2 max-sm:translate-y-1/2 max-sm:z-10  
                max-sm:flex-col-reverse max-sm:justify-center max-sm:items-center"
            >
              <span
                className={`sm:hidden bg-[#F1F5F9] w-12 aspect-square rounded-full grid place-items-center`}
              >
                <span
                  className={`sm:hidden w-10 aspect-square rounded-full bg-[#3C50E0]`}
                ></span>
              </span>
              <span className="text-black">Multi Empresa</span>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
